import type { ScanReport } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function parseOrThrow(res: Response) {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore, fall back to statusText
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function startScan(url: string): Promise<ScanReport> {
  const res = await fetch(`${API_BASE}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return parseOrThrow(res);
}

export async function getReport(reportId: string): Promise<ScanReport> {
  const res = await fetch(`${API_BASE}/api/report/${reportId}`);
  return parseOrThrow(res);
}

export function reportPdfUrl(reportId: string): string {
  return `${API_BASE}/api/report/${reportId}/pdf`;
}
