"use client";

import { useState } from "react";
import ColorBlindFilters, { COLOR_BLIND_MODES, ColorBlindMode } from "./ColorBlindFilters";

export default function ScreenshotSimulator({ screenshotBase64 }: { screenshotBase64: string }) {
  const [mode, setMode] = useState<ColorBlindMode>("normal");
  const filterId = COLOR_BLIND_MODES[mode].filterId;

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <ColorBlindFilters />
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(COLOR_BLIND_MODES) as ColorBlindMode[]).map((key) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
            style={
              mode === key
                ? { background: "var(--accent-soft)", borderColor: "var(--accent)", color: "var(--accent)" }
                : { background: "transparent", borderColor: "var(--border-strong)", color: "var(--text-muted)" }
            }
          >
            {COLOR_BLIND_MODES[key].label}
          </button>
        ))}
      </div>
      <div className="rounded-xl overflow-hidden border max-h-[480px] overflow-y-auto" style={{ borderColor: "var(--border)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${screenshotBase64}`}
          alt="Full-page screenshot of the scanned site, with the selected color-vision simulation applied"
          style={filterId ? { filter: `url(#${filterId})` } : undefined}
          className="w-full block"
        />
      </div>
    </div>
  );
}
