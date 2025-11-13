-- Update admin role directly in database
-- Run this in PostgreSQL

UPDATE users 
SET role = 'admin', 
    account_status = 'active'
WHERE email = 'phuchai.le@gmail.com';

-- Verify the update
SELECT id, email, full_name, role, account_status 
FROM users 
WHERE email = 'phuchai.le@gmail.com';
