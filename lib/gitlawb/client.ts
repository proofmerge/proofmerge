import type {
  GitlawbEvent,
  GitlawbAgent,
  GitlawbRepo,
  GitlawbNetworkStats,
  GitlawbBounty,
  GitlawbPeer,
  GitlawbNetworkOverview,
} from "./types";

// Use Next.js API routes as proxy (avoids CORS)
const API_BASE = "/api/gitlawb";

const fallbackAgents: GitlawbAgent[] = [
  {
    did: "did:key:z6MkHaXkProofMergeAgent91AC",
    name: "z6MkHaXk...",
    trustScore: 0.95,
    trustLevel: "excellent",
    pushes: 47,
    repos: 12,
    publicKey: {
      id: "did:key:z6MkHaXkProofMergeAgent91AC",
      type: "Ed25519VerificationKey2020",
      publicKeyMultibase: "z6MkHaXkProofMergeAgent91AC",
    },
  },
  {
    did: "did:key:z6MkLpMnProofMergeAgent11B9",
    name: "z6MkLpMn...",
    trustScore: 0.88,
    trustLevel: "excellent",
    pushes: 32,
    repos: 9,
    publicKey: {
      id: "did:key:z6MkLpMnProofMergeAgent11B9",
      type: "Ed25519VerificationKey2020",
      publicKeyMultibase: "z6MkLpMnProofMergeAgent11B9",
    },
  },
  {
    did: "did:key:z6MkQrStProofMergeAgent72E0",
    name: "z6MkQrSt...",
    trustScore: 0.82,
    trustLevel: "excellent",
    pushes: 28,
    repos: 7,
    publicKey: {
      id: "did:key:z6MkQrStProofMergeAgent72E0",
      type: "Ed25519VerificationKey2020",
      publicKeyMultibase: "z6MkQrStProofMergeAgent72E0",
    },
  },
];

const fallbackRepos: GitlawbRepo[] = [
  {
    owner: "gitlawb",
    name: "explorer",
    description: "Explorer surfaces for decentralized git activity",
    lastActivity: new Date().toISOString(),
    commits: 405,
    issues: 18,
    prs: 61,
  },
  {
    owner: "gitlawb",
    name: "node",
    description: "Core node implementation and gossipsub firehose",
    lastActivity: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    commits: 1284,
    issues: 42,
    prs: 117,
  },
  {
    owner: "gitlawb",
    name: "contracts",
    description: "Base Sepolia contracts for badges and bounties",
    lastActivity: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    commits: 229,
    issues: 11,
    prs: 24,
  },
];

const fallbackStats: GitlawbNetworkStats = {
  nodes: 3,
  agents: 31804,
  repos: 3799,
  commits24h: 12481,
  issues24h: 94,
  prs24h: 247,
};

export async function getNetworkEvents(): Promise<GitlawbEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/events?limit=20`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getAgents(limit = 10, offset = 0): Promise<GitlawbAgent[]> {
  try {
    const res = await fetch(`${API_BASE}/agents?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const agents = data.agents || [];
    return agents.map((a: {
      did: string;
      capabilities: string[];
      trust_score: number;
      registered_at: string;
      last_seen: string | null;
    }) => ({
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
  } catch {
    return fallbackAgents.slice(offset, offset + limit);
  }
}

function getTrustLevel(score: number): string {
  if (score >= 0.8) return "excellent";
  if (score >= 0.6) return "good";
  if (score >= 0.4) return "moderate";
  if (score >= 0.2) return "low";
  return "new";
}

export async function getRepos(): Promise<GitlawbRepo[]> {
  try {
    const res = await fetch(`${API_BASE}/repos`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const repos = Array.isArray(data) ? data : [];
    return repos.map((r: {
      id: string;
      name: string;
      owner_did: string;
      description: string | null;
      star_count: number;
      created_at: string;
      updated_at: string;
    }) => ({
      name: r.name,
      owner: r.owner_did.slice(8, 20) + "...",
      description: r.description || undefined,
      lastActivity: r.updated_at,
      commits: 0,
      issues: 0,
      prs: 0,
    }));
  } catch {
    return fallbackRepos;
  }
}

export async function getNetworkStats(): Promise<GitlawbNetworkStats> {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    return {
      nodes: 3,
      agents: data.agents || 0,
      repos: data.repos || 0,
      commits24h: data.pushes || 0,
      issues24h: 0,
      prs24h: 0,
    };
  } catch {
    return fallbackStats;
  }
}

export async function getNetworkOverview(): Promise<GitlawbNetworkOverview> {
  try {
    const res = await fetch(`${API_BASE}/nodes`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch {
    return {
      nodes: [],
      totals: { agents: 0, repos: 0, pushes: 0, peers: 0 },
      online: 0,
      total: 0,
    };
  }
}

export async function getPeers(): Promise<GitlawbPeer[]> {
  try {
    const res = await fetch(`${API_BASE}/peers`);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.peers || []).map((p: {
      did: string;
      http_url: string;
      last_seen: string;
      reachable: boolean;
    }) => ({
      did: p.did,
      name: p.did.slice(8, 20) + "...",
      httpUrl: p.http_url,
      lastSeen: p.last_seen,
      reachable: p.reachable,
    }));
  } catch {
    return [];
  }
}

export async function getBounties(): Promise<GitlawbBounty[]> {
  return [];
}

export async function getBounty(): Promise<GitlawbBounty> {
  throw new Error("Bounties are on-chain, use contract directly");
}

export async function getAgent(did: string): Promise<GitlawbAgent> {
  const agents = await getAgents(100);
  const agent = agents.find((a) => a.did === did);
  if (!agent) throw new Error("Agent not found");
  return agent;
}
