"use client";

import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import {
  useApproveToken,
  useBounties,
  useBountyCount,
  useCancelBounty,
  useClaimBounty,
  useCompleteBounty,
  useCreateBounty,
} from "@/lib/contracts";
import { useAuth } from "@/lib/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import type { Bounty } from "@/lib/supabase/types";

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
  const [filter, setFilter] = useState<"all" | "open" | "claimed" | "completed">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<"onchain" | "offchain">("onchain");

  const { data: bountyCount } = useBountyCount();
  const { data: onChainBounties, refetch: refetchOnChain } = useBounties(
    BigInt(0),
    bountyCount || BigInt(20)
  );

  const fetchBounties = useCallback(async () => {
    try {
      let query = supabase.from("bounties").select("*");
      if (filter !== "all") query = query.eq("status", filter);
      const { data } = await query.order("created_at", { ascending: false });
      setBounties(data || []);
    } catch (err) {
      console.error("Error fetching bounties:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (activeTab === "offchain") queueMicrotask(() => void fetchBounties());
  }, [activeTab, fetchBounties]);

  const filteredOnChainBounties = ((onChainBounties as OnChainBounty[]) || []).filter(
    (bounty) => filter === "all" || STATUS_MAP[Number(bounty.status)] === filter
  );

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-4 rounded-lg border border-green-500/20 bg-black p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-green-400">
            [ bounty board ]
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Bounty Board</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Discover and claim crypto bounties on gitlawb issues.
          </p>
        </div>
        {isConnected && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-md bg-green-600 px-4 py-2 text-sm text-white transition hover:bg-green-500"
          >
            Create Bounty
          </button>
        )}
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <div className="flex w-fit gap-1 rounded-lg border border-green-500/20 bg-black p-1">
          <TabButton active={activeTab === "onchain"} onClick={() => setActiveTab("onchain")}>
            On-Chain ({Number(bountyCount || 0)})
          </TabButton>
          <TabButton
            active={activeTab === "offchain"}
            onClick={() => {
              setActiveTab("offchain");
              setLoading(true);
            }}
          >
            Off-Chain
          </TabButton>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "open", "claimed", "completed"] as const).map((nextFilter) => (
            <button
              key={nextFilter}
              onClick={() => setFilter(nextFilter)}
              className={`rounded-md border px-3 py-1.5 text-sm transition ${
                filter === nextFilter
                  ? "border-green-500/40 bg-green-500/10 text-green-300"
                  : "border-green-500/15 bg-black text-zinc-500 hover:border-green-500/30 hover:text-zinc-100"
              }`}
            >
              {nextFilter.charAt(0).toUpperCase() + nextFilter.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "onchain" && (
        <section className="space-y-3">
          {filteredOnChainBounties.length === 0 ? (
            <EmptyState>No on-chain bounties found</EmptyState>
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
        </section>
      )}

      {activeTab === "offchain" && (
        <section className="space-y-3">
          {loading ? (
            <EmptyState>Loading...</EmptyState>
          ) : bounties.length === 0 ? (
            <EmptyState>No off-chain bounties found</EmptyState>
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
        </section>
      )}

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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-sm transition ${
        active
          ? "bg-green-500/15 text-green-300 ring-1 ring-green-500/20"
          : "text-zinc-500 hover:text-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-green-500/20 bg-black py-8 text-center font-mono text-sm text-zinc-500">
      {children}
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

  const status = STATUS_MAP[Number(bounty.status)] || "unknown";
  const isCreator =
    userAddress && bounty.creator.toLowerCase() === userAddress.toLowerCase();

  useEffect(() => {
    if (claimSuccess) onAction();
  }, [claimSuccess, onAction]);

  return (
    <article className="rounded-lg border border-green-500/20 bg-black p-4 transition hover:border-green-500/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-white">{bounty.title}</h3>
            <span className="font-mono text-xs text-zinc-600">#{Number(bounty.id)}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
            <span>{bounty.repo}</span>
            <span>-</span>
            <span className="font-medium text-green-400">
              {formatUnits(bounty.amount, 6)} USDC
            </span>
            <span>-</span>
            <span>{new Date(Number(bounty.createdAt) * 1000).toLocaleDateString()}</span>
          </div>
          <p className="mt-2 font-mono text-xs text-zinc-700">
            creator: {bounty.creator.slice(0, 6)}...{bounty.creator.slice(-4)}
          </p>
          {bounty.claimer !== "0x0000000000000000000000000000000000000000" && (
            <p className="font-mono text-xs text-zinc-700">
              claimer: {bounty.claimer.slice(0, 6)}...{bounty.claimer.slice(-4)}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <StatusPill status={status} />
          <div className="flex gap-2">
            {status === "open" && !isCreator && userAddress && (
              <ActionButton
                disabled={isClaiming}
                onClick={() => claimBounty(bounty.id)}
              >
                {isClaiming ? "Claiming..." : "Claim"}
              </ActionButton>
            )}
            {status === "claimed" && isCreator && (
              <ActionButton
                disabled={isCompleting}
                onClick={() => completeBounty(bounty.id)}
              >
                {isCompleting ? "Completing..." : "Complete"}
              </ActionButton>
            )}
            {status === "open" && isCreator && (
              <button
                onClick={() => cancelBounty(bounty.id)}
                disabled={isCancelling}
                className="rounded-md bg-red-600 px-3 py-1 text-xs text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
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
    <article className="rounded-lg border border-green-500/20 bg-black p-4 transition hover:border-green-500/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-medium text-white">{bounty.title}</h3>
          {bounty.description && (
            <p className="mt-1 text-sm text-zinc-500">{bounty.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
            <span>{bounty.repo}</span>
            <span>-</span>
            <span>
              {bounty.amount} {bounty.token}
            </span>
            <span>-</span>
            <span>{new Date(bounty.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusPill status={bounty.status} />
          {bounty.status === "open" && profileId && (
            <ActionButton disabled={claiming} onClick={handleClaim}>
              {claiming ? "Claiming..." : "Claim"}
            </ActionButton>
          )}
        </div>
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === "open"
      ? "bg-green-500/10 text-green-300 border-green-500/30"
      : status === "claimed"
        ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
        : status === "completed"
          ? "bg-green-500/10 text-green-300 border-green-500/30"
          : "bg-zinc-900 text-zinc-400 border-zinc-800";

  return (
    <span className={`rounded-full border px-2 py-1 font-mono text-xs ${color}`}>
      {status}
    </span>
  );
}

function ActionButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-md bg-green-600 px-3 py-1 text-xs text-white transition hover:bg-green-500 disabled:opacity-50"
    >
      {children}
    </button>
  );
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

  const { approve, isPending: isApproving, isSuccess: approveSuccess } =
    useApproveToken();
  const {
    createBounty: createOnChain,
    isPending: isCreating,
    isSuccess: createSuccess,
  } = useCreateBounty();

  useEffect(() => {
    if (approveSuccess && step === "approve") {
      createOnChain(
        "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        amount,
        6,
        repo,
        issueId,
        title
      );
      queueMicrotask(() => setStep("create"));
    }
  }, [amount, approveSuccess, createOnChain, issueId, repo, step, title]);

  useEffect(() => {
    if (createSuccess) {
      onCreate();
      onClose();
    }
  }, [createSuccess, onClose, onCreate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !repo || !amount) return;

    if (activeTab === "onchain") {
      setStep("approve");
      approve("0x036CbD53842c5426634e7929541eC2318f3dCF7e", amount, 6);
      return;
    }

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

  const isProcessing = submitting || isApproving || isCreating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg border border-green-500/20 bg-black p-6 shadow-[0_0_40px_rgba(34,197,94,0.08)]">
        <h2 className="mb-4 font-mono text-lg font-semibold text-green-300">
          Create Bounty {activeTab === "onchain" ? "(On-Chain)" : "(Off-Chain)"}
        </h2>

        {step !== "form" ? (
          <div className="py-4 text-center">
            <p className="mb-2 text-yellow-300">
              {step === "approve"
                ? "Step 1/2: Approving USDC spend..."
                : "Step 2/2: Creating bounty..."}
            </p>
            <p className="text-sm text-zinc-500">
              Please confirm the transaction in your wallet.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput label="Title" value={title} onChange={setTitle} placeholder="Fix memory leak in connector" required />
            {activeTab === "offchain" && (
              <div>
                <label className="mb-1 block text-sm text-zinc-500">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-green-500/20 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-green-400"
                  placeholder="Detailed description..."
                  rows={3}
                />
              </div>
            )}
            <FormInput label="Repository" value={repo} onChange={setRepo} placeholder="gitlawb/node" required />
            {activeTab === "onchain" && (
              <FormInput label="Issue ID" value={issueId} onChange={setIssueId} placeholder="issue-123" />
            )}
            <FormInput label="Amount (USDC)" value={amount} onChange={setAmount} placeholder="100" type="number" required />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-green-500/20 bg-zinc-950 px-4 py-2 text-sm text-zinc-400 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="rounded-md bg-green-600 px-4 py-2 text-sm text-white transition hover:bg-green-500 disabled:opacity-50"
              >
                {isProcessing
                  ? "Creating..."
                  : activeTab === "onchain"
                    ? "Create On-Chain"
                    : "Create"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-zinc-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-green-500/20 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-green-400"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
