-- ============================================================================
-- FacuLynk V1 — Full Database Schema
-- 15 tables: roles, departments, users, faculty_profiles, skills,
--   faculty_skills, faculty_interests, faculty_registration_requests,
--   tasks, task_required_skills, task_assignments, recommendations,
--   recommendation_items, rebalance_requests, audit_logs
-- ============================================================================

-- 1. roles
CREATE TABLE roles (
    id          VARCHAR(20)  PRIMARY KEY,
    description VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. departments
CREATE TABLE departments (
    id         VARCHAR(36)  PRIMARY KEY,
    name       VARCHAR(255) NOT NULL UNIQUE,
    code       VARCHAR(50)  NOT NULL UNIQUE,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. users
CREATE TABLE users (
    id              VARCHAR(36)  PRIMARY KEY,
    institutional_id VARCHAR(50) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    role_id         VARCHAR(20)  NOT NULL,
    account_status  VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_users_institutional_id ON users(institutional_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_account_status ON users(account_status);

-- 4. faculty_profiles
CREATE TABLE faculty_profiles (
    id                 VARCHAR(36)  PRIMARY KEY,
    user_id            VARCHAR(36)  NOT NULL UNIQUE,
    department_id      VARCHAR(36)  NOT NULL,
    designation        VARCHAR(50)  NOT NULL,
    max_workload_hours INT          NOT NULL,
    phone              VARCHAR(50),
    office             VARCHAR(100),
    experience_years   INT          NOT NULL DEFAULT 0,
    research_area      VARCHAR(255),
    avatar_url         VARCHAR(500),
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_faculty_dept FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_faculty_department ON faculty_profiles(department_id);
CREATE INDEX idx_faculty_designation ON faculty_profiles(designation);

-- 5. skills (master table)
CREATE TABLE skills (
    id   VARCHAR(36)  PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. faculty_skills (join)
CREATE TABLE faculty_skills (
    faculty_id VARCHAR(36) NOT NULL,
    skill_id   VARCHAR(36) NOT NULL,
    PRIMARY KEY (faculty_id, skill_id),
    CONSTRAINT fk_fs_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_fs_skill   FOREIGN KEY (skill_id)   REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. faculty_interests
CREATE TABLE faculty_interests (
    faculty_id VARCHAR(36)  NOT NULL,
    interest   VARCHAR(255) NOT NULL,
    PRIMARY KEY (faculty_id, interest),
    CONSTRAINT fk_fi_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. faculty_registration_requests
CREATE TABLE faculty_registration_requests (
    id               VARCHAR(36)  PRIMARY KEY,
    institutional_id VARCHAR(50)  NOT NULL,
    email            VARCHAR(255) NOT NULL,
    full_name        VARCHAR(255) NOT NULL,
    designation      VARCHAR(50)  NOT NULL,
    department_name  VARCHAR(255) NOT NULL,
    phone            VARCHAR(50),
    skills_json      JSON,
    availability     VARCHAR(100),
    status           VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    hod_note         TEXT,
    submitted_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at      TIMESTAMP    NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_frr_status ON faculty_registration_requests(status);
CREATE INDEX idx_frr_institutional_id ON faculty_registration_requests(institutional_id);

-- 9. tasks
CREATE TABLE tasks (
    id            VARCHAR(36)  PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    code          VARCHAR(50)  NOT NULL,
    type          VARCHAR(50)  NOT NULL,
    weekly_hours  INT          NOT NULL,
    priority      VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    department_id VARCHAR(36)  NOT NULL,
    semester      VARCHAR(50),
    deadline      DATE,
    description   TEXT,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_dept FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_department ON tasks(department_id);

-- 10. task_required_skills (join)
CREATE TABLE task_required_skills (
    task_id  VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (task_id, skill_id),
    CONSTRAINT fk_trs_task  FOREIGN KEY (task_id)  REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_trs_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. task_assignments (history-preserving)
CREATE TABLE task_assignments (
    id            VARCHAR(36) PRIMARY KEY,
    task_id       VARCHAR(36) NOT NULL,
    faculty_id    VARCHAR(36) NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    assigned_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at     TIMESTAMP   NULL,
    closed_reason VARCHAR(100),
    CONSTRAINT fk_ta_task    FOREIGN KEY (task_id)    REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_ta_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ta_task ON task_assignments(task_id);
CREATE INDEX idx_ta_faculty ON task_assignments(faculty_id);
CREATE INDEX idx_ta_status ON task_assignments(status);
CREATE INDEX idx_ta_faculty_status ON task_assignments(faculty_id, status);

-- 12. recommendations
CREATE TABLE recommendations (
    id                     VARCHAR(36) PRIMARY KEY,
    overloaded_faculty_id  VARCHAR(36) NOT NULL,
    status                 VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reason                 TEXT,
    created_at             TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at            TIMESTAMP   NULL,
    CONSTRAINT fk_rec_overloaded FOREIGN KEY (overloaded_faculty_id) REFERENCES faculty_profiles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_rec_status ON recommendations(status);

-- 13. recommendation_items
CREATE TABLE recommendation_items (
    id                      VARCHAR(36) PRIMARY KEY,
    recommendation_id       VARCHAR(36) NOT NULL,
    task_id                 VARCHAR(36) NOT NULL,
    target_faculty_id       VARCHAR(36) NOT NULL,
    match_score             INT,
    projected_source_hours  INT,
    projected_target_hours  INT,
    status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT fk_ri_recommendation FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE,
    CONSTRAINT fk_ri_task           FOREIGN KEY (task_id)           REFERENCES tasks(id),
    CONSTRAINT fk_ri_target         FOREIGN KEY (target_faculty_id) REFERENCES faculty_profiles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ri_recommendation ON recommendation_items(recommendation_id);

-- 14. rebalance_requests
CREATE TABLE rebalance_requests (
    id                             VARCHAR(36) PRIMARY KEY,
    request_type                   VARCHAR(50) NOT NULL,
    requester_faculty_id           VARCHAR(36) NOT NULL,
    target_overloaded_faculty_id   VARCHAR(36) NOT NULL,
    suggested_assignee_faculty_id  VARCHAR(36),
    task_id                        VARCHAR(36),
    reason                         TEXT        NOT NULL,
    status                         VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    hod_note                       TEXT,
    created_at                     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at                    TIMESTAMP   NULL,
    CONSTRAINT fk_rr_requester  FOREIGN KEY (requester_faculty_id)          REFERENCES faculty_profiles(id),
    CONSTRAINT fk_rr_target     FOREIGN KEY (target_overloaded_faculty_id)  REFERENCES faculty_profiles(id),
    CONSTRAINT fk_rr_assignee   FOREIGN KEY (suggested_assignee_faculty_id) REFERENCES faculty_profiles(id),
    CONSTRAINT fk_rr_task       FOREIGN KEY (task_id)                       REFERENCES tasks(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_rr_status ON rebalance_requests(status);
CREATE INDEX idx_rr_requester ON rebalance_requests(requester_faculty_id);

-- 15. audit_logs
CREATE TABLE audit_logs (
    id           VARCHAR(36)  PRIMARY KEY,
    action       VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(50)  NOT NULL,
    entity_id    VARCHAR(36),
    performed_by VARCHAR(36),
    details      JSON,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (performed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
