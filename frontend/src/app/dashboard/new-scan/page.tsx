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
        <p className="text-sm text-slate-400 mt-1">
          AccessLens will drive a real headless browser through the page and simulate color-blind,
          low-vision, motor-impaired, and screen-reader journeys.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            ref={urlInputRef}
            type="url"
            placeholder="https://yourwebsite.com"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="rounded-xl px-6 py-3 text-sm font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white whitespace-nowrap"
          >
            Test Website
          </button>
        </form>
        {urlError && <p className="text-rose-300 text-sm mt-2">{urlError}</p>}
      </div>

      <div>
        <p className="text-sm text-slate-400 mb-3">Or try a demo site:</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.values(DEMOS).map((demo) => (
            <button
              key={demo.url}
              onClick={() => goToScan(demo.url)}
              className="text-left rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-cyan-500/40 transition"
            >
              <p className="text-sm font-semibold text-slate-100">{demo.label}</p>
              <p className="text-xs text-slate-500 mt-1 truncate">{demo.url}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
