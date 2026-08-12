package com.faculynk.auth;

import com.faculynk.auth.dto.AuthUserResponse;
import com.faculynk.exception.InstitutionalIdClaimedException;
import com.faculynk.exception.InvalidDepartmentException;
import com.faculynk.exception.InvalidDesignationException;
import com.faculynk.exception.MissingRejectionNoteException;
import com.faculynk.exception.RegistrationNotFoundException;
import com.faculynk.exception.RegistrationNotPendingException;
import com.faculynk.model.entity.AuditLog;
import com.faculynk.model.entity.Department;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.FacultyRegistrationRequest;
import com.faculynk.model.entity.Role;
import com.faculynk.model.entity.Skill;
import com.faculynk.model.entity.User;
import com.faculynk.model.enums.AccountStatus;
import com.faculynk.model.enums.RegistrationStatus;
import com.faculynk.service.AuditService;
import com.faculynk.repository.DepartmentRepository;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.FacultyRegistrationRequestRepository;
import com.faculynk.repository.RoleRepository;
import com.faculynk.repository.SkillRepository;
import com.faculynk.repository.UserRepository;
import com.faculynk.security.PasswordService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class RegistrationService {

    private final FacultyRegistrationRequestRepository registrationRepository;
    private final UserRepository userRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final SkillRepository skillRepository;
    private final AuditService auditService;
    private final PasswordService passwordService;
    private final ObjectMapper objectMapper;

    public RegistrationService(FacultyRegistrationRequestRepository registrationRepository,
                               UserRepository userRepository,
                               FacultyProfileRepository facultyProfileRepository,
                               DepartmentRepository departmentRepository,
                               RoleRepository roleRepository,
                               SkillRepository skillRepository,
                               AuditService auditService,
                               PasswordService passwordService,
                               ObjectMapper objectMapper) {
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.departmentRepository = departmentRepository;
        this.roleRepository = roleRepository;
        this.skillRepository = skillRepository;
        this.auditService = auditService;
        this.passwordService = passwordService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<FacultyRegistrationRequest> getPendingRequests() {
        return registrationRepository.findByStatus(RegistrationStatus.PENDING);
    }

    @Transactional
    public AuthUserResponse approveRegistration(String id, String reviewerUserId) {
        // 1. Load HOD reviewer
        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new IllegalArgumentException("Reviewing HOD user not found: " + reviewerUserId));

        // 2. Load and Lock registration request (pessimistic write locking to avoid race conditions)
        FacultyRegistrationRequest request = registrationRepository.findAndLockById(id)
                .orElseThrow(() -> new RegistrationNotFoundException("Registration request not found: " + id));

        // 3. Verify request is still PENDING
        if (request.getStatus() != RegistrationStatus.PENDING) {
            throw new RegistrationNotPendingException("Registration request is not in PENDING status: " + request.getStatus());
        }

        // 4. Verify institutional ID is unclaimed
        boolean alreadyClaimed = userRepository.findByInstitutionalId(request.getInstitutionalId())
                .map(u -> u.getAccountStatus() == AccountStatus.ACTIVE)
                .orElse(false);
        if (alreadyClaimed) {
            throw new InstitutionalIdClaimedException("Institutional ID already claimed: " + request.getInstitutionalId());
        }

        // 5. Verify department exists
        Department department = departmentRepository.findByCode(request.getDepartmentName())
                .or(() -> departmentRepository.findByName(request.getDepartmentName()))
                .orElseThrow(() -> new InvalidDepartmentException("Department does not exist: " + request.getDepartmentName()));

        // 6. Verify role exists
        Role role = roleRepository.findById("FACULTY")
                .orElseThrow(() -> new IllegalStateException("FACULTY role not initialized in database"));

        // 7. Create User
        User user = new User();
        user.setInstitutionalId(request.getInstitutionalId());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setRole(role);
        user.setAccountStatus(AccountStatus.ACTIVE);
        // Use the securely stored password hash provided during registration
        user.setPasswordHash(request.getPasswordHash());
        user = userRepository.save(user);

        // 8. Create FacultyProfile
        FacultyProfile profile = new FacultyProfile();
        profile.setUser(user);
        profile.setDepartment(department);
        profile.setDesignation(request.getDesignation());
        profile.setMaxWorkloadHours(request.getDesignation().getDefaultMaxWorkloadHours());
        profile.setPhone(request.getPhone());
        profile.setExperienceYears(0);
        
        // 9. Parse and save skills
        Set<Skill> skills = new HashSet<>();
        try {
            if (request.getSkillsJson() != null) {
                String skillsJson = request.getSkillsJson().trim();
                if (skillsJson.startsWith("\"")) {
                    skillsJson = objectMapper.readValue(skillsJson, String.class);
                }
                List<String> skillNames = objectMapper.readValue(skillsJson, new TypeReference<List<String>>() {});
                for (String name : skillNames) {
                    String trimmedName = name.trim();
                    if (!trimmedName.isEmpty()) {
                        Skill skill = skillRepository.findByName(trimmedName)
                                .orElseGet(() -> {
                                    Skill newSkill = new Skill();
                                    newSkill.setName(trimmedName);
                                    return skillRepository.save(newSkill);
                                });
                        skills.add(skill);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        profile.setSkills(skills);
        profile = facultyProfileRepository.save(profile);

        // 10. Update Registration Request
        request.setStatus(RegistrationStatus.APPROVED);
        request.setReviewedAt(Instant.now());
        request.setHodNote("Approved by HOD " + reviewer.getInstitutionalId());
        registrationRepository.save(request);

        // 11. Write Audit Log
        auditService.logMutation(
                "FACULTY_APPROVED",
                "FACULTY_PROFILE",
                profile.getId(),
                reviewer,
                Map.of(
                        "facultyId", profile.getId(),
                        "institutionalId", user.getInstitutionalId(),
                        "email", user.getEmail(),
                        "approvedBy", reviewer.getInstitutionalId()
                )
        );

        // 12. Return safe response DTO
        AuthUserResponse response = new AuthUserResponse();
        response.setId(user.getId());
        response.setInstitutionalId(user.getInstitutionalId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole().getId());
        response.setAccountStatus(user.getAccountStatus().name());
        response.setFacultyId(profile.getId());
        response.setDepartmentId(department.getId());

        return response;
    }

    @Transactional
    public FacultyRegistrationRequest rejectRegistration(String id, String reviewerUserId, String hodNote) {
        if (hodNote == null || hodNote.trim().isEmpty()) {
            throw new MissingRejectionNoteException("Rejection note is required");
        }

        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new IllegalArgumentException("Reviewing HOD user not found: " + reviewerUserId));

        FacultyRegistrationRequest request = registrationRepository.findAndLockById(id)
                .orElseThrow(() -> new RegistrationNotFoundException("Registration request not found: " + id));

        if (request.getStatus() != RegistrationStatus.PENDING) {
            throw new RegistrationNotPendingException("Registration request is not in PENDING status: " + request.getStatus());
        }

        request.setStatus(RegistrationStatus.REJECTED);
        request.setReviewedAt(Instant.now());
        request.setHodNote(hodNote);
        request = registrationRepository.save(request);

        // Write Audit Log
        auditService.logMutation(
                "FACULTY_REJECTED",
                "FACULTY_REGISTRATION_REQUEST",
                request.getId(),
                reviewer,
                Map.of(
                        "requestInstitutionalId", request.getInstitutionalId(),
                        "email", request.getEmail(),
                        "note", hodNote,
                        "rejectedBy", reviewer.getInstitutionalId()
                )
        );

        return request;
    }
}
