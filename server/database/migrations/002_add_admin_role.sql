-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have 'user' role
UPDATE users SET role = 'user' WHERE role IS NULL;

-- You can manually set a user as admin by running:
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
