"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import * as api from "@/lib/api";
import type { AuthUser } from "@/lib/api";

export default function AuthModal({
  mode,
  onClose,
  onLoginSuccess,
}: {
  mode: "login" | "signup";
  onClose: () => void;
  onLoginSuccess?: (user: AuthUser) => void;
}) {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState(mode);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [signupDone, setSignupDone] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      (authMode === "signup" ? nameRef.current : emailRef.current)?.focus();
    }, 100);
    return () => clearTimeout(t);
  }, [authMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const signup = authMode === "signup";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setShowResend(false);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("authEmail") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("authPassword") as HTMLInputElement).value;
    const name = signup ? (form.elements.namedItem("authName") as HTMLInputElement).value.trim() : undefined;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (signup && !name) {
      setError("Please enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      if (signup) {
        await api.signup(email, password, name!);
        setPendingEmail(email);
        setSignupDone(true);
      } else {
        const user = await login(email, password);
        onLoginSuccess?.(user);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      if (message.toLowerCase().includes("verify")) setShowResend(true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResendStatus("Sending...");
    try {
      const emailValue = (document.getElementById("authEmail") as HTMLInputElement)?.value.trim();
      const res = await api.resendVerification(emailValue || pendingEmail);
      setResendStatus(res.message);
    } catch {
      setResendStatus("Could not resend right now. Try again shortly.");
    }
  }

  return (
    <div className="modal active" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <div className="modal-bg" onClick={onClose} />
      <div className="modal-panel">
        <button type="button" className="close-modal" onClick={onClose} aria-label="Close dialog">
          <svg width="21" height="21" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="modal-logo">
          <svg width="25" height="25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 11c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21a9 9 0 0118 0" />
          </svg>
        </div>

        {signupDone ? (
          <>
            <h2 id="authTitle">Check your email</h2>
            <p className="modal-sub">
              We sent a verification link to <strong>{pendingEmail}</strong>. Click it, then come back and log in.
            </p>
            <button
              className="button-primary auth-submit"
              type="button"
              onClick={() => {
                setSignupDone(false);
                setAuthMode("login");
              }}
            >
              <span>Go to Login</span>
            </button>
          </>
        ) : (
          <>
            <h2 id="authTitle">{signup ? "Create your account" : "Welcome back"}</h2>
            <p className="modal-sub">
              {signup ? "Create an account to save your accessibility scans." : "Log in to see your scans and dashboard."}
            </p>

            <form onSubmit={handleSubmit}>
              <div className={`field${signup ? "" : " hidden"}`}>
                <label htmlFor="authName">Your name</label>
                <input ref={nameRef} id="authName" name="authName" type="text" placeholder="Enter your name" />
              </div>

              <div className="field">
                <label htmlFor="authEmail">Email address</label>
                <input ref={emailRef} id="authEmail" name="authEmail" type="email" required placeholder="you@example.com" />
              </div>

              <div className="field">
                <label htmlFor="authPassword">Password</label>
                <input
                  id="authPassword"
                  name="authPassword"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                />
              </div>

              <p className="auth-error" role="alert">{error}</p>

              {showResend && (
                <div style={{ marginBottom: 14 }}>
                  <button type="button" onClick={handleResend} className="switch-auth" style={{ margin: 0 }}>
                    <span style={{ textDecoration: "underline", cursor: "pointer", color: "#67e8f9" }}>
                      Resend verification email
                    </span>
                  </button>
                  {resendStatus && <p className="modal-note" style={{ marginTop: 6 }}>{resendStatus}</p>}
                </div>
              )}

              <button className="button-primary auth-submit" type="submit" disabled={submitting}>
                <span>{submitting ? "Please wait…" : signup ? "Create Account" : "Login"}</span>
              </button>
            </form>

            {!signup && (
              <p className="modal-note" style={{ marginTop: 12 }}>
                <Link href="/forgot-password" style={{ color: "#67e8f9", textDecoration: "underline" }} onClick={onClose}>
                  Forgot your password?
                </Link>
              </p>
            )}

            <p className="switch-auth">
              <span>{signup ? "Already have an account?" : "New to AccessLens?"}</span>{" "}
              <button type="button" onClick={() => { setAuthMode(signup ? "login" : "signup"); setError(""); setShowResend(false); }}>
                {signup ? "Login instead" : "Create an account"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
