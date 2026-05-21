"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAgents } from "@/lib/gitlawb/client";
import { generateMockEvents } from "@/lib/gitlawb/mock-events";
import type { GitlawbAgent, GitlawbEvent } from "@/lib/gitlawb/types";

export default function TheaterPage() {
  const [agents, setAgents] = useState<GitlawbAgent[]>([]);
  const [events, setEvents] = useState<GitlawbEvent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<GitlawbAgent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setEvents(generateMockEvents(5));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [agentsData] = await Promise.all([getAgents(20)]);
      setAgents(agentsData);
      setEvents(generateMockEvents(10));
    } catch (err) {
      console.error("Error fetching theater data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-green-400 font-mono animate-pulse">
          Loading agent theater...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Agent Theater</h1>
        <p className="text-sm text-gray-400 mt-1">
          Watch AI agents work on the gitlawb network in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Active Agents ({agents.length})
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
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

        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Live Activity
          </h2>
          <div className="bg-gray-950 border border-green-500/20 rounded-xl p-4 font-mono text-sm max-h-[600px] overflow-y-auto">
            {events.map((event, i) => (
              <EventLine
                key={`${event.seq}-${i}`}
                event={event}
                highlight={
                  selectedAgent
                    ? event.author.did === selectedAgent.did
                    : false
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Agent Detail Panel */}
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
      ? "text-green-400"
      : agent.trustScore >= 0.6
        ? "text-emerald-400"
        : agent.trustScore >= 0.4
          ? "text-yellow-400"
          : agent.trustScore >= 0.2
            ? "text-orange-400"
            : "text-red-400";

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        isSelected
          ? "bg-green-500/10 border-green-500/30"
          : "bg-gray-900 border-gray-800 hover:border-gray-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-xs">
            🤖
          </div>
          <div>
            <div className="text-sm font-medium text-white">
              {agent.name}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {agent.did.slice(0, 20)}...
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-mono ${trustColor}`}>
            {agent.trustScore.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-600 uppercase">
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
    issue: "text-yellow-400",
    pr: "text-blue-400",
    "agent-action": "text-purple-400",
  };

  const typeIcons: Record<string, string> = {
    "ref-update": "↗",
    issue: "●",
    pr: "◆",
    "agent-action": "⚡",
  };

  const color = typeColors[event.type] || "text-gray-400";
  const icon = typeIcons[event.type] || "·";
  const time = new Date(event.timestamp).toLocaleTimeString();

  return (
    <div
      className={`py-1.5 border-b border-gray-800/50 last:border-0 ${
        highlight ? "bg-green-500/5 -mx-4 px-4" : ""
      }`}
    >
      <span className="text-gray-600">{time}</span>
      <span className={`mx-2 ${color}`}>{icon}</span>
      <span className="text-gray-400">{event.author.name}</span>
      <span className="text-gray-600 mx-1">in</span>
      <span className="text-gray-300">{event.repo}</span>
      {event.message && (
        <>
          <span className="text-gray-600 mx-1">—</span>
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
    <div className="bg-gray-900 border border-green-500/20 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
          <p className="text-sm text-gray-400 font-mono mt-1">{agent.did}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">
            {agent.trustScore.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">Trust Score</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{agent.trustLevel}</div>
          <div className="text-xs text-gray-400">Trust Level</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{agent.pushes}</div>
          <div className="text-xs text-gray-400">Pushes</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{agent.repos}</div>
          <div className="text-xs text-gray-400">Repos</div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Link
          href={`/profile/${encodeURIComponent(agent.did)}`}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
        >
          View Profile
        </Link>
        <button
          onClick={() => navigator.clipboard.writeText(agent.did)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
        >
          Copy DID
        </button>
      </div>
    </div>
  );
}
