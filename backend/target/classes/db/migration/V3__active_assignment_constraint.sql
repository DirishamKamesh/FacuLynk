-- V3__active_assignment_constraint.sql
-- Enforce database constraint preventing multiple active task assignments for a single task
-- while preserving historical closed assignments.

ALTER TABLE task_assignments ADD COLUMN active_task_id VARCHAR(36) GENERATED ALWAYS AS (CASE WHEN status = 'ACTIVE' THEN task_id ELSE NULL END);
CREATE UNIQUE INDEX idx_active_task ON task_assignments (active_task_id);

-- Task active status for soft deletion/archival
ALTER TABLE tasks ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
