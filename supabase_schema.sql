-- Enable the pg_trgm extension if needed, but btree_gist is required for EXCLUDE with UUID
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create establishments table
CREATE TABLE establishments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    address TEXT,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    slot_duration INTEGER NOT NULL DEFAULT 30
);

-- Update profiles table (Using CREATE OR REPLACE or ALTER logic for idempotency if running iteratively, but here defining the desired final state)
-- If this was a migration I would use ALTER TABLE, but since I am defining the schema file, I will redefine it.
-- User profiles linked to auth.users
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    nome TEXT NOT NULL,
    telefone TEXT,
    role TEXT CHECK (role IN ('owner', 'barber', 'admin', 'cliente')) NOT NULL DEFAULT 'cliente',
    establishment_id UUID REFERENCES establishments(id)
);

-- Services belonging to an establishment
CREATE TABLE services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    establishment_id UUID REFERENCES establishments(id) NOT NULL,
    nome TEXT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    duracao INTEGER NOT NULL -- Duration in minutes
);

-- Appointments linked to establishment
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    establishment_id UUID REFERENCES establishments(id) NOT NULL,
    cliente_id UUID REFERENCES profiles(id) NOT NULL,
    barbeiro_id UUID REFERENCES profiles(id) NOT NULL,
    service_id UUID REFERENCES services(id) NOT NULL,
    data_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_hora_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('agendado', 'concluido', 'cancelado')) NOT NULL DEFAULT 'agendado',
    
    -- Prevent overlapping appointments for the same barber excluding cancelled ones
    CONSTRAINT no_overlap EXCLUDE USING gist (
        barbeiro_id WITH =,
        tstzrange(data_hora_inicio, data_hora_fim) WITH &&
    ) WHERE (status != 'cancelado')
);

-- RLS Policies (Examples)
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Establishments: Everyone can read (to find by slug), only owner can update
CREATE POLICY "Public establishments are viewable by everyone" ON establishments FOR SELECT USING (true);
CREATE POLICY "Owners can insert their own establishment" ON establishments FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their own establishment" ON establishments FOR UPDATE USING (auth.uid() = owner_id);

-- Profiles: Public can read basic info (barber names), users can update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Services: Public can read (booking), Establishment members can update
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Establishment members can manage services" ON services FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.establishment_id = services.establishment_id
        AND profiles.role IN ('owner', 'admin')
    )
);

-- Appointments:
-- Barbers/Owners see all appointments in their establishment
-- Clients see their own appointments
CREATE POLICY "Establishment members can view all appointments" ON appointments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.establishment_id = appointments.establishment_id
        AND profiles.role IN ('owner', 'barber', 'admin')
    )
);

CREATE POLICY "Clients can view their own appointments" ON appointments FOR SELECT USING (
    auth.uid() = cliente_id
);

CREATE POLICY "Clients can insert their own appointments" ON appointments FOR INSERT WITH CHECK (
    auth.uid() = cliente_id
);
