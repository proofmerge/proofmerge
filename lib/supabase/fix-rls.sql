-- Fix RLS policies for wallet-based auth (no Supabase auth)
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Only authenticated users can mint badges" ON badges;
DROP POLICY IF EXISTS "Authenticated users can create bounties" ON bounties;
DROP POLICY IF EXISTS "Authenticated users can update bounties" ON bounties;

-- Profiles: public read, public write
CREATE POLICY "Anyone can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update profiles"
  ON profiles FOR UPDATE
  USING (true);

-- Badges: public read, public insert
CREATE POLICY "Anyone can insert badges"
  ON badges FOR INSERT
  WITH CHECK (true);

-- Bounties: public read, public write
CREATE POLICY "Anyone can create bounties"
  ON bounties FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update bounties"
  ON bounties FOR UPDATE
  USING (true);
