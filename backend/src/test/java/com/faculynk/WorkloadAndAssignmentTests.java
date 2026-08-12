package com.faculynk;

import com.faculynk.auth.dto.LoginRequest;
import com.faculynk.dto.AssignmentRequest;
import com.faculynk.dto.FacultyProfileUpdateRequest;
import com.faculynk.dto.FacultyResponse;
import com.faculynk.dto.TaskRequest;
import com.faculynk.dto.TaskResponse;
import com.faculynk.dto.WorkloadSummary;
import com.faculynk.exception.CapacityExceededException;
import com.faculynk.model.entity.Department;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.Task;
import com.faculynk.model.entity.TaskAssignment;
import com.faculynk.model.enums.AssignmentStatus;
import com.faculynk.model.enums.Designation;
import com.faculynk.model.enums.ResponsibilityType;
import com.faculynk.repository.DepartmentRepository;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.TaskAssignmentRepository;
import com.faculynk.repository.TaskRepository;
import com.faculynk.model.entity.User;
import com.faculynk.model.enums.AccountStatus;
import com.faculynk.repository.RoleRepository;
import com.faculynk.repository.UserRepository;
import com.faculynk.security.JwtTokenProvider;
import com.faculynk.service.TaskAssignmentService;
import com.faculynk.service.WorkloadService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class WorkloadAndAssignmentTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskAssignmentRepository taskAssignmentRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TaskAssignmentService taskAssignmentService;

    @Autowired
    private WorkloadService workloadService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private org.springframework.transaction.PlatformTransactionManager transactionManager;

    private String hod1UserId = "10000000-0000-0000-0000-000000000001";
    private String faculty1UserId = "10000000-0000-0000-0000-000000000003";

    private String hodFacultyProfileId = "20000000-0000-0000-0000-000000000001";
    private String targetFacultyProfileId = "20000000-0000-0000-0000-000000000003"; // Dr. Aris Thorne

    private Cookie hodCookie;
    private Cookie facultyCookie;

    @BeforeEach
    void setUp() {
        String hodToken = tokenProvider.generateToken(hod1UserId, "HOD", "HOD-001");
        hodCookie = new Cookie("FACULYNK_TOKEN", hodToken);

        String facultyToken = tokenProvider.generateToken(faculty1UserId, "FACULTY", "FAC-1001");
        facultyCookie = new Cookie("FACULYNK_TOKEN", facultyToken);
    }

    @Test
    @DisplayName("1. Derivation test: Sum hours of ACTIVE task assignments correctly")
    void testDerivationOfWorkload() {
        // Dr. Sarah Vance (id: 20000000-0000-0000-0000-000000000001) has assignments:
        // task 1: 3h, task 2: 4h, task 3: 4h, task 4: 3h -> Sum = 14 hours.
        String vanceFacultyId = "20000000-0000-0000-0000-000000000001";
        WorkloadSummary summary = workloadService.calculateWorkload(vanceFacultyId);
        assertEquals(14, summary.getCurrentHours());
    }

    @Test
    @DisplayName("2. Valid assignment succeeds")
    void testValidAssignment() throws Exception {
        // Find an unassigned task in CSE department
        Task unassignedTask = taskRepository.saveAndFlush(createTestTask("Unassigned Lab", "LAB-UN", 2, "00000000-0000-0000-0000-000000000001"));

        AssignmentRequest req = new AssignmentRequest(targetFacultyProfileId);

        mockMvc.perform(post("/api/tasks/" + unassignedTask.getId() + "/assign")
                        .cookie(hodCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignedToFacultyId").value(targetFacultyProfileId));
    }

    @Test
    @DisplayName("3. Assignment exactly to capacity succeeds, exceeding capacity returns 409")
    void testCapacityCapping() throws Exception {
        // Dr. Aris Thorne (cap = 20) currently has 12h workload (headroom = 8h)
        // Task A = 8h -> exactly to capacity
        Task taskA = taskRepository.saveAndFlush(createTestTask("Capstone Special", "CAP-8H", 8, "00000000-0000-0000-0000-000000000001"));

        mockMvc.perform(post("/api/tasks/" + taskA.getId() + "/assign")
                        .cookie(hodCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignmentRequest(targetFacultyProfileId))))
                .andExpect(status().isOk());

        // Now Thorne has 20h workload. Trying to assign Task B (2h) should fail with 409 CAPACITY_EXCEEDED
        Task taskB = taskRepository.saveAndFlush(createTestTask("Accreditation Support", "ACC-2H", 2, "00000000-0000-0000-0000-000000000001"));

        mockMvc.perform(post("/api/tasks/" + taskB.getId() + "/assign")
                        .cookie(hodCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignmentRequest(targetFacultyProfileId))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("CAPACITY_EXCEEDED"))
                .andExpect(jsonPath("$.currentHours").value(20))
                .andExpect(jsonPath("$.taskHours").value(2))
                .andExpect(jsonPath("$.projectedHours").value(22))
                .andExpect(jsonPath("$.maxHours").value(20));
    }

    @Test
    @DisplayName("4. Already assigned task cannot receive second active assignment")
    void testAlreadyAssignedTaskFails() throws Exception {
        // Thorne is assigned scale神经网络 research lab (40000000-0000-0000-0000-000000000010)
        String assignedTaskId = "40000000-0000-0000-0000-000000000010";

        mockMvc.perform(post("/api/tasks/" + assignedTaskId + "/assign")
                        .cookie(hodCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignmentRequest(targetFacultyProfileId))))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("5-8. Reassignment closes old active assignment, creates new one, and preserves history")
    void testReassignmentFlowAndHistory() throws Exception {
        // Task scale neural indexing (id: 40000000-0000-0000-0000-000000000010, 4h) is assigned to Aris Thorne
        String taskId = "40000000-0000-0000-0000-000000000010";
        String oldFacultyId = "20000000-0000-0000-0000-000000000003"; // Aris Thorne
        String newFacultyId = "20000000-0000-0000-0000-000000000002"; // Jim Cokely

        // Jim Cokely (max 10) currently has 14h workload (overloaded).
        // Let's programmatically update Cokely's designation to Assistant Professor (max 20) so he has headroom
        FacultyProfile cokelyProfile = facultyProfileRepository.findById(newFacultyId).orElseThrow();
        cokelyProfile.setDesignation(Designation.ASSISTANT_PROFESSOR);
        cokelyProfile.setMaxWorkloadHours(20);
        facultyProfileRepository.saveAndFlush(cokelyProfile);

        // Reassign
        mockMvc.perform(post("/api/tasks/" + taskId + "/reassign")
                        .cookie(hodCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignmentRequest(newFacultyId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignedToFacultyId").value(newFacultyId));

        // Check Cokely workload updated: 14h + 4h = 18h
        assertEquals(18, workloadService.calculateWorkload(newFacultyId).getCurrentHours());

        // Check Thorne workload decreased: 12h - 4h = 8h
        assertEquals(8, workloadService.calculateWorkload(oldFacultyId).getCurrentHours());

        // Verify history: old assignment is CLOSED, new one is ACTIVE
        List<TaskAssignment> assignments = taskAssignmentRepository.findByTaskId(taskId);
        assertEquals(2, assignments.size());
        assertTrue(assignments.stream().anyMatch(ta -> ta.getFaculty().getId().equals(oldFacultyId) && ta.getStatus() == AssignmentStatus.CLOSED));
        assertTrue(assignments.stream().anyMatch(ta -> ta.getFaculty().getId().equals(newFacultyId) && ta.getStatus() == AssignmentStatus.ACTIVE));
    }

    @Test
    @DisplayName("9. Concurrency: Two simultaneous 5h assignments on 6h headroom")
    void testConcurrencyAssignmentCapping() throws InterruptedException, ExecutionException {
        org.springframework.transaction.support.TransactionTemplate txTemplate =
                new org.springframework.transaction.support.TransactionTemplate(transactionManager);
        txTemplate.setPropagationBehavior(org.springframework.transaction.TransactionDefinition.PROPAGATION_REQUIRES_NEW);

        // Setup fresh faculty profile in separate transaction to ensure visibility
        // Maxcap: 10h (Professor)
        String facultyId = txTemplate.execute(status -> {
            FacultyProfile fp = new FacultyProfile();
            User user = new User();
            user.setInstitutionalId("FAC-CONC-WORK");
            user.setEmail("concw@test.com");
            user.setFullName("Dr. Concurrency Workload");
            user.setRole(roleRepository.findById("FACULTY").orElseThrow());
            user.setAccountStatus(AccountStatus.ACTIVE);
            user.setPasswordHash("password");
            fp.setUser(userRepository.save(user));
            fp.setDepartment(departmentRepository.findById("00000000-0000-0000-0000-000000000001").orElseThrow());
            fp.setDesignation(Designation.PROFESSOR);
            fp.setMaxWorkloadHours(10);
            return facultyProfileRepository.save(fp).getId();
        });

        // Current workload: 5h (assigned Task A)
        txTemplate.executeWithoutResult(status -> {
            Task taskA = createTestTask("Core Lab", "LAB-5H-A", 5, "00000000-0000-0000-0000-000000000001");
            taskRepository.save(taskA);
            TaskAssignment ta = new TaskAssignment();
            ta.setTask(taskA);
            ta.setFaculty(facultyProfileRepository.findById(facultyId).orElseThrow());
            ta.setStatus(AssignmentStatus.ACTIVE);
            taskAssignmentRepository.save(ta);
        });

        // Now faculty has 5h workload, maxcap = 10h. Headroom = 5h.
        // Task B (5h) and Task C (5h) are submitted simultaneously.
        String taskBId = txTemplate.execute(status -> taskRepository.save(createTestTask("Elective A", "EL-5H-B", 5, "00000000-0000-0000-0000-000000000001")).getId());
        String taskCId = txTemplate.execute(status -> taskRepository.save(createTestTask("Elective B", "EL-5H-C", 5, "00000000-0000-0000-0000-000000000001")).getId());

        ExecutorService executor = Executors.newFixedThreadPool(2);

        CompletableFuture<TaskResponse> threadB = CompletableFuture.supplyAsync(() -> {
            try {
                return taskAssignmentService.assignTask(taskBId, facultyId, hod1UserId);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, executor);

        CompletableFuture<TaskResponse> threadC = CompletableFuture.supplyAsync(() -> {
            try {
                return taskAssignmentService.assignTask(taskCId, facultyId, hod1UserId);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, executor);

        CompletableFuture<Void> both = CompletableFuture.allOf(threadB, threadC);

        try {
            both.get();
            fail("Expected one assignment to be rejected due to capacity check");
        } catch (ExecutionException e) {
            Throwable cause = e.getCause();
            assertTrue(
                cause instanceof CapacityExceededException ||
                cause.getCause() instanceof CapacityExceededException ||
                cause.getMessage().contains("CapacityExceededException") ||
                cause.getMessage().contains("capacity")
            );
        }

        // Verify that only 1 additional assignment succeeded
        txTemplate.executeWithoutResult(status -> {
            List<TaskAssignment> assignments = taskAssignmentRepository.findByFacultyIdAndStatus(facultyId, AssignmentStatus.ACTIVE);
            assertEquals(2, assignments.size()); // 5h initial + 5h additional = 10h
        });

        // Cleanup
        txTemplate.executeWithoutResult(status -> {
            taskAssignmentRepository.findByFacultyId(facultyId).forEach(taskAssignmentRepository::delete);
            taskRepository.deleteById(taskBId);
            taskRepository.deleteById(taskCId);
            FacultyProfile fp = facultyProfileRepository.findById(facultyId).orElseThrow();
            facultyProfileRepository.delete(fp);
            userRepository.delete(fp.getUser());
        });

        executor.shutdown();
    }

    @Test
    @DisplayName("10. Authorization: Faculty blocked from task mutations and modifying other profiles")
    void testAuthorizationControls() throws Exception {
        // Faculty trying to create a task -> 403
        TaskRequest req = new TaskRequest();
        req.setTitle("Violating Task");
        req.setCode("VIOL-001");
        req.setType("TEACHING");
        req.setWeeklyHours(3);
        req.setDepartment("CSE");

        mockMvc.perform(post("/api/tasks")
                        .cookie(facultyCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());

        // Faculty trying to update another faculty profile -> 403
        FacultyProfileUpdateRequest updateReq = new FacultyProfileUpdateRequest();
        updateReq.setPhone("+1 (555) 000-0000");

        mockMvc.perform(put("/api/faculty/" + hodFacultyProfileId)
                        .cookie(facultyCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("11. Ownership enforcement: Faculty user cannot view another faculty workload")
    void testWorkloadOwnershipEnforcement() throws Exception {
        // targetFacultyProfileId belongs to Dr. Aris Thorne.
        // facultyCookie belongs to Dr. Sarah Vance (faculty1UserId).
        // Vance attempting to view Thorne's workload -> 403 Forbidden
        mockMvc.perform(get("/api/workload/faculty/" + targetFacultyProfileId)
                        .cookie(facultyCookie))
                .andExpect(status().isForbidden());

        // Vance viewing her own workload -> 200 OK
        mockMvc.perform(get("/api/workload/faculty/" + hodFacultyProfileId)
                        .cookie(facultyCookie))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("12. Boundary assignment tests (9/10, 15/16, 19/20)")
    void testBoundaryAssignmentCapping() {
        org.springframework.transaction.support.TransactionTemplate txTemplate =
                new org.springframework.transaction.support.TransactionTemplate(transactionManager);
        txTemplate.setPropagationBehavior(org.springframework.transaction.TransactionDefinition.PROPAGATION_REQUIRES_NEW);

        // 1. Professor (cap=10): 9/10 + 1h (allowed), 9/10 + 2h (409)
        txTemplate.executeWithoutResult(status -> {
            String fId = createTestFaculty("FAC-BND-1", Designation.PROFESSOR, 10);
            
            // Assign 9h
            Task t9 = taskRepository.save(createTestTask("T9", "T9", 9, "00000000-0000-0000-0000-000000000001"));
            taskAssignmentService.assignTask(t9.getId(), fId, hod1UserId);

            // 9/10 + 1h (allowed)
            Task t1 = taskRepository.save(createTestTask("T1", "T1", 1, "00000000-0000-0000-0000-000000000001"));
            assertNotNull(taskAssignmentService.assignTask(t1.getId(), fId, hod1UserId));

            // Clean assignments and try 9/10 + 2h (fails)
            taskAssignmentRepository.findByFacultyId(fId).forEach(taskAssignmentRepository::delete);
            taskAssignmentService.assignTask(t9.getId(), fId, hod1UserId);
            
            Task t2 = taskRepository.save(createTestTask("T2", "T2", 2, "00000000-0000-0000-0000-000000000001"));
            assertThrows(CapacityExceededException.class, () ->
                taskAssignmentService.assignTask(t2.getId(), fId, hod1UserId)
            );
            status.setRollbackOnly();
        });

        // 2. Associate (cap=16): 15/16 + 1h (allowed), 15/16 + 2h (409)
        txTemplate.executeWithoutResult(status -> {
            String fId = createTestFaculty("FAC-BND-2", Designation.ASSOCIATE_PROFESSOR, 16);
            
            Task t15 = taskRepository.save(createTestTask("T15", "T15", 15, "00000000-0000-0000-0000-000000000001"));
            taskAssignmentService.assignTask(t15.getId(), fId, hod1UserId);

            Task t1 = taskRepository.save(createTestTask("T1b", "T1b", 1, "00000000-0000-0000-0000-000000000001"));
            assertNotNull(taskAssignmentService.assignTask(t1.getId(), fId, hod1UserId));

            taskAssignmentRepository.findByFacultyId(fId).forEach(taskAssignmentRepository::delete);
            taskAssignmentService.assignTask(t15.getId(), fId, hod1UserId);
            
            Task t2 = taskRepository.save(createTestTask("T2b", "T2b", 2, "00000000-0000-0000-0000-000000000001"));
            assertThrows(CapacityExceededException.class, () ->
                taskAssignmentService.assignTask(t2.getId(), fId, hod1UserId)
            );
            status.setRollbackOnly();
        });

        // 3. Assistant (cap=20): 19/20 + 1h (allowed), 19/20 + 2h (409)
        txTemplate.executeWithoutResult(status -> {
            String fId = createTestFaculty("FAC-BND-3", Designation.ASSISTANT_PROFESSOR, 20);
            
            Task t19 = taskRepository.save(createTestTask("T19", "T19", 19, "00000000-0000-0000-0000-000000000001"));
            taskAssignmentService.assignTask(t19.getId(), fId, hod1UserId);

            Task t1 = taskRepository.save(createTestTask("T1c", "T1c", 1, "00000000-0000-0000-0000-000000000001"));
            assertNotNull(taskAssignmentService.assignTask(t1.getId(), fId, hod1UserId));

            taskAssignmentRepository.findByFacultyId(fId).forEach(taskAssignmentRepository::delete);
            taskAssignmentService.assignTask(t19.getId(), fId, hod1UserId);
            
            Task t2 = taskRepository.save(createTestTask("T2c", "T2c", 2, "00000000-0000-0000-0000-000000000001"));
            assertThrows(CapacityExceededException.class, () ->
                taskAssignmentService.assignTask(t2.getId(), fId, hod1UserId)
            );
            status.setRollbackOnly();
        });
    }

    private Task createTestTask(String title, String code, int hours, String departmentId) {
        Task t = new Task();
        t.setTitle(title);
        t.setCode(code);
        t.setType(ResponsibilityType.TEACHING);
        t.setWeeklyHours(hours);
        t.setDepartment(departmentRepository.findById(departmentId).orElseThrow());
        t.setActive(true);
        return t;
    }

    private String createTestFaculty(String instId, Designation desig, int maxcap) {
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
        return facultyProfileRepository.save(fp).getId();
    }
}
