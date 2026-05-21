"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface SearchResult {
  type: "profile" | "bounty" | "repo";
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
      const [profiles, bounties] = await Promise.all([
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

      setResults([...profileResults, ...bountyResults]);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query.length < 2) {
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
        placeholder="Search agents, bounties..."
        className="w-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
      />

      {showResults && query.length >= 2 && (
        <div className="absolute top-full left-0 mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50 max-h-64 overflow-auto">
          {loading ? (
            <div className="p-3 text-sm text-gray-400">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-3 text-sm text-gray-400">No results found</div>
          ) : (
            results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result)}
                className="w-full px-3 py-2 text-left hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {result.type === "profile"
                      ? "👤"
                      : result.type === "bounty"
                        ? "💰"
                        : "📁"}
                  </span>
                  <div>
                    <div className="text-sm text-white">{result.title}</div>
                    <div className="text-xs text-gray-400">
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
