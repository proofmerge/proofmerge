"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { useAuth } from "@/lib/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import {
  useBounties,
  useBountyCount,
  useClaimBounty,
  useCompleteBounty,
  useCancelBounty,
  useCreateBounty,
  useApproveToken,
} from "@/lib/contracts";
import type { Bounty } from "@/lib/supabase/types";

// Status mapping from contract enum
const STATUS_MAP: Record<number, string> = {
  0: "open",
  1: "claimed",
  2: "completed",
  3: "cancelled",
};

interface OnChainBounty {
  id: bigint;
  creator: `0x${string}`;
  claimer: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  repo: string;
  issueId: string;
  title: string;
  status: number;
  createdAt: bigint;
  claimedAt: bigint;
  completedAt: bigint;
}

export default function BountiesPage() {
  const { profile, isConnected } = useAuth();
  const { address } = useAccount();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "open" | "claimed" | "completed"
  >("all");
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<"onchain" | "offchain">("onchain");

  // On-chain bounties
  const { data: bountyCount } = useBountyCount();
  const { data: onChainBounties, refetch: refetchOnChain } = useBounties(
    BigInt(0),
    bountyCount || BigInt(20)
  );

  useEffect(() => {
    if (activeTab === "offchain") {
      fetchBounties();
    }
  }, [filter, activeTab]);

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

  const filteredOnChainBounties = (onChainBounties as OnChainBounty[] || []).filter(
    (b) => {
      if (filter === "all") return true;
      return STATUS_MAP[Number(b.status)] === filter;
    }
  );

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

      {/* Tab Switch */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab("onchain")}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            activeTab === "onchain"
              ? "bg-purple-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          On-Chain ({Number(bountyCount || 0)})
        </button>
        <button
          onClick={() => {
            setActiveTab("offchain");
            setLoading(true);
          }}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            activeTab === "offchain"
              ? "bg-purple-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Off-Chain
        </button>
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

      {/* On-Chain Bounties */}
      {activeTab === "onchain" && (
        <div className="space-y-3">
          {filteredOnChainBounties.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No on-chain bounties found
            </div>
          ) : (
            filteredOnChainBounties.map((bounty) => (
              <OnChainBountyCard
                key={Number(bounty.id)}
                bounty={bounty}
                userAddress={address}
                onAction={refetchOnChain}
              />
            ))
          )}
        </div>
      )}

      {/* Off-Chain Bounties */}
      {activeTab === "offchain" && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : bounties.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No off-chain bounties found
            </div>
          ) : (
            bounties.map((bounty) => (
              <BountyCard
                key={bounty.id}
                bounty={bounty}
                profileId={profile?.id}
                onClaim={fetchBounties}
              />
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateBountyModal
          onClose={() => setShowCreate(false)}
          onCreate={() => {
            fetchBounties();
            refetchOnChain();
          }}
          profileId={profile?.id}
          activeTab={activeTab}
        />
      )}
    </div>
  );
}

function OnChainBountyCard({
  bounty,
  userAddress,
  onAction,
}: {
  bounty: OnChainBounty;
  userAddress: `0x${string}` | undefined;
  onAction: () => void;
}) {
  const { claimBounty, isPending: isClaiming, isSuccess: claimSuccess } = useClaimBounty();
  const { completeBounty, isPending: isCompleting } = useCompleteBounty();
  const { cancelBounty, isPending: isCancelling } = useCancelBounty();
  const [txPending, setTxPending] = useState(false);

  const status = STATUS_MAP[Number(bounty.status)] || "unknown";
  const isCreator =
    userAddress &&
    bounty.creator.toLowerCase() === userAddress.toLowerCase();
  const isClaimer =
    userAddress &&
    bounty.claimer.toLowerCase() === userAddress.toLowerCase();

  useEffect(() => {
    if (claimSuccess) {
      setTxPending(false);
      onAction();
    }
  }, [claimSuccess]);

  function handleClaim() {
    setTxPending(true);
    claimBounty(bounty.id);
  }

  function handleComplete() {
    completeBounty(bounty.id);
  }

  function handleCancel() {
    cancelBounty(bounty.id);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-white">{bounty.title}</h3>
            <span className="text-xs text-gray-500">#{Number(bounty.id)}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>{bounty.repo}</span>
            <span>•</span>
            <span className="text-green-400 font-medium">
              {formatUnits(bounty.amount, 6)} USDC
            </span>
            <span>•</span>
            <span>
              {new Date(Number(bounty.createdAt) * 1000).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            Creator: {bounty.creator.slice(0, 6)}...{bounty.creator.slice(-4)}
          </div>
          {bounty.claimer !== "0x0000000000000000000000000000000000000000" && (
            <div className="text-xs text-gray-600">
              Claimer: {bounty.claimer.slice(0, 6)}...{bounty.claimer.slice(-4)}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              status === "open"
                ? "bg-green-500/20 text-green-400"
                : status === "claimed"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : status === "completed"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {status}
          </span>
          <div className="flex gap-2">
            {status === "open" && !isCreator && userAddress && (
              <button
                onClick={handleClaim}
                disabled={isClaiming || txPending}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {isClaiming || txPending ? "Claiming..." : "Claim"}
              </button>
            )}
            {status === "claimed" && isCreator && (
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {isCompleting ? "Completing..." : "Complete"}
              </button>
            )}
            {status === "open" && isCreator && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>
        </div>
      </div>
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

function getSubmitLabel(
  isProcessing: boolean,
  step: "form" | "approve" | "create",
  activeTab: "onchain" | "offchain"
): string {
  if (isProcessing) {
    if (step === "approve") return "Approving...";
    return "Creating...";
  }
  return activeTab === "onchain" ? "Create On-Chain" : "Create";
}

function CreateBountyModal({
  onClose,
  onCreate,
  profileId,
  activeTab,
}: {
  onClose: () => void;
  onCreate: () => void;
  profileId: string | undefined;
  activeTab: "onchain" | "offchain";
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repo, setRepo] = useState("");
  const [issueId, setIssueId] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "approve" | "create">("form");

  // On-chain hooks
  const {
    approve,
    isPending: isApproving,
    isSuccess: approveSuccess,
  } = useApproveToken();
  const {
    createBounty: createOnChain,
    isPending: isCreating,
    isSuccess: createSuccess,
  } = useCreateBounty();

  useEffect(() => {
    if (approveSuccess && step === "approve") {
      setStep("create");
      createOnChain(
        "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
        amount,
        6,
        repo,
        issueId,
        title
      );
    }
  }, [approveSuccess]);

  useEffect(() => {
    if (createSuccess) {
      onCreate();
      onClose();
    }
  }, [createSuccess]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !repo || !amount) return;

    if (activeTab === "onchain") {
      setStep("approve");
      approve(
        "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
        amount,
        6
      );
    } else {
      // Off-chain: save to Supabase
      if (!profileId) return;
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
  }

  const isProcessing =
    submitting || isApproving || isCreating || step === "approve" || step === "create";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-white mb-4">
          Create Bounty {activeTab === "onchain" ? "(On-Chain)" : "(Off-Chain)"}
        </h2>

        {step === "approve" && (
          <div className="text-center py-4">
            <div className="text-yellow-400 mb-2">
              Step 1/2: Approving USDC spend...
            </div>
            <div className="text-sm text-gray-400">
              Please confirm the approval transaction in your wallet
            </div>
          </div>
        )}

        {step === "create" && (
          <div className="text-center py-4">
            <div className="text-yellow-400 mb-2">
              Step 2/2: Creating bounty...
            </div>
            <div className="text-sm text-gray-400">
              Please confirm the create transaction in your wallet
            </div>
          </div>
        )}

        {step === "form" && (
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
            {activeTab === "offchain" && (
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
            )}
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
            {activeTab === "onchain" && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Issue ID
                </label>
                <input
                  type="text"
                  value={issueId}
                  onChange={(e) => setIssueId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  placeholder="issue-123"
                />
              </div>
            )}
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
                disabled={isProcessing}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {getSubmitLabel(isProcessing, step, activeTab)}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
