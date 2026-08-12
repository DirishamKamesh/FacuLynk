-- ============================================================================
-- FacuLynk V2 — Seed Data
-- Mirrors existing frontend mock data exactly.
-- All UUIDs follow a deterministic scheme for cross-reference readability.
--
-- Password hash: All seed accounts use a placeholder BCrypt hash.
-- Real password hashing is implemented in BE-004 (AuthService).
-- ============================================================================

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO roles (id, description) VALUES
('HOD',     'Head of Department — full administrative authority'),
('FACULTY', 'Academic faculty member');

-- ============================================================
-- DEPARTMENTS
-- ============================================================
INSERT INTO departments (id, name, code) VALUES
('00000000-0000-0000-0000-000000000001', 'Computer Science & Engineering', 'CSE');

-- ============================================================
-- USERS (10 total: 2 HODs + 8 Faculty)
-- Password hash placeholder — will be replaced by BCryptPasswordEncoder in BE-004.
-- ============================================================
INSERT INTO users (id, institutional_id, email, password_hash, full_name, role_id, account_status) VALUES
-- HOD accounts
('10000000-0000-0000-0000-000000000001', 'HOD-001', 'hod@university.edu',
 '$2a$12$SEED.DATA.PLACEHOLDER.NOT.FOR.PRODUCTION.USE.REPLACE.IN.BE004',
 'HOD Administrator', 'HOD', 'ACTIVE'),
('10000000-0000-0000-0000-000000000002', 'HOD-002', 'hod.activation@university.edu',
 '$2a$12$SEED.DATA.PLACEHOLDER.NOT.FOR.PRODUCTION.USE.REPLACE.IN.BE004',
 'Pending Activation HOD', 'HOD', 'PENDING_ACTIVATION'),
-- Faculty accounts (FAC-1001 through FAC-1008)
('10000000-0000-0000-0000-000000000003', 'FAC-1001', 'svance@university.edu',
 '$2a$12$SEED.DATA.PLACEHOLDER.NOT.FOR.PRODUCTION.USE.REPLACE.IN.BE004',
 'Dr. Sarah Vance', 'FACULTY', 'ACTIVE'),
('10000000-0000-0000-0000-000000000004', 'FAC-1002', 'jcokely@university.edu',
 '$2a$12$SEED.DATA.PLACEHOLDER.NOT.FOR.PRODUCTION.USE.REPLACE.IN.BE004',
 'Dr. Jim Cokely', 'FACULTY', 'ACTIVE'),
('10000000-0000-0000-0000-000000000005', 'FAC-1003', 'athorne@university.edu',
 '$2a$12$SEED.DATA.PLACEHOLDER.NOT.FOR.PRODUCTION.USE.REPLACE.IN.BE004',
 'Dr. Aris Thorne', 'FACULTY', 'ACTIVE'),
('10000000-0000-0000-0000-000000000006', 'FAC-1004', 'jsmith@university.edu',
 '$2a$12$SEED.DATA.PLACEHOLDER.NOT.FOR.PRODUCTION.USE.REPLACE.IN.BE004',
 'Dr. Joe Smith', 'FACULTY', 'ACTIVE'),
('10000000-0000-0000-0000-000000000007', 'FAC-1005', 'sholmes@university.edu',
 '$2a$12$SEED.DATA.PLACEHOLDER.NOT.FOR.PRODUCTION.USE.REPLACE.IN.BE004',
 'Dr. Sherry Holmes', 'FACULTY', 'ACTIVE'),
('10000000-0000-0000-0000-000000000008', 'FAC-1006', 'rdauffend@university.edu',
 '$2a$12$SEED.DATA.PLACEHOLDER.NOT.FOR.PRODUCTION.USE.REPLACE.IN.BE004',
 'Dr. Ryan Dauffend', 'FACULTY', 'ACTIVE'),
('10000000-0000-0000-0000-000000000009', 'FAC-1007', 'erostova@university.edu',
 '$2a$12$SEED.DATA.PLACEHOLDER.NOT.FOR.PRODUCTION.USE.REPLACE.IN.BE004',
 'Dr. Elena Rostova', 'FACULTY', 'ACTIVE'),
('10000000-0000-0000-0000-000000000010', 'FAC-1008', 'mvance@university.edu',
 '$2a$12$SEED.DATA.PLACEHOLDER.NOT.FOR.PRODUCTION.USE.REPLACE.IN.BE004',
 'Dr. Marcus Vance', 'FACULTY', 'ACTIVE');

-- ============================================================
-- FACULTY PROFILES (8 faculty members)
-- max_workload_hours: Professor=10, Associate Professor=16, Assistant Professor=20
-- currentWorkloadHours is NEVER stored — derived from active task_assignments.
-- ============================================================
INSERT INTO faculty_profiles (id, user_id, department_id, designation, max_workload_hours, phone, office, experience_years, research_area, avatar_url) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000001', 'Professor', 10,
 '+1 (555) 234-5678', 'Engineering Hall 302', 15, 'Distributed Data Store Security',
 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000001', 'Associate Professor', 16,
 '+1 (555) 345-6789', 'Engineering Hall 314', 10, 'Programming Language Theory',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000001', 'Assistant Professor', 20,
 '+1 (555) 456-7890', 'G.L. Cross Hall 012', 4, 'Scalable Neural Indexing',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006',
 '00000000-0000-0000-0000-000000000001', 'Professor', 10,
 '+1 (555) 567-8901', 'Engineering Lab 0216', 20, 'Graph Theory & Complexity',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000007',
 '00000000-0000-0000-0000-000000000001', 'Associate Professor', 16,
 '+1 (555) 678-9012', 'Memorial Union 0233', 12, 'Bayesian Inference in Bioinformatics',
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000008',
 '00000000-0000-0000-0000-000000000001', 'Assistant Professor', 20,
 '+1 (555) 789-0123', 'Price Hall 0300', 3, 'Real-time OS Scheduling',
 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000009',
 '00000000-0000-0000-0000-000000000001', 'Associate Professor', 16,
 '+1 (555) 890-1234', 'Engineering Hall 405', 8, 'Zero-Knowledge Proof Systems',
 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80'),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000010',
 '00000000-0000-0000-0000-000000000001', 'Assistant Professor', 20,
 '+1 (555) 901-2345', 'G.L. Cross Hall 104', 3, 'Autonomous Systems Perception',
 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80');

-- ============================================================
-- SKILLS (29 unique skills from mockFaculty + mockTasks)
-- ============================================================
INSERT INTO skills (id, name) VALUES
('30000000-0000-0000-0000-000000000001', 'Database Systems'),
('30000000-0000-0000-0000-000000000002', 'Distributed Systems'),
('30000000-0000-0000-0000-000000000003', 'Software Engineering'),
('30000000-0000-0000-0000-000000000004', 'System Architecture'),
('30000000-0000-0000-0000-000000000005', 'Programming Languages'),
('30000000-0000-0000-0000-000000000006', 'Algorithms'),
('30000000-0000-0000-0000-000000000007', 'Web Development'),
('30000000-0000-0000-0000-000000000008', 'Computer Graphics'),
('30000000-0000-0000-0000-000000000009', 'SQL Architecture'),
('30000000-0000-0000-0000-000000000010', 'Data Mining'),
('30000000-0000-0000-0000-000000000011', 'Machine Learning'),
('30000000-0000-0000-0000-000000000012', 'Theoretical Computer Science'),
('30000000-0000-0000-0000-000000000013', 'Mentorship'),
('30000000-0000-0000-0000-000000000014', 'Curriculum Design'),
('30000000-0000-0000-0000-000000000015', 'Probability & Statistics'),
('30000000-0000-0000-0000-000000000016', 'Data Science'),
('30000000-0000-0000-0000-000000000017', 'R Programming'),
('30000000-0000-0000-0000-000000000018', 'Python Analytics'),
('30000000-0000-0000-0000-000000000019', 'Computer Systems'),
('30000000-0000-0000-0000-000000000020', 'Assembly'),
('30000000-0000-0000-0000-000000000021', 'Operating Systems'),
('30000000-0000-0000-0000-000000000022', 'C/C++ Programming'),
('30000000-0000-0000-0000-000000000023', 'Cybersecurity'),
('30000000-0000-0000-0000-000000000024', 'Network Protocols'),
('30000000-0000-0000-0000-000000000025', 'Cryptography'),
('30000000-0000-0000-0000-000000000026', 'Cloud Computing'),
('30000000-0000-0000-0000-000000000027', 'Artificial Intelligence'),
('30000000-0000-0000-0000-000000000028', 'Deep Learning'),
('30000000-0000-0000-0000-000000000029', 'Computer Vision');

-- ============================================================
-- FACULTY_SKILLS (from mockFaculty.ts skills arrays)
-- ============================================================
-- fac-101: Dr. Sarah Vance — Database Systems, Distributed Systems, Software Engineering, System Architecture
INSERT INTO faculty_skills (faculty_id, skill_id) VALUES
('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002'),
('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'),
('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004');
-- fac-102: Dr. Jim Cokely — Programming Languages, Algorithms, Web Development, Computer Graphics
INSERT INTO faculty_skills (faculty_id, skill_id) VALUES
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005'),
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000006'),
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000007'),
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000008');
-- fac-103: Dr. Aris Thorne — Database Systems, SQL Architecture, Data Mining, Machine Learning
INSERT INTO faculty_skills (faculty_id, skill_id) VALUES
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000009'),
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000010'),
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000011');
-- fac-104: Dr. Joe Smith — Algorithms, Theoretical Computer Science, Mentorship, Curriculum Design
INSERT INTO faculty_skills (faculty_id, skill_id) VALUES
('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000006'),
('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000012'),
('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000013'),
('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000014');
-- fac-105: Dr. Sherry Holmes — Probability & Statistics, Data Science, R Programming, Python Analytics
INSERT INTO faculty_skills (faculty_id, skill_id) VALUES
('20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000015'),
('20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000016'),
('20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000017'),
('20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000018');
-- fac-106: Dr. Ryan Dauffend — Computer Systems, Assembly, Operating Systems, C/C++ Programming
INSERT INTO faculty_skills (faculty_id, skill_id) VALUES
('20000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000019'),
('20000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000020'),
('20000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000021'),
('20000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000022');
-- fac-107: Dr. Elena Rostova — Cybersecurity, Network Protocols, Cryptography, Cloud Computing
INSERT INTO faculty_skills (faculty_id, skill_id) VALUES
('20000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000023'),
('20000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000024'),
('20000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000025'),
('20000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000026');
-- fac-108: Dr. Marcus Vance — Artificial Intelligence, Deep Learning, Computer Vision, Python Analytics
INSERT INTO faculty_skills (faculty_id, skill_id) VALUES
('20000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000027'),
('20000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000028'),
('20000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000029'),
('20000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000018');

-- ============================================================
-- FACULTY_INTERESTS (from mockFaculty.ts researchArea)
-- ============================================================
INSERT INTO faculty_interests (faculty_id, interest) VALUES
('20000000-0000-0000-0000-000000000001', 'Distributed Data Store Security'),
('20000000-0000-0000-0000-000000000002', 'Programming Language Theory'),
('20000000-0000-0000-0000-000000000003', 'Scalable Neural Indexing'),
('20000000-0000-0000-0000-000000000004', 'Graph Theory & Complexity'),
('20000000-0000-0000-0000-000000000005', 'Bayesian Inference in Bioinformatics'),
('20000000-0000-0000-0000-000000000006', 'Real-time OS Scheduling'),
('20000000-0000-0000-0000-000000000007', 'Zero-Knowledge Proof Systems'),
('20000000-0000-0000-0000-000000000008', 'Autonomous Systems Perception');

-- ============================================================
-- TASKS (24 tasks from mockTasks.ts)
-- PS-08 type mapping: Lecture→TEACHING, Lab→LABORATORY_SESSIONS,
--   Research→PROJECT_GUIDANCE, Admin→DEPARTMENTAL_ACTIVITIES, Mentorship→MENTORING
-- ============================================================
INSERT INTO tasks (id, title, code, type, weekly_hours, priority, department_id, semester, deadline, description) VALUES
-- Dr. Sarah Vance tasks (14 hrs total)
('40000000-0000-0000-0000-000000000001', 'CS 4013 Database Systems Lab', 'CS 4013-002',
 'LABORATORY_SESSIONS', 3, 'HIGH', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-08-30',
 'Weekly hands-on lab sessions on indexing, query optimization, and B-tree storage engines.'),
('40000000-0000-0000-0000-000000000002', 'ABET Accreditation Committee Chair', 'ADMIN-ABET',
 'DEPARTMENTAL_ACTIVITIES', 4, 'HIGH', '00000000-0000-0000-0000-000000000001', 'Academic Year 2026-27', '2026-09-15',
 'Leading the self-study report preparation for CSE department accreditation renewal.'),
('40000000-0000-0000-0000-000000000003', 'CS 5013 Distributed Storage Systems', 'CS 5013-001',
 'TEACHING', 4, 'MEDIUM', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-08-28',
 'Graduate-level seminar on consensus algorithms, Raft, Paxos, and distributed transactions.'),
('40000000-0000-0000-0000-000000000004', 'CS 4990 Graduate Thesis & Research Advising', 'CS 4990-001',
 'PROJECT_GUIDANCE', 3, 'MEDIUM', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-10-15',
 'Supervision of MS and PhD candidates in distributed data storage resilience.'),
-- Dr. Jim Cokely tasks (14 hrs total)
('40000000-0000-0000-0000-000000000005', 'CS 1313 Programming for Non-Majors', 'CS 1313-001',
 'TEACHING', 4, 'HIGH', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-08-25',
 'Core introductory lecture on algorithmic thinking and fundamentals.'),
('40000000-0000-0000-0000-000000000006', 'CS 2334 Programming Structures', 'CS 2334-001',
 'TEACHING', 5, 'HIGH', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-08-26',
 'Object-oriented programming, data structure implementations, and software design patterns.'),
('40000000-0000-0000-0000-000000000007', 'Undergraduate Curriculum Committee', 'ADMIN-CURR-UG',
 'DEPARTMENTAL_ACTIVITIES', 5, 'MEDIUM', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-09-30',
 'Coordinating undergraduate course prerequisites and syllabus alignment.'),
-- Dr. Aris Thorne tasks (12 hrs total)
('40000000-0000-0000-0000-000000000008', 'Undergraduate Capstone Mentorship', 'CS 4970-001',
 'MENTORING', 3, 'MEDIUM', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-09-05',
 'Direct supervision of 4 senior design capstone teams.'),
('40000000-0000-0000-0000-000000000009', 'CS 3113 Introduction to Operating Systems', 'CS 3113-001',
 'TEACHING', 5, 'HIGH', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-08-27',
 'Processes, concurrency, memory management, and file systems architecture.'),
('40000000-0000-0000-0000-000000000010', 'Scalable Neural Indexing Research Lab', 'RES-INDEX-2026',
 'PROJECT_GUIDANCE', 4, 'MEDIUM', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-10-10',
 'Directing research on high-dimensional vector search algorithms.'),
-- Dr. Joe Smith tasks (9 hrs total)
('40000000-0000-0000-0000-000000000011', 'CS 2413 Data Structures & Algorithms', 'CS 2413-001',
 'TEACHING', 5, 'HIGH', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-08-28',
 'Comprehensive study of trees, graphs, sorting, and asymptotic complexity.'),
('40000000-0000-0000-0000-000000000012', 'Graduate Seminar on Graph Theory', 'CS 6813-001',
 'PROJECT_GUIDANCE', 4, 'MEDIUM', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-09-25',
 'Advanced investigation into NP-complete graph algorithms and approximation bounds.'),
-- Dr. Sherry Holmes tasks (18 hrs total)
('40000000-0000-0000-0000-000000000013', 'ECON 2843 Elements of Statistics', 'ECON 2843-002',
 'TEACHING', 5, 'HIGH', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-08-25',
 'Foundational cross-departmental statistics course.'),
('40000000-0000-0000-0000-000000000014', 'Biostatistics Graduate Seminar', 'CS 6800-001',
 'PROJECT_GUIDANCE', 4, 'MEDIUM', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-09-10',
 'Weekly research review on statistical genetics and sequence alignment models.'),
('40000000-0000-0000-0000-000000000015', 'CS 4023 Applied Data Science Lab', 'CS 4023-001',
 'LABORATORY_SESSIONS', 5, 'HIGH', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-08-31',
 'Practical lab on regression, hypothesis testing, and machine learning pipelines.'),
('40000000-0000-0000-0000-000000000016', 'Departmental Assessment Committee', 'ADMIN-ASSESS',
 'DEPARTMENTAL_ACTIVITIES', 4, 'MEDIUM', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-10-05',
 'Analyzing learning outcome metrics and accreditation evidence across courses.'),
-- Dr. Ryan Dauffend tasks (14 hrs total)
('40000000-0000-0000-0000-000000000017', 'CS 3013 Operating Systems Lab', 'CS 3013-002',
 'LABORATORY_SESSIONS', 4, 'HIGH', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-09-01',
 'Practical kernel module development and process synchronization exercises.'),
('40000000-0000-0000-0000-000000000018', 'CS 2613 Computer Systems & Assembly', 'CS 2613-001',
 'TEACHING', 6, 'HIGH', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-08-25',
 'x86/ARM assembly programming, machine data representation, and memory hierarchies.'),
('40000000-0000-0000-0000-000000000019', 'Real-time OS Lab Supervision', 'RES-RTOS-2026',
 'PROJECT_GUIDANCE', 4, 'MEDIUM', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-10-01',
 'Supervising embedded real-time scheduling testbeds and kernel driver benchmarks.'),
-- Dr. Elena Rostova tasks (10 hrs total)
('40000000-0000-0000-0000-000000000020', 'CS 4823 Cryptography & Security', 'CS 4823-001',
 'TEACHING', 4, 'HIGH', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-08-26',
 'Undergraduate cybersecurity core covering public key infrastructure and modern ciphers.'),
('40000000-0000-0000-0000-000000000021', 'Network Security & Cloud Lab', 'CS 4823-LAB',
 'LABORATORY_SESSIONS', 3, 'MEDIUM', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-09-05',
 'Hands-on lab exercises in packet analysis, firewall configuration, and zero-trust VPNs.'),
('40000000-0000-0000-0000-000000000022', 'Cybersecurity Curriculum Committee', 'ADMIN-CYBER',
 'DEPARTMENTAL_ACTIVITIES', 3, 'LOW', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-10-15',
 'Reviewing NSA/DHS Center of Academic Excellence accreditation criteria.'),
-- Dr. Marcus Vance tasks (15 hrs total)
('40000000-0000-0000-0000-000000000023', 'CS 5113 Neural Networks & Vision', 'CS 5113-001',
 'TEACHING', 4, 'HIGH', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-08-27',
 'Advanced course on convolutional neural networks and spatial transformer architectures.'),
('40000000-0000-0000-0000-000000000024', 'CS 4033 Machine Learning Fundamentals', 'CS 4033-001',
 'TEACHING', 5, 'HIGH', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-08-28',
 'Supervised and unsupervised learning models, evaluation metrics, and optimization algorithms.'),
('40000000-0000-0000-0000-000000000025', 'Autonomous Perception Lab', 'RES-AUTO-2026',
 'PROJECT_GUIDANCE', 6, 'MEDIUM', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-10-01',
 'Directing robotics vision research team on LiDAR and camera sensor fusion.'),
-- Unassigned backlog tasks (6 hrs total)
('40000000-0000-0000-0000-000000000026', 'Departmental Curriculum Review Taskforce', 'ADMIN-CURR',
 'DEPARTMENTAL_ACTIVITIES', 3, 'LOW', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-10-01',
 'Evaluation of new course proposals for the AI & Machine Learning undergraduate track.'),
('40000000-0000-0000-0000-000000000027', 'NSF Cyber-Infrastructure Grant Review', 'RES-NSF-2026',
 'PROJECT_GUIDANCE', 3, 'MEDIUM', '00000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-09-20',
 'Peer review and proposal submission for $1.2M federal research infrastructure grant.');

-- ============================================================
-- TASK_REQUIRED_SKILLS (from mockTasks.ts requiredSkills arrays)
-- ============================================================
-- tsk-201 (task 01): Database Systems, SQL Architecture
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000009');
-- tsk-203 (task 02): Curriculum Design, Mentorship, Software Engineering
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000014'),
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000013'),
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003');
-- tsk-204 (task 03): Database Systems, Distributed Systems
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001'),
('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002');
-- tsk-2013 (task 04): System Architecture, Distributed Systems
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004'),
('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002');
-- tsk-202 (task 05): Programming Languages, Web Development
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005'),
('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000007');
-- tsk-2014 (task 06): Programming Languages, Algorithms
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000005'),
('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006');
-- tsk-2015 (task 07): Curriculum Design, Programming Languages
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000014'),
('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000005');
-- tsk-2010 (task 08): Software Engineering, System Architecture, Mentorship
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000003'),
('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000004'),
('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000013');
-- tsk-2016 (task 09): Database Systems, SQL Architecture, System Architecture
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000001'),
('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000009'),
('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000004');
-- tsk-2017 (task 10): Data Mining, Machine Learning
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000010'),
('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000011');
-- tsk-2018 (task 11): Algorithms, Theoretical Computer Science
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000006'),
('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000012');
-- tsk-2019 (task 12): Algorithms, Theoretical Computer Science
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000006'),
('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000012');
-- tsk-206 (task 13): Probability & Statistics, R Programming
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000015'),
('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000017');
-- tsk-207 (task 14): Probability & Statistics, Python Analytics
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000015'),
('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000018');
-- tsk-2020 (task 15): Data Science, Python Analytics
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000016'),
('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000018');
-- tsk-2021 (task 16): Probability & Statistics, Curriculum Design
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000015'),
('40000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000014');
-- tsk-205 (task 17): Computer Systems, Assembly, C/C++ Programming
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000019'),
('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000020'),
('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000022');
-- tsk-2022 (task 18): Computer Systems, Assembly, C/C++ Programming
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000019'),
('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000020'),
('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000022');
-- tsk-2023 (task 19): Operating Systems, C/C++ Programming
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000021'),
('40000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000022');
-- tsk-208 (task 20): Cybersecurity, Cryptography, Network Protocols
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000023'),
('40000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000025'),
('40000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000024');
-- tsk-2024 (task 21): Cybersecurity, Network Protocols, Cloud Computing
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000023'),
('40000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000024'),
('40000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000026');
-- tsk-2025 (task 22): Cybersecurity, Cloud Computing
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000023'),
('40000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000026');
-- tsk-209 (task 23): Artificial Intelligence, Deep Learning, Computer Vision
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000027'),
('40000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000028'),
('40000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000029');
-- tsk-2026 (task 24): Artificial Intelligence, Python Analytics
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000027'),
('40000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000018');
-- tsk-2027 (task 25): Computer Vision, Deep Learning
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000025', '30000000-0000-0000-0000-000000000029'),
('40000000-0000-0000-0000-000000000025', '30000000-0000-0000-0000-000000000028');
-- tsk-2011 (task 26 — unassigned): Curriculum Design, Algorithms
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000026', '30000000-0000-0000-0000-000000000014'),
('40000000-0000-0000-0000-000000000026', '30000000-0000-0000-0000-000000000006');
-- tsk-2012 (task 27 — unassigned): Cloud Computing, Cybersecurity, Database Systems
INSERT INTO task_required_skills (task_id, skill_id) VALUES
('40000000-0000-0000-0000-000000000027', '30000000-0000-0000-0000-000000000026'),
('40000000-0000-0000-0000-000000000027', '30000000-0000-0000-0000-000000000023'),
('40000000-0000-0000-0000-000000000027', '30000000-0000-0000-0000-000000000001');

-- ============================================================
-- TASK_ASSIGNMENTS (22 active assignments — 2 tasks are unassigned)
-- Workload is DERIVED from these rows: SUM(weekly_hours) WHERE status='ACTIVE'
-- ============================================================
INSERT INTO task_assignments (id, task_id, faculty_id, status) VALUES
-- Dr. Sarah Vance: 3+4+4+3 = 14 hrs (Overloaded, max=10)
('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'ACTIVE'),
('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'ACTIVE'),
('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'ACTIVE'),
('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'ACTIVE'),
-- Dr. Jim Cokely: 4+5+5 = 14 hrs (Balanced, max=16, 87.5%)
('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'ACTIVE'),
('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 'ACTIVE'),
('50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000002', 'ACTIVE'),
-- Dr. Aris Thorne: 3+5+4 = 12 hrs (Underloaded, max=20, 60%)
('50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', 'ACTIVE'),
('50000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003', 'ACTIVE'),
('50000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000003', 'ACTIVE'),
-- Dr. Joe Smith: 5+4 = 9 hrs (Balanced, max=10, 90%)
('50000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000004', 'ACTIVE'),
('50000000-0000-0000-0000-000000000012', '40000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000004', 'ACTIVE'),
-- Dr. Sherry Holmes: 5+4+5+4 = 18 hrs (Overloaded, max=16)
('50000000-0000-0000-0000-000000000013', '40000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000005', 'ACTIVE'),
('50000000-0000-0000-0000-000000000014', '40000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000005', 'ACTIVE'),
('50000000-0000-0000-0000-000000000015', '40000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000005', 'ACTIVE'),
('50000000-0000-0000-0000-000000000016', '40000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000005', 'ACTIVE'),
-- Dr. Ryan Dauffend: 4+6+4 = 14 hrs (Underloaded, max=20, 70%)
('50000000-0000-0000-0000-000000000017', '40000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000006', 'ACTIVE'),
('50000000-0000-0000-0000-000000000018', '40000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000006', 'ACTIVE'),
('50000000-0000-0000-0000-000000000019', '40000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000006', 'ACTIVE'),
-- Dr. Elena Rostova: 4+3+3 = 10 hrs (Underloaded, max=16, 62.5%)
('50000000-0000-0000-0000-000000000020', '40000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000007', 'ACTIVE'),
('50000000-0000-0000-0000-000000000021', '40000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000007', 'ACTIVE'),
('50000000-0000-0000-0000-000000000022', '40000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000007', 'ACTIVE');
-- Dr. Marcus Vance: 4+5+6 = 15 hrs (Underloaded, max=20, 75%)
INSERT INTO task_assignments (id, task_id, faculty_id, status) VALUES
('50000000-0000-0000-0000-000000000023', '40000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000008', 'ACTIVE'),
('50000000-0000-0000-0000-000000000024', '40000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000008', 'ACTIVE'),
('50000000-0000-0000-0000-000000000025', '40000000-0000-0000-0000-000000000025', '20000000-0000-0000-0000-000000000008', 'ACTIVE');

-- ============================================================
-- FACULTY_REGISTRATION_REQUESTS (1 pending — Dr. Alan Turing)
-- ============================================================
INSERT INTO faculty_registration_requests (id, institutional_id, email, full_name, designation, department_name, phone, skills_json, availability, status) VALUES
('80000000-0000-0000-0000-000000000001', 'FAC-1009', 'alan.turing@university.edu',
 'Dr. Alan Turing', 'Assistant Professor', 'Computer Science & Engineering',
 '(555) 019-9821', '["Database Systems", "Algorithms", "Software Engineering"]',
 '20 hrs/week statutory limit', 'PENDING');

-- ============================================================
-- RECOMMENDATIONS (3 pending — from mockRecommendations.ts)
-- Grouped by overloaded faculty with recommendation_items
-- ============================================================
-- Recommendation for Dr. Sarah Vance (overloaded: 14/10)
INSERT INTO recommendations (id, overloaded_faculty_id, status, reason, created_at) VALUES
('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'PENDING',
 'Dr. Sarah Vance is overloaded at 14/10 hrs (+4h over statutory limit). Redistribution candidates identified.',
 '2026-08-10 09:00:00');

INSERT INTO recommendation_items (id, recommendation_id, task_id, target_faculty_id, match_score, projected_source_hours, projected_target_hours, status) VALUES
-- rec-301: shift DB Systems Lab to Aris Thorne (score 94)
('65000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
 '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003',
 94, 11, 15, 'PENDING'),
-- rec-303: shift ABET Committee to Elena Rostova (score 91)
('65000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001',
 '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000007',
 91, 10, 14, 'PENDING');

-- Recommendation for Dr. Sherry Holmes (overloaded: 18/16)
INSERT INTO recommendations (id, overloaded_faculty_id, status, reason, created_at) VALUES
('60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005', 'PENDING',
 'Dr. Sherry Holmes is overloaded at 18/16 hrs (+2h over statutory limit). Redistribution candidates identified.',
 '2026-08-10 09:00:00');

INSERT INTO recommendation_items (id, recommendation_id, task_id, target_faculty_id, match_score, projected_source_hours, projected_target_hours, status) VALUES
-- rec-302: shift Biostatistics Seminar to Marcus Vance (score 88)
('65000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000002',
 '40000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000008',
 88, 14, 19, 'PENDING');

-- ============================================================
-- REBALANCE_REQUESTS (2 pending — from rebalanceRequestService.ts)
-- ============================================================
INSERT INTO rebalance_requests (id, request_type, requester_faculty_id, target_overloaded_faculty_id, suggested_assignee_faculty_id, task_id, reason, status, created_at) VALUES
-- req-501: Dr. Sarah Vance requests overload relief
('70000000-0000-0000-0000-000000000001', 'OVERLOAD_RELIEF',
 '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
 '20000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001',
 'I am currently overloaded at 14/10 hrs (+4h over limit). Requesting to reassign Database Systems Lab to Dr. Aris Thorne who has 8 hrs available capacity.',
 'PENDING', '2026-08-10 09:30:00'),
-- req-502: Dr. Aris Thorne offers peer rebalance
('70000000-0000-0000-0000-000000000002', 'PEER_REBALANCE_OFFER',
 '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005',
 '20000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000014',
 'I have 8 hrs available capacity (12/20 hrs). Offering to take over Biostatistics Seminar from Dr. Sherry Holmes (18/16 hrs) to balance departmental load.',
 'PENDING', '2026-08-11 08:15:00');
