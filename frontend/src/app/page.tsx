"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./landing.css";
import ThreeBackground from "@/components/ThreeBackground";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/lib/useToast";

export default function LandingPage() {
  const router = useRouter();
  const { user, login, logout } = useAuth();
  const { message: toastMessage, showToast } = useToast();

  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  // Effects never run during SSR, so this default only ever shows briefly on
  // the client before the prefers-reduced-motion check below corrects it.
  const [motionEnabled, setMotionEnabled] = useState(true);

  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    // matchMedia only exists in the browser, so this can't be read during
    // the initial render (which may run on the server) without a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMotionEnabled(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const elements = revealRefs.current;
    if (!motionEnabled || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [motionEnabled]);

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!motionEnabled) return;
    const onMove = (e: PointerEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [motionEnabled]);

  function addReveal(el: HTMLElement | null) {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  }

  function goToDashboard() {
    if (user) {
      router.push("/dashboard");
    } else {
      setAuthMode("signup");
    }
  }

  function handleAuthSubmit(email: string, password: string, name?: string) {
    login(email, password, name);
    setAuthMode(null);
    router.push("/dashboard");
  }

  function toggleMotion() {
    setMotionEnabled((prev) => {
      const next = !prev;
      showToast(next ? "Visual motion enabled." : "Visual motion paused.");
      return next;
    });
  }

  return (
    <div className={`accesslens-landing${motionEnabled ? "" : " motion-off"}`}>
      <ThreeBackground motionEnabled={motionEnabled} />
      <div className="grid-overlay" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <div className="scanline" aria-hidden="true" />
      {motionEnabled && (
        <div className="cursor-light" style={{ left: cursorPos.x, top: cursorPos.y }} aria-hidden="true" />
      )}

      <div className="orbital-ring ring-one" aria-hidden="true" />
      <div className="orbital-ring ring-two" aria-hidden="true" />

      <nav className="nav" aria-label="Primary navigation">
        <div className="container nav-inner">
          <a href="#home" className="brand" aria-label="AccessLens home">
            <span className="brand-icon" aria-hidden="true">
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </span>
            <span>AccessLens</span>
          </a>

          <div className="nav-right">
            <div className="nav-links">
              <a href="#home">Home</a>
              <a href="#what-we-do">Features</a>
              <a href="#who-it-helps">Who it helps</a>
              <a href="#how-it-works">How it works</a>
              <a href="#about">About</a>
            </div>

            {user ? (
              <div className="user-actions">
                <span className="login-button">Hi, {user.name}</span>
                <button type="button" className="button-primary mini-button" onClick={() => router.push("/dashboard")}>
                  <span>Dashboard</span>
                </button>
                <button type="button" className="button-outline" onClick={() => { logout(); showToast("You have been logged out."); }}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-actions">
                <button type="button" className="login-button" onClick={() => setAuthMode("login")}>Login</button>
                <button type="button" className="button-primary mini-button" onClick={() => setAuthMode("signup")}>
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main>
        <section id="home" className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="live-pill">
                <span className="pulse-dot" />
                ACCESSIBILITY INTELLIGENCE / INDIA
              </div>

              <h1>
                See your website
                <span className="gradient-text"> through every user&rsquo;s eyes.</span>
              </h1>

              <p className="hero-description">
                AccessLens simulates disabled-user journeys, translates barriers into human impact,
                suggests developer-ready fixes, and connects insights to India&rsquo;s accessibility context.
              </p>

              <div className="hero-form-shell">
                <div className="hero-form">
                  <button className="button-primary hero-main-button" type="button" onClick={goToDashboard} style={{ width: "100%" }}>
                    <span>{user ? "Go to Dashboard" : "Get Started Free"}</span>
                  </button>
                </div>
              </div>

              <div className="demo-row">
                <span>{user ? "Your scans are saved to your dashboard." : "Sign up to start scanning your website."}</span>
              </div>

              <div className="trust-row">
                <span>Human-impact insights</span>
                <span>Code-fix suggestions</span>
                <span>India-focused context</span>
              </div>
            </div>

            <div className="holo-stage">
              <div className="holo-grid-floor" aria-hidden="true" />
              <div className="orbit orbit-a" aria-hidden="true" />
              <div className="orbit orbit-b" aria-hidden="true" />
              <div className="orbit orbit-c" aria-hidden="true" />

              <div className="floating-tag tag-one"><i /><span>Live user journey</span></div>
              <div className="floating-tag tag-two"><i /><span>WCAG + India context</span></div>

              <div className="holo-card-wrap">
                <div className="holo-border">
                  <article className="holo-card" aria-label="AccessLens product preview">
                    <div className="window-bar">
                      <div className="dots" aria-hidden="true"><span /><span /><span /></div>
                      <div className="ai-status"><i /> AI JOURNEY ANALYSIS</div>
                    </div>

                    <div className="dashboard-heading">
                      <div>
                        <small>ACCESSLENS INTELLIGENCE</small>
                        <h3>Accessibility overview</h3>
                        <p>checkout.example.in / sign-up flow</p>
                      </div>
                      <div className="holo-score">
                        <span>ESTIMATED CHECK SCORE</span>
                        <strong className="gradient-text">68%</strong>
                      </div>
                    </div>

                    <div className="analysis-progress">
                      <div className="meta"><span>Journey analysis</span><span>76% complete</span></div>
                      <div className="bar"><div /></div>
                    </div>

                    <div className="finding-stack">
                      <div className="finding critical">
                        <div className="finding-icon">
                          <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.3 14.39A2 2 0 003.72 21h16.56a2 2 0 001.73-2.75l-8.3-14.39a2 2 0 00-3.42 0z" />
                          </svg>
                        </div>
                        <div className="finding-body">
                          <h4>Error state relies only on red</h4>
                          <span className="severity serious">SERIOUS</span>
                          <p>Color-blind users may not understand why this field failed.</p>
                        </div>
                      </div>

                      <div className="finding warning">
                        <div className="finding-icon">
                          <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 100-18 9 9 0 000 18z" />
                          </svg>
                        </div>
                        <div className="finding-body">
                          <h4>Email input has no label</h4>
                          <span className="severity moderate">MODERATE</span>
                          <p>A screen-reader user may hear an unclear field name.</p>
                        </div>
                      </div>
                    </div>

                    <div className="code-patch">
                      <div>
                        <label>SUGGESTED DEVELOPER FIX</label>
                        <code>&lt;label for=&quot;email&quot;&gt;Email address&lt;/label&gt;</code>
                      </div>
                      <span>Review &rarr;</span>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section reveal" ref={addReveal}>
          <div className="container">
            <div className="stats">
              <article className="stat"><strong className="gradient-text">100+</strong><span>Accessibility rules checked</span></article>
              <article className="stat"><strong className="gradient-text">4</strong><span>Disability perspectives</span></article>
              <article className="stat"><strong className="gradient-text">3</strong><span>Indian compliance contexts</span></article>
              <article className="stat"><strong className="gradient-text">1</strong><span>Unified action dashboard</span></article>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        <section id="what-we-do" className="section reveal" ref={addReveal}>
          <div className="container">
            <header className="section-heading">
              <p className="eyebrow">What AccessLens does</p>
              <h2>Not another scanner. <span className="gradient-text">A lens into real user barriers.</span></h2>
              <p>Raw accessibility errors are easy to ignore. AccessLens turns them into understandable user stories and clear next steps.</p>
            </header>

            <div className="bento">
              <article className="bento-card bento-large">
                <div className="bento-icon">
                  <svg width="23" height="23" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3>Journey-based accessibility testing</h3>
                <p>Test meaningful user paths&mdash;sign-up, forms, search, and checkout&mdash;not only isolated technical violations on a single page.</p>
                <div className="mini-lines" aria-hidden="true"><span /><span /><span /></div>
              </article>

              <article className="bento-card bento-side">
                <div className="bento-icon">
                  <svg width="23" height="23" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3>Disabled-user perspectives</h3>
                <p>Color blindness, low vision, motor difficulty, and screen-reader-oriented checks.</p>
              </article>

              <article className="bento-card bento-half">
                <div className="bento-icon">
                  <svg width="23" height="23" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3>Plain-language user impact</h3>
                <p>Know why an issue matters before your team sees a technical rule number.</p>
              </article>

              <article className="bento-card bento-half">
                <div className="bento-icon">
                  <svg width="23" height="23" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3>Suggested fixes, not magic promises</h3>
                <p>Review generated HTML, CSS, and ARIA suggestions before a developer applies them.</p>
              </article>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        <section className="section reveal" ref={addReveal}>
          <div className="container">
            <header className="section-heading">
              <p className="eyebrow">Platform features</p>
              <h2>Built for the work <span className="gradient-text">after the alert.</span></h2>
            </header>

            <div className="feature-matrix">
              <article className="feature-row"><span className="number-icon">01</span><div><h3>AI user simulation</h3><p>Explore color-blind, low-vision, motor, and screen-reader perspectives.</p></div></article>
              <article className="feature-row"><span className="number-icon">02</span><div><h3>Severity-weighted findings</h3><p>Prioritize critical, serious, moderate, and minor barriers first.</p></div></article>
              <article className="feature-row"><span className="number-icon">03</span><div><h3>Before-and-after code</h3><p>Inspect suggested changes before a developer decides to use them.</p></div></article>
              <article className="feature-row"><span className="number-icon">04</span><div><h3>India compliance context</h3><p>Connect findings with RPwD, IS 17802, and GIGW context.</p></div></article>
              <article className="feature-row"><span className="number-icon">05</span><div><h3>Developer dashboard</h3><p>See barriers by journey, severity, impact, and next action.</p></div></article>
              <article className="feature-row"><span className="number-icon">06</span><div><h3>Manual-test guidance</h3><p>Clearly identify what needs real-user or specialist review.</p></div></article>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        <section id="who-it-helps" className="section reveal" ref={addReveal}>
          <div className="container">
            <header className="section-heading">
              <p className="eyebrow">Who it helps</p>
              <h2>Designed for teams building <span className="gradient-text">India&rsquo;s digital future.</span></h2>
            </header>

            <div className="audience">
              <article className="audience-card">
                <div className="bento-icon">
                  <svg width="23" height="23" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3>Startups &amp; product teams</h3>
                <p>Bring accessibility into the product process early, with concrete direction engineers can act on.</p>
              </article>

              <article className="audience-card">
                <div className="bento-icon">
                  <svg width="23" height="23" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3>Banks &amp; fintech</h3>
                <p>Make financial journeys inclusive while preparing your teams for accessibility expectations.</p>
              </article>

              <article className="audience-card">
                <div className="bento-icon">
                  <svg width="23" height="23" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3>Government &amp; public sector</h3>
                <p>Support accessible citizen-facing services and understand GIGW and RPwD accessibility context.</p>
              </article>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        <section id="how-it-works" className="section reveal" ref={addReveal}>
          <div className="container">
            <header className="section-heading">
              <p className="eyebrow">Simple workflow</p>
              <h2>From website URL to <span className="gradient-text">clear next steps.</span></h2>
            </header>

            <div className="timeline">
              <article className="timeline-item"><span className="timeline-number">1</span><div className="timeline-copy"><h3>Enter your website URL</h3><p>Add a URL or choose a demo. AccessLens targets important journeys such as sign-up, forms, and checkout.</p></div></article>
              <article className="timeline-item"><span className="timeline-number">2</span><div className="timeline-copy"><h3>Review disabled-user perspectives</h3><p>See where color-blind, low-vision, motor-impaired, and screen-reader users can face barriers.</p></div></article>
              <article className="timeline-item"><span className="timeline-number">3</span><div className="timeline-copy"><h3>Understand issues and suggestions</h3><p>Read the human impact, inspect suggested code, and identify what needs manual testing.</p></div></article>
              <article className="timeline-item"><span className="timeline-number">4</span><div className="timeline-copy"><h3>Connect to Indian accessibility context</h3><p>Relate findings to RPwD, IS 17802, and GIGW without overpromising one-click compliance.</p></div></article>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        <section id="about" className="section reveal" ref={addReveal}>
          <div className="container">
            <article className="about-card">
              <p className="eyebrow">About AccessLens</p>
              <h2>Inclusion should be part of <span className="gradient-text">every digital journey.</span></h2>
              <p>AccessLens is an AI-powered accessibility testing platform built for India&rsquo;s digital reality. We help startups, banks, and government teams understand and reduce accessibility barriers before they become user-experience or compliance problems.</p>
              <p>Our mission is to make Indian websites more inclusive&mdash;not merely compliant on paper, but genuinely easier for people with disabilities to use.</p>
              <p className="about-note">Built by developers who care about inclusion, for teams that need to ship accessible products.</p>
              <button className="return-link" type="button" onClick={goToDashboard}>
                {user ? "Ready to test your website? Go to your dashboard →" : "Ready to test your website? Sign up to get started →"}
              </button>
            </article>
          </div>
        </section>

        <section className="closing reveal" ref={addReveal}>
          <div className="container">
            <h2>Make your site <span className="gradient-text">inclusive today.</span></h2>
            <p>Build experiences that work for more people&mdash;and make accessibility a practical part of your product process.</p>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-inner">
          <div>
            <div className="footer-brand">AccessLens &mdash; AI Accessibility Testing for India</div>
            <p className="footer-sub">RPwD Act &bull; IS 17802 &bull; GIGW 3.0</p>
          </div>
          <span className="copyright">&copy; 2026 AccessLens. All rights reserved.</span>
        </div>
      </footer>

      <button className="motion-toggle" type="button" onClick={toggleMotion} aria-pressed={!motionEnabled}>
        <i />
        <span>Motion: {motionEnabled ? "On" : "Off"}</span>
      </button>

      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSubmit={handleAuthSubmit} />
      )}

      <div className={`toast${toastMessage ? " show" : ""}`} role="status" aria-live="polite">
        {toastMessage}
      </div>
    </div>
  );
}
