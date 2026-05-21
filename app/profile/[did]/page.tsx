"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabase/client";
import { useHasBadge } from "@/lib/contracts";
import type { Profile, Badge, Bounty } from "@/lib/supabase/types";

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
  const [badges, setBadges] = useState<Badge[]>([]);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const walletAddress = extractAddress(did);

  useEffect(() => {
    fetchProfile();
  }, [did]);

  async function fetchProfile() {
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
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
            {profile.display_name?.[0] || "?"}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              {profile.display_name || "Anonymous"}
            </h1>
            <p className="text-sm text-gray-400 font-mono mt-1">{did}</p>
            {profile.bio && (
              <p className="text-gray-300 mt-2">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {profile.total_commits}
            </div>
            <div className="text-xs text-gray-400">Commits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {profile.total_prs}
            </div>
            <div className="text-xs text-gray-400">PRs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {profile.total_issues}
            </div>
            <div className="text-xs text-gray-400">Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {profile.trust_score.toFixed(2)}
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
                          ? "bg-blue-500/20 text-blue-400"
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

function OnChainBadgesSection({ address }: { address: string }) {
  const [onChainBadges, setOnChainBadges] = useState<
    { id: number; name: string; icon: string }[]
  >([]);

  // Check each badge
  const { data: has1 } = useHasBadge(address, 1);
  const { data: has2 } = useHasBadge(address, 2);
  const { data: has3 } = useHasBadge(address, 3);
  const { data: has4 } = useHasBadge(address, 4);
  const { data: has5 } = useHasBadge(address, 5);
  const { data: has6 } = useHasBadge(address, 6);

  useEffect(() => {
    const badges = [];
    if (has1) badges.push({ id: 1, ...BADGE_NAMES[1] });
    if (has2) badges.push({ id: 2, ...BADGE_NAMES[2] });
    if (has3) badges.push({ id: 3, ...BADGE_NAMES[3] });
    if (has4) badges.push({ id: 4, ...BADGE_NAMES[4] });
    if (has5) badges.push({ id: 5, ...BADGE_NAMES[5] });
    if (has6) badges.push({ id: 6, ...BADGE_NAMES[6] });
    setOnChainBadges(badges);
  }, [has1, has2, has3, has4, has5, has6]);

  if (onChainBadges.length === 0) return null;

  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">
        On-Chain Badges ({onChainBadges.length})
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {onChainBadges.map((badge) => (
          <div
            key={badge.id}
            className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center"
          >
            <div className="text-2xl mb-1">{badge.icon}</div>
            <div className="text-sm font-medium text-white">{badge.name}</div>
            <div className="text-xs text-purple-400 mt-1">Verified on-chain</div>
          </div>
        ))}
      </div>
    </div>
  );
}
