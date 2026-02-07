-- Update appointments table to support blocking functionality
-- 1. Add 'bloqueio' to the status enum
-- 2. Make service_id and cliente_id nullable for blocked slots

-- Drop existing constraint
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Add new constraint with 'bloqueio' status
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('agendado', 'concluido', 'cancelado', 'bloqueio'));

-- Make service_id nullable (for blocked slots)
ALTER TABLE appointments ALTER COLUMN service_id DROP NOT NULL;

-- Make cliente_id nullable (for blocked slots)
ALTER TABLE appointments ALTER COLUMN cliente_id DROP NOT NULL;
