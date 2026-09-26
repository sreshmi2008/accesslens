"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useReports } from "@/lib/useReports";
import ScanHistoryCard from "@/components/ScanHistoryCard";

export default function HistoryPage() {
  const { token } = useAuth();
  const { reports } = useReports(token);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scan History</h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Every scan you&rsquo;ve run, most recent first.</p>
      </div>

      {reports.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-faint)" }}>
          No scans yet.{" "}
          <Link href="/dashboard/new-scan" className="underline underline-offset-4" style={{ color: "var(--accent)" }}>Run your first one</Link>.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {reports.map((entry) => (
            <ScanHistoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
