"use client";

import { useCallback, useEffect, useState } from "react";
import * as api from "./api";
import type { ScanHistoryItem } from "./types";

/** Scan history now lives in the backend database, tied to the real logged-in
 * user, so it survives restarts and is the same across devices/browsers. */
export function useReports(token: string | null) {
  const [reports, setReports] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) {
      setReports([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getReports(token);
      setReports(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return { reports, loading, refresh };
}
