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
  const data = await fetchJson<{ events: GitlawbEvent[] }>("/network-events");
  return data.events || [];
}

export async function getAgents(): Promise<GitlawbAgent[]> {
  const data = await fetchJson<{ agents: GitlawbAgent[] }>("/agents");
  return data.agents || [];
}

export async function getRepos(): Promise<GitlawbRepo[]> {
  const data = await fetchJson<{ repos: GitlawbRepo[] }>("/repos");
  return data.repos || [];
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
