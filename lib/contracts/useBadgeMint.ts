"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { proofMergeBadgeAbi } from "./ProofMergeBadge.abi";
import { PROOF_MERGE_BADGE_ADDRESS } from "./addresses";

export function useBadgeMint() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  function mintBadge(to: string, badgeId: number) {
    writeContract({
      address: PROOF_MERGE_BADGE_ADDRESS,
      abi: proofMergeBadgeAbi,
      functionName: "mintBadge",
      args: [to as `0x${string}`, BigInt(badgeId)],
    });
  }

  return {
    mintBadge,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
