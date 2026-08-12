package com.faculynk.service;

import com.faculynk.model.entity.AuditLog;
import com.faculynk.model.entity.User;
import com.faculynk.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class AuditServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AuditService auditService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testLogMutation() throws Exception {
        // Arrange
        User user = new User();
        user.setId("user1");
        
        Map<String, Object> details = new HashMap<>();
        details.put("key", "value");
        
        when(objectMapper.writeValueAsString(details)).thenReturn("{\"key\":\"value\"}");

        // Act
        auditService.logMutation("TEST_ACTION", "TEST_ENTITY", "123", user, details);

        // Assert
        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        
        AuditLog savedLog = captor.getValue();
        assertEquals("TEST_ACTION", savedLog.getAction());
        assertEquals("TEST_ENTITY", savedLog.getEntityType());
        assertEquals("123", savedLog.getEntityId());
        assertEquals(user, savedLog.getPerformedBy());
        assertEquals("{\"key\":\"value\"}", savedLog.getDetails());
    }
}
