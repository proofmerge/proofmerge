"use client";

import { useReadContract } from "wagmi";
import { proofMergeBadgeAbi } from "./ProofMergeBadge.abi";
import { PROOF_MERGE_BADGE_ADDRESS } from "./addresses";

export function useBadgeBalance(address: string | undefined, badgeId: number) {
  return useReadContract({
    address: PROOF_MERGE_BADGE_ADDRESS,
    abi: proofMergeBadgeAbi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`, BigInt(badgeId)] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useHasBadge(address: string | undefined, badgeId: number) {
  return useReadContract({
    address: PROOF_MERGE_BADGE_ADDRESS,
    abi: proofMergeBadgeAbi,
    functionName: "hasBadge",
    args: address ? [address as `0x${string}`, BigInt(badgeId)] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useBadgeName(badgeId: number) {
  return useReadContract({
    address: PROOF_MERGE_BADGE_ADDRESS,
    abi: proofMergeBadgeAbi,
    functionName: "getBadgeName",
    args: [BigInt(badgeId)],
  });
}

export function useAllBadgeIds() {
  return useReadContract({
    address: PROOF_MERGE_BADGE_ADDRESS,
    abi: proofMergeBadgeAbi,
    functionName: "getAllBadgeIds",
  });
}
