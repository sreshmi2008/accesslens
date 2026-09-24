"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

export default function AuthModal({
  mode,
  onClose,
  onSubmit,
}: {
  mode: "login" | "signup";
  onClose: () => void;
  onSubmit: (email: string, password: string, name?: string) => void;
}) {
  const [authMode, setAuthMode] = useState(mode);
  const [error, setError] = useState("");
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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    onSubmit(email, password, name);
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

        <h2 id="authTitle">{signup ? "Create your account" : "Welcome back"}</h2>
        <p className="modal-sub">
          {signup ? "Create an account to save accessibility insights." : "Log in to save and review your accessibility insights."}
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
            <input id="authPassword" name="authPassword" type="password" required minLength={4} placeholder="Minimum 4 characters" />
          </div>

          <p className="auth-error" role="alert">{error}</p>

          <button className="button-primary auth-submit" type="submit">
            <span>{signup ? "Create Account" : "Login"}</span>
          </button>
        </form>

        <p className="switch-auth">
          <span>{signup ? "Already have an account?" : "New to AccessLens?"}</span>{" "}
          <button type="button" onClick={() => { setAuthMode(signup ? "login" : "signup"); setError(""); }}>
            {signup ? "Login instead" : "Create an account"}
          </button>
        </p>
        <p className="modal-note">Hackathon demo authentication only. Do not enter a real password.</p>
      </div>
    </div>
  );
}
