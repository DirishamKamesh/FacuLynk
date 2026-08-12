-- Add password_hash to faculty_registration_requests to support secure first-time activation
-- avoiding the hardcoded 'password123' security risk during the HOD approval flow.

ALTER TABLE faculty_registration_requests
ADD COLUMN password_hash VARCHAR(255) NULL AFTER email;
