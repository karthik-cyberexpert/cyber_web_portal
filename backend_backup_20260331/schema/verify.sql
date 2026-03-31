USE Cyber_Dept_Portal;

-- 1. Remove any existing record with this email
DELETE FROM `users` WHERE `email` = 'admin@css.com';

-- 2. Insert fresh record
INSERT INTO `users` (
    `email`, 
    `name`, 
    `password_hash`, 
    `role`, 
    `is_active`,
    `password_changed`
) VALUES (
    'admin@css.com', 
    'System Administrator', 
    '$2b$10$Fs9ktX8uyga4hVuLEVRce.z6VnJa60lJsWL5oyMdUATwGytli7Vky', 
    'admin', 
    TRUE,
    FALSE
);



-- SELECT email, role, password_changed FROM users WHERE email = 'admin@css.com';