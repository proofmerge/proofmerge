"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface SearchResult {
  type: "profile" | "bounty" | "agent" | "repo" | "badge" | "tx";
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

const badgeResults: SearchResult[] = [
  {
    type: "badge",
    id: "badge-1",
    title: "First Contribution",
    subtitle: "Badge B01 - first merged PR",
    url: "/badges",
  },
  {
    type: "badge",
    id: "badge-2",
    title: "Bug Hunter",
    subtitle: "Badge B02 - closed issues",
    url: "/badges",
  },
  {
    type: "badge",
    id: "badge-3",
    title: "Top Reviewer",
    subtitle: "Badge B03 - reviewed PRs",
    url: "/badges",
  },
  {
    type: "badge",
    id: "badge-4",
    title: "Prolific Coder",
    subtitle: "Badge B04 - 100+ commits",
    url: "/badges",
  },
  {
    type: "badge",
    id: "badge-5",
    title: "Agent Master",
    subtitle: "Badge B05 - deployed agents",
    url: "/badges",
  },
  {
    type: "badge",
    id: "badge-6",
    title: "Bounty Hunter",
    subtitle: "Badge B06 - claimed bounties",
    url: "/badges",
  },
];

export default function SearchBar({
  className = "",
  inputClassName = "",
  showButton = false,
  filter = "all",
  placeholder = "Search DID, repo, tx, badge, bounty...",
}: {
  className?: string;
  inputClassName?: string;
  showButton?: boolean;
  filter?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const runSearch = useCallback(async (rawQuery: string) => {
    const q = rawQuery.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const allResults: SearchResult[] = [];
    const normalizedFilter = filter.toLowerCase();

    try {
      const shouldSearch = (type: string) =>
        normalizedFilter === "all" || normalizedFilter === type;

      const [profiles, bounties, agents, repos] = await Promise.all([
        shouldSearch("did") || shouldSearch("profile")
          ? supabase
              .from("profiles")
              .select("id, did, display_name")
              .or(`display_name.ilike.%${q}%,did.ilike.%${q}%`)
              .limit(4)
          : Promise.resolve({ data: [] }),
        shouldSearch("bounty")
          ? supabase
              .from("bounties")
              .select("id, title, repo, status")
              .or(`title.ilike.%${q}%,repo.ilike.%${q}%`)
              .limit(4)
          : Promise.resolve({ data: [] }),
        shouldSearch("did") || shouldSearch("agent")
          ? supabase
              .from("gitlawb_agents")
              .select("did, trust_score")
              .ilike("did", `%${q}%`)
              .limit(4)
          : Promise.resolve({ data: [] }),
        shouldSearch("repo")
          ? supabase
              .from("gitlawb_repos")
              .select("id, name, owner_did, description")
              .or(`name.ilike.%${q}%,owner_did.ilike.%${q}%`)
              .limit(4)
          : Promise.resolve({ data: [] }),
      ]);

      for (const a of agents.data || []) {
        allResults.push({
          type: "agent",
          id: a.did,
          title: trimDid(a.did),
          subtitle: `trust: ${a.trust_score ?? "0.00"} - ${a.did}`,
          url: `/profile/${encodeURIComponent(a.did)}`,
        });
      }

      for (const r of repos.data || []) {
        allResults.push({
          type: "repo",
          id: r.id,
          title: `${trimDid(r.owner_did)}/${r.name}`,
          subtitle: r.description || "gitlawb repo",
          url: "/stats",
        });
      }

      for (const p of profiles.data || []) {
        allResults.push({
          type: "profile",
          id: p.id,
          title: p.display_name || trimDid(p.did),
          subtitle: p.did,
          url: `/profile/${encodeURIComponent(p.did)}`,
        });
      }

      for (const b of bounties.data || []) {
        allResults.push({
          type: "bounty",
          id: b.id.toString(),
          title: b.title,
          subtitle: `${b.repo} - ${b.status}`,
          url: "/bounties",
        });
      }

      if (shouldSearch("badge")) {
        allResults.push(
          ...badgeResults.filter((badge) =>
            `${badge.title} ${badge.subtitle}`.toLowerCase().includes(q.toLowerCase())
          )
        );
      }

      if ((shouldSearch("tx") || shouldSearch("commit")) && isHashLike(q)) {
        allResults.push({
          type: "tx",
          id: q,
          title: q,
          subtitle: "hash-like query - inspect latest events",
          url: "/theater",
        });
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setResults(allResults);
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      queueMicrotask(() => setResults([]));
      return;
    }

    const timer = setTimeout(() => void runSearch(q), 250);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const firstResult = results[0];
    if (firstResult) {
      handleSelect(firstResult);
      return;
    }

    const q = query.trim();
    if (q.length < 2) return;
    router.push(fallbackUrl(q, filter));
    setShowResults(false);
  }

  function handleSelect(result: SearchResult) {
    router.push(result.url);
    setQuery("");
    setResults([]);
    setShowResults(false);
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 180)}
          placeholder={placeholder}
          className={`w-full rounded-md border border-green-500/20 bg-zinc-950 px-3 py-2 font-mono text-sm text-green-100 outline-none placeholder:text-zinc-700 focus:border-green-400 ${inputClassName}`}
        />
        {showButton && (
          <button
            type="submit"
            className="rounded-md bg-green-500 px-5 text-sm font-semibold text-black transition hover:bg-green-400"
          >
            Search
          </button>
        )}
      </div>

      {showResults && query.trim().length >= 2 && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-green-500/20 bg-black shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          {loading ? (
            <div className="p-3 font-mono text-sm text-zinc-500">searching...</div>
          ) : results.length === 0 ? (
            <div className="p-3 font-mono text-sm text-zinc-500">
              No indexed match. Press Enter to open best route.
            </div>
          ) : (
            results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(result)}
                className="w-full px-3 py-2 text-left transition hover:bg-zinc-900"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 rounded border border-green-500/20 px-1.5 py-0.5 font-mono text-[10px] uppercase text-green-300">
                    {result.type}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm text-white">{result.title}</div>
                    <div className="truncate font-mono text-xs text-zinc-500">
                      {result.subtitle}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </form>
  );
}

function trimDid(did: string) {
  if (!did) return "unknown";
  return `${did.slice(0, 14)}...${did.slice(-4)}`;
}

function isHashLike(query: string) {
  return /^0x[a-fA-F0-9]{6,}$/.test(query) || /^[a-fA-F0-9]{16,}$/.test(query);
}

function fallbackUrl(query: string, filter: string) {
  const normalizedFilter = filter.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (normalizedFilter === "repo" || lowerQuery.includes("/") || lowerQuery.includes("repo")) {
    return "/stats";
  }
  if (normalizedFilter === "bounty" || lowerQuery.includes("bounty")) {
    return "/bounties";
  }
  if (normalizedFilter === "badge" || lowerQuery.includes("badge")) {
    return "/badges";
  }
  if (normalizedFilter === "tx" || normalizedFilter === "commit" || isHashLike(query)) {
    return "/theater";
  }
  if (normalizedFilter === "did" || query.startsWith("did:")) {
    return `/profile/${encodeURIComponent(query)}`;
  }
  return "/";
}
