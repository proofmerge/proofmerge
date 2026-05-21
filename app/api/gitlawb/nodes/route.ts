import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NODES = [
  { name: "node.gitlawb.com", url: "https://node.gitlawb.com/api/v1", location: "US", flag: "\u{1F1FA}\u{1F1F8}" },
  { name: "node2.gitlawb.com", url: "https://node2.gitlawb.com/api/v1", location: "US", flag: "\u{1F1FA}\u{1F1F8}" },
  { name: "node3.gitlawb.com", url: "https://node3.gitlawb.com/api/v1", location: "Japan", flag: "\u{1F1EF}\u{1F1F5}" },
];

async function fetchNodeStats(node: (typeof NODES)[number]) {
  try {
    const [statsRes, peersRes] = await Promise.all([
      fetch(`${node.url}/stats`, { headers: { Accept: "application/json" } }),
      fetch(`${node.url}/peers`, { headers: { Accept: "application/json" } }),
    ]);

    const stats = statsRes.ok ? await statsRes.json() : null;
    const peers = peersRes.ok ? await peersRes.json() : null;

    return {
      name: node.name,
      location: node.location,
      flag: node.flag,
      online: statsRes.ok,
      version: stats?.version || "unknown",
      agents: stats?.agents || 0,
      repos: stats?.repos || 0,
      pushes: stats?.pushes || 0,
      peers: peers?.count || 0,
    };
  } catch {
    return {
      name: node.name,
      location: node.location,
      flag: node.flag,
      online: false,
      version: "unknown",
      agents: 0,
      repos: 0,
      pushes: 0,
      peers: 0,
    };
  }
}

export async function GET() {
  try {
    const nodes = await Promise.all(NODES.map(fetchNodeStats));

    const totals = nodes.reduce(
      (acc, n) => ({
        agents: Math.max(acc.agents, n.agents),
        repos: acc.repos + n.repos,
        pushes: acc.pushes + n.pushes,
        peers: Math.max(acc.peers, n.peers),
      }),
      { agents: 0, repos: 0, pushes: 0, peers: 0 }
    );

    return NextResponse.json({
      nodes,
      totals,
      online: nodes.filter((n) => n.online).length,
      total: nodes.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch node data" },
      { status: 502 }
    );
  }
}
