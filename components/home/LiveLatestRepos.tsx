"use client";

import { useEffect, useState } from "react";

type RepoRow = {
  id: string;
  name: string;
  owner: string;
  activity: string;
  metric: string;
  age: string;
};

type GitlawbRepoRow = {
  id?: string;
  name?: string;
  owner_did?: string;
  description?: string | null;
  star_count?: number;
  updated_at?: string;
};

export default function LiveLatestRepos({ initialRepos }: { initialRepos: RepoRow[] }) {
  const [repos, setRepos] = useState(initialRepos);

  useEffect(() => {
    let mounted = true;

    async function loadRepos() {
      try {
        const res = await fetch(`/api/gitlawb/repos?limit=4&t=${Date.now()}`, {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();
        const rows = (Array.isArray(data) ? data : []).map(formatRepo);

        if (mounted && rows.length > 0) {
          setRepos(rows);
        }
      } catch {
        // Keep cached rows visible if live fetch is temporarily unavailable.
      }
    }

    void loadRepos();
    const timer = window.setInterval(loadRepos, 15000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  if (repos.length === 0) {
    return <div className="px-4 py-6 text-center text-sm text-zinc-500">No repos cached yet</div>;
  }

  return (
    <div className="divide-y divide-green-500/10">
      {repos.map((repo) => (
        <div
          key={repo.id}
          className="grid gap-3 px-4 py-3 text-sm sm:grid-cols-[88px_1fr_auto] sm:items-center"
        >
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md border border-green-500/20 bg-green-500/10 font-mono text-xs text-green-300">
              R
            </span>
            <div className="font-mono text-xs text-green-400">{repo.id}</div>
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-100">{repo.name}</p>
            <p className="mt-1 truncate text-xs text-zinc-500">
              Owner <span className="font-mono text-zinc-300">{repo.owner}</span> - {repo.activity}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
            <p className="font-mono text-xs text-green-200">{repo.metric}</p>
            <p className="mt-1 text-xs text-zinc-600">{repo.age}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatRepo(repo: GitlawbRepoRow): RepoRow {
  const id = repo.id || `${repo.owner_did || "repo"}/${repo.name || "unknown"}`;
  const owner = repo.owner_did || "unknown";

  return {
    id: `0xrepo...${id.slice(-4)}`,
    name: repo.name || "unknown repo",
    owner: owner.length > 14 ? `${owner.slice(8, 16)}...${owner.slice(-4)}` : owner,
    activity: repo.description || "no description",
    metric: `${repo.star_count || 0} stars`,
    age: repo.updated_at ? timeAgo(repo.updated_at) : "unknown",
  };
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${Math.max(seconds, 0)} secs ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}
