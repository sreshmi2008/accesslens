"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import AuthModal from "@/components/AuthModal";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, login, logout } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="text-lg font-semibold">You need to log in to see your dashboard.</p>
        <p className="text-sm text-slate-400 max-w-sm">
          Scans, and the history of what you&rsquo;ve tested, are tied to your AccessLens account.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setAuthMode("login")}
            className="text-sm font-semibold px-5 py-2.5 rounded-full border border-cyan-500/40 text-cyan-200"
          >
            Login
          </button>
          <button
            onClick={() => setAuthMode("signup")}
            className="text-sm font-semibold px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
          >
            Sign Up
          </button>
        </div>
        <Link href="/" className="text-xs text-slate-500 underline underline-offset-4 mt-2">Back to home</Link>

        {authMode && (
          <AuthModal
            mode={authMode}
            onClose={() => setAuthMode(null)}
            onSubmit={(email, password, name) => {
              login(email, password, name);
              setAuthMode(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <DashboardSidebar user={user} onLogout={logout} />
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
