"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import * as api from "@/lib/api";

function ResetPasswordInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("No reset token was provided.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.resetPassword(token, password);
      setMessage(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "var(--background)", color: "var(--text)" }}>
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold mb-2">Choose a new password</h1>

        {message ? (
          <>
            <p className="text-emerald-500 text-sm mb-6">{message}</p>
            <Link href="/" className="underline underline-offset-4 text-sm" style={{ color: "var(--accent)" }}>
              Back to AccessLens to log in
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: "var(--border-strong)", background: "var(--surface)", color: "var(--text)" }}
            />
            {error && <p className="text-rose-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "var(--accent-strong)" }}
            >
              {submitting ? "Saving…" : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--background)" }} />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
