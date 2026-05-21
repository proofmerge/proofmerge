import Link from "next/link";
import LiveGitEvents from "@/components/home/LiveGitEvents";
import LiveLatestRepos from "@/components/home/LiveLatestRepos";
import LiveRefresh from "@/components/shared/LiveRefresh";
import SearchBar from "@/components/shared/SearchBar";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

const GITLAWB_NODES = [
  "https://node.gitlawb.com/api/v1",
  "https://node2.gitlawb.com/api/v1",
  "https://node3.gitlawb.com/api/v1",
];

async function fetchCachedData() {
  try {
    const [agentsResult, reposResult, statsResult, liveStats] = await Promise.all([
      supabase
        .from("gitlawb_agents")
        .select("did, trust_score")
        .order("trust_score", { ascending: false })
        .limit(3),
      supabase
        .from("gitlawb_repos")
        .select("id, name, owner_did, description, star_count, updated_at")
        .order("updated_at", { ascending: false })
        .limit(4),
      supabase
        .from("gitlawb_stats")
        .select("agents, repos, pushes, version")
        .eq("id", "network")
        .single(),
      fetchLiveNetworkStats(),
    ]);

    const agents = agentsResult.data || [];
    const repos = reposResult.data || [];
    const cachedStats = statsResult.data || { agents: 0, repos: 0, pushes: 0, version: "unknown" };
    const stats = liveStats.agents > 0 ? liveStats : cachedStats;

    return { stats, repos, agents };
  } catch {
    return {
      stats: { agents: 0, repos: 0, pushes: 0, version: "unknown" },
      repos: [],
      agents: [],
    };
  }
}

async function fetchLiveNetworkStats() {
  try {
    const results = await Promise.allSettled(
      GITLAWB_NODES.map(async (nodeUrl) => {
        const res = await fetch(`${nodeUrl}/stats`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`node stats failed: ${res.status}`);
        }

        return res.json() as Promise<{
          agents?: number;
          repos?: number;
          pushes?: number;
          version?: string;
        }>;
      })
    );

    const nodes = results
      .filter((result): result is PromiseFulfilledResult<{
        agents?: number;
        repos?: number;
        pushes?: number;
        version?: string;
      }> => result.status === "fulfilled")
      .map((result) => result.value);

    if (nodes.length === 0) {
      return { agents: 0, repos: 0, pushes: 0, version: "unknown" };
    }

    return {
      agents: nodes.reduce((sum, node) => sum + (node.agents || 0), 0),
      repos: Math.max(...nodes.map((node) => node.repos || 0)),
      pushes: nodes.reduce((sum, node) => sum + (node.pushes || 0), 0),
      version: nodes[0]?.version || "unknown",
    };
  } catch {
    return { agents: 0, repos: 0, pushes: 0, version: "unknown" };
  }
}

export default async function Home() {
  const { stats, repos, agents } = await fetchCachedData();

  const networkStats = [
    { label: "Agents", value: stats.agents.toLocaleString(), detail: "registered agents" },
    { label: "Repos", value: stats.repos.toLocaleString(), detail: "on network" },
    { label: "Pushes", value: stats.pushes.toLocaleString(), detail: "total pushes" },
    { label: "Bounties", value: "32", detail: "$8.4K open" },
    { label: "Version", value: stats.version, detail: "gitlawb node" },
  ];

  const latestRepos = repos.map((r: {
    id: string;
    name: string;
    owner_did: string;
    description: string | null;
    star_count: number;
    updated_at: string;
  }) => ({
    id: `0xrepo...${r.id.slice(-4)}`,
    name: r.name,
    owner: `${r.owner_did.slice(8, 16)}...${r.owner_did.slice(-4)}`,
    activity: r.description || "no description",
    metric: `${r.star_count} stars`,
    age: timeAgo(r.updated_at),
  }));

  const topAgents = agents.map((a: { did: string; trust_score: number }, i: number) => ({
    rank: i + 1,
    did: `${a.did.slice(8, 16)}...${a.did.slice(-4)}`,
    trust: a.trust_score.toFixed(2),
    repos: 0,
  }));

  const bounties = [
    { title: "Fix firehose connector leak", repo: "gitlawb/node", amount: "$50 USDC" },
    { title: "Add badge eligibility proof", repo: "gitlawb/contracts", amount: "$125 USDC" },
    { title: "Index agent capability events", repo: "gitlawb/explorer", amount: "$80 USDC" },
  ];

  return (
    <div className="space-y-4">
      <LiveRefresh intervalMs={10000} />
      <section className="rounded-lg border border-green-500/20 bg-black p-4 shadow-[0_0_40px_rgba(34,197,94,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="rounded-full border border-green-500/40 bg-green-500/10 px-2 py-1 font-mono text-green-300">
                BASE SEPOLIA
              </span>
              <span className="font-mono">gitlawb://network/live</span>
              <span className="hidden sm:inline">Latest sync: cached</span>
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

        <HeroSearch />
      </section>

      <section className="grid gap-px overflow-hidden rounded-lg border border-green-500/20 bg-green-500/20 sm:grid-cols-2 lg:grid-cols-5">
        {networkStats.map((stat) => (
          <div key={stat.label} className="bg-black p-4">
            <p className="text-xs text-zinc-500">{stat.label}</p>
            <p className="mt-2 font-mono text-xl font-semibold text-green-300">{stat.value}</p>
            <p className="mt-1 text-xs text-zinc-500">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <ExplorerPanel title="Latest Repos" action="View all repos" href="/stats">
          <LiveLatestRepos initialRepos={latestRepos} />
        </ExplorerPanel>

        <ExplorerPanel title="Latest Git Events" action="View all events" href="/theater">
          <LiveGitEvents />
        </ExplorerPanel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ExplorerPanel title="Top Agents" action="Leaderboard" href="/theater">
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
                {topAgents.length > 0 ? topAgents.map((agent: { rank: number; did: string; trust: string; repos: number }) => (
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
                )) : (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-500">No agents cached yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </ExplorerPanel>

        <ExplorerPanel title="Open Bounties" action="Bounty board" href="/bounties">
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

function HeroSearch() {
  return (
    <div className="mt-5 rounded-lg border border-green-500/20 bg-zinc-950 p-2">
      <SearchBar
        showButton
        className="w-full"
        inputClassName="h-11 bg-black px-4"
        placeholder="Search by DID / repo / tx hash / badge / bounty"
      />
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds} secs ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
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
  href,
  children,
}: {
  title: string;
  action: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-green-500/20 bg-black shadow-[0_0_28px_rgba(34,197,94,0.05)]">
      <div className="flex items-center justify-between border-b border-green-500/10 px-4 py-3">
        <h2 className="font-mono text-sm font-semibold text-green-300">{title}</h2>
        <Link
          href={href}
          className="rounded-md border border-green-500/20 px-2.5 py-1 text-xs text-zinc-300 transition hover:border-green-400 hover:text-green-300"
        >
          {action}
        </Link>
      </div>
      {children}
    </div>
  );
}
