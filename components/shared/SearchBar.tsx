"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getAgents, getRepos } from "@/lib/gitlawb/client";

interface SearchResult {
  type: "profile" | "bounty" | "agent" | "repo" | "badge";
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const [profiles, bounties, agents, repos] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, did, display_name")
          .or(`display_name.ilike.%${q}%,did.ilike.%${q}%`)
          .limit(5),
        supabase
          .from("bounties")
          .select("id, title, repo, status")
          .or(`title.ilike.%${q}%,repo.ilike.%${q}%`)
          .limit(5),
        getAgents(50).then((all) =>
          all.filter(
            (a) =>
              a.did.toLowerCase().includes(q.toLowerCase()) ||
              a.name.toLowerCase().includes(q.toLowerCase())
          )
        ),
        getRepos().then((all) =>
          all.filter(
            (r) =>
              r.name.toLowerCase().includes(q.toLowerCase()) ||
              r.owner.toLowerCase().includes(q.toLowerCase()) ||
              (r.description || "").toLowerCase().includes(q.toLowerCase())
          )
        ),
      ]);

      const profileResults: SearchResult[] = (profiles.data || []).map(
        (p) => ({
          type: "profile" as const,
          id: p.id,
          title: p.display_name || "Anonymous",
          subtitle: p.did,
          url: `/profile/${encodeURIComponent(p.did)}`,
        })
      );

      const bountyResults: SearchResult[] = (bounties.data || []).map(
        (b) => ({
          type: "bounty" as const,
          id: b.id.toString(),
          title: b.title,
          subtitle: `${b.repo} • ${b.status}`,
          url: "/bounties",
        })
      );

      const agentResults: SearchResult[] = agents.slice(0, 5).map((a) => ({
        type: "agent" as const,
        id: a.did,
        title: a.name,
        subtitle: `Trust: ${a.trustScore.toFixed(2)} • ${a.did.slice(0, 30)}...`,
        url: `/profile/${encodeURIComponent(a.did)}`,
      }));

      const repoResults: SearchResult[] = repos.slice(0, 5).map((r) => ({
        type: "repo" as const,
        id: `${r.owner}/${r.name}`,
        title: `${r.owner}/${r.name}`,
        subtitle: r.description || "No description",
        url: "/stats",
      }));

      setResults([
        ...agentResults,
        ...repoResults,
        ...profileResults,
        ...bountyResults,
      ]);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => void search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  function handleSelect(result: SearchResult) {
    router.push(result.url);
    setQuery("");
    setShowResults(false);
  }

  const typeIcons: Record<string, string> = {
    agent: "🤖",
    repo: "📁",
    profile: "👤",
    bounty: "💰",
    badge: "🏅",
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          const nextQuery = e.target.value;
          setQuery(nextQuery);
          if (nextQuery.length < 2) {
            setResults([]);
          }
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        placeholder="Search DID, repo, bounty..."
        className="w-full rounded-md border border-green-500/20 bg-zinc-950 px-3 py-2 font-mono text-sm text-green-100 outline-none placeholder:text-zinc-700 focus:border-green-400"
      />

      {showResults && query.length >= 2 && (
        <div className="absolute top-full left-0 mt-1 w-full rounded-lg border border-green-500/20 bg-black shadow-lg z-50 max-h-64 overflow-auto">
          {loading ? (
            <div className="p-3 text-sm text-zinc-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-3 text-sm text-zinc-500">No results found</div>
          ) : (
            results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result)}
                className="w-full px-3 py-2 text-left hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    {typeIcons[result.type] || "🔍"}
                  </span>
                  <div>
                    <div className="text-sm text-white">{result.title}</div>
                    <div className="text-xs text-zinc-500 font-mono">
                      {result.subtitle}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
