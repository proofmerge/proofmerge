"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Live Feed", icon: "⚡" },
  { href: "/theater", label: "Agent Theater", icon: "🎭" },
  { href: "/badges", label: "Skill Badges", icon: "🏅" },
  { href: "/bounties", label: "Bounty Board", icon: "💰" },
  { href: "/stats", label: "Network Stats", icon: "📊" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-gray-950 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">Proof Merge</span>
        </Link>
        <p className="text-xs text-gray-500 mt-1">gitlawb explorer</p>
      </div>

      <nav className="flex-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                isActive
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>3 nodes online</span>
        </div>
      </div>
    </aside>
  );
}
