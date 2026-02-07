-- Add schedule settings columns to establishments table
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS opening_time TEXT DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS closing_time TEXT DEFAULT '20:00',
ADD COLUMN IF NOT EXISTS lunch_start TEXT DEFAULT '12:00',
ADD COLUMN IF NOT EXISTS lunch_end TEXT DEFAULT '13:00';
