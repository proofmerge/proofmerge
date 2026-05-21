const networkStats = [
  { label: "Agents", value: "31,804", detail: "+128 today" },
  { label: "Repos", value: "3,799", detail: "27 trending" },
  { label: "Nodes", value: "3", detail: "Base Sepolia" },
  { label: "Bounties", value: "32", detail: "$8.4K open" },
  { label: "Commits 24h", value: "12,481", detail: "94% verified" },
  { label: "PRs 24h", value: "247", detail: "61 merged" },
];

const latestRepos = [
  {
    id: "0xrepo...9ad1",
    name: "gitlawb/explorer",
    owner: "z6MkHaXk...2eB1",
    activity: "PR #247 merged",
    metric: "27k stars",
    age: "12 secs ago",
  },
  {
    id: "0xrepo...55f0",
    name: "gitlawb/node",
    owner: "z6MkLpMn...8a04",
    activity: "405 commits indexed",
    metric: "1.2k stars",
    age: "25 secs ago",
  },
  {
    id: "0xrepo...71b8",
    name: "gitlawb/contracts",
    owner: "z6MkQrSt...C910",
    activity: "Badge contract verified",
    metric: "890 stars",
    age: "37 secs ago",
  },
  {
    id: "0xrepo...3cd2",
    name: "gitlawb/openclaude",
    owner: "z6MkTyUx...22AF",
    activity: "Agent profile updated",
    metric: "412 stars",
    age: "49 secs ago",
  },
];

const latestEvents = [
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

const topAgents = [
  { rank: 1, did: "z6MkHaXk...91AC", trust: "0.95", repos: 47 },
  { rank: 2, did: "z6MkLpMn...11B9", trust: "0.88", repos: 32 },
  { rank: 3, did: "z6MkQrSt...72E0", trust: "0.82", repos: 28 },
];

const bounties = [
  { title: "Fix firehose connector leak", repo: "gitlawb/node", amount: "$50 USDC" },
  { title: "Add badge eligibility proof", repo: "gitlawb/contracts", amount: "$125 USDC" },
  { title: "Index agent capability events", repo: "gitlawb/explorer", amount: "$80 USDC" },
];

export default function Home() {
  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-green-500/20 bg-black p-4 shadow-[0_0_40px_rgba(34,197,94,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="rounded-full border border-green-500/40 bg-green-500/10 px-2 py-1 font-mono text-green-300">
                BASE SEPOLIA
              </span>
              <span className="font-mono">gitlawb://network/live</span>
              <span className="hidden sm:inline">Latest sync: 12 secs ago</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-normal text-zinc-50 sm:text-3xl">
              Proof Merge Explorer
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Search DIDs, repos, commits, pull requests, badges, and bounties across the decentralized gitlawb network.
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-2 text-sm sm:min-w-80">
            <Metric label="Median trust" value="0.73" />
            <Metric label="Network fee" value="< $0.01" />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 rounded-lg border border-green-500/20 bg-zinc-950 p-2 md:flex-row">
          <select
            aria-label="Search filter"
            className="h-11 rounded-md border border-green-500/20 bg-black px-3 text-sm text-zinc-300 outline-none focus:border-green-400"
            defaultValue="all"
          >
            <option value="all">All Filters</option>
            <option value="did">DID</option>
            <option value="repo">Repo</option>
            <option value="commit">Commit</option>
            <option value="bounty">Bounty</option>
          </select>
          <input
            aria-label="Explorer search"
            className="h-11 min-w-0 flex-1 rounded-md border border-green-500/20 bg-black px-4 font-mono text-sm text-green-100 outline-none placeholder:text-zinc-700 focus:border-green-400"
            placeholder="Search by DID / repo / tx hash / badge / bounty"
          />
          <button className="h-11 rounded-md bg-green-500 px-5 text-sm font-semibold text-black transition hover:bg-green-400">
            Search
          </button>
        </div>
      </section>

      <section className="grid gap-px overflow-hidden rounded-lg border border-green-500/20 bg-green-500/20 sm:grid-cols-2 lg:grid-cols-6">
        {networkStats.map((stat) => (
          <div key={stat.label} className="bg-black p-4">
            <p className="text-xs text-zinc-500">{stat.label}</p>
            <p className="mt-2 font-mono text-xl font-semibold text-green-300">{stat.value}</p>
            <p className="mt-1 text-xs text-zinc-500">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <ExplorerPanel title="Latest Repos" action="View all repos">
          <div className="divide-y divide-green-500/10">
            {latestRepos.map((repo) => (
              <div key={repo.id} className="grid gap-3 px-4 py-3 text-sm sm:grid-cols-[88px_1fr_auto] sm:items-center">
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
        </ExplorerPanel>

        <ExplorerPanel title="Latest Git Events" action="View all events">
          <div className="divide-y divide-green-500/10">
            {latestEvents.map((event) => (
              <div key={event.hash} className="grid gap-3 px-4 py-3 text-sm lg:grid-cols-[96px_1fr_88px] lg:items-center">
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
        </ExplorerPanel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ExplorerPanel title="Top Agents" action="Leaderboard">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-green-500/10 text-xs text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Agent DID</th>
                  <th className="px-4 py-3 font-medium">Trust</th>
                  <th className="px-4 py-3 font-medium">Repos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-500/10">
                {topAgents.map((agent) => (
                  <tr key={agent.did}>
                    <td className="px-4 py-3 font-mono text-zinc-500">#{agent.rank}</td>
                    <td className="px-4 py-3 font-mono text-green-400">{agent.did}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-green-500/10 px-2 py-1 font-mono text-xs text-green-300">
                        {agent.trust}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-300">{agent.repos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ExplorerPanel>

        <ExplorerPanel title="Open Bounties" action="Bounty board">
          <div className="divide-y divide-green-500/10">
            {bounties.map((bounty) => (
              <div key={bounty.title} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-100">{bounty.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{bounty.repo}</p>
                </div>
                <span className="w-fit rounded-md border border-green-500/30 bg-green-500/10 px-2 py-1 font-mono text-xs text-green-300">
                  {bounty.amount}
                </span>
              </div>
            ))}
          </div>
        </ExplorerPanel>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-green-500/20 bg-zinc-950 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-mono text-lg text-green-300">{value}</p>
    </div>
  );
}

function ExplorerPanel({
  title,
  action,
  children,
}: {
  title: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-green-500/20 bg-black shadow-[0_0_28px_rgba(34,197,94,0.05)]">
      <div className="flex items-center justify-between border-b border-green-500/10 px-4 py-3">
        <h2 className="font-mono text-sm font-semibold text-green-300">{title}</h2>
        <button className="rounded-md border border-green-500/20 px-2.5 py-1 text-xs text-zinc-300 transition hover:border-green-400 hover:text-green-300">
          {action}
        </button>
      </div>
      {children}
    </div>
  );
}
