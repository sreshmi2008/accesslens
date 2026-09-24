"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { useScanHistory } from "@/lib/useScanHistory";
import ScanHistoryCard from "@/components/ScanHistoryCard";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { history } = useScanHistory(user?.email ?? null);

  const totalScans = history.length;
  const totalBarriers = history.reduce((sum, e) => sum + e.barriersFound, 0);
  const avgReadiness = totalScans === 0 ? 0 : Math.round(history.reduce((sum, e) => sum + e.readinessPct, 0) / totalScans);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-sm text-slate-400 mt-1">Here&rsquo;s a snapshot of your accessibility testing so far.</p>
      </div>

      <section className="grid grid-cols-3 gap-4">
        <StatCard label="Scans run" value={totalScans} />
        <StatCard label="Total barriers found" value={totalBarriers} />
        <StatCard label="Average IS 17802 readiness" value={totalScans === 0 ? "—" : `${avgReadiness}%`} />
      </section>

      <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-slate-100">Ready to test another site?</h2>
          <p className="text-sm text-slate-400 mt-1">Simulate disabled-user journeys on any URL in under a minute.</p>
        </div>
        <Link
          href="/dashboard/new-scan"
          className="text-sm font-bold px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white whitespace-nowrap"
        >
          Start New Scan
        </Link>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent scans</h2>
          {history.length > 0 && (
            <Link href="/dashboard/history" className="text-sm text-cyan-300 hover:underline">View all &rarr;</Link>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">
            No scans yet.{" "}
            <Link href="/dashboard/new-scan" className="text-cyan-300 underline underline-offset-4">Run your first one</Link>.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {history.slice(0, 4).map((entry) => (
              <ScanHistoryCard key={entry.reportId} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
