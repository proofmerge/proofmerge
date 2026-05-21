"use client";

import { useEffect } from "react";
import { useBadgeMint, useHasBadge } from "@/lib/contracts";
import { useAuth } from "@/lib/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

const BADGES = [
  {
    id: 1,
    code: "B01",
    name: "First Contribution",
    description: "Your first merged PR on gitlawb network",
    requirement: "1+ PRs merged",
    check: (p: Profile) => p.total_prs >= 1,
  },
  {
    id: 2,
    code: "B02",
    name: "Bug Hunter",
    description: "Closed 10+ issues on gitlawb",
    requirement: "10+ issues closed",
    check: (p: Profile) => p.total_issues >= 10,
  },
  {
    id: 3,
    code: "B03",
    name: "Top Reviewer",
    description: "Reviewed 20+ pull requests",
    requirement: "20+ PRs reviewed",
    check: (p: Profile) => p.total_prs >= 20,
  },
  {
    id: 4,
    code: "B04",
    name: "Prolific Coder",
    description: "100+ commits to gitlawb repos",
    requirement: "100+ commits",
    check: (p: Profile) => p.total_commits >= 100,
  },
  {
    id: 5,
    code: "B05",
    name: "Agent Master",
    description: "Deployed 5+ AI agents on gitlawb",
    requirement: "5+ agents deployed",
    check: (p: Profile) => p.total_commits >= 50,
  },
  {
    id: 6,
    code: "B06",
    name: "Bounty Hunter",
    description: "Claimed 3+ bounties successfully",
    requirement: "3+ bounties claimed",
    check: (p: Profile) => p.total_issues >= 3,
  },
];

export default function BadgesPage() {
  const { profile, isConnected, address } = useAuth();

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-green-500/20 bg-black p-4">
        <p className="font-mono text-xs uppercase tracking-wide text-green-400">
          [ badge registry ]
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Skill Badges</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Mint on-chain badges based on your gitlawb contributions.
        </p>
      </section>

      {!isConnected && (
        <section className="rounded-lg border border-green-500/20 bg-black p-6 text-center">
          <p className="font-mono text-sm text-zinc-500">
            [ connect wallet to check eligibility ]
          </p>
        </section>
      )}

      {isConnected && profile && (
        <section className="rounded-lg border border-green-500/20 bg-black p-4">
          <h2 className="mb-3 font-mono text-sm font-semibold text-green-300">
            Your Stats
          </h2>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-green-500/10 bg-green-500/10 md:grid-cols-4">
            <ProfileStat label="Commits" value={profile.total_commits} />
            <ProfileStat label="PRs" value={profile.total_prs} />
            <ProfileStat label="Issues" value={profile.total_issues} />
            <ProfileStat label="Trust" value={profile.trust_score.toFixed(2)} highlight />
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {BADGES.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            address={address}
            profileId={profile?.id}
            profile={profile}
          />
        ))}
      </section>
    </div>
  );
}

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

  const isMinted = hasBadge === true;
  const isMinting = isPending || isConfirming;
  const isEligible = profile ? badge.check(profile) : false;

  useEffect(() => {
    if (isSuccess && profileId) {
      void supabase.from("badges").insert({
        profile_id: profileId,
        badge_id: badge.id,
        badge_name: badge.name,
      });
    }
  }, [badge.id, badge.name, isSuccess, profileId]);

  function handleMint() {
    if (!address || !isEligible) return;
    mintBadge(address, badge.id);
  }

  return (
    <div
      className={`rounded-lg border bg-black p-5 transition ${
        isMinted
          ? "border-green-500/50 shadow-[0_0_24px_rgba(34,197,94,0.08)]"
          : isEligible
            ? "border-green-500/30"
            : "border-green-500/15"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded border border-green-500/20 bg-green-500/10 px-2 py-1 font-mono text-xs text-green-300">
          {badge.code}
        </span>
        <span className="font-mono text-xs text-zinc-700">ERC-1155</span>
      </div>

      <h3 className="text-base font-semibold text-white">{badge.name}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {badge.description}
      </p>
      <p className="mt-2 font-mono text-xs text-zinc-600">
        requires: {badge.requirement}
      </p>

      <div className="mt-5">
        {checkingBadge ? (
          <p className="font-mono text-sm text-zinc-500">checking...</p>
        ) : isMinted ? (
          <p className="font-mono text-sm text-green-400">[ minted ]</p>
        ) : !isEligible ? (
          <p className="font-mono text-sm text-zinc-600">[ locked ]</p>
        ) : (
          <button
            onClick={handleMint}
            disabled={isMinting || !address}
            className={`w-full rounded-md px-4 py-2 text-sm font-medium transition ${
              isMinting || !address
                ? "cursor-not-allowed bg-zinc-900 text-zinc-600"
                : "bg-green-600 text-white hover:bg-green-500"
            }`}
          >
            {!address ? "Connect Wallet" : isMinting ? "Minting..." : "Mint Badge"}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 text-xs text-red-400">
          {error.message.slice(0, 100)}
        </div>
      )}
    </div>
  );
}

function ProfileStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-black p-4 text-center">
      <div className={`font-mono text-xl font-semibold ${highlight ? "text-green-300" : "text-white"}`}>
        {value}
      </div>
      <div className="mt-1 text-xs text-zinc-600">{label}</div>
    </div>
  );
}
