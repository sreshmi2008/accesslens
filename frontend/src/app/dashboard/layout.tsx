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
        className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center relative"
        style={{ background: "var(--background)", color: "var(--text)" }}
      >
        <ThemeToggle className="absolute top-6 right-6" />
        <p className="text-lg font-semibold">You need to log in to see your dashboard.</p>
        <p className="text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>
          Scans, and the history of what you&rsquo;ve tested, are tied to your AccessLens account.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setAuthMode("login")}
            className="text-sm font-semibold px-5 py-2.5 rounded-full border"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            Login
          </button>
          <button
            onClick={() => setAuthMode("signup")}
            className="text-sm font-semibold px-5 py-2.5 rounded-full text-white"
            style={{ background: "var(--accent-strong)" }}
          >
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
    <div className="min-h-screen flex" style={{ background: "var(--background)", color: "var(--text)" }}>
      <DashboardSidebar user={user} onLogout={logout} />
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
