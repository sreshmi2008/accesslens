"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useReports } from "@/lib/useReports";
import ScanHistoryCard from "@/components/ScanHistoryCard";

const STAT_ICONS = {
  scans: (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" />
    </svg>
  ),
  barriers: (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.3 14.39A2 2 0 003.72 21h16.56a2 2 0 001.73-2.75l-8.3-14.39a2 2 0 00-3.42 0z" />
    </svg>
  ),
  readiness: (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="al-card p-5">
      <div className="al-stat-icon mb-4">{icon}</div>
      <p className="text-3xl font-bold tracking-tight al-gradient-text">{value}</p>
      <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>{label}</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          Here&rsquo;s a snapshot of your accessibility testing so far.
        </p>
      </div>

      <section className="grid grid-cols-3 gap-4">
        <StatCard icon={STAT_ICONS.scans} label="Scans run" value={totalScans} />
        <StatCard icon={STAT_ICONS.barriers} label="Total barriers found" value={totalBarriers} />
        <StatCard icon={STAT_ICONS.readiness} label="Average IS 17802 readiness" value={totalScans === 0 ? "—" : `${avgReadiness}%`} />
      </section>

      <section
        className="al-card relative overflow-hidden p-7 flex items-center justify-between gap-4 flex-wrap"
        style={{ borderColor: "var(--border-strong)" }}
      >
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
        />
        <div className="relative">
          <h2 className="font-bold text-lg tracking-tight" style={{ color: "var(--text)" }}>Ready to test another site?</h2>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
            Simulate disabled-user journeys on any URL in under a minute.
          </p>
        </div>
        <Link href="/dashboard/new-scan" className="al-btn al-btn-primary relative px-6 py-3 text-sm">
          Start New Scan
        </Link>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight">Recent scans</h2>
          {reports.length > 0 && (
            <Link href="/dashboard/history" className="text-sm font-medium hover:underline" style={{ color: "var(--accent)" }}>
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
