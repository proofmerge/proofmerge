"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
    >
      Connect Wallet
    </button>
  );
}
