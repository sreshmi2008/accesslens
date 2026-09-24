import type { ScanHistoryItem, ScanReport } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginResult {
  access_token: string;
  user: AuthUser;
}

export interface MessageResult {
  message: string;
}

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

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

// --- Auth ---

export async function signup(email: string, password: string, name: string): Promise<MessageResult> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  return parseOrThrow(res);
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseOrThrow(res);
}

export async function me(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders(token) });
  return parseOrThrow(res);
}

export async function verifyEmail(token: string): Promise<MessageResult> {
  const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return parseOrThrow(res);
}

export async function resendVerification(email: string): Promise<MessageResult> {
  const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return parseOrThrow(res);
}

export async function requestPasswordReset(email: string): Promise<MessageResult> {
  const res = await fetch(`${API_BASE}/api/auth/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return parseOrThrow(res);
}

export async function resetPassword(token: string, newPassword: string): Promise<MessageResult> {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  return parseOrThrow(res);
}

// --- Scans ---

export async function startScan(token: string, url: string): Promise<ScanReport> {
  const res = await fetch(`${API_BASE}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ url }),
  });
  return parseOrThrow(res);
}

export async function getReport(token: string, reportId: string): Promise<ScanReport> {
  const res = await fetch(`${API_BASE}/api/report/${reportId}`, { headers: authHeaders(token) });
  return parseOrThrow(res);
}

export async function getReports(token: string): Promise<ScanHistoryItem[]> {
  const res = await fetch(`${API_BASE}/api/reports`, { headers: authHeaders(token) });
  return parseOrThrow(res);
}

export async function downloadReportPdf(token: string, reportId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/report/${reportId}/pdf`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Could not download the PDF report.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `accesslens-report-${reportId.slice(0, 8)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
