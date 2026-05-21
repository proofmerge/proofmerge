import { supabase } from "./client";
import type { GitlawbAgent, GitlawbRepo, GitlawbNetworkStats } from "@/lib/gitlawb/types";

export async function getCachedAgents(limit = 10, offset = 0): Promise<GitlawbAgent[]> {
  const { data, error } = await supabase
    .from("gitlawb_agents")
    .select("*")
    .order("trust_score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return [];

  return data.map((a) => ({
    did: a.did,
    name: a.did.slice(8, 20) + "...",
    trustScore: a.trust_score,
    trustLevel: getTrustLevel(a.trust_score),
    pushes: 0,
    repos: 0,
    publicKey: {
      id: a.did,
      type: "Ed25519VerificationKey2020",
      publicKeyMultibase: a.did.replace("did:key:", ""),
    },
  }));
}

export async function getCachedRepos(limit = 10): Promise<GitlawbRepo[]> {
  const { data, error } = await supabase
    .from("gitlawb_repos")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((r) => ({
    name: r.name,
    owner: r.owner_did.slice(8, 20) + "...",
    description: r.description || undefined,
    lastActivity: r.updated_at,
    commits: 0,
    issues: 0,
    prs: 0,
  }));
}

export async function getCachedStats(): Promise<GitlawbNetworkStats> {
  const { count: agents } = await supabase
    .from("gitlawb_agents")
    .select("*", { count: "exact", head: true });

  const { count: repos } = await supabase
    .from("gitlawb_repos")
    .select("*", { count: "exact", head: true });

  return {
    nodes: 3,
    agents: agents || 0,
    repos: repos || 0,
    commits24h: 0,
    issues24h: 0,
    prs24h: 0,
  };
}

export async function getCachedAgentCount(): Promise<number> {
  const { count } = await supabase
    .from("gitlawb_agents")
    .select("*", { count: "exact", head: true });
  return count || 0;
}

export async function getCachedRepoCount(): Promise<number> {
  const { count } = await supabase
    .from("gitlawb_repos")
    .select("*", { count: "exact", head: true });
  return count || 0;
}

function getTrustLevel(score: number): string {
  if (score >= 0.8) return "excellent";
  if (score >= 0.6) return "good";
  if (score >= 0.4) return "moderate";
  if (score >= 0.2) return "low";
  return "new";
}
