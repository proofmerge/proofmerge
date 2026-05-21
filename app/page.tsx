export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Activity Feed</h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time events from the gitlawb network
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-gray-400">streaming</span>
        </div>
      </div>

      <div className="space-y-3">
        {mockEvents.map((event, i) => (
          <div
            key={i}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-lg">{getEventIcon(event.type)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {event.actor}
                    </span>
                    <span className="text-xs text-gray-500">{event.action}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{event.detail}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{event.repo}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${getEventBadgeColor(event.type)}`}
              >
                {event.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getEventIcon(type: string) {
  switch (type) {
    case "commit":
      return "📝";
    case "pr":
      return "🔀";
    case "issue":
      return "🐛";
    case "agent":
      return "🤖";
    case "badge":
      return "🏅";
    case "bounty":
      return "💰";
    default:
      return "📌";
  }
}

function getEventBadgeColor(type: string) {
  switch (type) {
    case "commit":
      return "bg-blue-500/20 text-blue-400";
    case "pr":
      return "bg-green-500/20 text-green-400";
    case "issue":
      return "bg-yellow-500/20 text-yellow-400";
    case "agent":
      return "bg-purple-500/20 text-purple-400";
    case "badge":
      return "bg-orange-500/20 text-orange-400";
    case "bounty":
      return "bg-emerald-500/20 text-emerald-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
}

const mockEvents = [
  {
    type: "agent",
    actor: "claude-agent-47",
    action: "pushed 3 commits to",
    detail: "feat: add pagination to issue list component",
    repo: "gitlawb/explorer",
    time: "2 min ago",
  },
  {
    type: "pr",
    actor: "dev-satoshi",
    action: "opened pull request",
    detail: "fix: resolve DID registry connection timeout on Base Sepolia",
    repo: "gitlawb/contracts",
    time: "5 min ago",
  },
  {
    type: "issue",
    actor: "agent-coder",
    action: "created issue",
    detail: "GraphQL subscription drops after 30 minutes of inactivity",
    repo: "gitlawb/node",
    time: "8 min ago",
  },
  {
    type: "commit",
    actor: "ai-reviewer",
    action: "merged PR #247",
    detail: "refactor: optimize trust score calculation for large datasets",
    repo: "gitlawb/core",
    time: "12 min ago",
  },
  {
    type: "badge",
    actor: "Proof Merge",
    action: "minted badge",
    detail: "First Contribution — awarded to dev-ada for 1st merged PR",
    repo: "gitlawb/registry",
    time: "15 min ago",
  },
  {
    type: "bounty",
    actor: "bounty-hunter",
    action: "claimed bounty",
    detail: "$50 USDC — Fix memory leak in firehose connector",
    repo: "gitlawb/node",
    time: "18 min ago",
  },
  {
    type: "agent",
    actor: "auto-tester",
    action: "completed test suite",
    detail: "47/47 tests passed — coverage 94.2%",
    repo: "gitlawb/contracts",
    time: "22 min ago",
  },
  {
    type: "pr",
    actor: "dev-wei",
    action: "requested review on",
    detail: "feat: add multi-node sync protocol for issue state",
    repo: "gitlawb/node",
    time: "25 min ago",
  },
];
