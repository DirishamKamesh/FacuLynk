package com.faculynk.model.enums;

/**
 * PS-08 Authoritative Responsibility Types.
 * Maps legacy frontend labels as follows:
 *   Lecture -> TEACHING
 *   Lab -> LABORATORY_SESSIONS
 *   Research -> PROJECT_GUIDANCE
 *   Mentorship -> MENTORING
 *   Admin -> DEPARTMENTAL_ACTIVITIES
 *   (EXAMINATIONS has no legacy label)
 */
public enum ResponsibilityType {
    TEACHING,
    LABORATORY_SESSIONS,
    PROJECT_GUIDANCE,
    EXAMINATIONS,
    MENTORING,
    DEPARTMENTAL_ACTIVITIES
}
