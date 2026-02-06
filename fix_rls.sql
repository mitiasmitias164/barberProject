-- FIX RLS POLICIES FOR REGISTRATION FLOW
-- This script ensures that authenticated users can insert their own profiles, establishments, and services.

-- 1. Profiles: Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 2. Establishments: Allow users to insert an establishment where they are the owner
DROP POLICY IF EXISTS "Owners can insert their own establishment" ON establishments;
CREATE POLICY "Owners can insert their own establishment" 
ON establishments 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- 3. Services: Avoid circular dependency on 'profiles' during first insert.
-- Check directly if the user owns the establishment.
DROP POLICY IF EXISTS "Owners can insert services" ON services;
CREATE POLICY "Owners can insert services" 
ON services 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM establishments 
        WHERE establishments.id = services.establishment_id 
        AND establishments.owner_id = auth.uid()
    )
);
