"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthUser } from "@/lib/api";
import ThemeToggle from "./ThemeToggle";

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
  {
    href: "/dashboard/ai-journey",
    label: "AI Journeys",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function DashboardSidebar({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const pathname = usePathname();
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <aside
      className="w-64 shrink-0 flex flex-col min-h-screen border-r relative"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="px-5 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight" style={{ color: "var(--text)" }}>
          <span
            className="grid place-items-center w-9 h-9 rounded-xl"
            style={{ background: "linear-gradient(135deg, var(--accent-strong), var(--accent-2))", boxShadow: "var(--shadow-glow)" }}
          >
            <svg width="17" height="17" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </span>
          AccessLens
        </Link>
        <ThemeToggle />
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={
                active
                  ? { background: "var(--accent-soft)", color: "var(--accent)" }
                  : { color: "var(--text-muted)" }
              }
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
                  style={{ background: "linear-gradient(180deg, var(--accent-strong), var(--accent-2))" }}
                />
              )}
              <span className={active ? "" : "opacity-80"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3 px-1">
          <span
            className="grid place-items-center w-9 h-9 rounded-full text-sm font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, var(--accent-soft), var(--surface-hover))", color: "var(--accent)", border: "1px solid var(--border-strong)" }}
          >
            {initial}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{user.name}</p>
            <p className="text-xs truncate" style={{ color: "var(--text-faint)" }}>{user.email}</p>
          </div>
        </div>
        <button onClick={onLogout} className="al-btn al-btn-outline w-full text-xs px-3 py-2.5">
          Logout
        </button>
      </div>
    </aside>
  );
}
