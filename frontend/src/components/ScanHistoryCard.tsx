import Link from "next/link";
import type { ScanHistoryItem } from "@/lib/types";

export default function ScanHistoryCard({ entry }: { entry: ScanHistoryItem }) {
  const readinessColor =
    entry.readiness_pct >= 80 ? "#34d399" : entry.readiness_pct >= 50 ? "#fbbf24" : "#fb7185";

  return (
    <Link href={`/dashboard/results?reportId=${entry.id}`} className="al-card al-card-interactive block p-4">
      <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{entry.url}</p>
      <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>{new Date(entry.created_at).toLocaleString()}</p>
      <div className="flex items-center gap-4 mt-3 text-xs">
        <span style={{ color: "var(--text-muted)" }}>{entry.barriers_found} barriers found</span>
        <span style={{ color: readinessColor }}>{entry.readiness_pct}% IS 17802 readiness</span>
      </div>
    </Link>
  );
}
