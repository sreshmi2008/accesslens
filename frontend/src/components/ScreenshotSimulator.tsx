"use client";

import { useState } from "react";
import ColorBlindFilters, { COLOR_BLIND_MODES, ColorBlindMode } from "./ColorBlindFilters";

export default function ScreenshotSimulator({ screenshotBase64 }: { screenshotBase64: string }) {
  const [mode, setMode] = useState<ColorBlindMode>("normal");
  const filterId = COLOR_BLIND_MODES[mode].filterId;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <ColorBlindFilters />
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(COLOR_BLIND_MODES) as ColorBlindMode[]).map((key) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
              mode === key
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-200"
                : "bg-transparent border-slate-700 text-slate-400 hover:border-slate-500"
            }`}
          >
            {COLOR_BLIND_MODES[key].label}
          </button>
        ))}
      </div>
      <div className="rounded-xl overflow-hidden border border-slate-800 max-h-[480px] overflow-y-auto">
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
