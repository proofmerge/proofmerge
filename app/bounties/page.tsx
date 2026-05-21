"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import type { Bounty } from "@/lib/supabase/types";

export default function BountiesPage() {
  const { profile, isConnected } = useAuth();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "claimed" | "completed">("all");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchBounties();
  }, [filter]);

  async function fetchBounties() {
    try {
      let query = supabase.from("bounties").select("*");
      if (filter !== "all") {
        query = query.eq("status", filter);
      }
      const { data } = await query.order("created_at", { ascending: false });
      setBounties(data || []);
    } catch (err) {
      console.error("Error fetching bounties:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bounty Board</h1>
          <p className="text-sm text-gray-400 mt-1">
            Discover and claim crypto bounties on gitlawb issues
          </p>
        </div>
        {isConnected && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            Create Bounty
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "open", "claimed", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === f
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bounty List */}
      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading...</div>
      ) : bounties.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No bounties found
        </div>
      ) : (
        <div className="space-y-3">
          {bounties.map((bounty) => (
            <BountyCard
              key={bounty.id}
              bounty={bounty}
              profileId={profile?.id}
              onClaim={fetchBounties}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateBountyModal
          onClose={() => setShowCreate(false)}
          onCreate={fetchBounties}
          profileId={profile?.id}
        />
      )}
    </div>
  );
}

function BountyCard({
  bounty,
  profileId,
  onClaim,
}: {
  bounty: Bounty;
  profileId: string | undefined;
  onClaim: () => void;
}) {
  const [claiming, setClaiming] = useState(false);

  async function handleClaim() {
    if (!profileId) return;
    setClaiming(true);
    try {
      await supabase
        .from("bounties")
        .update({
          status: "claimed",
          claimer_id: profileId,
          claimed_at: new Date().toISOString(),
        })
        .eq("id", bounty.id)
        .eq("status", "open");
      onClaim();
    } catch (err) {
      console.error("Error claiming bounty:", err);
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-white">{bounty.title}</h3>
          {bounty.description && (
            <p className="text-sm text-gray-400 mt-1">{bounty.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>{bounty.repo}</span>
            <span>•</span>
            <span>
              {bounty.amount} {bounty.token}
            </span>
            <span>•</span>
            <span>{new Date(bounty.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              bounty.status === "open"
                ? "bg-green-500/20 text-green-400"
                : bounty.status === "claimed"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-blue-500/20 text-blue-400"
            }`}
          >
            {bounty.status}
          </span>
          {bounty.status === "open" && profileId && (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              {claiming ? "Claiming..." : "Claim"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateBountyModal({
  onClose,
  onCreate,
  profileId,
}: {
  onClose: () => void;
  onCreate: () => void;
  profileId: string | undefined;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repo, setRepo] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profileId || !title || !repo || !amount) return;

    setSubmitting(true);
    try {
      await supabase.from("bounties").insert({
        title,
        description,
        repo,
        amount,
        token: "USDC",
        chain_id: 84532,
        contract_address: "0x0319Cd15baC7506602E206e9C58B09f6F4B2Fa0C",
        creator_id: profileId,
      });
      onCreate();
      onClose();
    } catch (err) {
      console.error("Error creating bounty:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-white mb-4">
          Create Bounty
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              placeholder="Fix memory leak in connector"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              placeholder="Detailed description..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Repository
            </label>
            <input
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              placeholder="gitlawb/node"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Amount (USDC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              placeholder="100"
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-400 text-sm rounded-lg hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
