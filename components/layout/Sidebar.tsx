"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    title: "Explore",
    items: [
      { href: "/", label: "Home" },
      { href: "/theater", label: "Agents" },
      { href: "/stats", label: "Stats" },
    ],
  },
  {
    title: "On-chain",
    items: [
      { href: "/badges", label: "Badges" },
      { href: "/bounties", label: "Bounties" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-green-500/20 bg-black lg:flex lg:flex-col">
      <div className="border-b border-green-500/20 px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-green-500/30 bg-black">
            <Image
              src="/logo-proofmerge-mark.png"
              alt="Proof Merge logo"
              width={36}
              height={36}
              className="h-9 w-9 object-cover"
              priority
            />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold leading-tight text-zinc-50">
              Proof Merge
            </span>
            <span className="block truncate font-mono text-xs text-zinc-500">gitlawb explorer</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-5 p-3">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-700">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                      isActive
                        ? "bg-green-500/10 text-green-300 ring-1 ring-green-500/20"
                        : "text-zinc-400 hover:bg-zinc-950 hover:text-zinc-100"
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-green-500/20 p-4">
        <div className="rounded-lg border border-green-500/20 bg-zinc-950 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Network</span>
            <span className="font-mono text-green-300">Operational</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Nodes" value="3" />
            <MiniStat label="Chain" value="84532" />
            <MiniStat label="Sync" value="12s" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-black p-2">
      <p className="font-mono text-xs text-green-300">{value}</p>
      <p className="mt-1 text-[10px] text-zinc-700">{label}</p>
    </div>
  );
}
