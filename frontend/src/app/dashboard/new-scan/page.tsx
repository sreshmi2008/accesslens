"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
        <h1 className="text-3xl font-bold tracking-tight">New Scan</h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          AccessLens will drive a real headless browser through the page and simulate color-blind,
          low-vision, motor-impaired, and screen-reader journeys.
        </p>
      </div>

      <div className="al-card p-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            ref={urlInputRef}
            type="url"
            placeholder="https://yourwebsite.com"
            className="al-input flex-1 px-4 py-3 text-sm"
          />
          <button type="submit" className="al-btn al-btn-primary px-6 py-3 text-sm">
            Test Website
          </button>
        </form>
        {urlError && <p className="text-rose-500 text-sm mt-2">{urlError}</p>}
      </div>

      <div>
        <p className="text-sm mb-3 font-medium" style={{ color: "var(--text-muted)" }}>Or try a demo site:</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.values(DEMOS).map((demo) => (
            <button
              key={demo.url}
              onClick={() => goToScan(demo.url)}
              className="al-card al-card-interactive text-left p-4"
            >
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{demo.label}</p>
              <p className="text-xs mt-1 truncate" style={{ color: "var(--text-faint)" }}>{demo.url}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="al-card relative overflow-hidden p-5 flex items-center justify-between gap-4 flex-wrap">
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
        />
        <div className="relative">
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Want AI to actually click through the site?</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            AI Journeys let Claude sign up, fill forms, and navigate like a real visitor, checking accessibility at every step.
          </p>
        </div>
        <Link href="/dashboard/ai-journey" className="al-btn al-btn-primary relative px-5 py-2.5 text-xs">
          Try AI Journeys
        </Link>
      </div>
    </div>
  );
}
