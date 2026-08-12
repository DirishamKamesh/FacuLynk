package com.faculynk.service;

import com.faculynk.model.entity.AuditLog;
import com.faculynk.model.entity.User;
import com.faculynk.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    // Use default propagation (REQUIRED) so it participates in the caller's transaction
    @Transactional(propagation = Propagation.REQUIRED)
    public void logMutation(String action, String entityType, String entityId, User performedBy, Map<String, Object> details) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setPerformedBy(performedBy);

        try {
            if (details != null && !details.isEmpty()) {
                auditLog.setDetails(objectMapper.writeValueAsString(details));
            } else {
                auditLog.setDetails("{}");
            }
        } catch (Exception e) {
            auditLog.setDetails("{}");
        }

        auditLogRepository.save(auditLog);
    }
}
