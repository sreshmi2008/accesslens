import Link from "next/link";
import type { ScanHistoryItem } from "@/lib/types";

export default function ScanHistoryCard({ entry }: { entry: ScanHistoryItem }) {
  const readinessColor =
    entry.readiness_pct >= 80 ? "text-emerald-300" : entry.readiness_pct >= 50 ? "text-amber-300" : "text-rose-300";

  return (
    <Link
      href={`/dashboard/results?reportId=${entry.id}`}
      className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-cyan-500/40 hover:bg-slate-900/70 transition block"
    >
      <p className="text-sm font-semibold text-slate-100 truncate">{entry.url}</p>
      <p className="text-xs text-slate-500 mt-1">{new Date(entry.created_at).toLocaleString()}</p>
      <div className="flex items-center gap-4 mt-3 text-xs">
        <span className="text-slate-400">{entry.barriers_found} barriers found</span>
        <span className={readinessColor}>{entry.readiness_pct}% IS 17802 readiness</span>
      </div>
    </Link>
  );
}
