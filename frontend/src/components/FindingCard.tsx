import type { Finding } from "@/lib/types";
import { PERSONA_LABEL } from "@/lib/types";

const SEVERITY_STYLE: Record<Finding["severity"], string> = {
  critical: "bg-rose-500/20 text-rose-200 border-rose-500/40",
  serious: "bg-rose-500/15 text-rose-200 border-rose-500/30",
  moderate: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  minor: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export default function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="font-semibold text-slate-100">{finding.title}</h4>
        <span className={`text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${SEVERITY_STYLE[finding.severity]}`}>
          {finding.severity}
        </span>
        <span className="text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-200">
          {PERSONA_LABEL[finding.persona]}
        </span>
        <span
          className={`text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
            finding.auto_fixable
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-slate-500/30 bg-slate-500/10 text-slate-300"
          }`}
        >
          {finding.auto_fixable ? "Auto-fixable" : "Needs manual review"}
        </span>
      </div>

      <p className="text-sm text-slate-300">{finding.user_impact}</p>

      <p className="text-sm text-slate-400">
        <span className="font-semibold text-slate-300">Suggested fix: </span>
        {finding.suggested_fix}
      </p>

      {(finding.code_before || finding.code_after) && (
        <div className="grid sm:grid-cols-2 gap-2">
          {finding.code_before && (
            <div>
              <p className="text-[0.65rem] uppercase tracking-wide text-slate-500 mb-1">Before</p>
              <pre className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 overflow-x-auto"><code>{finding.code_before}</code></pre>
            </div>
          )}
          {finding.code_after && (
            <div>
              <p className="text-[0.65rem] uppercase tracking-wide text-slate-500 mb-1">After</p>
              <pre className="text-xs bg-slate-950 border border-emerald-800/50 rounded-lg p-2 overflow-x-auto"><code>{finding.code_after}</code></pre>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] text-slate-500">
        {finding.wcag_ref && <span>WCAG {finding.wcag_ref}</span>}
        {finding.compliance_tags.map((t, i) => (
          <span key={i}>{t.law}: {t.reference}</span>
        ))}
      </div>
    </div>
  );
}
