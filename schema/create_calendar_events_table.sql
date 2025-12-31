CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- 'UT', 'MODEL', 'SEMESTER', 'HOLIDAY'
    date DATE NOT NULL,
    title VARCHAR(255), -- For Holidays or custom titles
    description TEXT,
    batch_id INT, -- Nullable, for battery specific exams
    semester INT, -- Nullable, for semester specific exams
    subject_id INT, -- Nullable, links to subjects table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
