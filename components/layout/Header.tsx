"use client";

export default function Header() {
  return (
    <header className="h-14 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>gitlawb network</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
          Connect Wallet
        </button>
      </div>
    </header>
  );
}
