-- Add slot_duration to establishments if missing
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS slot_duration INTEGER DEFAULT 30;
