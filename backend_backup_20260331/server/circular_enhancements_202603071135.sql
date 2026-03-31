-- Migration script: Enhancing Circulars with Targeted Recipients
-- Date: 2026-03-07 11:35

-- 1. Create table for specific recipients
CREATE TABLE IF NOT EXISTS circular_recipients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    circular_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (circular_id) REFERENCES circulars(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Update existing circulars to use consistent casing if needed
UPDATE circulars SET audience = 'All' WHERE audience = 'all';
UPDATE circulars SET audience = 'Students' WHERE audience = 'students';
UPDATE circulars SET audience = 'Faculty' WHERE audience = 'faculty';
UPDATE circulars SET audience = 'Tutors' WHERE audience = 'tutors';

-- 3. Add column to track if it's targeted only to recipients (optional but good for filtering)
-- We can just rely on the existence of records in circular_recipients if we want "Selected Students" mode.
