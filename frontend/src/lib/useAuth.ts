"use client";

import { useCallback, useEffect, useState } from "react";

export interface DemoUser {
  name: string;
  email: string;
  loggedInAt: string;
}

const STORAGE_KEY = "accessLensUser";

/** Hackathon-demo-only auth: no backend accounts, just a localStorage record
 * so the dashboard flow can be demoed without building real user management. */
export function useAuth() {
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    // localStorage only exists in the browser, so this can't be read during
    // the initial render (which may run on the server) without a hydration mismatch.
    const saved = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = useCallback((email: string, password: string, name?: string) => {
    const demoUser: DemoUser = {
      name: name || email.split("@")[0] || "User",
      email,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    return demoUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, login, logout };
}
