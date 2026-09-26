"use client";

import { useEffect, useRef, useState } from "react";

export default function ScreenReaderDemo({ tree }: { tree: string[] }) {
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  function play() {
    if (!supported || tree.length === 0) return;
    window.speechSynthesis.cancel();
    cancelledRef.current = false;
    setPlaying(true);

    let i = 0;
    const speakNext = () => {
      if (cancelledRef.current || i >= tree.length) {
        setPlaying(false);
        setCurrentIndex(-1);
        return;
      }
      setCurrentIndex(i);
      const utterance = new SpeechSynthesisUtterance(tree[i]);
      utterance.rate = 1.05;
      utterance.onend = () => {
        i += 1;
        speakNext();
      };
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  }

  function stop() {
    cancelledRef.current = true;
    window.speechSynthesis.cancel();
    setPlaying(false);
    setCurrentIndex(-1);
  }

  if (!supported) {
    return <p className="text-sm" style={{ color: "var(--text-muted)" }}>Your browser doesn&rsquo;t support speech synthesis for this demo.</p>;
  }

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Hear what a screen reader announces walking this page.</p>
        <button
          onClick={playing ? stop : play}
          disabled={tree.length === 0}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border disabled:opacity-40"
          style={{ background: "var(--accent-soft)", borderColor: "var(--accent)", color: "var(--accent)" }}
        >
          {playing ? "Stop" : "Play"}
        </button>
      </div>
      <ol className="max-h-64 overflow-y-auto text-sm font-mono space-y-1">
        {tree.map((line, i) => (
          <li
            key={i}
            className="px-2 py-1 rounded"
            style={i === currentIndex ? { background: "var(--accent-soft)", color: "var(--accent)" } : { color: "var(--text-muted)" }}
          >
            {line}
          </li>
        ))}
        {tree.length === 0 && <li style={{ color: "var(--text-faint)" }}>No accessibility tree captured for this page.</li>}
      </ol>
    </div>
  );
}
