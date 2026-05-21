"use client";

import { useEffect, useState } from "react";
import { useRealtimeStats } from "@/lib/hooks/useRealtime";
import { getNetworkStats, getRepos, getAgents } from "@/lib/gitlawb/client";
import type { GitlawbRepo, GitlawbAgent, GitlawbNetworkStats } from "@/lib/gitlawb/types";

export default function StatsPage() {
  const realtimeStats = useRealtimeStats();
  const [networkStats, setNetworkStats] = useState<GitlawbNetworkStats | null>(null);
  const [repos, setRepos] = useState<GitlawbRepo[]>([]);
  const [agents, setAgents] = useState<GitlawbAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
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
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Network Stats</h1>
        <p className="text-sm text-gray-400 mt-1">
          gitlawb network health and activity
        </p>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Agents"
          value={networkStats?.agents || 0}
          icon="🤖"
        />
        <StatsCard
          label="Repos"
          value={networkStats?.repos || 0}
          icon="📁"
        />
        <StatsCard
          label="Nodes"
          value={networkStats?.nodes || 0}
          icon="🖥️"
        />
        <StatsCard
          label="Bounties"
          value={realtimeStats.bounties}
          icon="💰"
        />
      </div>

      {/* Proof Merge Stats */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Proof Merge Activity
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {realtimeStats.profiles}
            </div>
            <div className="text-sm text-gray-400">Profiles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {realtimeStats.badges}
            </div>
            <div className="text-sm text-gray-400">Badges Minted</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {realtimeStats.bounties}
            </div>
            <div className="text-sm text-gray-400">Bounties Created</div>
          </div>
        </div>
      </div>

      {/* Top Repos */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Trending Repos
        </h2>
        {repos.length > 0 ? (
          <div className="space-y-3">
            {repos.map((repo, i) => (
              <div
                key={`${repo.owner}-${repo.name}`}
                className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-6">{i + 1}</span>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {repo.owner.slice(0, 12)}.../{repo.name}
                    </div>
                    {repo.description && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {repo.description.slice(0, 60)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {repo.lastActivity
                    ? new Date(repo.lastActivity).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No repos data available</p>
        )}
      </div>

      {/* Top Agents */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Top Contributors
        </h2>
        {agents.length > 0 ? (
          <div className="space-y-3">
            {agents.map((agent, i) => (
              <div
                key={agent.did}
                className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-6">{i + 1}</span>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {agent.name}
                    </div>
                    <div className="text-xs text-gray-400">{agent.did.slice(0, 30)}...</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(agent.trustScore * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {agent.trustScore.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No agents data available</p>
        )}
      </div>
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}
