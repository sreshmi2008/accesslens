"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { useScanHistory } from "@/lib/useScanHistory";
import ScanHistoryCard from "@/components/ScanHistoryCard";

export default function HistoryPage() {
  const { user } = useAuth();
  const { history } = useScanHistory(user?.email ?? null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scan History</h1>
        <p className="text-sm text-slate-400 mt-1">Every scan you&rsquo;ve run, most recent first.</p>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-slate-500">
          No scans yet.{" "}
          <Link href="/dashboard/new-scan" className="text-cyan-300 underline underline-offset-4">Run your first one</Link>.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {history.map((entry) => (
            <ScanHistoryCard key={entry.reportId} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
