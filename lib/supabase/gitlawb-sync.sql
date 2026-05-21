-- gitlawb data tables for search and caching
-- Run this in Supabase SQL Editor

-- Agents table (synced from gitlawb)
CREATE TABLE IF NOT EXISTS gitlawb_agents (
  did TEXT PRIMARY KEY,
  capabilities TEXT[],
  trust_score DECIMAL(3,2) DEFAULT 0.00,
  registered_at TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repos table (synced from gitlawb)
CREATE TABLE IF NOT EXISTS gitlawb_repos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_did TEXT NOT NULL,
  description TEXT,
  star_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stats table (synced from gitlawb)
CREATE TABLE IF NOT EXISTS gitlawb_stats (
  id TEXT PRIMARY KEY DEFAULT 'network',
  agents INTEGER DEFAULT 0,
  repos INTEGER DEFAULT 0,
  pushes INTEGER DEFAULT 0,
  version TEXT DEFAULT 'unknown',
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for search
CREATE INDEX IF NOT EXISTS idx_agents_did ON gitlawb_agents(did);
CREATE INDEX IF NOT EXISTS idx_repos_name ON gitlawb_repos(name);
CREATE INDEX IF NOT EXISTS idx_repos_owner ON gitlawb_repos(owner_did);

-- Enable RLS
ALTER TABLE gitlawb_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gitlawb_repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gitlawb_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agents are viewable by everyone" ON gitlawb_agents;
DROP POLICY IF EXISTS "Repos are viewable by everyone" ON gitlawb_repos;
DROP POLICY IF EXISTS "Stats are viewable by everyone" ON gitlawb_stats;
DROP POLICY IF EXISTS "Anyone can insert agents" ON gitlawb_agents;
DROP POLICY IF EXISTS "Anyone can update agents" ON gitlawb_agents;
DROP POLICY IF EXISTS "Anyone can insert repos" ON gitlawb_repos;
DROP POLICY IF EXISTS "Anyone can update repos" ON gitlawb_repos;
DROP POLICY IF EXISTS "Anyone can upsert stats" ON gitlawb_stats;

-- Public read access
CREATE POLICY "Agents are viewable by everyone"
  ON gitlawb_agents FOR SELECT
  USING (true);

CREATE POLICY "Repos are viewable by everyone"
  ON gitlawb_repos FOR SELECT
  USING (true);

CREATE POLICY "Stats are viewable by everyone"
  ON gitlawb_stats FOR SELECT
  USING (true);

-- Public write for sync
CREATE POLICY "Anyone can insert agents"
  ON gitlawb_agents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update agents"
  ON gitlawb_agents FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can insert repos"
  ON gitlawb_repos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update repos"
  ON gitlawb_repos FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can upsert stats"
  ON gitlawb_stats FOR INSERT
  WITH CHECK (true);
