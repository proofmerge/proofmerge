"use client";

import { useEffect, useState } from "react";

type GitlawbEvent = {
  type?: string;
  repo?: string;
  author?: { did?: string; name?: string };
  message?: string;
  timestamp?: string;
  seq?: number;
  signatures?: string[];
};

type ExplorerEvent = {
  type: string;
  hash: string;
  action: string;
  from: string;
  to: string;
  value: string;
  age: string;
};

const fallbackEvents: ExplorerEvent[] = [
  {
    type: "Agent",
    hash: "0xddcf...9408",
    action: "claude-agent-47 pushed 3 commits",
    from: "z6MkAgent...47",
    to: "gitlawb/explorer",
    value: "3 commits",
    age: "13 secs ago",
  },
  {
    type: "PR",
    hash: "0x0cb3...8586",
    action: "dev-satoshi opened pull request",
    from: "z6MkDev...A91",
    to: "gitlawb/contracts",
    value: "review",
    age: "18 secs ago",
  },
  {
    type: "Issue",
    hash: "0x7d35...f7a1",
    action: "agent-coder created issue",
    from: "z6MkCode...730",
    to: "gitlawb/node",
    value: "bug",
    age: "31 secs ago",
  },
  {
    type: "Badge",
    hash: "0x2562...a83e",
    action: "First Contribution badge minted",
    from: "ProofMergeBadge",
    to: "dev-ada.base",
    value: "ERC-1155",
    age: "44 secs ago",
  },
];

export default function LiveGitEvents() {
  const [events, setEvents] = useState<ExplorerEvent[]>(fallbackEvents);

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      try {
        const res = await fetch(`/api/gitlawb/events?limit=4&t=${Date.now()}`, {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();
        const rows = Array.isArray(data) ? data : data.events || [];
        const formatted = rows.slice(0, 4).map(formatEvent);

        if (mounted && formatted.length > 0) {
          setEvents(formatted);
        }
      } catch {
        // Keep the last visible data instead of flashing an error state.
      }
    }

    void loadEvents();
    const timer = window.setInterval(loadEvents, 5000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="divide-y divide-green-500/10">
      {events.map((event) => (
        <div
          key={`${event.hash}-${event.action}`}
          className="grid gap-3 px-4 py-3 text-sm lg:grid-cols-[96px_1fr_88px] lg:items-center"
        >
          <div>
            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-xs text-green-300">
              {event.type}
            </span>
            <p className="mt-2 font-mono text-xs text-green-400">{event.hash}</p>
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-100">{event.action}</p>
            <p className="mt-1 truncate text-xs text-zinc-500">
              From <span className="font-mono text-zinc-300">{event.from}</span> to{" "}
              <span className="font-mono text-zinc-300">{event.to}</span>
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 lg:block lg:text-right">
            <p className="font-mono text-xs text-green-200">{event.value}</p>
            <p className="mt-1 text-xs text-zinc-600">{event.age}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatEvent(event: GitlawbEvent): ExplorerEvent {
  const did = event.author?.did || "did:key:unknown";
  const hash = event.signatures?.[0] || String(event.seq || did);
  const type = event.type || "event";

  return {
    type: typeLabel(type),
    hash: `0x${hash.slice(-8)}`,
    action: event.message || `${typeLabel(type)} activity`,
    from: truncateDid(did),
    to: event.repo || "gitlawb/network",
    value: event.repo?.split("/").pop() || "event",
    age: event.timestamp ? timeAgo(event.timestamp) : "just now",
  };
}

function truncateDid(did: string) {
  const clean = did.replace("did:key:", "");
  if (clean.length <= 14) return clean;
  return `${clean.slice(0, 8)}...${clean.slice(-4)}`;
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    "ref-update": "Push",
    issue: "Issue",
    pr: "PR",
    "agent-action": "Agent",
  };

  return labels[type] || "Event";
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
