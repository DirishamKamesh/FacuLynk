package com.faculynk.config;

import com.faculynk.security.JwtAuthenticationFilter;
import com.faculynk.security.JwtTokenProvider;
import com.faculynk.security.UserDetailsServiceImpl;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Spring Security Configuration.
 * Configures stateless sessions, CORS, JWT authentication filter,
 * public vs protected endpoints, and method-level @PreAuthorize authorization.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtTokenProvider tokenProvider;
    private final UserDetailsServiceImpl userDetailsService;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource,
                          JwtTokenProvider tokenProvider,
                          UserDetailsServiceImpl userDetailsService) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(tokenProvider, userDetailsService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            
            /*
             * CSRF SECURITY DECISION:
             * 
             * Since the backend is a stateless REST API and authenticates users via JWTs
             * stored in cookies configured with:
             *   - SameSite = Strict
             *   - HttpOnly = true
             *   - Secure = true (in production)
             *
             * The SameSite=Strict attribute prevents modern browsers from sending the cookie
             * on any cross-site request (e.g., standard CSRF attacks originating from external
             * sites). Furthermore, because we do not use stateful HTTP sessions on the server,
             * session fixation or standard stateful CSRF vulnerabilities do not apply here.
             * 
             * Therefore, CSRF protection is disabled for these endpoints.
             */
            .csrf(csrf -> csrf.disable())
            
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Custom authentication entry point to return 401 Unauthorized for unauthenticated requests
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"" + authException.getMessage() + "\"}");
                })
            )
            
            .authorizeHttpRequests(auth -> auth
                // Public auth endpoints
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/activate-hod").permitAll()
                .requestMatchers("/api/auth/register-faculty").permitAll()
                .requestMatchers("/api/auth/logout").permitAll()
                .requestMatchers("/api/health").permitAll()
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
