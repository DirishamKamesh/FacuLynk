package com.faculynk.config;

import com.faculynk.exception.DuplicatePendingRegistrationException;
import com.faculynk.exception.InstitutionalIdClaimedException;
import com.faculynk.exception.InvalidDepartmentException;
import com.faculynk.exception.InvalidDesignationException;
import com.faculynk.exception.MissingRejectionNoteException;
import com.faculynk.exception.RegistrationNotFoundException;
import com.faculynk.exception.RegistrationNotPendingException;
import com.faculynk.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({BadCredentialsException.class, UsernameNotFoundException.class})
    public ResponseEntity<Map<String, String>> handleUnauthorized(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Unauthorized");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleForbidden(AccessDeniedException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Forbidden");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
    @ExceptionHandler({RegistrationNotFoundException.class, FacultyNotFoundException.class, TaskNotFoundException.class})
    public ResponseEntity<Map<String, String>> handleNotFound(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Not Found");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(CapacityExceededException.class)
    public ResponseEntity<Map<String, Object>> handleCapacityExceeded(CapacityExceededException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", "CAPACITY_EXCEEDED");
        error.put("facultyId", ex.getFacultyId());
        error.put("currentHours", ex.getCurrentHours());
        error.put("taskHours", ex.getTaskHours());
        error.put("projectedHours", ex.getProjectedHours());
        error.put("maxHours", ex.getMaxHours());
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(StaleRecommendationException.class)
    public ResponseEntity<Map<String, String>> handleStaleRecommendation(StaleRecommendationException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "STALE_RECOMMENDATION");
        error.put("recommendationId", ex.getRecommendationId());
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler({
            RegistrationNotPendingException.class,
            InstitutionalIdClaimedException.class,
            DuplicatePendingRegistrationException.class,
            FacultyInactiveException.class,
            TaskAlreadyAssignedException.class
    })
    public ResponseEntity<Map<String, String>> handleConflict(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Conflict");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler({
            InvalidDepartmentException.class,
            InvalidDesignationException.class,
            MissingRejectionNoteException.class,
            InvalidResponsibilityTypeException.class,
            InvalidAssignmentException.class
    })
    public ResponseEntity<Map<String, String>> handleUnprocessable(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Unprocessable Entity");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, String>> handleBadRequest(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Bad Request");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Validation Error");
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        response.put("details", errors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
