-- Add slot_duration to establishments
ALTER TABLE establishments ADD COLUMN IF NOT EXISTS slot_duration INTEGER DEFAULT 30;

-- Update appointments to support blocking (null client)
ALTER TABLE appointments ALTER COLUMN cliente_id DROP NOT NULL;

-- Drop existing check constraint on status if it exists and add new one
-- Note: Modifying check constraints usually requires dropping and re-adding
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
    CHECK (status IN ('agendado', 'concluido', 'cancelado', 'bloqueio'));
