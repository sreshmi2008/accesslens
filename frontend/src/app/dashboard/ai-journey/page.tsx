"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { getAiJourneys, startAiJourney } from "@/lib/api";
import type { AIJourneyHistoryItem } from "@/lib/types";

const STOP_REASON_LABEL: Record<string, string> = {
  completed: "Completed",
  max_steps_reached: "Stopped at step limit",
  left_target_site: "Stopped — left the site",
  error: "Failed",
};

function normalizeUrl(value: string) {
  const url = value.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) return "https://" + url;
  return url;
}

export default function AiJourneyPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [url, setUrl] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [journeys, setJourneys] = useState<AIJourneyHistoryItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (!token) return;
    getAiJourneys(token)
      .then(setJourneys)
      .finally(() => setLoadingList(false));
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const raw = url.trim();
    if (!raw) {
      setError("Please enter a website URL first.");
      return;
    }
    const normalized = normalizeUrl(raw);
    try {
      new URL(normalized);
    } catch {
      setError("Please enter a valid website URL.");
      return;
    }
    if (!token) return;

    setSubmitting(true);
    try {
      const report = await startAiJourney(token, normalized, goal.trim() || null);
      router.push(`/dashboard/ai-journey/results?id=${report.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI-Driven Journeys</h1>
        <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--text-muted)" }}>
          Claude drives a real browser through the site — clicking, typing, and navigating like a real
          visitor — checking accessibility at every step. Requires a Claude API key with Computer Use
          access to be configured on the server.
        </p>
      </div>

      <div className="al-card p-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="al-input w-full px-4 py-3 text-sm"
          />
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder='Optional: what should it try to do? (e.g. "sign up for an account")'
            className="al-input w-full px-4 py-3 text-sm"
          />
          {error && <p className="text-rose-500 text-sm">{error}</p>}
          <button type="submit" disabled={submitting} className="al-btn al-btn-primary px-6 py-3 text-sm">
            {submitting ? "Running the journey…" : "Start AI Journey"}
          </button>
          {submitting && (
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>
              This can take a few minutes — Claude is taking real screenshots and real actions, one step at a time.
            </p>
          )}
        </form>
      </div>

      <section>
        <h2 className="text-lg font-bold tracking-tight mb-4">Past AI journeys</h2>
        {loadingList ? (
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>Loading…</p>
        ) : journeys.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>No AI journeys run yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {journeys.map((j) => (
              <Link
                key={j.id}
                href={`/dashboard/ai-journey/results?id=${j.id}`}
                className="al-card al-card-interactive block p-4"
              >
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{j.url}</p>
                {j.goal && <p className="text-xs mt-1 truncate" style={{ color: "var(--text-muted)" }}>Goal: {j.goal}</p>}
                <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>{new Date(j.created_at).toLocaleString()}</p>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span style={{ color: "var(--text-muted)" }}>{j.steps_taken} steps</span>
                  <span style={{ color: "var(--text-muted)" }}>{j.barriers_found} barriers found</span>
                  <span style={{ color: j.stop_reason === "error" ? "#fb7185" : "var(--accent)" }}>
                    {STOP_REASON_LABEL[j.stop_reason] || j.stop_reason}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
