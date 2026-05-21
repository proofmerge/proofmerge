import type { GitlawbEvent } from "./types";

// Generate realistic mock events based on gitlawb network activity
export function generateMockEvents(count: number = 10): GitlawbEvent[] {
  const agents = [
    "z6MkiauPKiwNFvijyQ6aG8MGpiap2sENv8JBFa5esQR2VpJU",
    "z6Mkg3JGdFdEj8G71VKYXJ4e5XkXWUyJESuvRTTVygr4QnKD",
    "z6MktmKxVdA3a5hNb9Up4bA8tkC8ZEpnSwze2TKWmjgLWxpx",
    "z6MkmMgymvnAn9tbKVEyZ8vwvmUJ1weR1xYgKuF8fG7nqijM",
    "z6MkuKPHiFQ4pwtSkfMNmdfMeeWMFcbVE6LW1B5Fnkie1Lp3",
  ];

  const repos = [
    "gitlawb/openclaude",
    "gitlawb/node",
    "gitlawb/contracts",
    "gitlawb/explorer",
    "gitlawb/sdk",
  ];

  const eventTypes: GitlawbEvent["type"][] = [
    "ref-update",
    "issue",
    "pr",
    "agent-action",
  ];

  const messages = {
    "ref-update": [
      "feat: add pagination to issue list",
      "fix: resolve DID registry connection timeout",
      "refactor: optimize trust score calculation",
      "docs: update API documentation",
      "feat: implement multi-node sync protocol",
    ],
    issue: [
      "GraphQL subscription drops after 30 min inactivity",
      "Memory leak in firehose connector",
      "Add support for did:web resolution",
      "Improve error handling in UCAN delegation",
    ],
    pr: [
      "feat: add real-time event streaming",
      "fix: resolve gossipsub message ordering",
      "feat: implement agent capability discovery",
      "refactor: migrate to new DID registry",
    ],
    "agent-action": [
      "completed test suite (47/47 passed)",
      "deployed new contract to Base Sepolia",
      "reviewed 3 pull requests",
      "published npm package v0.2.0",
    ],
  };

  const events: GitlawbEvent[] = [];

  for (let i = 0; i < count; i++) {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const repo = repos[Math.floor(Math.random() * repos.length)];
    const msgs = messages[type];
    const message = msgs[Math.floor(Math.random() * msgs.length)];

    events.push({
      type,
      repo,
      author: {
        did: `did:key:${agent}`,
        name: `${agent.slice(0, 12)}...`,
      },
      timestamp: new Date(
        Date.now() - Math.floor(Math.random() * 3600000)
      ).toISOString(),
      seq: Date.now() + i,
      message,
      ref: type === "ref-update" ? "refs/heads/main" : undefined,
    });
  }

  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
