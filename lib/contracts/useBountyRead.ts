import { useReadContract } from "wagmi";
import { PROOF_MERGE_BOUNTY_ADDRESS } from "./addresses";
import { PROOF_MERGE_BOUNTY_ABI } from "./ProofMergeBounty.abi";

export function useBountyCount() {
  return useReadContract({
    address: PROOF_MERGE_BOUNTY_ADDRESS,
    abi: PROOF_MERGE_BOUNTY_ABI,
    functionName: "bountyCount",
  });
}

export function useBounty(bountyId: bigint | undefined) {
  return useReadContract({
    address: PROOF_MERGE_BOUNTY_ADDRESS,
    abi: PROOF_MERGE_BOUNTY_ABI,
    functionName: "getBounty",
    args: bountyId !== undefined ? [bountyId] : undefined,
    query: {
      enabled: bountyId !== undefined,
    },
  });
}

export function useBounties(offset: bigint = BigInt(0), limit: bigint = BigInt(20)) {
  return useReadContract({
    address: PROOF_MERGE_BOUNTY_ADDRESS,
    abi: PROOF_MERGE_BOUNTY_ABI,
    functionName: "getBounties",
    args: [offset, limit],
  });
}

export function useFeePercent() {
  return useReadContract({
    address: PROOF_MERGE_BOUNTY_ADDRESS,
    abi: PROOF_MERGE_BOUNTY_ABI,
    functionName: "feePercent",
  });
}
