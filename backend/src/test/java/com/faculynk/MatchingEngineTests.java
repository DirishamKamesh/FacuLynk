package com.faculynk;

import com.faculynk.dto.CandidateResponse;
import com.faculynk.dto.MatchingResponse;
import com.faculynk.model.entity.Department;
import com.faculynk.model.entity.FacultyInterest;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.Skill;
import com.faculynk.model.entity.Task;
import com.faculynk.model.entity.User;
import com.faculynk.model.enums.AccountStatus;
import com.faculynk.model.enums.Designation;
import com.faculynk.model.enums.ResponsibilityType;
import com.faculynk.repository.DepartmentRepository;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.RoleRepository;
import com.faculynk.repository.SkillRepository;
import com.faculynk.repository.TaskRepository;
import com.faculynk.repository.UserRepository;
import com.faculynk.service.MatchingEngine;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MatchingEngineTests {

    @Autowired
    private MatchingEngine matchingEngine;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Test
    @DisplayName("Verify Matching Engine weighted scoring and constraints")
    void testMatchingScoringAndConstraints() {
        Department cseDept = departmentRepository.findById("00000000-0000-0000-0000-000000000001").orElseThrow();
        
        // 1. Create a task with 2 required skills
        Skill skillJava = skillRepository.save(new Skill(null, "Java"));
        Skill skillSpring = skillRepository.save(new Skill(null, "Spring"));
        Set<Skill> reqSkills = new HashSet<>();
        reqSkills.add(skillJava);
        reqSkills.add(skillSpring);

        Task task = new Task();
        task.setTitle("Advanced Backend Coding");
        task.setCode("CSE-401");
        task.setType(ResponsibilityType.TEACHING);
        task.setWeeklyHours(4);
        task.setDepartment(cseDept);
        task.setRequiredSkills(reqSkills);
        task.setActive(true);
        task = taskRepository.save(task);

        // 2. Create Candidate A: matches 1 skill (50%), headroom = 20h/20h (100%), experience = 15y (100%), interest = aligned ("TEACHING")
        FacultyProfile candidateA = createTestFaculty("FAC-CAND-A", Designation.ASSISTANT_PROFESSOR, 20, 15);
        candidateA.getSkills().add(skillJava);
        candidateA.setDepartment(cseDept);
        candidateA = facultyProfileRepository.save(candidateA);

        // Add a "teaching" interest so interestScore = 100.0 for TEACHING task type
        FacultyInterest teachingInterest = new FacultyInterest(candidateA, "teaching");
        candidateA.getInterests().add(teachingInterest);
        candidateA = facultyProfileRepository.save(candidateA);

        MatchingResponse response = matchingEngine.calculateSuitability(task.getId(), null);
        
        // Find candidate A in response candidates
        final String targetId = candidateA.getId();
        CandidateResponse candA = response.getCandidates().stream()
                .filter(c -> c.getFacultyId().equals(targetId))
                .findFirst()
                .orElse(null);

        assertNotNull(candA);
        assertTrue(candA.isEligible());
        
        // Skill score: 1/2 matches = 50.0%
        assertEquals(50.0, candA.getSkillScore(), 0.01);
        // Headroom score: 20h available / 20h max = 100.0%
        assertEquals(100.0, candA.getHeadroomScore(), 0.01);
        // Experience score: 15 / 15 = 100.0%
        assertEquals(100.0, candA.getExperienceScore(), 0.01);
        // Interest score: Aligned -> 100.0%
        assertEquals(100.0, candA.getInterestScore(), 0.01);

        // Final score: (50 * 0.45) + (100 * 0.25) + (100 * 0.15) + (100 * 0.15)
        // = 22.5 + 25.0 + 15.0 + 15.0 = 77.5
        assertEquals(77.50, candA.getFinalScore(), 0.01);
    }

    @Test
    @DisplayName("Verify Matching Engine exclusions")
    void testMatchingExclusions() {
        Department cseDept = departmentRepository.findById("00000000-0000-0000-0000-000000000001").orElseThrow();
        Department eceDept = new Department();
        eceDept.setName("Electronics & Communication");
        eceDept.setCode("ECE");
        eceDept = departmentRepository.save(eceDept);

        Task task = new Task();
        task.setTitle("Lab Work");
        task.setCode("CSE-LAB");
        task.setType(ResponsibilityType.LABORATORY_SESSIONS);
        task.setWeeklyHours(6);
        task.setDepartment(cseDept);
        task.setActive(true);
        task = taskRepository.save(task);

        // 1. Inactive Faculty exclusion
        FacultyProfile inactive = createTestFaculty("FAC-EX-INACTIVE", Designation.PROFESSOR, 10, 5);
        inactive.getUser().setAccountStatus(AccountStatus.INACTIVE);
        inactive.setDepartment(cseDept);
        inactive = facultyProfileRepository.save(inactive);

        // 2. Wrong Department exclusion
        FacultyProfile wrongDept = createTestFaculty("FAC-EX-DEPT", Designation.PROFESSOR, 10, 5);
        wrongDept.setDepartment(eceDept);
        wrongDept = facultyProfileRepository.save(wrongDept);

        // 3. Insufficient Capacity exclusion
        FacultyProfile overcap = createTestFaculty("FAC-EX-CAP", Designation.PROFESSOR, 10, 5);
        overcap.setMaxWorkloadHours(5); // Cap = 5, task requires 6 -> Insufficient Capacity
        overcap.setDepartment(cseDept);
        overcap = facultyProfileRepository.save(overcap);

        final String inactiveId = inactive.getId();
        final String wrongDeptId = wrongDept.getId();
        final String overcapId = overcap.getId();

        MatchingResponse response = matchingEngine.calculateSuitability(task.getId(), "SOME_SOURCE_ID");

        // Verify exclusions exist in excludedCandidates
        assertTrue(response.getExcludedCandidates().stream().anyMatch(e -> e.getFacultyId().equals(inactiveId) && e.getReason().equals("FACULTY_INACTIVE")));
        assertTrue(response.getExcludedCandidates().stream().anyMatch(e -> e.getFacultyId().equals(wrongDeptId) && e.getReason().equals("WRONG_DEPARTMENT")));
        assertTrue(response.getExcludedCandidates().stream().anyMatch(e -> e.getFacultyId().equals(overcapId) && e.getReason().equals("INSUFFICIENT_CAPACITY")));
    }

    private FacultyProfile createTestFaculty(String instId, Designation desig, int maxcap, int experience) {
        FacultyProfile fp = new FacultyProfile();
        User user = new User();
        user.setInstitutionalId(instId);
        user.setEmail(instId + "@test.com");
        user.setFullName("Dr. " + instId);
        user.setRole(roleRepository.findById("FACULTY").orElseThrow());
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setPasswordHash("password");
        fp.setUser(userRepository.save(user));
        fp.setDepartment(departmentRepository.findById("00000000-0000-0000-0000-000000000001").orElseThrow());
        fp.setDesignation(desig);
        fp.setMaxWorkloadHours(maxcap);
        fp.setExperienceYears(experience);
        return facultyProfileRepository.save(fp);
    }
}
