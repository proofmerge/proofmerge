"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface SearchResult {
  type: "profile" | "bounty" | "agent" | "repo";
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

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      void search(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  async function search(q: string) {
    setLoading(true);
    const allResults: SearchResult[] = [];

    try {
      // Search Supabase profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, did, display_name")
        .or(`display_name.ilike.%${q}%,did.ilike.%${q}%`)
        .limit(3);

      if (profiles) {
        for (const p of profiles) {
          allResults.push({
            type: "profile",
            id: p.id,
            title: p.display_name || "Anonymous",
            subtitle: p.did,
            url: `/profile/${encodeURIComponent(p.did)}`,
          });
        }
      }

      // Search Supabase bounties
      const { data: bounties } = await supabase
        .from("bounties")
        .select("id, title, repo, status")
        .or(`title.ilike.%${q}%,repo.ilike.%${q}%`)
        .limit(3);

      if (bounties) {
        for (const b of bounties) {
          allResults.push({
            type: "bounty",
            id: b.id.toString(),
            title: b.title,
            subtitle: `${b.repo} • ${b.status}`,
            url: "/bounties",
          });
        }
      }

      // Search gitlawb agents (fetch 10, filter locally)
      try {
        const res = await fetch(
          `https://node.gitlawb.com/api/v1/agents?limit=10`
        );
        if (res.ok) {
          const data = await res.json();
          const agents = data.agents || [];
          const filtered = agents.filter(
            (a: { did: string }) =>
              a.did.toLowerCase().includes(q.toLowerCase())
          );
          for (const a of filtered.slice(0, 3)) {
            allResults.push({
              type: "agent",
              id: a.did,
              title: a.did.slice(8, 20) + "...",
              subtitle: `Trust: ${a.trust_score.toFixed(2)}`,
              url: `/profile/${encodeURIComponent(a.did)}`,
            });
          }
        }
      } catch {
        // ignore gitlawb errors
      }

      // Search gitlawb repos (fetch 10, filter locally)
      try {
        const res = await fetch(
          `https://node.gitlawb.com/api/v1/repos?limit=10`
        );
        if (res.ok) {
          const data = await res.json();
          const repos = Array.isArray(data) ? data : [];
          const filtered = repos.filter(
            (r: { name: string; owner_did: string }) =>
              r.name.toLowerCase().includes(q.toLowerCase()) ||
              r.owner_did.toLowerCase().includes(q.toLowerCase())
          );
          for (const r of filtered.slice(0, 3)) {
            allResults.push({
              type: "repo",
              id: r.id || r.name,
              title: `${r.owner_did.slice(8, 20)}.../${r.name}`,
              subtitle: r.description || "gitlawb repo",
              url: "/stats",
            });
          }
        }
      } catch {
        // ignore gitlawb errors
      }
    } catch (err) {
      console.error("Search error:", err);
    }

    setResults(allResults);
    setLoading(false);
  }

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
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
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
