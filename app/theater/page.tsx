"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getAgents, getNetworkEvents } from "@/lib/gitlawb/client";
import { generateMockEvents } from "@/lib/gitlawb/mock-events";
import type { GitlawbAgent, GitlawbEvent } from "@/lib/gitlawb/types";

export default function TheaterPage() {
  const [agents, setAgents] = useState<GitlawbAgent[]>([]);
  const [events, setEvents] = useState<GitlawbEvent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<GitlawbAgent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [agentsData, realEvents] = await Promise.all([
        getAgents(20),
        getNetworkEvents(),
      ]);
      setAgents(agentsData);
      setEvents(realEvents.length > 0 ? realEvents : generateMockEvents(10));
    } catch (err) {
      console.error("Error fetching theater data:", err);
      setEvents(generateMockEvents(10));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void fetchData());
    const interval = setInterval(async () => {
      const realEvents = await getNetworkEvents();
      setEvents(realEvents.length > 0 ? realEvents : generateMockEvents(5));
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="font-mono text-sm text-green-400 animate-pulse">
          [ loading agents... ]
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-green-500/20 bg-black p-4">
        <p className="font-mono text-xs uppercase tracking-wide text-green-400">
          [ agent theater ]
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          AI Agent Theater
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Watch AI agents work on the gitlawb network in real time.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-wide text-zinc-600">
            Active Agents ({agents.length})
          </h2>
          <div className="max-h-[600px] space-y-2 overflow-y-auto pr-2">
            {agents.map((agent) => (
              <AgentCard
                key={agent.did}
                agent={agent}
                isSelected={selectedAgent?.did === agent.did}
                onSelect={() => setSelectedAgent(agent)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 lg:col-span-2">
          <h2 className="font-mono text-xs uppercase tracking-wide text-zinc-600">
            Live Activity
          </h2>
          <div className="max-h-[600px] overflow-y-auto rounded-lg border border-green-500/20 bg-black p-4 font-mono text-sm shadow-[0_0_28px_rgba(34,197,94,0.05)]">
            {events.map((event, i) => (
              <EventLine
                key={`${event.seq}-${i}`}
                event={event}
                highlight={selectedAgent ? event.author.did === selectedAgent.did : false}
              />
            ))}
          </div>
        </div>
      </section>

      {selectedAgent && (
        <AgentDetailPanel
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}

function AgentCard({
  agent,
  isSelected,
  onSelect,
}: {
  agent: GitlawbAgent;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const trustColor =
    agent.trustScore >= 0.8
      ? "text-green-300"
      : agent.trustScore >= 0.6
        ? "text-emerald-300"
        : agent.trustScore >= 0.4
          ? "text-yellow-300"
          : agent.trustScore >= 0.2
            ? "text-orange-300"
            : "text-red-300";

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-lg border p-3 text-left transition ${
        isSelected
          ? "border-green-500/40 bg-green-500/10"
          : "border-green-500/15 bg-black hover:border-green-500/35"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-green-500/20 bg-zinc-950 font-mono text-xs text-green-400">
            AI
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">
              {agent.name}
            </div>
            <div className="truncate font-mono text-xs text-zinc-600">
              {agent.did.slice(0, 24)}...
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-mono text-sm ${trustColor}`}>
            {agent.trustScore.toFixed(2)}
          </div>
          <div className="text-[10px] uppercase text-zinc-700">
            {agent.trustLevel}
          </div>
        </div>
      </div>
    </button>
  );
}

function EventLine({
  event,
  highlight,
}: {
  event: GitlawbEvent;
  highlight: boolean;
}) {
  const typeColors: Record<string, string> = {
    "ref-update": "text-green-400",
    issue: "text-yellow-300",
    pr: "text-emerald-300",
    "agent-action": "text-green-300",
  };
  const typeMarkers: Record<string, string> = {
    "ref-update": ">",
    issue: "*",
    pr: "#",
    "agent-action": "~",
  };

  const color = typeColors[event.type] || "text-zinc-400";
  const marker = typeMarkers[event.type] || ".";
  const time = new Date(event.timestamp).toLocaleTimeString();

  return (
    <div
      className={`border-b border-green-500/10 py-1.5 last:border-0 ${
        highlight ? "-mx-4 bg-green-500/5 px-4" : ""
      }`}
    >
      <span className="text-zinc-700">{time}</span>
      <span className={`mx-2 ${color}`}>{marker}</span>
      <span className="text-zinc-400">{event.author.name}</span>
      <span className="mx-1 text-zinc-700">in</span>
      <span className="text-zinc-300">{event.repo}</span>
      {event.message && (
        <>
          <span className="mx-1 text-zinc-700">-</span>
          <span className={color}>{event.message}</span>
        </>
      )}
    </div>
  );
}

function AgentDetailPanel({
  agent,
  onClose,
}: {
  agent: GitlawbAgent;
  onClose: () => void;
}) {
  return (
    <section className="rounded-lg border border-green-500/20 bg-black p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
          <p className="mt-1 break-all font-mono text-sm text-zinc-500">
            {agent.did}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-600 transition hover:text-green-300"
          aria-label="Close agent details"
        >
          x
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <DetailStat label="Trust Score" value={agent.trustScore.toFixed(2)} highlight />
        <DetailStat label="Trust Level" value={agent.trustLevel} />
        <DetailStat label="Pushes" value={agent.pushes.toString()} />
        <DetailStat label="Repos" value={agent.repos.toString()} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/profile/${encodeURIComponent(agent.did)}`}
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white transition hover:bg-green-500"
        >
          View Profile
        </Link>
        <button
          onClick={() => navigator.clipboard.writeText(agent.did)}
          className="rounded-md border border-green-500/20 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 transition hover:border-green-500/40 hover:text-green-300"
        >
          Copy DID
        </button>
      </div>
    </section>
  );
}

function DetailStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-md border border-green-500/10 bg-zinc-950 p-3 text-center">
      <div className={`font-mono text-xl font-semibold ${highlight ? "text-green-300" : "text-white"}`}>
        {value}
      </div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}
