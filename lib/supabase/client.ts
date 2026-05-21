import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Profile operations
export async function getProfile(did: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("did", did)
    .single();

  if (error) throw error;
  return data;
}

export async function getProfileByWallet(walletAddress: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

  if (error) throw error;
  return data;
}

export async function upsertProfile(
  profile: Database["public"]["Tables"]["profiles"]["Insert"]
) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "did" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Badge operations
export async function getBadges(profileId: string) {
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .eq("profile_id", profileId);

  if (error) throw error;
  return data;
}

export async function mintBadge(
  badge: Database["public"]["Tables"]["badges"]["Insert"]
) {
  const { data, error } = await supabase
    .from("badges")
    .insert(badge)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Bounty operations
export async function getBounties(status?: string) {
  let query = supabase.from("bounties").select("*");

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) throw error;
  return data;
}

export async function getBounty(id: number) {
  const { data, error } = await supabase
    .from("bounties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createBounty(
  bounty: Database["public"]["Tables"]["bounties"]["Insert"]
) {
  const { data, error } = await supabase
    .from("bounties")
    .insert(bounty)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function claimBounty(bountyId: number, claimerId: string) {
  const { data, error } = await supabase
    .from("bounties")
    .update({
      status: "claimed",
      claimer_id: claimerId,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", bountyId)
    .eq("status", "open")
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeBounty(bountyId: number) {
  const { data, error } = await supabase
    .from("bounties")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", bountyId)
    .eq("status", "claimed")
    .select()
    .single();

  if (error) throw error;
  return data;
}
