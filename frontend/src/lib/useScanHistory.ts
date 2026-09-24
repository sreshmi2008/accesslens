"use client";

import { useCallback, useEffect, useState } from "react";

export interface ScanHistoryEntry {
  reportId: string;
  url: string;
  createdAt: string;
  barriersFound: number;
  readinessPct: number;
}

function storageKey(email: string) {
  return `accessLensScans:${email}`;
}

/** Scan history tied to the demo localStorage user (see useAuth). Kept
 * client-side to match the hackathon-demo auth model rather than adding
 * real backend user accounts just to list past scans. */
export function useScanHistory(email: string | null) {
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);

  useEffect(() => {
    // localStorage only exists in the browser, so this can't be read during
    // the initial render (which may run on the server) without a hydration mismatch.
    if (!email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHistory([]);
      return;
    }
    const raw = localStorage.getItem(storageKey(email));
    setHistory(raw ? JSON.parse(raw) : []);
  }, [email]);

  const addEntry = useCallback(
    (entry: ScanHistoryEntry) => {
      if (!email) return;
      setHistory((prev) => {
        const next = [entry, ...prev.filter((e) => e.reportId !== entry.reportId)].slice(0, 20);
        localStorage.setItem(storageKey(email), JSON.stringify(next));
        return next;
      });
    },
    [email]
  );

  return { history, addEntry };
}
