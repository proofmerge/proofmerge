import type {
  GitlawbEvent,
  GitlawbAgent,
  GitlawbRepo,
  GitlawbNetworkStats,
  GitlawbBounty,
} from "./types";

// Direct gitlawb node API
const GITLAWB_API_URL = "https://node.gitlawb.com/api/v1";

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

async function fetchJson<T>(endpoint: string): Promise<T> {
  const signal = AbortSignal.timeout(5000);
  const res = await fetch(`${GITLAWB_API_URL}${endpoint}`, {
    next: { revalidate: 30 },
    signal,
  });

  if (!res.ok) {
    throw new Error(`gitlawb API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getNetworkEvents(): Promise<GitlawbEvent[]> {
  // Events require GraphQL subscriptions (not available via REST)
  return [];
}

export async function getAgents(limit = 10, offset = 0): Promise<GitlawbAgent[]> {
  try {
    const data = await fetchJson<{
      agents: Array<{
        did: string;
        capabilities: string[];
        trust_score: number;
        registered_at: string;
        last_seen: string | null;
      }>;
    }>(`/agents?limit=${limit}&offset=${offset}`);

    return (data.agents || []).map((a) => ({
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
    const data = await fetchJson<
      Array<{
        id: string;
        name: string;
        owner_did: string;
        description: string | null;
        star_count: number;
        created_at: string;
        updated_at: string;
      }>
    >("/repos");

    return data.map((r) => ({
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
    const data = await fetchJson<{
      agents: number;
      repos: number;
      pushes: number;
      version: string;
    }>("/stats");

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

export async function getBounties(): Promise<GitlawbBounty[]> {
  // Bounties are on-chain only
  return [];
}

export async function getBounty(): Promise<GitlawbBounty> {
  throw new Error("Bounties are on-chain, use contract directly");
}

export async function getAgent(did: string): Promise<GitlawbAgent> {
  const data = await fetchJson<{
    agents: Array<{
      did: string;
      capabilities: string[];
      trust_score: number;
      registered_at: string;
      last_seen: string | null;
    }>;
  }>(`/agents?limit=100`);

  const agent = data.agents.find((a) => a.did === did);
  if (!agent) throw new Error("Agent not found");

  return {
    did: agent.did,
    name: agent.did.slice(8, 20) + "...",
    trustScore: agent.trust_score,
    trustLevel: getTrustLevel(agent.trust_score),
    pushes: 0,
    repos: 0,
    publicKey: {
      id: agent.did,
      type: "Ed25519VerificationKey2020",
      publicKeyMultibase: agent.did.replace("did:key:", ""),
    },
  };
}
