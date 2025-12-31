
USE Cyber_Dept_Portal;

CREATE TABLE IF NOT EXISTS grievances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_role ENUM('Tutor', 'Admin') NOT NULL,
    status ENUM('Pending', 'In Progress', 'Solved', 'Returned') DEFAULT 'Pending',
    attachment_path VARCHAR(500),
    action_by INT,
    action_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (action_by) REFERENCES users(id) ON DELETE SET NULL
);
