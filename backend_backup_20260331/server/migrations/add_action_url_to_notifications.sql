-- Add action_url column to notifications table
ALTER TABLE notifications 
ADD COLUMN action_url VARCHAR(255) DEFAULT NULL AFTER message;

-- Verify the column was added
DESCRIBE notifications;
