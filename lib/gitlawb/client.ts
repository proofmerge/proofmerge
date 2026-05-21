import type {
  GitlawbEvent,
  GitlawbAgent,
  GitlawbRepo,
  GitlawbNetworkStats,
  GitlawbBounty,
} from "./types";

// Use gitlawbounty.xyz as proxy since direct gitlawb API requires node access
const GITLAWB_API_URL = "https://gitlawbounty.xyz/api";

async function fetchJson<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${GITLAWB_API_URL}${endpoint}`, {
    next: { revalidate: 30 }, // refresh every 30 seconds
  });

  if (!res.ok) {
    throw new Error(`gitlawb API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getNetworkEvents(): Promise<GitlawbEvent[]> {
  // Events endpoint returns empty from gitlawbounty.xyz
  // Return mock events for now - real events require direct node access
  return [];
}

export async function getAgents(limit = 10, offset = 0): Promise<GitlawbAgent[]> {
  const data = await fetchJson<{
    agents: Array<{
      did: string;
      fullDid: string;
      capabilities: string[];
      trustScore: number;
      registeredAt: string;
      lastSeen: string | null;
      profileUrl: string;
    }>;
    count: number;
    totalCount: number;
  }>(`/network-agents?limit=${limit}&offset=${offset}`);

  return (data.agents || []).map((a) => ({
    did: a.fullDid,
    name: a.did.slice(0, 12) + "...",
    trustScore: a.trustScore,
    trustLevel: getTrustLevel(a.trustScore),
    pushes: 0,
    repos: 0,
    publicKey: {
      id: a.fullDid,
      type: "Ed25519VerificationKey2020",
      publicKeyMultibase: a.did,
    },
  }));
}

function getTrustLevel(score: number): string {
  if (score >= 0.8) return "excellent";
  if (score >= 0.6) return "good";
  if (score >= 0.4) return "moderate";
  if (score >= 0.2) return "low";
  return "new";
}

export async function getRepos(): Promise<GitlawbRepo[]> {
  const data = await fetchJson<
    Array<{
      owner: string;
      name: string;
      url: string;
      description: string | null;
      starCount: number;
      updatedAt: string;
      updatedAgo: string;
      bountyCount: number;
      totalReward: number;
    }>
  >("/repos");

  return data.map((r) => ({
    name: r.name,
    owner: r.owner,
    description: r.description || undefined,
    lastActivity: r.updatedAt,
    commits: 0,
    issues: 0,
    prs: 0,
  }));
}

export async function getNetworkStats(): Promise<GitlawbNetworkStats> {
  const data = await fetchJson<{
    totalRepos: number;
    totalAgents: number;
    totalBounties: number;
    bountiesByStatus: Record<string, number>;
    totalReward: number;
  }>("/network-stats");

  return {
    nodes: 3, // gitlawb has 3 known nodes
    agents: data.totalAgents || 0,
    repos: data.totalRepos || 0,
    commits24h: 0, // not available from this endpoint
    issues24h: 0,
    prs24h: 0,
  };
}

export async function getBounties(): Promise<GitlawbBounty[]> {
  const data = await fetchJson<{
    bounties: Array<{
      id: number;
      repo: string;
      issueId: string;
      title: string;
      body: string;
      amount: string;
      token: string;
      status: string;
      creator: string;
      claimer?: string;
      createdAt: string;
    }>;
  }>("/bounties");

  return (data.bounties || []).map((b) => ({
    ...b,
    status: b.status as GitlawbBounty["status"],
    chainId: 84532,
    contractAddress: "0x8fc59d42b56fc153bcb9f871aae8e32bcf530789",
  }));
}

export async function getBounty(id: number): Promise<GitlawbBounty> {
  const data = await fetchJson<{
    bounty: {
      id: number;
      repo: string;
      issueId: string;
      title: string;
      body: string;
      amount: string;
      token: string;
      status: string;
      creator: string;
      claimer?: string;
      createdAt: string;
    };
  }>(`/bounty/${id}`);

  return {
    ...data.bounty,
    status: data.bounty.status as GitlawbBounty["status"],
    chainId: 84532,
    contractAddress: "0x8fc59d42b56fc153bcb9f871aae8e32bcf530789",
  };
}

export async function getAgent(did: string): Promise<GitlawbAgent> {
  return fetchJson<GitlawbAgent>(`/agent/${encodeURIComponent(did)}`);
}
