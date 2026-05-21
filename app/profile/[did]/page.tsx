"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useHasBadge } from "@/lib/contracts";
import type { Profile, Badge, Bounty, GitlawbAgent } from "@/lib/supabase/types";

const BADGE_NAMES: Record<number, { name: string; icon: string }> = {
  1: { name: "First Contribution", icon: "🎉" },
  2: { name: "Bug Hunter", icon: "🐛" },
  3: { name: "Top Reviewer", icon: "👀" },
  4: { name: "Prolific Coder", icon: "💻" },
  5: { name: "Agent Master", icon: "🤖" },
  6: { name: "Bounty Hunter", icon: "💰" },
};

function extractAddress(did: string): string | null {
  if (did.startsWith("did:ethr:")) {
    return did.replace("did:ethr:", "");
  }
  return null;
}

export default function ProfilePage() {
  const params = useParams();
  const did = decodeURIComponent(params.did as string);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [agent, setAgent] = useState<GitlawbAgent | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const walletAddress = extractAddress(did);

  const fetchProfile = useCallback(async () => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("did", did)
        .single();

      if (profileData) {
        setProfile(profileData);

        const [badgesRes, bountiesRes] = await Promise.all([
          supabase
            .from("badges")
            .select("*")
            .eq("profile_id", profileData.id),
          supabase
            .from("bounties")
            .select("*")
            .or(
              `creator_id.eq.${profileData.id},claimer_id.eq.${profileData.id}`
            ),
        ]);

        setBadges(badgesRes.data || []);
        setBounties(bountiesRes.data || []);
        return;
      }

      const didWithoutPrefix = did.replace(/^did:key:/, "");
      const didCandidates = Array.from(new Set([did, didWithoutPrefix]));
      const { data: agentData } = await supabase
        .from("gitlawb_agents")
        .select("*")
        .in("did", didCandidates)
        .maybeSingle();

      if (agentData) {
        setAgent(agentData);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, [did]);

  useEffect(() => {
    queueMicrotask(() => void fetchProfile());
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (!profile && !agent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Profile not found</div>
      </div>
    );
  }

  if (agent && !profile) {
    const displayDid = agent.did.startsWith("did:key:")
      ? agent.did
      : `did:key:${agent.did}`;

    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <section className="rounded-lg border border-green-500/20 bg-black p-5 shadow-[0_0_32px_rgba(34,197,94,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-wide text-green-400">
                [ gitlawb agent profile ]
              </p>
              <h1 className="mt-2 truncate text-2xl font-semibold text-white">
                {trimDid(displayDid)}
              </h1>
              <p className="mt-2 break-all font-mono text-xs text-zinc-500">
                {displayDid}
              </p>
            </div>
            <span className="w-fit rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 font-mono text-xs text-green-300">
              synced agent
            </span>
          </div>

          <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-green-500/20 bg-green-500/20 sm:grid-cols-4">
            <AgentStat label="Trust" value={Number(agent.trust_score || 0).toFixed(2)} />
            <AgentStat label="Capabilities" value={(agent.capabilities || []).length.toString()} />
            <AgentStat label="Last Seen" value={agent.last_seen ? timeAgo(agent.last_seen) : "unknown"} />
            <AgentStat label="Synced" value={timeAgo(agent.synced_at)} />
          </div>
        </section>

        <section className="rounded-lg border border-green-500/20 bg-black p-5">
          <h2 className="font-mono text-sm font-semibold text-green-300">
            Capabilities
          </h2>
          {agent.capabilities && agent.capabilities.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {agent.capabilities.map((capability) => (
                <span
                  key={capability}
                  className="rounded-md border border-green-500/20 bg-green-500/10 px-2 py-1 font-mono text-xs text-green-300"
                >
                  {capability}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              No capabilities published for this agent yet.
            </p>
          )}
        </section>
      </div>
    );
  }

  const activeProfile = profile;
  if (!activeProfile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-2xl">
            {activeProfile.display_name?.[0] || "?"}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              {activeProfile.display_name || "Anonymous"}
            </h1>
            <p className="text-sm text-gray-400 font-mono mt-1">{did}</p>
            {activeProfile.bio && (
              <p className="text-gray-300 mt-2">{activeProfile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {activeProfile.total_commits}
            </div>
            <div className="text-xs text-gray-400">Commits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {activeProfile.total_prs}
            </div>
            <div className="text-xs text-gray-400">PRs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {activeProfile.total_issues}
            </div>
            <div className="text-xs text-gray-400">Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {activeProfile.trust_score.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">Trust Score</div>
          </div>
        </div>
      </div>

      {/* On-Chain Badges */}
      {walletAddress && (
        <OnChainBadgesSection address={walletAddress} />
      )}

      {/* Off-Chain Badges */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Badges ({badges.length})
        </h2>
        {badges.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center"
              >
                <div className="text-2xl mb-1">🏅</div>
                <div className="text-sm font-medium text-white">
                  {badge.badge_name}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Minted {new Date(badge.minted_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No badges minted yet</p>
        )}
      </div>

      {/* Bounties */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Bounties ({bounties.length})
        </h2>
        {bounties.length > 0 ? (
          <div className="space-y-3">
            {bounties.map((bounty) => (
              <div
                key={bounty.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">
                      {bounty.title}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {bounty.repo} • {bounty.amount} {bounty.token}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      bounty.status === "open"
                        ? "bg-green-500/20 text-green-400"
                        : bounty.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {bounty.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No bounties yet</p>
        )}
      </div>
    </div>
  );
}

function AgentStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-2 font-mono text-lg font-semibold text-green-300">
        {value}
      </p>
    </div>
  );
}

function trimDid(did: string) {
  return `${did.slice(0, 18)}...${did.slice(-6)}`;
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${Math.max(seconds, 0)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function OnChainBadgesSection({ address }: { address: string }) {
  // Check each badge
  const { data: has1 } = useHasBadge(address, 1);
  const { data: has2 } = useHasBadge(address, 2);
  const { data: has3 } = useHasBadge(address, 3);
  const { data: has4 } = useHasBadge(address, 4);
  const { data: has5 } = useHasBadge(address, 5);
  const { data: has6 } = useHasBadge(address, 6);

  const onChainBadges = useMemo(() => {
    const badges = [];
    if (has1) badges.push({ id: 1, ...BADGE_NAMES[1] });
    if (has2) badges.push({ id: 2, ...BADGE_NAMES[2] });
    if (has3) badges.push({ id: 3, ...BADGE_NAMES[3] });
    if (has4) badges.push({ id: 4, ...BADGE_NAMES[4] });
    if (has5) badges.push({ id: 5, ...BADGE_NAMES[5] });
    if (has6) badges.push({ id: 6, ...BADGE_NAMES[6] });
    return badges;
  }, [has1, has2, has3, has4, has5, has6]);

  if (onChainBadges.length === 0) return null;

  return (
    <div className="bg-gray-900 border border-green-500/30 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">
        On-Chain Badges ({onChainBadges.length})
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {onChainBadges.map((badge) => (
          <div
            key={badge.id}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center"
          >
            <div className="text-2xl mb-1">{badge.icon}</div>
            <div className="text-sm font-medium text-white">{badge.name}</div>
            <div className="text-xs text-green-400 mt-1">Verified on-chain</div>
          </div>
        ))}
      </div>
    </div>
  );
}
