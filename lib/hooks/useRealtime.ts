"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Badge, Bounty } from "@/lib/supabase/types";

export function useRealtimeBadges(profileId?: string) {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    if (!profileId) return;

    // Initial fetch
    supabase
      .from("badges")
      .select("*")
      .eq("profile_id", profileId)
      .then(({ data }) => setBadges(data || []));

    // Subscribe to changes
    const channel = supabase
      .channel("badges-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "badges",
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBadges((prev) => [...prev, payload.new as Badge]);
          } else if (payload.eventType === "DELETE") {
            setBadges((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  return badges;
}

export function useRealtimeBounties(status?: string) {
  const [bounties, setBounties] = useState<Bounty[]>([]);

  useEffect(() => {
    // Initial fetch
    let query = supabase.from("bounties").select("*");
    if (status) {
      query = query.eq("status", status);
    }
    query
      .order("created_at", { ascending: false })
      .then(({ data }) => setBounties(data || []));

    // Subscribe to changes
    const channel = supabase
      .channel("bounties-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bounties",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBounties((prev) => [payload.new as Bounty, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setBounties((prev) =>
              prev.map((b) =>
                b.id === payload.new.id ? (payload.new as Bounty) : b
              )
            );
          } else if (payload.eventType === "DELETE") {
            setBounties((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [status]);

  return bounties;
}

export function useRealtimeStats() {
  const [stats, setStats] = useState({
    profiles: 0,
    badges: 0,
    bounties: 0,
  });

  useEffect(() => {
    // Initial fetch
    Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("badges").select("*", { count: "exact", head: true }),
      supabase.from("bounties").select("*", { count: "exact", head: true }),
    ]).then(([profiles, badges, bounties]) => {
      setStats({
        profiles: profiles.count || 0,
        badges: badges.count || 0,
        bounties: bounties.count || 0,
      });
    });

    // Subscribe to all changes
    const channel = supabase
      .channel("stats-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .then(({ count }) =>
              setStats((prev) => ({ ...prev, profiles: count || 0 }))
            );
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "badges" },
        () => {
          supabase
            .from("badges")
            .select("*", { count: "exact", head: true })
            .then(({ count }) =>
              setStats((prev) => ({ ...prev, badges: count || 0 }))
            );
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bounties" },
        () => {
          supabase
            .from("bounties")
            .select("*", { count: "exact", head: true })
            .then(({ count }) =>
              setStats((prev) => ({ ...prev, bounties: count || 0 }))
            );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return stats;
}
