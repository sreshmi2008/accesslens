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
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "var(--background)", color: "var(--text)" }}>
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold mb-2">Reset your password</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Enter your email and we&rsquo;ll send you a reset link.</p>

        {message ? (
          <p className="text-emerald-500 text-sm">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: "var(--border-strong)", background: "var(--surface)", color: "var(--text)" }}
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "var(--accent-strong)" }}
            >
              {submitting ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <Link href="/" className="block underline underline-offset-4 text-sm mt-6" style={{ color: "var(--accent)" }}>
          Back to AccessLens
        </Link>
      </div>
    </div>
  );
}
