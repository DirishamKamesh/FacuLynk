package com.faculynk;

import com.faculynk.auth.AuthService;
import com.faculynk.auth.RegistrationService;
import com.faculynk.auth.dto.AuthUserResponse;
import com.faculynk.auth.dto.LoginRequest;
import com.faculynk.auth.dto.RegisterFacultyRequest;
import com.faculynk.auth.dto.RejectionRequest;
import com.faculynk.exception.DuplicatePendingRegistrationException;
import com.faculynk.exception.InstitutionalIdClaimedException;
import com.faculynk.exception.InvalidDepartmentException;
import com.faculynk.exception.InvalidDesignationException;
import com.faculynk.exception.RegistrationNotFoundException;
import com.faculynk.exception.RegistrationNotPendingException;
import com.faculynk.model.entity.FacultyProfile;
import com.faculynk.model.entity.FacultyRegistrationRequest;
import com.faculynk.model.entity.User;
import com.faculynk.model.enums.AccountStatus;
import com.faculynk.model.enums.Designation;
import com.faculynk.model.enums.RegistrationStatus;
import com.faculynk.repository.FacultyProfileRepository;
import com.faculynk.repository.FacultyRegistrationRequestRepository;
import com.faculynk.repository.UserRepository;
import com.faculynk.security.JwtTokenProvider;
import com.faculynk.security.PasswordService;
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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RegistrationAndVerificationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @Autowired
    private FacultyRegistrationRequestRepository registrationRequestRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private org.springframework.transaction.PlatformTransactionManager transactionManager;

    private String hod1UserId = "10000000-0000-0000-0000-000000000001";
    private String faculty1UserId = "10000000-0000-0000-0000-000000000003";

    private Cookie hodCookie;
    private Cookie facultyCookie;

    @BeforeEach
    void setUp() {
        // Set up auth cookies for testing requests
        String hodToken = tokenProvider.generateToken(hod1UserId, "HOD", "HOD-001");
        hodCookie = new Cookie("FACULYNK_TOKEN", hodToken);

        String facultyToken = tokenProvider.generateToken(faculty1UserId, "FACULTY", "FAC-1001");
        facultyCookie = new Cookie("FACULYNK_TOKEN", facultyToken);
    }

    @Test
    @DisplayName("1. Valid faculty registration creates PENDING request")
    void testValidRegistration() throws Exception {
        RegisterFacultyRequest req = new RegisterFacultyRequest(
                "FAC-9999",
                "newfac@university.edu",
                "Dr. New Faculty",
                "Assistant Professor",
                "CSE",
                "+1 (555) 999-9999",
                Arrays.asList("Java", "Spring Boot"),
                "Statutory 20 hours"
        );

        mockMvc.perform(post("/api/auth/register-faculty")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.institutionalId").value("FAC-9999"));

        // Verify request stored in DB
        Optional<FacultyRegistrationRequest> saved = registrationRequestRepository.findByInstitutionalId("FAC-9999");
        assertTrue(saved.isPresent());
        assertEquals(RegistrationStatus.PENDING, saved.get().getStatus());
    }

    @Test
    @DisplayName("2. Invalid designation rejected with 422")
    void testInvalidDesignationRejected() throws Exception {
        RegisterFacultyRequest req = new RegisterFacultyRequest(
                "FAC-9999", "newfac@university.edu", "Dr. New Faculty",
                "Dean", // Invalid designation
                "CSE", "+1 (555) 999-9999", Arrays.asList("Java"), "20 hours"
        );

        mockMvc.perform(post("/api/auth/register-faculty")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("3. Invalid department rejected with 422")
    void testInvalidDepartmentRejected() throws Exception {
        RegisterFacultyRequest req = new RegisterFacultyRequest(
                "FAC-9999", "newfac@university.edu", "Dr. New Faculty",
                "Assistant Professor",
                "INVALID_DEPT_XYZ", // Non-existent department
                "+1 (555) 999-9999", Arrays.asList("Java"), "20 hours"
        );

        mockMvc.perform(post("/api/auth/register-faculty")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("4. Duplicate open registration request rejected with 409")
    void testDuplicateOpenRegistrationRejected() throws Exception {
        // FAC-1009 Alan Turing already has an open pending request in V2 seed data
        RegisterFacultyRequest req = new RegisterFacultyRequest(
                "FAC-1009", // Duplicate institutionalId
                "alan.diff@university.edu", "Dr. Alan Turing Diff",
                "Assistant Professor", "CSE", "+1 (555) 999-9999", Arrays.asList("Java"), "20 hours"
        );

        mockMvc.perform(post("/api/auth/register-faculty")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("5. Existing active institutional ID rejected with 409")
    void testExistingActiveIdRejected() throws Exception {
        // FAC-1001 Sarah Vance is already an active faculty in DB
        RegisterFacultyRequest req = new RegisterFacultyRequest(
                "FAC-1001", // Already claimed/active
                "svance.new@university.edu", "Dr. Sarah Vance",
                "Professor", "CSE", "+1 (555) 999-9999", Arrays.asList("Java"), "10 hours"
        );

        mockMvc.perform(post("/api/auth/register-faculty")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("6. HOD can list pending registration requests")
    void testHodCanListPending() throws Exception {
        mockMvc.perform(get("/api/verification-requests")
                        .cookie(hodCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].institutionalId").value("FAC-1009"));
    }

    @Test
    @DisplayName("7. Faculty cannot list verification requests (403)")
    void testFacultyCannotListPending() throws Exception {
        mockMvc.perform(get("/api/verification-requests")
                        .cookie(facultyCookie))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("8. HOD can approve pending request, returns user DTO")
    void testHodApprovePending() throws Exception {
        // Find the pending request of Alan Turing
        FacultyRegistrationRequest alan = registrationRequestRepository.findByInstitutionalId("FAC-1009").orElseThrow();

        mockMvc.perform(post("/api/verification-requests/" + alan.getId() + "/approve")
                        .cookie(hodCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountStatus").value("ACTIVE"))
                .andExpect(jsonPath("$.role").value("FACULTY"))
                .andExpect(jsonPath("$.facultyId").isNotEmpty())
                .andExpect(jsonPath("$.departmentId").isNotEmpty());
    }

    @Test
    @DisplayName("9-13. Approval creates User, Profile, Skills, Workload, and marks request APPROVED")
    void testApprovalDetailsAndPersistence() {
        FacultyRegistrationRequest alan = registrationRequestRepository.findByInstitutionalId("FAC-1009").orElseThrow();
        assertEquals(RegistrationStatus.PENDING, alan.getStatus());

        // Call RegistrationService directly to examine details
        AuthUserResponse response = registrationService.approveRegistration(alan.getId(), hod1UserId);
        assertNotNull(response);

        // Verify request updated
        FacultyRegistrationRequest updatedRequest = registrationRequestRepository.findById(alan.getId()).orElseThrow();
        assertEquals(RegistrationStatus.APPROVED, updatedRequest.getStatus());
        assertNotNull(updatedRequest.getReviewedAt());

        // Verify User exists and is ACTIVE
        User user = userRepository.findByInstitutionalId("FAC-1009").orElseThrow();
        assertEquals("Dr. Alan Turing", user.getFullName());
        assertEquals(AccountStatus.ACTIVE, user.getAccountStatus());
        assertEquals("FACULTY", user.getRole().getId());

        // Verify FacultyProfile exists
        FacultyProfile profile = facultyProfileRepository.findByUserId(user.getId()).orElseThrow();
        assertEquals(Designation.ASSISTANT_PROFESSOR, profile.getDesignation());
        // Verify designation max workload cap is derived (Assistant Professor = 20)
        assertEquals(20, profile.getMaxWorkloadHours());

        // Verify skills are created and assigned
        assertFalse(profile.getSkills().isEmpty());
        assertTrue(profile.getSkills().stream().anyMatch(s -> "Database Systems".equals(s.getName())));
    }

    @Test
    @DisplayName("14. Approval is atomic on failure (invalid department throws exception)")
    void testApprovalIsAtomicOnFailure() {
        FacultyRegistrationRequest req = new FacultyRegistrationRequest();
        req.setInstitutionalId("FAC-TEST-ERR");
        req.setEmail("error@test.com");
        req.setFullName("Dr. Atomic Fail");
        req.setDesignation(Designation.PROFESSOR);
        req.setDepartmentName("NON_EXISTENT_DEPARTMENT_CODE_TRIP_ERR");
        req.setStatus(RegistrationStatus.PENDING);
        req = registrationRequestRepository.save(req);

        String reqId = req.getId();
        assertThrows(InvalidDepartmentException.class, () ->
            registrationService.approveRegistration(reqId, hod1UserId)
        );

        // Verify request remains PENDING (rolled back successfully)
        FacultyRegistrationRequest loaded = registrationRequestRepository.findById(reqId).orElseThrow();
        assertEquals(RegistrationStatus.PENDING, loaded.getStatus());

        // Verify no user was created
        assertFalse(userRepository.findByInstitutionalId("FAC-TEST-ERR").isPresent());
    }

    @Test
    @DisplayName("15-17. HOD can reject pending request, stores HOD note, does not create User")
    void testHodCanRejectRequest() throws Exception {
        FacultyRegistrationRequest alan = registrationRequestRepository.findByInstitutionalId("FAC-1009").orElseThrow();
        RejectionRequest rejectReq = new RejectionRequest("Rejection Reason: Incorrect ID format");

        mockMvc.perform(post("/api/verification-requests/" + alan.getId() + "/reject")
                        .cookie(hodCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.hodNote").value("Rejection Reason: Incorrect ID format"));

        // Verify request status in DB
        FacultyRegistrationRequest updated = registrationRequestRepository.findById(alan.getId()).orElseThrow();
        assertEquals(RegistrationStatus.REJECTED, updated.getStatus());
        assertEquals("Rejection Reason: Incorrect ID format", updated.getHodNote());
        assertNotNull(updated.getReviewedAt());

        // Verify NO user created
        assertFalse(userRepository.findByInstitutionalId("FAC-1009").isPresent());
    }

    @Test
    @DisplayName("18. Rejected request cannot be approved later")
    void testRejectedRequestCannotBeApproved() {
        FacultyRegistrationRequest alan = registrationRequestRepository.findByInstitutionalId("FAC-1009").orElseThrow();
        
        // Reject request first
        registrationService.rejectRegistration(alan.getId(), hod1UserId, "Rejection note");
        
        // Attempt to approve rejected request -> expect RegistrationNotPendingException
        assertThrows(RegistrationNotPendingException.class, () ->
            registrationService.approveRegistration(alan.getId(), hod1UserId)
        );
    }

    @Test
    @DisplayName("19. Approved faculty can subsequently login using BE-004 credentials")
    void testApprovedFacultyCanLogin() throws Exception {
        FacultyRegistrationRequest alan = registrationRequestRepository.findByInstitutionalId("FAC-1009").orElseThrow();
        
        // Approve registration
        registrationService.approveRegistration(alan.getId(), hod1UserId);

        // Faculty user initial password defaults to "password123"
        LoginRequest loginReq = new LoginRequest("FAC-1009", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.institutionalId").value("FAC-1009"))
                .andExpect(jsonPath("$.role").value("FACULTY"));
    }

    @Test
    @DisplayName("20. Pending registration cannot login")
    void testPendingRegistrationCannotLogin() throws Exception {
        // FAC-1009 is currently in PENDING registration status. There is no User record for them.
        LoginRequest loginReq = new LoginRequest("FAC-1009", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("21. Concurrency test: Duplicate concurrent approvals allow only one success")
    void testDuplicateConcurrentApprovals() throws InterruptedException, ExecutionException {
        org.springframework.transaction.support.TransactionTemplate txTemplate =
                new org.springframework.transaction.support.TransactionTemplate(transactionManager);
        txTemplate.setPropagationBehavior(org.springframework.transaction.TransactionDefinition.PROPAGATION_REQUIRES_NEW);

        String registrationId = txTemplate.execute(status -> {
            FacultyRegistrationRequest req = new FacultyRegistrationRequest();
            req.setInstitutionalId("FAC-CONCURR");
            req.setEmail("concurr@test.com");
            req.setFullName("Dr. Concurrency");
            req.setDesignation(Designation.ASSISTANT_PROFESSOR);
            req.setDepartmentName("CSE");
            req.setSkillsJson("[\"Algorithms\"]");
            req.setStatus(RegistrationStatus.PENDING);
            req = registrationRequestRepository.saveAndFlush(req);
            return req.getId();
        });

        // We run in separate threads using separate transactions.
        ExecutorService executor = Executors.newFixedThreadPool(2);

        CompletableFuture<AuthUserResponse> threadA = CompletableFuture.supplyAsync(() -> {
            try {
                return registrationService.approveRegistration(registrationId, hod1UserId);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, executor);

        CompletableFuture<AuthUserResponse> threadB = CompletableFuture.supplyAsync(() -> {
            try {
                return registrationService.approveRegistration(registrationId, hod1UserId);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, executor);

        CompletableFuture<Void> both = CompletableFuture.allOf(threadA, threadB);

        try {
            both.get();
            fail("Should have thrown an exception on one of the concurrent threads");
        } catch (ExecutionException e) {
            // One thread must throw RegistrationNotPendingException
            Throwable cause = e.getCause();
            System.out.println("CONCURRENCY TEST EXCEPTION: " + cause.getClass().getName() + " - " + cause.getMessage());
            if (cause.getCause() != null) {
                System.out.println("CONCURRENCY TEST EXCEPTION CAUSE: " + cause.getCause().getClass().getName() + " - " + cause.getCause().getMessage());
            }
            assertTrue(
                cause instanceof RegistrationNotPendingException ||
                cause.getCause() instanceof RegistrationNotPendingException ||
                cause.getMessage().contains("RegistrationNotPendingException") ||
                cause.getMessage().contains("optimistic") ||
                cause.getMessage().contains("lock") ||
                cause.getMessage().contains("Conflict")
            );
        }

        // Verify that only 1 User is created
        txTemplate.executeWithoutResult(status -> {
            List<User> users = userRepository.findByInstitutionalId("FAC-CONCURR").stream().toList();
            assertEquals(1, users.size());
        });

        // Cleanup the committed transaction data to keep DB clean
        txTemplate.executeWithoutResult(status -> {
            facultyProfileRepository.findByUserId(
                userRepository.findByInstitutionalId("FAC-CONCURR").map(User::getId).orElse("")
            ).ifPresent(facultyProfileRepository::delete);
            userRepository.findByInstitutionalId("FAC-CONCURR").ifPresent(userRepository::delete);
            registrationRequestRepository.deleteById(registrationId);
        });

        executor.shutdown();
    }
}
