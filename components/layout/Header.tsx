"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-green-500/20 bg-black/95 backdrop-blur">
      <div className="flex min-h-16 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            href="/"
            className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-green-500/30 bg-black lg:hidden"
            aria-label="Proof Merge home"
          >
            <Image
              src="/logo-proofmerge.png"
              alt="Proof Merge logo"
              width={40}
              height={40}
              className="h-10 w-10 object-cover"
              priority
            />
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1.5 font-mono text-xs text-green-300 sm:flex">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_14px_rgba(74,222,128,0.8)]" />
            Live
          </div>
          <div className="min-w-0 flex-1">
            <input
              aria-label="Global explorer search"
              className="h-10 w-full rounded-md border border-green-500/20 bg-zinc-950 px-3 font-mono text-sm text-green-100 outline-none placeholder:text-zinc-700 focus:border-green-400"
              placeholder="Search DID, repo, commit hash, PR, issue, badge..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 lg:justify-end">
          <div className="hidden rounded-md border border-green-500/20 bg-zinc-950 px-3 py-2 text-xs text-zinc-500 md:block">
            Gas: <span className="font-mono text-green-300">0.105 Gwei</span>
          </div>
          <button className="rounded-md border border-green-500/20 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 transition hover:border-green-400 hover:text-green-300">
            Base Sepolia
          </button>
          <button className="rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-green-400">
            Connect
          </button>
        </div>
      </div>
    </header>
  );
}
