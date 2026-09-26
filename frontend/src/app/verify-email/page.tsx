"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import * as api from "@/lib/api";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      setMessage("No verification token was provided.");
      return;
    }
    api
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed.");
      });
  }, [token]);

  return (
    <div className="al-bg min-h-screen flex flex-col items-center justify-center px-6" style={{ color: "var(--text)" }}>
      <div className="al-card p-10 flex flex-col items-center gap-4 text-center max-w-sm w-full">
        {status === "loading" && (
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full opacity-20 blur-md" style={{ background: "linear-gradient(135deg, var(--accent-strong), var(--accent-2))" }} />
            <div className="relative h-12 w-12 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          </div>
        )}
        {status === "success" && <p className="text-emerald-500 font-semibold text-lg">{message}</p>}
        {status === "error" && <p className="text-rose-500 font-semibold text-lg">{message}</p>}
        {status !== "loading" && (
          <Link href="/" className="al-btn al-btn-outline px-5 py-2.5 text-sm mt-2">
            Back to AccessLens
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--background)" }} />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
