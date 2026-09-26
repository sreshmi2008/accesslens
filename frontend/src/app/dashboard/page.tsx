"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useReports } from "@/lib/useReports";
import ScanHistoryCard from "@/components/ScanHistoryCard";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{label}</p>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { user, token } = useAuth();
  const { reports } = useReports(token);

  const totalScans = reports.length;
  const totalBarriers = reports.reduce((sum, e) => sum + e.barriers_found, 0);
  const avgReadiness = totalScans === 0 ? 0 : Math.round(reports.reduce((sum, e) => sum + e.readiness_pct, 0) / totalScans);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Here&rsquo;s a snapshot of your accessibility testing so far.
        </p>
      </div>

      <section className="grid grid-cols-3 gap-4">
        <StatCard label="Scans run" value={totalScans} />
        <StatCard label="Total barriers found" value={totalBarriers} />
        <StatCard label="Average IS 17802 readiness" value={totalScans === 0 ? "—" : `${avgReadiness}%`} />
      </section>

      <section
        className="rounded-2xl border p-6 flex items-center justify-between gap-4 flex-wrap"
        style={{ borderColor: "var(--border)", background: "var(--accent-soft)" }}
      >
        <div>
          <h2 className="font-semibold" style={{ color: "var(--text)" }}>Ready to test another site?</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Simulate disabled-user journeys on any URL in under a minute.
          </p>
        </div>
        <Link
          href="/dashboard/new-scan"
          className="text-sm font-bold px-5 py-2.5 rounded-full text-white whitespace-nowrap"
          style={{ background: "var(--accent-strong)" }}
        >
          Start New Scan
        </Link>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent scans</h2>
          {reports.length > 0 && (
            <Link href="/dashboard/history" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
              View all &rarr;
            </Link>
          )}
        </div>
        {reports.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>
            No scans yet.{" "}
            <Link href="/dashboard/new-scan" className="underline underline-offset-4" style={{ color: "var(--accent)" }}>
              Run your first one
            </Link>
            .
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {reports.slice(0, 4).map((entry) => (
              <ScanHistoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
