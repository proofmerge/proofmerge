"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useHasBadge, useBadgeMint } from "@/lib/contracts";
import { supabase } from "@/lib/supabase/client";

const BADGES = [
  {
    id: 1,
    name: "First Contribution",
    description: "Your first merged PR on gitlawb network",
    icon: "🎉",
  },
  {
    id: 2,
    name: "Bug Hunter",
    description: "Closed 10+ issues on gitlawb",
    icon: "🐛",
  },
  {
    id: 3,
    name: "Top Reviewer",
    description: "Reviewed 20+ pull requests",
    icon: "👀",
  },
  {
    id: 4,
    name: "Prolific Coder",
    description: "100+ commits to gitlawb repos",
    icon: "💻",
  },
  {
    id: 5,
    name: "Agent Master",
    description: "Deployed 5+ AI agents on gitlawb",
    icon: "🤖",
  },
  {
    id: 6,
    name: "Bounty Hunter",
    description: "Claimed 3+ bounties successfully",
    icon: "💰",
  },
];

function BadgeCard({
  badge,
  address,
  profileId,
}: {
  badge: (typeof BADGES)[0];
  address: string | undefined;
  profileId: string | undefined;
}) {
  const { data: hasBadge, isLoading: checkingBadge } = useHasBadge(
    address,
    badge.id
  );
  const { mintBadge, isPending, isConfirming, isSuccess, error } =
    useBadgeMint();

  async function handleMint() {
    if (!address) return;
    mintBadge(address, badge.id);

    // Save to Supabase after mint
    if (isSuccess && profileId) {
      await supabase.from("badges").insert({
        profile_id: profileId,
        badge_id: badge.id,
        badge_name: badge.name,
      });
    }
  }

  const isMinted = hasBadge === true;
  const isMinting = isPending || isConfirming;

  return (
    <div
      className={`bg-gray-900 border rounded-xl p-6 transition-colors ${
        isMinted
          ? "border-purple-500/50 bg-purple-500/5"
          : "border-gray-800"
      }`}
    >
      <div className="text-4xl mb-3">{badge.icon}</div>
      <h3 className="text-lg font-semibold text-white">{badge.name}</h3>
      <p className="text-sm text-gray-400 mt-2">{badge.description}</p>

      <div className="mt-4">
        {checkingBadge ? (
          <div className="text-sm text-gray-500">Checking...</div>
        ) : isMinted ? (
          <div className="flex items-center gap-2 text-sm text-purple-400">
            <span>✅</span>
            <span>Minted</span>
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
            Connect your wallet to check and mint badges
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BADGES.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            address={address}
            profileId={profile?.id}
          />
        ))}
      </div>
    </div>
  );
}
