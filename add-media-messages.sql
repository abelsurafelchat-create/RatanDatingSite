-- Add columns for voice and image messages

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS media_data TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);

-- Update existing messages to have 'text' type
UPDATE messages SET message_type = 'text' WHERE message_type IS NULL;
