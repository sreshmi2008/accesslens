"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.requestPasswordReset(email.trim());
      setMessage(res.message);
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold mb-2">Reset your password</h1>
        <p className="text-sm text-slate-400 mb-6">Enter your email and we&rsquo;ll send you a reset link.</p>

        {message ? (
          <p className="text-emerald-300 text-sm">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl px-6 py-3 text-sm font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <Link href="/" className="block text-cyan-300 underline underline-offset-4 text-sm mt-6">
          Back to AccessLens
        </Link>
      </div>
    </div>
  );
}
