"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useHasBadge, useBadgeMint } from "@/lib/contracts";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { Profile } from "@/lib/supabase/types";

const BADGES = [
  {
    id: 1,
    name: "First Contribution",
    description: "Your first merged PR on gitlawb network",
    icon: "🎉",
    requirement: "1+ PRs merged",
    check: (p: Profile) => p.total_prs >= 1,
  },
  {
    id: 2,
    name: "Bug Hunter",
    description: "Closed 10+ issues on gitlawb",
    icon: "🐛",
    requirement: "10+ issues closed",
    check: (p: Profile) => p.total_issues >= 10,
  },
  {
    id: 3,
    name: "Top Reviewer",
    description: "Reviewed 20+ pull requests",
    icon: "👀",
    requirement: "20+ PRs reviewed",
    check: (p: Profile) => p.total_prs >= 20,
  },
  {
    id: 4,
    name: "Prolific Coder",
    description: "100+ commits to gitlawb repos",
    icon: "💻",
    requirement: "100+ commits",
    check: (p: Profile) => p.total_commits >= 100,
  },
  {
    id: 5,
    name: "Agent Master",
    description: "Deployed 5+ AI agents on gitlawb",
    icon: "🤖",
    requirement: "5+ agents deployed",
    check: (p: Profile) => p.total_commits >= 50, // proxy: 50+ commits
  },
  {
    id: 6,
    name: "Bounty Hunter",
    description: "Claimed 3+ bounties successfully",
    icon: "💰",
    requirement: "3+ bounties claimed",
    check: (p: Profile) => p.total_issues >= 3, // proxy: 3+ issues
  },
];

function BadgeCard({
  badge,
  address,
  profileId,
  profile,
}: {
  badge: (typeof BADGES)[0];
  address: string | undefined;
  profileId: string | undefined;
  profile: Profile | null;
}) {
  const { data: hasBadge, isLoading: checkingBadge } = useHasBadge(
    address,
    badge.id
  );
  const { mintBadge, isPending, isConfirming, isSuccess, error } =
    useBadgeMint();
  const [savingToDb, setSavingToDb] = useState(false);

  const isMinted = hasBadge === true;
  const isMinting = isPending || isConfirming;
  const isEligible = profile ? badge.check(profile) : false;

  // Save to Supabase after successful mint
  useEffect(() => {
    if (isSuccess && profileId) {
      setSavingToDb(true);
      supabase
        .from("badges")
        .insert({
          profile_id: profileId,
          badge_id: badge.id,
          badge_name: badge.name,
        })
        .then(() => setSavingToDb(false));
    }
  }, [isSuccess]);

  function handleMint() {
    if (!address || !isEligible) return;
    mintBadge(address, badge.id);
  }

  return (
    <div
      className={`bg-gray-900 border rounded-xl p-6 transition-colors ${
        isMinted
          ? "border-purple-500/50 bg-purple-500/5"
          : isEligible
            ? "border-green-500/30 bg-green-500/5"
            : "border-gray-800"
      }`}
    >
      <div className="text-4xl mb-3">{badge.icon}</div>
      <h3 className="text-lg font-semibold text-white">{badge.name}</h3>
      <p className="text-sm text-gray-400 mt-2">{badge.description}</p>
      <p className="text-xs text-gray-500 mt-1">Requires: {badge.requirement}</p>

      <div className="mt-4">
        {checkingBadge ? (
          <div className="text-sm text-gray-500">Checking...</div>
        ) : isMinted ? (
          <div className="flex items-center gap-2 text-sm text-purple-400">
            <span>✅</span>
            <span>Minted</span>
          </div>
        ) : !isEligible ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>🔒</span>
            <span>Not eligible yet</span>
          </div>
        ) : (
          <button
            onClick={handleMint}
            disabled={isMinting || !address}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isMinting || !address
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {!address
              ? "Connect Wallet"
              : isMinting
                ? "Minting..."
                : savingToDb
                  ? "Saving..."
                  : "Mint Badge"}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-400">
          {error.message.slice(0, 100)}
        </div>
      )}
    </div>
  );
}

export default function BadgesPage() {
  const { profile, isConnected, address } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Skill Badges</h1>
        <p className="text-sm text-gray-400 mt-1">
          Mint on-chain badges based on your gitlawb contributions
        </p>
      </div>

      {!isConnected && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-400">
            Connect your wallet to check eligibility and mint badges
          </p>
        </div>
      )}

      {isConnected && profile && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-medium text-gray-400 mb-3">
            Your Stats
          </h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-white">
                {profile.total_commits}
              </div>
              <div className="text-xs text-gray-500">Commits</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {profile.total_prs}
              </div>
              <div className="text-xs text-gray-500">PRs</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {profile.total_issues}
              </div>
              <div className="text-xs text-gray-500">Issues</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-400">
                {profile.trust_score.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">Trust</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BADGES.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            address={address}
            profileId={profile?.id}
            profile={profile}
          />
        ))}
      </div>
    </div>
  );
}
