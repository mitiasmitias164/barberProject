-- Combined Migration Script for Availability Feature
-- Run this in Supabase SQL Editor
-- This updates the database schema to support blocking/unavailable time slots

-- ============================================================
-- 1. Update establishments table with schedule settings
-- ============================================================
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS opening_time TEXT DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS closing_time TEXT DEFAULT '20:00',
ADD COLUMN IF NOT EXISTS lunch_start TEXT DEFAULT '12:00',
ADD COLUMN IF NOT EXISTS lunch_end TEXT DEFAULT '13:00';

-- ============================================================
-- 2. Update appointments table for blocking functionality
-- ============================================================

-- Drop existing status constraint if it exists
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Add new constraint with 'bloqueio' status
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('agendado', 'concluido', 'cancelado', 'bloqueio'));

-- Make service_id nullable (for blocked slots that don't have a service)
ALTER TABLE appointments ALTER COLUMN service_id DROP NOT NULL;

-- Make cliente_id nullable (for blocked slots that don't have a client)
ALTER TABLE appointments ALTER COLUMN cliente_id DROP NOT NULL;

-- ============================================================
-- Verification Queries (Optional - run after migration)
-- ============================================================

-- Check establishments table structure
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'establishments' 
-- AND column_name IN ('opening_time', 'closing_time', 'lunch_start', 'lunch_end', 'slot_duration');

-- Check appointments table constraints
-- SELECT constraint_name, check_clause 
-- FROM information_schema.check_constraints 
-- WHERE constraint_name = 'appointments_status_check';

-- Check if nullable columns work
-- SELECT column_name, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'appointments' 
-- AND column_name IN ('service_id', 'cliente_id');
