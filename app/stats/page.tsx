"use client";

import { useCallback, useEffect, useState } from "react";
import { useRealtimeStats } from "@/lib/hooks/useRealtime";
import { getAgents, getNetworkStats, getRepos, getPeers, getNetworkOverview } from "@/lib/gitlawb/client";
import { getCachedAgents, getCachedRepos, getCachedStats } from "@/lib/supabase/gitlawb-cache";
import type {
  GitlawbAgent,
  GitlawbNetworkStats,
  GitlawbNetworkOverview,
  GitlawbPeer,
  GitlawbRepo,
} from "@/lib/gitlawb/types";

export default function StatsPage() {
  const realtimeStats = useRealtimeStats();
  const [networkStats, setNetworkStats] = useState<GitlawbNetworkStats | null>(null);
  const [repos, setRepos] = useState<GitlawbRepo[]>([]);
  const [agents, setAgents] = useState<GitlawbAgent[]>([]);
  const [peers, setPeers] = useState<GitlawbPeer[]>([]);
  const [overview, setOverview] = useState<GitlawbNetworkOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      // Try cached data first (fast), fallback to live API
      const [cachedStats, cachedRepos, cachedAgents] = await Promise.all([
        getCachedStats(),
        getCachedRepos(10),
        getCachedAgents(10),
      ]);

      const hasCachedData = cachedStats.agents > 0;

      if (hasCachedData) {
        setNetworkStats(cachedStats);
        setRepos(cachedRepos);
        setAgents(cachedAgents);
      } else {
        // Fallback to live API if no cached data
        const [stats, reposData, agentsData] = await Promise.all([
          getNetworkStats(),
          getRepos(),
          getAgents(10),
        ]);
        setNetworkStats(stats);
        setRepos(reposData.slice(0, 10));
        setAgents(agentsData.slice(0, 10));
      }

      // Peers and overview always from live API (small response)
      const [peersData, overviewData] = await Promise.all([
        getPeers(),
        getNetworkOverview(),
      ]);
      setPeers(peersData);
      setOverview(overviewData);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void fetchStats());
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="font-mono text-sm text-green-400 animate-pulse">
          [ loading stats... ]
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-green-500/20 bg-black p-4">
        <p className="font-mono text-xs uppercase tracking-wide text-green-400">
          [ network stats ]
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          Network Stats
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          gitlawb network health, trending repos, and top contributors.
        </p>
      </section>

      <section className="grid gap-px overflow-hidden rounded-lg border border-green-500/20 bg-green-500/20 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard label="Agents" value={networkStats?.agents || 0} code="AI" />
        <StatsCard label="Repos" value={networkStats?.repos || 0} code="RP" />
        <StatsCard label="Pushes" value={networkStats?.commits24h || 0} code="PS" />
        <StatsCard label="Peers" value={peers.length} code="PN" />
        <StatsCard label="Bounties" value={realtimeStats.bounties} code="BO" />
      </section>

      {overview && overview.nodes.length > 0 && (
        <Panel title="Network Nodes">
          <div className="divide-y divide-green-500/10">
            {overview.nodes.map((node) => (
              <div
                key={node.name}
                className="grid gap-3 py-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{node.flag}</span>
                    <p className="font-medium text-white">{node.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                        node.online
                          ? "bg-green-500/10 text-green-300"
                          : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {node.online ? "online" : "offline"}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 font-mono text-xs text-zinc-500">
                    <span>agents: <span className="text-zinc-300">{node.agents.toLocaleString()}</span></span>
                    <span>repos: <span className="text-zinc-300">{node.repos.toLocaleString()}</span></span>
                    <span>pushes: <span className="text-zinc-300">{node.pushes.toLocaleString()}</span></span>
                    <span>peers: <span className="text-zinc-300">{node.peers}</span></span>
                    <span>v{node.version}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-zinc-600">{node.location}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 rounded-md border border-green-500/10 bg-zinc-950 p-3 font-mono text-xs text-zinc-500">
            <span>{overview.online}/{overview.total} nodes online</span>
            <span>cluster repos: <span className="text-green-300">{overview.totals.repos.toLocaleString()}</span></span>
            <span>total pushes: <span className="text-green-300">{overview.totals.pushes.toLocaleString()}</span></span>
          </div>
        </Panel>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <Panel title="Proof Merge Activity">
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-green-500/10 bg-green-500/10">
            <MiniStat label="Profiles" value={realtimeStats.profiles} />
            <MiniStat label="Badges" value={realtimeStats.badges} />
            <MiniStat label="Bounties" value={realtimeStats.bounties} />
          </div>
        </Panel>

        <Panel title="Trending Repos" wide>
          {repos.length > 0 ? (
            <div className="divide-y divide-green-500/10">
              {repos.map((repo, i) => (
                <div
                  key={`${repo.owner}-${repo.name}`}
                  className="grid gap-3 py-3 text-sm sm:grid-cols-[36px_1fr_auto] sm:items-center"
                >
                  <span className="font-mono text-xs text-zinc-700">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {repo.owner.slice(0, 12)}.../{repo.name}
                    </p>
                    {repo.description && (
                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-xs text-zinc-600">
                    {repo.lastActivity
                      ? new Date(repo.lastActivity).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No repos data available</p>
          )}
        </Panel>
      </section>

      <Panel title="Network Peers">
        {peers.length > 0 ? (
          <div className="divide-y divide-green-500/10">
            {peers.map((peer) => (
              <div
                key={peer.did}
                className="grid gap-3 py-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{peer.name}</p>
                  <p className="mt-1 truncate font-mono text-xs text-zinc-600">
                    {peer.httpUrl}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-2 py-1 font-mono text-xs ${
                    peer.reachable
                      ? "bg-green-500/10 text-green-300"
                      : "bg-red-500/10 text-red-300"
                  }`}
                >
                  {peer.reachable ? "online" : "offline"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No peers data available</p>
        )}
      </Panel>

      <Panel title="Top Contributors">
        {agents.length > 0 ? (
          <div className="divide-y divide-green-500/10">
            {agents.map((agent, i) => (
              <div
                key={agent.did}
                className="grid gap-3 py-3 text-sm sm:grid-cols-[36px_1fr_130px] sm:items-center"
              >
                <span className="font-mono text-xs text-zinc-700">#{i + 1}</span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{agent.name}</p>
                  <p className="mt-1 truncate font-mono text-xs text-zinc-600">
                    {agent.did}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-zinc-900">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${Math.min(agent.trustScore * 100, 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-green-300">
                    {agent.trustScore.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No agents data available</p>
        )}
      </Panel>
    </div>
  );
}

function StatsCard({
  label,
  value,
  code,
}: {
  label: string;
  value: number;
  code: string;
}) {
  return (
    <div className="bg-black p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">{label}</span>
        <span className="rounded border border-green-500/20 px-1.5 py-0.5 font-mono text-[10px] text-green-400">
          {code}
        </span>
      </div>
      <div className="mt-3 font-mono text-2xl font-semibold text-green-300">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-black p-4 text-center">
      <div className="font-mono text-2xl font-semibold text-green-300">
        {value.toLocaleString()}
      </div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function Panel({
  title,
  children,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section
      className={`rounded-lg border border-green-500/20 bg-black p-4 ${
        wide ? "lg:col-span-2" : ""
      }`}
    >
      <h2 className="mb-3 font-mono text-sm font-semibold text-green-300">
        {title}
      </h2>
      {children}
    </section>
  );
}
