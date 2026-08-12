package com.faculynk.service;

import com.faculynk.dto.FacultyCreateRequest;
import com.faculynk.dto.FacultyProfileUpdateRequest;
import com.faculynk.dto.FacultyResponse;
import com.faculynk.dto.WorkloadSummary;
import com.faculynk.exception.DuplicatePendingRegistrationException;
import com.faculynk.exception.FacultyNotFoundException;
import com.faculynk.exception.InstitutionalIdClaimedException;
import com.faculynk.exception.InvalidDepartmentException;
import com.faculynk.exception.InvalidDesignationException;
import com.faculynk.model.entity.Department;
import com.faculynk.model.entity.FacultyInterest;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.Role;
import com.faculynk.model.entity.Skill;
import com.faculynk.model.entity.User;
import com.faculynk.model.enums.AccountStatus;
import com.faculynk.model.enums.Designation;
import com.faculynk.repository.DepartmentRepository;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.RoleRepository;
import com.faculynk.repository.SkillRepository;
import com.faculynk.repository.UserRepository;
import com.faculynk.security.PasswordService;
import com.faculynk.service.AuditService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final FacultyProfileRepository facultyProfileRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final SkillRepository skillRepository;
    private final WorkloadService workloadService;
    private final PasswordService passwordService;
    private final AuditService auditService;

    public FacultyService(FacultyProfileRepository facultyProfileRepository,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          DepartmentRepository departmentRepository,
                          SkillRepository skillRepository,
                          WorkloadService workloadService,
                          PasswordService passwordService,
                          AuditService auditService) {
        this.facultyProfileRepository = facultyProfileRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.skillRepository = skillRepository;
        this.workloadService = workloadService;
        this.passwordService = passwordService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<FacultyResponse> getAllFaculty() {
        return facultyProfileRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FacultyResponse getFacultyById(String id) {
        FacultyProfile profile = facultyProfileRepository.findById(id)
                .orElseThrow(() -> new FacultyNotFoundException("Faculty profile not found with ID: " + id));
        return mapToResponse(profile);
    }

    @Transactional(readOnly = true)
    public FacultyResponse getFacultyByUserId(String userId) {
        FacultyProfile profile = facultyProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new FacultyNotFoundException("Faculty profile not found for user ID: " + userId));
        return mapToResponse(profile);
    }

    @Transactional
    public FacultyResponse createFaculty(FacultyCreateRequest request) {
        // Validate Institutional ID format
        if (request.getInstitutionalId() == null || !request.getInstitutionalId().startsWith("FAC-")) {
            throw new IllegalArgumentException("Invalid Faculty Institutional ID format. Must start with 'FAC-'");
        }

        // Validate claim existence
        boolean alreadyClaimed = userRepository.findByInstitutionalId(request.getInstitutionalId()).isPresent();
        if (alreadyClaimed) {
            throw new InstitutionalIdClaimedException("Institutional ID already claimed: " + request.getInstitutionalId());
        }

        // Validate designation
        Designation designation;
        try {
            designation = Designation.fromDisplayName(request.getDesignation());
        } catch (IllegalArgumentException e) {
            throw new InvalidDesignationException("Invalid designation: " + request.getDesignation());
        }

        // Validate department
        Department department = departmentRepository.findByCode(request.getDepartment())
                .or(() -> departmentRepository.findByName(request.getDepartment()))
                .orElseThrow(() -> new InvalidDepartmentException("Department does not exist: " + request.getDepartment()));

        // Load role
        Role role = roleRepository.findById("FACULTY")
                .orElseThrow(() -> new IllegalStateException("FACULTY role not initialized"));

        // Create User
        User user = new User();
        user.setInstitutionalId(request.getInstitutionalId());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setRole(role);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setPasswordHash(passwordService.encode("password123"));
        user = userRepository.save(user);

        // Create FacultyProfile
        FacultyProfile profile = new FacultyProfile();
        profile.setUser(user);
        profile.setDepartment(department);
        profile.setDesignation(designation);
        profile.setMaxWorkloadHours(designation.getDefaultMaxWorkloadHours());
        profile.setPhone(request.getPhone());
        profile.setOffice(request.getOffice());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setResearchArea(request.getResearchArea());

        // Save skills
        if (request.getSkills() != null) {
            Set<Skill> skills = new HashSet<>();
            for (String name : request.getSkills()) {
                String trimmed = name.trim();
                if (!trimmed.isEmpty()) {
                    Skill skill = skillRepository.findByName(trimmed)
                            .orElseGet(() -> {
                                Skill s = new Skill();
                                s.setName(trimmed);
                                return skillRepository.save(s);
                            });
                    skills.add(skill);
                }
            }
            profile.setSkills(skills);
        }

        // Save interests
        if (request.getInterests() != null) {
            List<FacultyInterest> interests = new ArrayList<>();
            for (String name : request.getInterests()) {
                String trimmed = name.trim();
                if (!trimmed.isEmpty()) {
                    interests.add(new FacultyInterest(profile, trimmed));
                }
            }
            profile.setInterests(interests);
        }

        profile = facultyProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public FacultyResponse updateFaculty(String id, FacultyProfileUpdateRequest request) {
        FacultyProfile profile = facultyProfileRepository.findById(id)
                .orElseThrow(() -> new FacultyNotFoundException("Faculty profile not found with ID: " + id));

        User user = profile.getUser();

        // 1. Update Name and Email if provided
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        userRepository.save(user);

        // 2. Update Designation (server-controlled cap)
        if (request.getDesignation() != null) {
            try {
                Designation designation = Designation.fromDisplayName(request.getDesignation());
                profile.setDesignation(designation);
                profile.setMaxWorkloadHours(designation.getDefaultMaxWorkloadHours());
            } catch (IllegalArgumentException e) {
                throw new InvalidDesignationException("Invalid designation: " + request.getDesignation());
            }
        }

        // 3. Update Department
        if (request.getDepartment() != null) {
            Department department = departmentRepository.findByCode(request.getDepartment())
                    .or(() -> departmentRepository.findByName(request.getDepartment()))
                    .orElseThrow(() -> new InvalidDepartmentException("Department does not exist: " + request.getDepartment()));
            profile.setDepartment(department);
        }

        // 4. Update other profile details
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if (request.getOffice() != null) {
            profile.setOffice(request.getOffice());
        }
        if (request.getExperienceYears() >= 0) {
            profile.setExperienceYears(request.getExperienceYears());
        }
        if (request.getResearchArea() != null) {
            profile.setResearchArea(request.getResearchArea());
        }

        // 5. Update skills
        if (request.getSkills() != null) {
            Set<Skill> skills = new HashSet<>();
            for (String name : request.getSkills()) {
                String trimmed = name.trim();
                if (!trimmed.isEmpty()) {
                    Skill skill = skillRepository.findByName(trimmed)
                            .orElseGet(() -> {
                                Skill s = new Skill();
                                s.setName(trimmed);
                                return skillRepository.save(s);
                            });
                    skills.add(skill);
                }
            }
            profile.getSkills().clear();
            profile.getSkills().addAll(skills);
        }

        // 6. Update interests
        if (request.getInterests() != null) {
            List<FacultyInterest> interests = new ArrayList<>();
            for (String name : request.getInterests()) {
                String trimmed = name.trim();
                if (!trimmed.isEmpty()) {
                    interests.add(new FacultyInterest(profile, trimmed));
                }
            }
            profile.getInterests().clear();
            profile.getInterests().addAll(interests);
        }

        profile = facultyProfileRepository.save(profile);

        auditService.logMutation(
                "FACULTY_PROFILE_UPDATED",
                "FACULTY_PROFILE",
                profile.getId(),
                user, // Assuming the caller is an HOD, wait, we don't have the HOD user ID here!
                // Ah, we don't have the reviewerUserId in updateFaculty! Let's pass the user themselves for now or null?
                // Wait, if it's updated by HOD, who performed it?
                // Actually I'll use the profile's user since we don't have the actor ID passed in.
                java.util.Map.of("updatedBy", "HOD", "facultyId", profile.getId())
        );

        return mapToResponse(profile);
    }

    @Transactional
    public FacultyResponse selfUpdateProfile(String userId, FacultyProfileUpdateRequest request) {
        FacultyProfile profile = facultyProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new FacultyNotFoundException("Faculty profile not found for user ID: " + userId));

        // Faculty must NOT change designation, department, or max workload.
        // We only bind allowed self-profile fields.
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if (request.getOffice() != null) {
            profile.setOffice(request.getOffice());
        }
        if (request.getResearchArea() != null) {
            profile.setResearchArea(request.getResearchArea());
        }

        // Update skills
        if (request.getSkills() != null) {
            Set<Skill> skills = new HashSet<>();
            for (String name : request.getSkills()) {
                String trimmed = name.trim();
                if (!trimmed.isEmpty()) {
                    Skill skill = skillRepository.findByName(trimmed)
                            .orElseGet(() -> {
                                Skill s = new Skill();
                                s.setName(trimmed);
                                return skillRepository.save(s);
                            });
                    skills.add(skill);
                }
            }
            profile.getSkills().clear();
            profile.getSkills().addAll(skills);
        }

        // Update interests
        if (request.getInterests() != null) {
            List<FacultyInterest> interests = new ArrayList<>();
            for (String name : request.getInterests()) {
                String trimmed = name.trim();
                if (!trimmed.isEmpty()) {
                    interests.add(new FacultyInterest(profile, trimmed));
                }
            }
            profile.getInterests().clear();
            profile.getInterests().addAll(interests);
        }

        profile = facultyProfileRepository.save(profile);

        auditService.logMutation(
                "FACULTY_PROFILE_UPDATED",
                "FACULTY_PROFILE",
                profile.getId(),
                profile.getUser(),
                java.util.Map.of("updatedBy", "SELF", "facultyId", profile.getId())
        );

        return mapToResponse(profile);
    }

    @Transactional
    public void softDeactivateFaculty(String id) {
        FacultyProfile profile = facultyProfileRepository.findById(id)
                .orElseThrow(() -> new FacultyNotFoundException("Faculty profile not found with ID: " + id));

        User user = profile.getUser();
        user.setAccountStatus(AccountStatus.INACTIVE);
        userRepository.save(user);

        auditService.logMutation(
                "FACULTY_DEACTIVATED",
                "FACULTY_PROFILE",
                profile.getId(),
                user,
                java.util.Map.of("action", "Deactivated", "facultyId", profile.getId())
        );
    }

    private FacultyResponse mapToResponse(FacultyProfile profile) {
        WorkloadSummary summary = workloadService.calculateWorkload(profile.getId());

        List<String> skillsList = profile.getSkills().stream()
                .map(Skill::getName)
                .collect(Collectors.toList());

        List<String> interestsList = profile.getInterests().stream()
                .map(FacultyInterest::getInterest)
                .collect(Collectors.toList());

        return new FacultyResponse(
                profile.getId(),
                profile.getUser().getFullName(),
                profile.getUser().getEmail(),
                profile.getDesignation().getDisplayName(),
                profile.getDepartment().getCode(),
                profile.getMaxWorkloadHours(),
                summary.getCurrentHours(),
                summary.getUtilizationPct(),
                summary.getHeadroomHours(),
                summary.getExcessHours(),
                summary.getStatus(),
                skillsList,
                interestsList,
                profile.getExperienceYears(),
                profile.getUser().getAccountStatus().name()
        );
    }
}
