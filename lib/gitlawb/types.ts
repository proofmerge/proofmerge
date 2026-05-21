export interface GitlawbEvent {
  type: "ref-update" | "issue" | "pr" | "agent-action";
  repo: string;
  ref?: string;
  from?: string;
  to?: string;
  author: {
    did: string;
    name?: string;
  };
  timestamp: string;
  seq: number;
  message?: string;
  signatures?: string[];
}

export interface GitlawbAgent {
  did: string;
  name: string;
  trustScore: number;
  trustLevel: string;
  pushes: number;
  repos: number;
  publicKey: {
    id: string;
    type: string;
    publicKeyMultibase: string;
  };
}

export interface GitlawbRepo {
  name: string;
  owner: string;
  description?: string;
  lastActivity: string;
  commits: number;
  issues: number;
  prs: number;
}

export interface GitlawbNetworkStats {
  nodes: number;
  agents: number;
  repos: number;
  commits24h: number;
  issues24h: number;
  prs24h: number;
}

export interface GitlawbNodeInfo {
  name: string;
  location: string;
  flag: string;
  online: boolean;
  version: string;
  agents: number;
  repos: number;
  pushes: number;
  peers: number;
}

export interface GitlawbNetworkOverview {
  nodes: GitlawbNodeInfo[];
  totals: { agents: number; repos: number; pushes: number; peers: number };
  online: number;
  total: number;
}

export interface GitlawbPeer {
  did: string;
  name: string;
  httpUrl: string;
  lastSeen: string;
  reachable: boolean;
}

export interface GitlawbBounty {
  id: number;
  repo: string;
  issueId: string;
  title: string;
  body: string;
  amount: string;
  token: string;
  status: "open" | "claimed" | "completed" | "expired";
  creator: string;
  claimer?: string;
  createdAt: string;
  chainId: number;
  contractAddress: string;
}
