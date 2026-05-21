"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";

export default function WalletButton() {
  const { profile, isConnected, isLoading, address, login, logout } =
    useAuth();

  if (isLoading) {
    return (
      <button className="px-4 py-2 bg-gray-700 text-gray-400 text-sm rounded-lg cursor-wait">
        Loading...
      </button>
    );
  }

  if (isConnected && profile) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/profile/${encodeURIComponent(profile.did)}`}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
        >
          {profile.display_name || "Profile"}
        </Link>
        <button
          onClick={logout}
          className="px-3 py-2 bg-gray-800 hover:bg-red-700 text-gray-400 hover:text-white text-sm rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
    >
      Connect Wallet
    </button>
  );
}
