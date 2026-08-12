package com.faculynk.auth;

import com.faculynk.auth.dto.ActivateHodRequest;
import com.faculynk.auth.dto.AuthUserResponse;
import com.faculynk.auth.dto.LoginRequest;
import com.faculynk.auth.dto.RegisterFacultyRequest;
import com.faculynk.model.entity.FacultyRegistrationRequest;
import com.faculynk.model.entity.User;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Value("${app.jwt.cookie-name:FACULYNK_TOKEN}")
    private String cookieName;

    @Value("${app.jwt.cookie-secure:true}")
    private boolean cookieSecure;

    @Value("${app.jwt.expiration-ms:28800000}")
    private long jwtExpirationMs;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthUserResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = authService.authenticate(request);
        String token = authService.generateToken(user);

        ResponseCookie cookie = ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ofMillis(jwtExpirationMs))
                .build();

        AuthUserResponse authUserResponse = authService.mapToResponse(user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(authUserResponse);
    }

    @PostMapping("/activate-hod")
    public ResponseEntity<AuthUserResponse> activateHod(@Valid @RequestBody ActivateHodRequest request) {
        AuthUserResponse response = authService.activateHod(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register-faculty")
    public ResponseEntity<FacultyRegistrationRequest> registerFaculty(@Valid @RequestBody RegisterFacultyRequest request) {
        FacultyRegistrationRequest response = authService.registerFaculty(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = authentication.getName();
        AuthUserResponse response = authService.getCurrentUser(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Test endpoints to verify authorization configurations during security phase tests.
     */
    @GetMapping("/test-hod")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<String> testHod() {
        return ResponseEntity.ok("HOD_AUTHORIZED");
    }

    @GetMapping("/test-faculty")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<String> testFaculty() {
        return ResponseEntity.ok("FACULTY_AUTHORIZED");
    }
}
