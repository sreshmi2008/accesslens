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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4 px-6 text-center">
      {status === "loading" && (
        <div className="h-10 w-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      )}
      {status === "success" && <p className="text-emerald-300 font-semibold text-lg">{message}</p>}
      {status === "error" && <p className="text-rose-300 font-semibold text-lg">{message}</p>}
      {status !== "loading" && (
        <Link href="/" className="text-cyan-300 underline underline-offset-4 text-sm">
          Back to AccessLens
        </Link>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
