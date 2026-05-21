export interface Profile {
  id: string;
  did: string;
  wallet_address: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  trust_score: number;
  total_commits: number;
  total_prs: number;
  total_issues: number;
  total_bounties_completed: number;
  created_at: string;
  updated_at: string;
}

export interface GitlawbAgent {
  did: string;
  capabilities: string[];
  trust_score: number;
  registered_at: string;
  last_seen: string | null;
  synced_at: string;
}

export interface GitlawbRepo {
  id: string;
  name: string;
  owner_did: string;
  description: string | null;
  star_count: number;
  created_at: string;
  updated_at: string;
  synced_at: string;
}

export interface Badge {
  id: number;
  profile_id: string;
  badge_id: number;
  badge_name: string;
  minted_at: string;
  tx_hash: string | null;
}

export interface Bounty {
  id: number;
  title: string;
  description: string;
  repo: string;
  issue_id: string;
  amount: string;
  token: string;
  chain_id: number;
  contract_address: string;
  on_chain_id: number | null;
  status: "open" | "claimed" | "completed" | "expired";
  creator_id: string | null;
  claimer_id: string | null;
  created_at: string;
  claimed_at: string | null;
  completed_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
      badges: {
        Row: Badge;
        Insert: Omit<Badge, "id" | "minted_at">;
        Update: Partial<Omit<Badge, "id">>;
        Relationships: [];
      };
      bounties: {
        Row: Bounty;
        Insert: Omit<Bounty, "id" | "created_at" | "claimed_at" | "completed_at">;
        Update: Partial<Omit<Bounty, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
