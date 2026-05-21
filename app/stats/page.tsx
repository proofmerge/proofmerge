"use client";

import { useCallback, useEffect, useState } from "react";
import { useRealtimeStats } from "@/lib/hooks/useRealtime";
import { getAgents, getNetworkStats, getRepos } from "@/lib/gitlawb/client";
import type {
  GitlawbAgent,
  GitlawbNetworkStats,
  GitlawbRepo,
} from "@/lib/gitlawb/types";

export default function StatsPage() {
  const realtimeStats = useRealtimeStats();
  const [networkStats, setNetworkStats] = useState<GitlawbNetworkStats | null>(null);
  const [repos, setRepos] = useState<GitlawbRepo[]>([]);
  const [agents, setAgents] = useState<GitlawbAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [stats, reposData, agentsData] = await Promise.all([
        getNetworkStats(),
        getRepos(),
        getAgents(10),
      ]);
      setNetworkStats(stats);
      setRepos(reposData.slice(0, 10));
      setAgents(agentsData.slice(0, 10));
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

      <section className="grid gap-px overflow-hidden rounded-lg border border-green-500/20 bg-green-500/20 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Agents" value={networkStats?.agents || 0} code="AI" />
        <StatsCard label="Repos" value={networkStats?.repos || 0} code="RP" />
        <StatsCard label="Pushes" value={networkStats?.commits24h || 0} code="PS" />
        <StatsCard label="Bounties" value={realtimeStats.bounties} code="BO" />
      </section>

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
