-- Add last_seen column to users table

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP DEFAULT NOW();

-- Update existing users to have current timestamp
UPDATE users 
SET last_seen = NOW() 
WHERE last_seen IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);
