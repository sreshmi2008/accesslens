"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getReport, reportPdfUrl, startScan } from "@/lib/api";
import type { Finding, JourneyResult, Persona, ScanReport } from "@/lib/types";
import { PERSONA_LABEL } from "@/lib/types";
import FindingCard from "@/components/FindingCard";
import ScreenshotSimulator from "@/components/ScreenshotSimulator";
import ScreenReaderDemo from "@/components/ScreenReaderDemo";
import { useAuth } from "@/lib/useAuth";
import { useScanHistory } from "@/lib/useScanHistory";

const PERSONA_ORDER: Persona[] = ["screen_reader", "color_blind", "low_vision", "motor_impaired"];

const TABS = [
  { id: "summary", label: "Summary" },
  { id: "simulations", label: "Simulations" },
  { id: "findings", label: "Findings" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function JourneyBlock({ journey }: { journey: JourneyResult }) {
  const byPersona = new Map<Persona, Finding[]>();
  for (const f of journey.findings) {
    if (!byPersona.has(f.persona)) byPersona.set(f.persona, []);
    byPersona.get(f.persona)!.push(f);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-100">{journey.name}</h3>
      {journey.findings.length === 0 && (
        <p className="text-sm text-slate-400">No barriers found in this journey.</p>
      )}
      {PERSONA_ORDER.filter((p) => byPersona.has(p)).map((persona) => (
        <div key={persona} className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wide text-cyan-300">{PERSONA_LABEL[persona]}</h4>
          <div className="space-y-2">
            {byPersona.get(persona)!.map((f) => (
              <FindingCard key={f.id} finding={f} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const url = params.get("url");
  const reportId = params.get("reportId");
  const { user } = useAuth();
  const { addEntry } = useScanHistory(user?.email ?? null);

  const [report, setReport] = useState<ScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("summary");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        if (reportId) {
          const r = await getReport(reportId);
          if (!cancelled) setReport(r);
        } else if (url) {
          const r = await startScan(url);
          if (!cancelled) {
            setReport(r);
            router.replace(`/dashboard/results?reportId=${r.id}`);
          }
        } else {
          setError("No URL or report specified.");
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, reportId]);

  useEffect(() => {
    if (!report || !user) return;
    addEntry({
      reportId: report.id,
      url: report.url,
      createdAt: report.created_at,
      barriersFound: report.summary.barriers_found,
      readinessPct: report.summary.is17802_readiness_pct,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="h-10 w-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-sm max-w-md">
          Simulating disabled-user journeys on {url || "this site"}&hellip; this drives a real headless
          browser through the page, so it can take up to a minute.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-rose-300 font-semibold">Could not complete the scan</p>
        <p className="text-slate-400 text-sm max-w-md">{error}</p>
      </div>
    );
  }

  if (!report) return null;

  const allFindings = report.journeys.flatMap((j) => j.findings);
  const accessibilityTree = report.journeys[0]?.accessibility_tree ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-100 truncate max-w-lg">{report.url}</h1>
          <p className="text-xs text-slate-500 mt-1">Scanned {new Date(report.created_at).toLocaleString()}</p>
        </div>
        <a
          href={reportPdfUrl(report.id)}
          className="text-xs font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white whitespace-nowrap"
        >
          Download PDF Report
        </a>
      </div>

      <div className="flex gap-1 border-b border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === t.id ? "border-cyan-400 text-cyan-200" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="space-y-6">
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Journeys tested" value={report.summary.journeys_tested} />
            <StatCard label="Barriers found" value={report.summary.barriers_found} />
            <StatCard label="Auto-fixable" value={report.summary.auto_fixable} />
            <StatCard label="Needs manual testing" value={report.summary.needs_manual} />
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">IS 17802 readiness (estimated)</p>
              <p className="text-3xl font-bold text-slate-100">{report.summary.is17802_readiness_pct}%</p>
            </div>
            {report.summary.high_risk_journeys.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">High-risk journeys for RPwD complaints</p>
                <ul className="text-sm text-rose-300 list-disc list-inside">
                  {report.summary.high_risk_journeys.map((j) => (
                    <li key={j}>{j}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <p className="text-xs text-slate-500">
            This report is generated by automated testing and covers roughly 30-40% of real-world
            accessibility barriers. It is not a substitute for manual testing with real assistive
            technology (NVDA, VoiceOver) and real disabled users.
          </p>
        </div>
      )}

      {tab === "simulations" && (
        <div className="space-y-8">
          {report.screenshot_base64 && (
            <section>
              <h2 className="text-lg font-semibold mb-3">See it through a color-blind user&rsquo;s eyes</h2>
              <ScreenshotSimulator screenshotBase64={report.screenshot_base64} />
            </section>
          )}
          <section>
            <h2 className="text-lg font-semibold mb-3">Hear it through a screen-reader user&rsquo;s ears</h2>
            <ScreenReaderDemo tree={accessibilityTree} />
          </section>
        </div>
      )}

      {tab === "findings" && (
        <div className="space-y-8">
          {allFindings.length === 0 ? (
            <p className="text-sm text-emerald-300">
              No barriers detected by the automated checks. Remember: this still covers only ~30-40% of
              real-world issues &mdash; manual testing with assistive tech is still recommended.
            </p>
          ) : (
            report.journeys.map((j) => <JourneyBlock key={j.name} journey={j} />)
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardResultsPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-slate-400 text-sm">Loading&hellip;</div>}>
      <ResultsInner />
    </Suspense>
  );
}
