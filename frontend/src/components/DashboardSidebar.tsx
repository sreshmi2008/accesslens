"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthUser } from "@/lib/api";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM13 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V6zM4 15a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3zM13 15a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/new-scan",
    label: "New Scan",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    href: "/dashboard/history",
    label: "History",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function DashboardSidebar({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/30 flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-100">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600">
            <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </span>
          AccessLens
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-cyan-500/15 text-cyan-200 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800 space-y-3">
        <div className="px-2">
          <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800/60"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
