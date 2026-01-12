-- Seed file to add an administrator user
-- Database: Cyber_Dept_Portal

USE Cyber_Dept_Portal;

-- Insert Admin User
-- Note: 'password_hash' currently contains a dummy bcrypt hash ($2b$12$Kue.o9.W8E6R6qE.L9W7Qe9w9w9w9w9w9w9w9w9w9w9w9w9w9w9w) 
-- You should replace this with a proper hash for your production password.
-- Use INSERT IGNORE to create the admin user only if it doesn't exist (preserves password changes)
-- INSERT IGNORE will skip if admin@css.com already exists, preserving any password changes
INSERT IGNORE INTO `users` (
    `email`, 
    `name`, 
    `password_hash`, 
    `role`, 
    `phone`, 
    `is_active`,
    `password_changed`
) VALUES (
    'admin@css.com', 
    'System Administrator', 
    '$2b$10$Fs9ktX8uyga4hVuLEVRce.z6VnJa60lJsWL5oyMdUATwGytli7Vky', 
    'admin', 
    '1234567890', 
    TRUE,
    FALSE
);
