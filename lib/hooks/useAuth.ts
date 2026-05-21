"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-create or fetch profile when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      fetchOrCreateProfile(address);
    } else {
      setProfile(null);
    }
  }, [isConnected, address]);

  async function fetchOrCreateProfile(walletAddress: string) {
    setLoading(true);
    try {
      // Try to find existing profile by wallet
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single();

      if (existing) {
        setProfile(existing);
        return;
      }

      // Create new profile with DID derived from wallet
      const did = `did:ethr:${walletAddress}`;
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
          did,
          wallet_address: walletAddress,
          display_name: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(newProfile);
    } catch (err) {
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!profile) return;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }
  }

  function login() {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }

  function logout() {
    disconnect();
    setProfile(null);
  }

  return {
    profile,
    isConnected,
    isLoading: loading,
    address,
    login,
    logout,
    updateProfile,
  };
}
