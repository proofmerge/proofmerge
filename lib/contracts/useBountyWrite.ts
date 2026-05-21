import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { PROOF_MERGE_BOUNTY_ADDRESS } from "./addresses";
import { PROOF_MERGE_BOUNTY_ABI } from "./ProofMergeBounty.abi";

// ERC20 ABI for approve
const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

export function useCreateBounty() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function createBounty(
    tokenAddress: `0x${string}`,
    amount: string,
    decimals: number,
    repo: string,
    issueId: string,
    title: string
  ) {
    const parsedAmount = parseUnits(amount, decimals);
    writeContract({
      address: PROOF_MERGE_BOUNTY_ADDRESS,
      abi: PROOF_MERGE_BOUNTY_ABI,
      functionName: "createBounty",
      args: [tokenAddress, parsedAmount, repo, issueId, title],
    });
  }

  return {
    createBounty,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useApproveToken() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function approve(
    tokenAddress: `0x${string}`,
    amount: string,
    decimals: number
  ) {
    const parsedAmount = parseUnits(amount, decimals);
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [PROOF_MERGE_BOUNTY_ADDRESS, parsedAmount],
    });
  }

  return {
    approve,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useClaimBounty() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function claimBounty(bountyId: bigint) {
    writeContract({
      address: PROOF_MERGE_BOUNTY_ADDRESS,
      abi: PROOF_MERGE_BOUNTY_ABI,
      functionName: "claimBounty",
      args: [bountyId],
    });
  }

  return {
    claimBounty,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useCompleteBounty() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function completeBounty(bountyId: bigint) {
    writeContract({
      address: PROOF_MERGE_BOUNTY_ADDRESS,
      abi: PROOF_MERGE_BOUNTY_ABI,
      functionName: "completeBounty",
      args: [bountyId],
    });
  }

  return {
    completeBounty,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useCancelBounty() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function cancelBounty(bountyId: bigint) {
    writeContract({
      address: PROOF_MERGE_BOUNTY_ADDRESS,
      abi: PROOF_MERGE_BOUNTY_ABI,
      functionName: "cancelBounty",
      args: [bountyId],
    });
  }

  return {
    cancelBounty,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
