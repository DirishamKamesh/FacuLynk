-- Update all seed data users to use a valid BCrypt hash for "password123"
UPDATE users SET password_hash = '$2a$10$n1iYw.Jof6prB5tlA424eOvoNNYljVByEeJt0ZgEu40Ku7q6lvoLa' 
WHERE institutional_id IN ('HOD-001', 'HOD-002', 'FAC-1001', 'FAC-1002', 'FAC-1003', 'FAC-1004', 'FAC-1005', 'FAC-1006', 'FAC-1007', 'FAC-1008');

-- Update pending requests as well if they exist
UPDATE faculty_registration_requests SET password_hash = '$2a$10$n1iYw.Jof6prB5tlA424eOvoNNYljVByEeJt0ZgEu40Ku7q6lvoLa';
