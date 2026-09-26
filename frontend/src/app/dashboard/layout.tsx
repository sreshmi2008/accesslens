"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import AuthModal from "@/components/AuthModal";
import DashboardSidebar from "@/components/DashboardSidebar";
import ThemeToggle from "@/components/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);

  if (loading) {
    return <div className="min-h-screen" style={{ background: "var(--background)" }} />;
  }

  if (!user) {
    return (
      <div
        className="al-bg min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center relative"
        style={{ color: "var(--text)" }}
      >
        <ThemeToggle className="absolute top-6 right-6" />
        <span
          className="grid place-items-center w-14 h-14 rounded-2xl mb-2"
          style={{ background: "linear-gradient(135deg, var(--accent-strong), var(--accent-2))", boxShadow: "var(--shadow-glow)" }}
        >
          <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </span>
        <p className="text-xl font-bold tracking-tight">You need to log in to see your dashboard.</p>
        <p className="text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>
          Scans, and the history of what you&rsquo;ve tested, are tied to your AccessLens account.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setAuthMode("login")} className="al-btn al-btn-outline px-5 py-2.5 text-sm">
            Login
          </button>
          <button onClick={() => setAuthMode("signup")} className="al-btn al-btn-primary px-5 py-2.5 text-sm">
            Sign Up
          </button>
        </div>
        <Link href="/" className="text-xs underline underline-offset-4 mt-2" style={{ color: "var(--text-faint)" }}>
          Back to home
        </Link>

        {authMode && (
          <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onLoginSuccess={() => setAuthMode(null)} />
        )}
      </div>
    );
  }

  return (
    <div className="al-bg min-h-screen flex" style={{ color: "var(--text)" }}>
      <DashboardSidebar user={user} onLogout={logout} />
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
