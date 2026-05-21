-- Proof Merge Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  did TEXT UNIQUE NOT NULL,
  wallet_address TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  trust_score DECIMAL(3,2) DEFAULT 0.00,
  total_commits INTEGER DEFAULT 0,
  total_prs INTEGER DEFAULT 0,
  total_issues INTEGER DEFAULT 0,
  total_bounties_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_profiles_did ON profiles(did);
CREATE INDEX idx_profiles_wallet ON profiles(wallet_address);

-- Badges table
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id INTEGER NOT NULL,
  badge_name TEXT NOT NULL,
  minted_at TIMESTAMPTZ DEFAULT NOW(),
  tx_hash TEXT
);

-- Index for fast lookups
CREATE INDEX idx_badges_profile ON badges(profile_id);
CREATE INDEX idx_badges_badge_id ON badges(badge_id);

-- Unique constraint: one badge type per profile
CREATE UNIQUE INDEX idx_badges_unique ON badges(profile_id, badge_id);

-- Bounties table
CREATE TABLE bounties (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  repo TEXT NOT NULL,
  issue_id TEXT,
  amount TEXT NOT NULL,
  token TEXT NOT NULL DEFAULT 'USDC',
  chain_id INTEGER NOT NULL DEFAULT 84532,
  contract_address TEXT NOT NULL,
  on_chain_id INTEGER,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'completed', 'expired')),
  creator_id UUID REFERENCES profiles(id),
  claimer_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Index for fast lookups
CREATE INDEX idx_bounties_status ON bounties(status);
CREATE INDEX idx_bounties_repo ON bounties(repo);
CREATE INDEX idx_bounties_creator ON bounties(creator_id);
CREATE INDEX idx_bounties_claimer ON bounties(claimer_id);

-- Auto-update updated_at for profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only owner can update
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- Badges: anyone can read, only system can insert
CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can mint badges"
  ON badges FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Bounties: anyone can read, authenticated can create
CREATE POLICY "Bounties are viewable by everyone"
  ON bounties FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create bounties"
  ON bounties FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update bounties"
  ON bounties FOR UPDATE
  USING (auth.role() = 'authenticated');
