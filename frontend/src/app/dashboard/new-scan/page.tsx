"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const DEMOS: Record<string, { label: string; url: string }> = {
  ecommerce: { label: "E-commerce Signup", url: "https://www.w3.org/WAI/demos/bad/before/home.html" },
  government: { label: "Government Form", url: "https://the-internet.herokuapp.com/login" },
};

function normalizeUrl(value: string) {
  const url = value.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) return "https://" + url;
  return url;
}

export default function NewScanPage() {
  const router = useRouter();
  const [urlError, setUrlError] = useState("");
  const urlInputRef = useRef<HTMLInputElement>(null);

  function goToScan(rawUrl: string) {
    router.push(`/dashboard/results?url=${encodeURIComponent(rawUrl)}`);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const raw = urlInputRef.current?.value.trim() || "";
    setUrlError("");
    if (!raw) {
      setUrlError("Please enter a website URL first.");
      return;
    }
    const url = normalizeUrl(raw);
    try {
      new URL(url);
    } catch {
      setUrlError("Please enter a valid website URL.");
      return;
    }
    goToScan(url);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">New Scan</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          AccessLens will drive a real headless browser through the page and simulate color-blind,
          low-vision, motor-impaired, and screen-reader journeys.
        </p>
      </div>

      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            ref={urlInputRef}
            type="url"
            placeholder="https://yourwebsite.com"
            className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: "var(--border-strong)", background: "var(--background)", color: "var(--text)" }}
          />
          <button
            type="submit"
            className="rounded-xl px-6 py-3 text-sm font-bold text-white whitespace-nowrap"
            style={{ background: "var(--accent-strong)" }}
          >
            Test Website
          </button>
        </form>
        {urlError && <p className="text-rose-500 text-sm mt-2">{urlError}</p>}
      </div>

      <div>
        <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>Or try a demo site:</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.values(DEMOS).map((demo) => (
            <button
              key={demo.url}
              onClick={() => goToScan(demo.url)}
              className="text-left rounded-xl border p-4 transition-colors"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{demo.label}</p>
              <p className="text-xs mt-1 truncate" style={{ color: "var(--text-faint)" }}>{demo.url}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
