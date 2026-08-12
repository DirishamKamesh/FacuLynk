package com.faculynk;

import com.faculynk.auth.dto.ActivateHodRequest;
import com.faculynk.auth.dto.LoginRequest;
import com.faculynk.auth.dto.RegisterFacultyRequest;
import com.faculynk.model.entity.User;
import com.faculynk.model.enums.AccountStatus;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityAndAuthTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TEST_PASSWORD = "password123";
    private String hod1Id = "10000000-0000-0000-0000-000000000001";
    private String hod2Id = "10000000-0000-0000-0000-000000000002";
    private String fac1Id = "10000000-0000-0000-0000-000000000003";

    @BeforeEach
    void setUp() {
        // Assign a valid BCrypt hash to seeded users for authentication tests
        String hash = passwordService.encode(TEST_PASSWORD);

        User hod1 = userRepository.findById(hod1Id).orElseThrow();
        hod1.setPasswordHash(hash);
        userRepository.save(hod1);

        User fac1 = userRepository.findById(fac1Id).orElseThrow();
        fac1.setPasswordHash(hash);
        userRepository.save(fac1);
    }

    @Test
    @DisplayName("1. Successful HOD login sets JWT cookie and returns user DTO")
    void testSuccessfulHodLogin() throws Exception {
        LoginRequest req = new LoginRequest("HOD-001", TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("FACULYNK_TOKEN"))
                .andExpect(jsonPath("$.institutionalId").value("HOD-001"))
                .andExpect(jsonPath("$.role").value("HOD"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("2. Successful faculty login sets JWT cookie and returns user DTO")
    void testSuccessfulFacultyLogin() throws Exception {
        // Can log in via email as well
        LoginRequest req = new LoginRequest("svance@university.edu", TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("FACULYNK_TOKEN"))
                .andExpect(jsonPath("$.institutionalId").value("FAC-1001"))
                .andExpect(jsonPath("$.role").value("FACULTY"));
    }

    @Test
    @DisplayName("3. Invalid password rejected")
    void testInvalidPasswordRejected() throws Exception {
        LoginRequest req = new LoginRequest("HOD-001", "wrong_password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("4. Non-existent user login rejected")
    void testNonExistentUserRejected() throws Exception {
        LoginRequest req = new LoginRequest("NON-EXISTENT", TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("5. Pending faculty rejected")
    void testPendingFacultyRejected() throws Exception {
        // Set FAC-1001 to PENDING
        User fac1 = userRepository.findById(fac1Id).orElseThrow();
        fac1.setAccountStatus(AccountStatus.PENDING);
        userRepository.saveAndFlush(fac1);

        LoginRequest req = new LoginRequest("FAC-1001", TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("6. Rejected faculty rejected")
    void testRejectedFacultyRejected() throws Exception {
        // Set FAC-1001 to REJECTED
        User fac1 = userRepository.findById(fac1Id).orElseThrow();
        fac1.setAccountStatus(AccountStatus.REJECTED);
        userRepository.saveAndFlush(fac1);

        LoginRequest req = new LoginRequest("FAC-1001", TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("7. Inactive account rejected")
    void testInactiveAccountRejected() throws Exception {
        // Set FAC-1001 to INACTIVE
        User fac1 = userRepository.findById(fac1Id).orElseThrow();
        fac1.setAccountStatus(AccountStatus.INACTIVE);
        userRepository.saveAndFlush(fac1);

        LoginRequest req = new LoginRequest("FAC-1001", TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("8. Pending-activation HOD cannot login via normal login route")
    void testPendingActivationHodCannotLogin() throws Exception {
        LoginRequest req = new LoginRequest("HOD-002", TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("9. HOD activation succeeds, updates fields and sets status to ACTIVE")
    void testHodActivationSucceeds() throws Exception {
        ActivateHodRequest req = new ActivateHodRequest(
                "HOD-002",
                "Dr. New HOD",
                "newhod@university.edu",
                "Computer Science & Engineering",
                "newpassword123",
                "newpassword123"
        );

        mockMvc.perform(post("/api/auth/activate-hod")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountStatus").value("ACTIVE"))
                .andExpect(jsonPath("$.fullName").value("Dr. New HOD"))
                .andExpect(jsonPath("$.email").value("newhod@university.edu"));

        // Verify status changed in DB
        User updatedUser = userRepository.findByInstitutionalId("HOD-002").orElseThrow();
        assertEquals(AccountStatus.ACTIVE, updatedUser.getAccountStatus());
        assertTrue(passwordService.matches("newpassword123", updatedUser.getPasswordHash()));
    }

    @Test
    @DisplayName("10. HOD activation rejects user with wrong status (already ACTIVE)")
    void testHodActivationRejectsActiveUser() throws Exception {
        ActivateHodRequest req = new ActivateHodRequest(
                "HOD-001", // Already ACTIVE
                "HOD Administrator",
                "hod@university.edu",
                "Computer Science & Engineering",
                "newpassword123",
                "newpassword123"
        );

        mockMvc.perform(post("/api/auth/activate-hod")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("11. JWT cookie is HttpOnly")
    void testJwtCookieHttpOnly() throws Exception {
        LoginRequest req = new LoginRequest("HOD-001", TEST_PASSWORD);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn();

        Cookie cookie = result.getResponse().getCookie("FACULYNK_TOKEN");
        assertNotNull(cookie);
        assertTrue(cookie.isHttpOnly());
    }

    @Test
    @DisplayName("12. JWT cookie has correct SameSite = Strict attribute")
    void testJwtCookieSameSiteStrict() throws Exception {
        LoginRequest req = new LoginRequest("HOD-001", TEST_PASSWORD);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn();

        String setCookieHeader = result.getResponse().getHeader("Set-Cookie");
        assertNotNull(setCookieHeader);
        assertTrue(setCookieHeader.contains("SameSite=Strict") || setCookieHeader.contains("samesite=Strict"));
    }

    @Test
    @DisplayName("13. Protected endpoint without cookie returns 401")
    void testProtectedEndpointWithoutCookie() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("14. Faculty role is rejected from HOD-only endpoint with 403")
    void testFacultyRoleRejectedFromHodEndpoint() throws Exception {
        String token = tokenProvider.generateToken(fac1Id, "FACULTY", "FAC-1001");
        Cookie cookie = new Cookie("FACULYNK_TOKEN", token);

        mockMvc.perform(get("/api/auth/test-hod")
                        .cookie(cookie))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("15. HOD role is accepted for HOD-only endpoint")
    void testHodRoleAcceptedForHodEndpoint() throws Exception {
        String token = tokenProvider.generateToken(hod1Id, "HOD", "HOD-001");
        Cookie cookie = new Cookie("FACULYNK_TOKEN", token);

        mockMvc.perform(get("/api/auth/test-hod")
                        .cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("HOD_AUTHORIZED"));
    }

    @Test
    @DisplayName("16. Faculty role is accepted for Faculty-only endpoint")
    void testFacultyRoleAcceptedForFacultyEndpoint() throws Exception {
        String token = tokenProvider.generateToken(fac1Id, "FACULTY", "FAC-1001");
        Cookie cookie = new Cookie("FACULYNK_TOKEN", token);

        mockMvc.perform(get("/api/auth/test-faculty")
                        .cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("FACULTY_AUTHORIZED"));
    }

    @Test
    @DisplayName("17. /api/auth/me returns currently authenticated user details")
    void testMeReturnsAuthenticatedUser() throws Exception {
        String token = tokenProvider.generateToken(fac1Id, "FACULTY", "FAC-1001");
        Cookie cookie = new Cookie("FACULYNK_TOKEN", token);

        mockMvc.perform(get("/api/auth/me")
                        .cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.institutionalId").value("FAC-1001"))
                .andExpect(jsonPath("$.role").value("FACULTY"))
                .andExpect(jsonPath("$.email").value("svance@university.edu"));
    }

    @Test
    @DisplayName("18. Logout deletes the FACULYNK_TOKEN auth cookie")
    void testLogoutClearsAuthCookie() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("FACULYNK_TOKEN", 0));
    }
}
