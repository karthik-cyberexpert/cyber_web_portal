-- Add place_to_visit column to od_requests
ALTER TABLE od_requests ADD COLUMN place_to_visit VARCHAR(255) AFTER reason;
