"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { getAiJourney } from "@/lib/api";
import type { AIJourneyReport } from "@/lib/types";
import FindingCard from "@/components/FindingCard";

const STOP_REASON_LABEL: Record<string, string> = {
  completed: "Claude considered the journey complete.",
  max_steps_reached: "Stopped after reaching the step limit.",
  left_target_site: "Stopped because the browser left the original site.",
  error: "Stopped due to an error.",
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="al-card p-4 text-center">
      <div className="text-2xl font-bold al-gradient-text">{value}</div>
      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

function ActionBadge({ name }: { name: string }) {
  return (
    <span
      className="text-[0.65rem] font-mono font-semibold px-2 py-0.5 rounded-full border"
      style={{ borderColor: "var(--accent)", background: "var(--accent-soft)", color: "var(--accent)" }}
    >
      {name}
    </span>
  );
}

function ResultsInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const { token, loading: authLoading } = useAuth();

  const [report, setReport] = useState<AIJourneyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token || !id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      setError(!id ? "No journey specified." : "You need to be logged in to view this.");
      return;
    }
    let cancelled = false;
    getAiJourney(token, id)
      .then((r) => {
        if (!cancelled) setReport(r);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, token, authLoading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-28 text-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full opacity-20 blur-md" style={{ background: "linear-gradient(135deg, var(--accent-strong), var(--accent-2))" }} />
          <div
            className="relative h-12 w-12 rounded-full border-[3px] border-t-transparent animate-spin"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading journey…</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-28 text-center">
        <div className="al-stat-icon" style={{ color: "#fb7185", background: "rgba(244, 63, 94, 0.12)" }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.3 14.39A2 2 0 003.72 21h16.56a2 2 0 001.73-2.75l-8.3-14.39a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-rose-500 font-semibold">Could not load this journey</p>
        <p className="text-sm max-w-md" style={{ color: "var(--text-muted)" }}>{error}</p>
      </div>
    );
  }

  const allFindings = report.steps.flatMap((s) => s.findings);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight truncate max-w-lg" style={{ color: "var(--text)" }}>{report.url}</h1>
        <p className="text-xs mt-1.5" style={{ color: "var(--text-faint)" }}>
          Run {new Date(report.created_at).toLocaleString()}
          {report.goal && <> &middot; Goal: {report.goal}</>}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {STOP_REASON_LABEL[report.stop_reason] || report.stop_reason}
        </p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Steps taken" value={report.steps.length} />
        <StatCard label="Barriers found" value={report.summary.barriers_found} />
        <StatCard label="Auto-fixable" value={report.summary.auto_fixable} />
        <StatCard label="IS 17802 readiness" value={`${report.summary.is17802_readiness_pct}%`} />
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-bold tracking-tight">Step by step</h2>
        {report.steps.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No steps were recorded for this journey.</p>
        ) : (
          report.steps.map((step) => (
            <div key={step.step_number} className="al-card p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Step {step.step_number}</p>
                  <p className="text-xs truncate max-w-md" style={{ color: "var(--text-faint)" }}>{step.url}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {step.actions.map((a, i) => (
                    <ActionBadge key={i} name={a.name} />
                  ))}
                </div>
              </div>

              {step.screenshot_base64 && (
                <div className="rounded-xl overflow-hidden border max-h-[320px] overflow-y-auto" style={{ borderColor: "var(--border)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/png;base64,${step.screenshot_base64}`}
                    alt={`Screenshot at step ${step.step_number}`}
                    className="w-full block"
                  />
                </div>
              )}

              {step.findings.length > 0 && (
                <div className="space-y-2">
                  {step.findings.map((f) => (
                    <FindingCard key={f.id} finding={f} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {allFindings.length === 0 && (
        <div className="al-card p-5 flex items-center gap-3">
          <div className="al-stat-icon shrink-0" style={{ color: "#34d399", background: "rgba(52, 211, 153, 0.12)" }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No barriers detected across this journey&rsquo;s steps.</p>
        </div>
      )}
    </div>
  );
}

export default function AiJourneyResultsPage() {
  return (
    <Suspense fallback={<p className="py-24 text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>}>
      <ResultsInner />
    </Suspense>
  );
}
