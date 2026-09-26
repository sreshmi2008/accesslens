import type { Finding } from "@/lib/types";
import { PERSONA_LABEL } from "@/lib/types";

const SEVERITY_STYLE: Record<Finding["severity"], string> = {
  critical: "bg-rose-500/15 text-rose-500 border-rose-500/30",
  serious: "bg-rose-500/10 text-rose-500 border-rose-500/25",
  moderate: "bg-amber-500/10 text-amber-500 border-amber-500/25",
  minor: "border-[var(--border-strong)]",
};

const SEVERITY_BAR: Record<Finding["severity"], string> = {
  critical: "#f43f5e",
  serious: "#fb7185",
  moderate: "#f59e0b",
  minor: "var(--border-strong)",
};

export default function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div className="al-card relative p-4 pl-5 space-y-3 overflow-hidden">
      <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: SEVERITY_BAR[finding.severity] }} />

      <div className="flex flex-wrap items-center gap-2">
        <h4 className="font-semibold" style={{ color: "var(--text)" }}>{finding.title}</h4>
        <span className={`text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${SEVERITY_STYLE[finding.severity]}`}>
          {finding.severity}
        </span>
        <span
          className="text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border"
          style={{ borderColor: "var(--accent)", background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          {PERSONA_LABEL[finding.persona]}
        </span>
        <span
          className={`text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
            finding.auto_fixable ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : ""
          }`}
          style={!finding.auto_fixable ? { borderColor: "var(--border-strong)", color: "var(--text-muted)" } : undefined}
        >
          {finding.auto_fixable ? "Auto-fixable" : "Needs manual review"}
        </span>
      </div>

      <p className="text-sm" style={{ color: "var(--text)" }}>{finding.user_impact}</p>

      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        <span className="font-semibold" style={{ color: "var(--text)" }}>Suggested fix: </span>
        {finding.suggested_fix}
      </p>

      <p className="text-sm rounded-lg p-2.5 border" style={{ color: "var(--text-muted)", background: "var(--background)", borderColor: "var(--border)" }}>
        <span className="font-semibold" style={{ color: "var(--accent)" }}>Manual test: </span>
        {finding.manual_test_hint}
      </p>

      {(finding.code_before || finding.code_after) && (
        <div className="grid sm:grid-cols-2 gap-2">
          {finding.code_before && (
            <div>
              <p className="text-[0.65rem] uppercase tracking-wide mb-1" style={{ color: "var(--text-faint)" }}>Before</p>
              <pre className="text-xs rounded-lg p-2 overflow-x-auto border" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                <code>{finding.code_before}</code>
              </pre>
            </div>
          )}
          {finding.code_after && (
            <div>
              <p className="text-[0.65rem] uppercase tracking-wide mb-1" style={{ color: "var(--text-faint)" }}>After</p>
              <pre className="text-xs rounded-lg p-2 overflow-x-auto border border-emerald-500/30" style={{ background: "var(--background)", color: "var(--text-muted)" }}>
                <code>{finding.code_after}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem]" style={{ color: "var(--text-faint)" }}>
        {finding.wcag_ref && <span>WCAG {finding.wcag_ref}</span>}
        {finding.compliance_tags.map((t, i) => (
          <span key={i}>{t.law}: {t.reference}</span>
        ))}
      </div>
    </div>
  );
}
