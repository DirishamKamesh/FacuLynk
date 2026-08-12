package com.faculynk.auth;

import com.faculynk.auth.dto.ActivateHodRequest;
import com.faculynk.exception.*;
import com.faculynk.auth.dto.AuthUserResponse;
import com.faculynk.auth.dto.LoginRequest;
import com.faculynk.auth.dto.RegisterFacultyRequest;
import com.faculynk.model.entity.AuditLog;
import com.faculynk.model.entity.Department;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.FacultyRegistrationRequest;
import com.faculynk.model.entity.User;
import com.faculynk.model.enums.AccountStatus;
import com.faculynk.model.enums.Designation;
import com.faculynk.model.enums.RegistrationStatus;
import com.faculynk.service.AuditService;
import com.faculynk.repository.DepartmentRepository;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.FacultyRegistrationRequestRepository;
import com.faculynk.repository.UserRepository;
import com.faculynk.security.JwtTokenProvider;
import com.faculynk.security.PasswordService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyRegistrationRequestRepository registrationRequestRepository;
    private final AuditService auditService;
    private final PasswordService passwordService;
    private final JwtTokenProvider tokenProvider;
    private final ObjectMapper objectMapper;

    public AuthService(UserRepository userRepository,
                       FacultyProfileRepository facultyProfileRepository,
                       DepartmentRepository departmentRepository,
                       FacultyRegistrationRequestRepository registrationRequestRepository,
                       AuditService auditService,
                       PasswordService passwordService,
                       JwtTokenProvider tokenProvider,
                       ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.departmentRepository = departmentRepository;
        this.registrationRequestRepository = registrationRequestRepository;
        this.auditService = auditService;
        this.passwordService = passwordService;
        this.tokenProvider = tokenProvider;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public User authenticate(LoginRequest request) {
        User user = userRepository.findByInstitutionalId(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + request.getUsername()));

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new BadCredentialsException("Account is not active: status is " + user.getAccountStatus());
        }

        if (!passwordService.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid password");
        }

        return user;
    }

    public String generateToken(User user) {
        return tokenProvider.generateToken(user.getId(), user.getRole().getId(), user.getInstitutionalId());
    }

    @Transactional
    public AuthUserResponse activateHod(ActivateHodRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        User user = userRepository.findByInstitutionalId(request.getHodId())
                .orElseThrow(() -> new UsernameNotFoundException("HOD account not found with ID: " + request.getHodId()));

        if (!"HOD".equals(user.getRole().getId())) {
            throw new IllegalArgumentException("User is not an HOD");
        }

        if (user.getAccountStatus() != AccountStatus.PENDING_ACTIVATION) {
            throw new IllegalStateException("HOD account is not in PENDING_ACTIVATION status");
        }

        // Validate or find department
        Department department = departmentRepository.findByCode(request.getDepartment())
                .or(() -> departmentRepository.findByName(request.getDepartment()))
                .orElseGet(() -> {
                    Department newDept = new Department();
                    newDept.setName(request.getDepartment());
                    newDept.setCode(request.getDepartment().substring(0, Math.min(request.getDepartment().length(), 4)).toUpperCase());
                    return departmentRepository.save(newDept);
                });

        // Update HOD User fields
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordService.encode(request.getPassword()));
        user.setAccountStatus(AccountStatus.ACTIVE);
        user = userRepository.save(user);

        // Update HOD Profile if not present
        Optional<FacultyProfile> profileOpt = facultyProfileRepository.findByUserId(user.getId());
        FacultyProfile profile;
        if (profileOpt.isEmpty()) {
            profile = new FacultyProfile();
            profile.setUser(user);
            profile.setDepartment(department);
            profile.setDesignation(Designation.PROFESSOR); // Default designation
            profile.setMaxWorkloadHours(0); // HOD default statutory cap is 0
            profile = facultyProfileRepository.save(profile);
        } else {
            profile = profileOpt.get();
            profile.setDepartment(department);
            profile = facultyProfileRepository.save(profile);
        }

        // Write audit log entry
        auditService.logMutation(
                "HOD_ACTIVATED",
                "USER",
                user.getId(),
                user,
                Map.of(
                        "activatedBy", user.getInstitutionalId(),
                        "email", user.getEmail(),
                        "department", department.getName()
                )
        );

        return mapToResponse(user);
    }

    @Transactional
    public FacultyRegistrationRequest registerFaculty(RegisterFacultyRequest request) {
        // 1. institutional ID format validation
        if (request.getFacultyId() == null || !request.getFacultyId().startsWith("FAC-")) {
            throw new IllegalArgumentException("Invalid Faculty Institutional ID format. Must start with 'FAC-'");
        }

        // 2. Designation validation
        Designation designation;
        try {
            designation = Designation.fromDisplayName(request.getDesignation());
        } catch (IllegalArgumentException e) {
            throw new InvalidDesignationException("Invalid designation: " + request.getDesignation());
        }

        // 3. Department existence validation
        Optional<Department> departmentOpt = departmentRepository.findByCode(request.getDepartment())
                .or(() -> departmentRepository.findByName(request.getDepartment()));
        if (departmentOpt.isEmpty()) {
            throw new InvalidDepartmentException("Department does not exist: " + request.getDepartment());
        }

        // 4. Existing active user claims check
        boolean alreadyClaimed = userRepository.findByInstitutionalId(request.getFacultyId())
                .map(u -> u.getAccountStatus() == AccountStatus.ACTIVE)
                .orElse(false);
        if (alreadyClaimed) {
            throw new InstitutionalIdClaimedException("Institutional ID already claimed: " + request.getFacultyId());
        }

        // 5. Open duplicate registration requests check
        boolean hasDuplicate = registrationRequestRepository.existsByInstitutionalIdAndStatusIn(
                request.getFacultyId(), java.util.List.of(RegistrationStatus.PENDING)
        ) || registrationRequestRepository.existsByEmailAndStatusIn(
                request.getEmail(), java.util.List.of(RegistrationStatus.PENDING)
        );

        if (hasDuplicate) {
            throw new DuplicatePendingRegistrationException("An active registration request already exists for this Faculty ID or Email");
        }

        FacultyRegistrationRequest req = new FacultyRegistrationRequest();
        req.setInstitutionalId(request.getFacultyId());
        req.setEmail(request.getEmail());
        req.setFullName(request.getFullName());
        req.setDesignation(designation);
        req.setDepartmentName(request.getDepartment());
        req.setPhone(request.getPhone());
        req.setAvailability(request.getAvailability());
        req.setStatus(RegistrationStatus.PENDING);
        req.setPasswordHash(passwordService.encode(request.getPassword()));

        try {
            req.setSkillsJson(objectMapper.writeValueAsString(request.getSkills()));
        } catch (Exception e) {
            req.setSkillsJson("[]");
        }

        return registrationRequestRepository.save(req);
    }

    @Transactional(readOnly = true)
    public AuthUserResponse getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
        return mapToResponse(user);
    }

    public AuthUserResponse mapToResponse(User user) {
        AuthUserResponse response = new AuthUserResponse();
        response.setId(user.getId());
        response.setInstitutionalId(user.getInstitutionalId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole().getId());
        response.setAccountStatus(user.getAccountStatus().name());

        Optional<FacultyProfile> profileOpt = facultyProfileRepository.findByUserId(user.getId());
        if (profileOpt.isPresent()) {
            response.setFacultyId(profileOpt.get().getId());
            response.setDepartmentId(profileOpt.get().getDepartment().getId());
        }

        return response;
    }
}
