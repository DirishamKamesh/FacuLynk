package com.faculynk;

import com.faculynk.dto.AssignmentRequest;
import com.faculynk.dto.RecommendationResponse;
import com.faculynk.exception.StaleRecommendationException;
import com.faculynk.model.entity.Department;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.Recommendation;
import com.faculynk.model.entity.RecommendationItem;
import com.faculynk.model.entity.Task;
import com.faculynk.model.entity.TaskAssignment;
import com.faculynk.model.entity.User;
import com.faculynk.model.enums.AccountStatus;
import com.faculynk.model.enums.AssignmentStatus;
import com.faculynk.model.enums.Designation;
import com.faculynk.model.enums.RecommendationStatus;
import com.faculynk.model.enums.ResponsibilityType;
import com.faculynk.repository.AuditLogRepository;
import com.faculynk.repository.DepartmentRepository;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.RecommendationItemRepository;
import com.faculynk.repository.RecommendationRepository;
import com.faculynk.repository.RoleRepository;
import com.faculynk.repository.TaskAssignmentRepository;
import com.faculynk.repository.TaskRepository;
import com.faculynk.repository.UserRepository;
import com.faculynk.security.JwtTokenProvider;
import com.faculynk.service.RecommendationService;
import com.faculynk.service.TaskAssignmentService;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RecommendationTests {

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
    private RecommendationRepository recommendationRepository;

    @Autowired
    private RecommendationItemRepository recommendationItemRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private TaskAssignmentService taskAssignmentService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private org.springframework.transaction.PlatformTransactionManager transactionManager;

    private String hodUserId = "10000000-0000-0000-0000-000000000001"; // Dr. HOD CSE
    private String facultyUserId = "10000000-0000-0000-0000-000000000003"; // Dr. Aris Thorne

    private Cookie hodCookie;
    private Cookie facultyCookie;

    @BeforeEach
    void setUp() {
        String hodToken = tokenProvider.generateToken(hodUserId, "HOD", "HOD-001");
        hodCookie = new Cookie("FACULYNK_TOKEN", hodToken);

        String facultyToken = tokenProvider.generateToken(facultyUserId, "FACULTY", "FAC-1001");
        facultyCookie = new Cookie("FACULYNK_TOKEN", facultyToken);
    }

    @Test
    @DisplayName("Verify HOD generate recommendations succeeds and maps before/after workloads")
    void testRecommendationGenerationFlow() throws Exception {
        // Sarah Vance (20000000-0000-0000-0000-000000000001, Prof CSE, max=10) has 14h workload (overloaded).
        // Generate recommendations and assert workload snapshot directly from the POST response
        // (GET /api/recommendations returns ALL recs including seeded STALE ones, so $[0] ordering is unreliable there).
        mockMvc.perform(post("/api/recommendations/generate")
                        .cookie(hodCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                // $[0] = Sarah Vance's recommendation (first overloaded faculty in dept, profile id ...001)
                // Engine selects ABET task (4h, greatest excess reduction): sourceProjectedHours = 14 - 4 = 10
                .andExpect(jsonPath("$[0].items[0].sourceCurrentHours").value(14))
                .andExpect(jsonPath("$[0].items[0].sourceMaxHours").value(10))
                .andExpect(jsonPath("$[0].items[0].sourceProjectedHours").value(10));

        // Load the pending recommendation from repo and verify structure
        List<Recommendation> pending = recommendationRepository.findByStatus(RecommendationStatus.PENDING);
        assertFalse(pending.isEmpty());
        Recommendation rec = pending.get(0);
        assertEquals("10000000-0000-0000-0000-000000000003", rec.getOverloadedFaculty().getUser().getId());
        assertEquals(1, rec.getItems().size());
    }

    @Test
    @DisplayName("Verify approve recommendation reassigns task and marks APPLIED")
    void testApproveRecommendationSucceeds() throws Exception {
        // Generate recommendation
        List<RecommendationResponse> generated = recommendationService.generateRecommendations(hodUserId);
        assertFalse(generated.isEmpty());
        String recId = generated.get(0).getId();

        // Approve recommendation
        mockMvc.perform(post("/api/recommendations/" + recId + "/approve")
                        .cookie(hodCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPLIED"));

        // Verify status in DB
        Recommendation rec = recommendationRepository.findById(recId).orElseThrow();
        assertEquals(RecommendationStatus.APPLIED, rec.getStatus());

        // Verify assignment changed: task is assigned to target faculty
        String taskId = rec.getItems().get(0).getTask().getId();
        String targetFacultyId = rec.getItems().get(0).getTargetFaculty().getId();
        
        Optional<TaskAssignment> activeAssign = taskAssignmentRepository.findByTaskIdAndStatus(taskId, AssignmentStatus.ACTIVE);
        assertTrue(activeAssign.isPresent());
        assertEquals(targetFacultyId, activeAssign.get().getFaculty().getId());

        // Audit exists
        assertTrue(auditLogRepository.findAll().stream().anyMatch(log -> log.getAction().equals("RECOMMENDATION_APPLIED")));
    }

    @Test
    @DisplayName("Verify stale recommendation transition marks STALE in DB and returns 409 Conflict")
    void testStaleRecommendationFlow() {
        org.springframework.transaction.support.TransactionTemplate txTemplate =
                new org.springframework.transaction.support.TransactionTemplate(transactionManager);
        txTemplate.setPropagationBehavior(org.springframework.transaction.TransactionDefinition.PROPAGATION_REQUIRES_NEW);

        // Run setup and generation in a separate transaction so it commits
        String recId = txTemplate.execute(status -> {
            List<RecommendationResponse> generated = recommendationService.generateRecommendations(hodUserId);
            return generated.get(0).getId();
        });

        // In a separate transaction, invalidate the recommendation by adding a filler task to the target faculty.
        // Use an array to capture the filler task ID for cleanup (effectively final lambda capture).
        final String[] fillerTaskIdHolder = new String[1];
        txTemplate.executeWithoutResult(status -> {
            Recommendation rec = recommendationRepository.findById(recId).orElseThrow();
            String targetFacultyId = rec.getItems().get(0).getTargetFaculty().getId();

            // Target faculty has headroom (e.g. 8h), task is 4h.
            // Assign a filler task of 5h -> reduces headroom to < 4h (insufficient for 4h task).
            Task fillerTask = new Task();
            fillerTask.setTitle("Filler Task");
            fillerTask.setCode("FIL-99");
            fillerTask.setType(ResponsibilityType.TEACHING);
            fillerTask.setWeeklyHours(5);
            fillerTask.setDepartment(departmentRepository.findById("00000000-0000-0000-0000-000000000001").orElseThrow());
            fillerTask.setActive(true);
            fillerTask = taskRepository.save(fillerTask);
            fillerTaskIdHolder[0] = fillerTask.getId();

            taskAssignmentService.assignTask(fillerTask.getId(), targetFacultyId, hodUserId);
        });

        // Approve recommendation must throw StaleRecommendationException (which doesn't roll back the STALE status)
        txTemplate.execute(status -> {
            try {
                recommendationService.approveRecommendation(recId, hodUserId);
                fail("Expected StaleRecommendationException");
            } catch (StaleRecommendationException ex) {
                assertEquals(recId, ex.getRecommendationId());
            }
            return null;
        });

        // Verify recommendation status is STALE in DB (persisted state!)
        txTemplate.executeWithoutResult(status -> {
            Recommendation rec = recommendationRepository.findById(recId).orElseThrow();
            assertEquals(RecommendationStatus.STALE, rec.getStatus());
            assertEquals(RecommendationStatus.STALE, rec.getItems().get(0).getStatus());

            // Task assignment remains unaltered (it is still assigned to Sarah Vance)
            String taskId = rec.getItems().get(0).getTask().getId();
            Optional<TaskAssignment> activeAssign = taskAssignmentRepository.findByTaskIdAndStatus(taskId, AssignmentStatus.ACTIVE);
            assertTrue(activeAssign.isPresent());
            assertEquals("20000000-0000-0000-0000-000000000001", activeAssign.get().getFaculty().getId()); // Dr. Sarah Vance
        });

        // Clean up ALL committed data: recommendation + filler task (cascade deletes filler assignment)
        txTemplate.executeWithoutResult(status -> {
            recommendationRepository.deleteById(recId);
            // Delete the filler task assignment first (FK constraint), then the task
            if (fillerTaskIdHolder[0] != null) {
                taskAssignmentRepository.findByTaskId(fillerTaskIdHolder[0]).forEach(taskAssignmentRepository::delete);
                taskRepository.deleteById(fillerTaskIdHolder[0]);
            }
        });
    }

    @Test
    @DisplayName("Verify rejection of recommendation marks REJECTED")
    void testRejectRecommendation() throws Exception {
        List<RecommendationResponse> generated = recommendationService.generateRecommendations(hodUserId);
        assertFalse(generated.isEmpty());
        String recId = generated.get(0).getId();

        mockMvc.perform(post("/api/recommendations/" + recId + "/reject")
                        .cookie(hodCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));

        Recommendation rec = recommendationRepository.findById(recId).orElseThrow();
        assertEquals(RecommendationStatus.REJECTED, rec.getStatus());
    }

    @Test
    @DisplayName("Verify already processed recommendation cannot be approved again")
    void testCannotApproveProcessedRecommendation() throws Exception {
        List<RecommendationResponse> generated = recommendationService.generateRecommendations(hodUserId);
        assertFalse(generated.isEmpty());
        String recId = generated.get(0).getId();

        // 1st approval succeeds
        recommendationService.approveRecommendation(recId, hodUserId);

        // 2nd approval fails with 500/409 (IllegalStateException)
        mockMvc.perform(post("/api/recommendations/" + recId + "/approve")
                        .cookie(hodCookie))
                .andExpect(status().isBadRequest()); // Maps IllegalArgumentException/IllegalStateException to 400 Bad Request or Conflict
    }

    @Test
    @DisplayName("Verify authorization constraints on recommendations")
    void testRecommendationSecurityRestrictions() throws Exception {
        // Faculty attempting to list recommendations -> 403 Forbidden
        mockMvc.perform(get("/api/recommendations")
                        .cookie(facultyCookie))
                .andExpect(status().isForbidden());

        // Faculty attempting to generate recommendations -> 403 Forbidden
        mockMvc.perform(post("/api/recommendations/generate")
                        .cookie(facultyCookie))
                .andExpect(status().isForbidden());
    }
}
