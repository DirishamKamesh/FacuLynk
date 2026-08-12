package com.faculynk;

import com.faculynk.model.entity.Department;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.FacultyRegistrationRequest;
import com.faculynk.model.entity.RebalanceRequest;
import com.faculynk.model.entity.Recommendation;
import com.faculynk.model.entity.Role;
import com.faculynk.model.entity.Task;
import com.faculynk.model.entity.TaskAssignment;
import com.faculynk.model.entity.User;
import com.faculynk.model.enums.AccountStatus;
import com.faculynk.model.enums.AssignmentStatus;
import com.faculynk.model.enums.Designation;
import com.faculynk.model.enums.RebalanceStatus;
import com.faculynk.model.enums.RecommendationStatus;
import com.faculynk.model.enums.RegistrationStatus;
import com.faculynk.model.enums.ResponsibilityType;
import com.faculynk.repository.AuditLogRepository;
import com.faculynk.repository.DepartmentRepository;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.FacultyRegistrationRequestRepository;
import com.faculynk.repository.RebalanceRequestRepository;
import com.faculynk.repository.RecommendationItemRepository;
import com.faculynk.repository.RecommendationRepository;
import com.faculynk.repository.RoleRepository;
import com.faculynk.repository.SkillRepository;
import com.faculynk.repository.TaskAssignmentRepository;
import com.faculynk.repository.TaskRepository;
import com.faculynk.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EntityAndRepositoryTests {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private FacultyRegistrationRequestRepository registrationRequestRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskAssignmentRepository taskAssignmentRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private RecommendationItemRepository recommendationItemRepository;

    @Autowired
    private RebalanceRequestRepository rebalanceRequestRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    @DisplayName("1. Verify roles seeded correctly")
    void testRolesSeeded() {
        assertEquals(2, roleRepository.count());
        assertTrue(roleRepository.existsById("HOD"));
        assertTrue(roleRepository.existsById("FACULTY"));
    }

    @Test
    @DisplayName("2. Verify departments seeded correctly")
    void testDepartmentsSeeded() {
        assertEquals(1, departmentRepository.count());
        Optional<Department> dept = departmentRepository.findByCode("CSE");
        assertTrue(dept.isPresent());
        assertEquals("Computer Science & Engineering", dept.get().getName());
    }

    @Test
    @DisplayName("3. Verify users & security query support")
    void testUsersSeeded() {
        assertEquals(10, userRepository.count());

        Optional<User> hod = userRepository.findByInstitutionalId("HOD-001");
        assertTrue(hod.isPresent());
        assertEquals("HOD", hod.get().getRole().getId());
        assertEquals(AccountStatus.ACTIVE, hod.get().getAccountStatus());

        Optional<User> facultyUser = userRepository.findByEmail("svance@university.edu");
        assertTrue(facultyUser.isPresent());
        assertEquals("Dr. Sarah Vance", facultyUser.get().getFullName());
    }

    @Test
    @DisplayName("4. Verify faculty profiles & designations")
    void testFacultyProfilesSeeded() {
        assertEquals(8, facultyProfileRepository.count());

        Optional<FacultyProfile> sarah = facultyProfileRepository.findByUserInstitutionalId("FAC-1001");
        assertTrue(sarah.isPresent());
        assertEquals(Designation.PROFESSOR, sarah.get().getDesignation());
        assertEquals(10, sarah.get().getMaxWorkloadHours());
        assertFalse(sarah.get().getSkills().isEmpty());
        assertFalse(sarah.get().getInterests().isEmpty());
    }

    @Test
    @DisplayName("5. Verify skills seeded correctly")
    void testSkillsSeeded() {
        assertEquals(29, skillRepository.count());
        assertTrue(skillRepository.findByName("Database Systems").isPresent());
    }

    @Test
    @DisplayName("6. CRITICAL QUERY — Verify raw aggregate workload calculation")
    void testWorkloadAggregationQuery() {
        // Dr. Sarah Vance (FAC-1001): 4 assigned active tasks (3 + 4 + 4 + 3 = 14 hrs)
        Optional<FacultyProfile> sarah = facultyProfileRepository.findByUserInstitutionalId("FAC-1001");
        assertTrue(sarah.isPresent());
        int sarahHours = taskAssignmentRepository.calculateCurrentWorkloadHours(sarah.get().getId());
        assertEquals(14, sarahHours, "Dr. Sarah Vance should have 14 derived workload hours");

        // Dr. Jim Cokely (FAC-1002): 3 tasks (4 + 5 + 5 = 14 hrs)
        Optional<FacultyProfile> jim = facultyProfileRepository.findByUserInstitutionalId("FAC-1002");
        assertTrue(jim.isPresent());
        int jimHours = taskAssignmentRepository.calculateCurrentWorkloadHours(jim.get().getId());
        assertEquals(14, jimHours, "Dr. Jim Cokely should have 14 derived workload hours");

        // Dr. Aris Thorne (FAC-1003): 3 tasks (3 + 5 + 4 = 12 hrs)
        Optional<FacultyProfile> aris = facultyProfileRepository.findByUserInstitutionalId("FAC-1003");
        assertTrue(aris.isPresent());
        int arisHours = taskAssignmentRepository.calculateCurrentWorkloadHours(aris.get().getId());
        assertEquals(12, arisHours, "Dr. Aris Thorne should have 12 derived workload hours");

        // Dr. Joe Smith (FAC-1004): 2 tasks (5 + 4 = 9 hrs)
        Optional<FacultyProfile> joe = facultyProfileRepository.findByUserInstitutionalId("FAC-1004");
        assertTrue(joe.isPresent());
        int joeHours = taskAssignmentRepository.calculateCurrentWorkloadHours(joe.get().getId());
        assertEquals(9, joeHours, "Dr. Joe Smith should have 9 derived workload hours");
    }

    @Test
    @DisplayName("7. Verify task assignments & unassigned tasks queries")
    void testAssignmentsAndUnassignedTasks() {
        // Total tasks seeded = 27
        assertEquals(27, taskRepository.count());

        // Active task assignments = 25
        List<TaskAssignment> activeAssignments = taskAssignmentRepository.findByFacultyDepartmentIdAndStatus(
            departmentRepository.findByCode("CSE").get().getId(), AssignmentStatus.ACTIVE
        );
        assertEquals(25, activeAssignments.size());

        // Unassigned tasks = 2 (ADMIN-CURR, RES-NSF-2026)
        List<Task> unassigned = taskRepository.findUnassignedTasks();
        assertEquals(2, unassigned.size(), "Should have exactly 2 unassigned tasks");
    }

    @Test
    @DisplayName("8. Verify PS-08 responsibility types on tasks")
    void testTaskTypes() {
        List<Task> teachingTasks = taskRepository.findByType(ResponsibilityType.TEACHING);
        assertFalse(teachingTasks.isEmpty());

        List<Task> labTasks = taskRepository.findByType(ResponsibilityType.LABORATORY_SESSIONS);
        assertFalse(labTasks.isEmpty());
    }

    @Test
    @DisplayName("9. Verify registration requests queries")
    void testRegistrationRequests() {
        assertEquals(1, registrationRequestRepository.count());
        List<FacultyRegistrationRequest> pending = registrationRequestRepository.findByStatus(RegistrationStatus.PENDING);
        assertEquals(1, pending.size());
        assertEquals("FAC-1009", pending.get(0).getInstitutionalId());
    }

    @Test
    @DisplayName("10. Verify recommendations & items queries")
    void testRecommendationsQueries() {
        assertEquals(2, recommendationRepository.count());
        assertEquals(3, recommendationItemRepository.count());

        List<Recommendation> pendingRecs = recommendationRepository.findByStatus(RecommendationStatus.PENDING);
        assertEquals(2, pendingRecs.size());
    }

    @Test
    @DisplayName("11. Verify rebalance requests queries")
    void testRebalanceRequestsQueries() {
        assertEquals(2, rebalanceRequestRepository.count());
        List<RebalanceRequest> pendingRequests = rebalanceRequestRepository.findByStatus(RebalanceStatus.PENDING);
        assertEquals(2, pendingRequests.size());
    }
}
