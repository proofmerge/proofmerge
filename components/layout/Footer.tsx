export default function Footer() {
  return (
    <footer className="border-t border-green-500/20 bg-black px-4 py-3 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600">
        <div className="flex flex-wrap items-center gap-3">
          <span>Proof Merge Explorer</span>
          <span className="hidden sm:inline">Powered by gitlawb</span>
          <span className="font-mono text-green-400">Badge: 0x1B26...b9D</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span>Agents 31,804</span>
          <span>Repos 3,799</span>
          <span>Bounties 32</span>
        </div>
      </div>
    </footer>
  );
}
