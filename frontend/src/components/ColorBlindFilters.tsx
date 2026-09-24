export const COLOR_BLIND_MODES = {
  normal: { label: "Typical vision", filterId: null },
  protanopia: { label: "Protanopia (red-blind)", filterId: "cb-protanopia" },
  deuteranopia: { label: "Deuteranopia (green-blind)", filterId: "cb-deuteranopia" },
  tritanopia: { label: "Tritanopia (blue-blind)", filterId: "cb-tritanopia" },
} as const;

export type ColorBlindMode = keyof typeof COLOR_BLIND_MODES;

/** Approximate dichromacy simulation matrices (Brettel/Vienot-derived, the
 * same values used by common browser-extension colorblindness simulators).
 * Rendered once as hidden SVG <filter> defs; components apply them via
 * `filter: url(#cb-protanopia)` etc. */
export default function ColorBlindFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <filter id="cb-protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0     0 0
                    0.558 0.442 0     0 0
                    0     0.242 0.758 0 0
                    0     0     0     1 0"
          />
        </filter>
        <filter id="cb-deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0   0 0
                    0.7   0.3   0   0 0
                    0     0.3   0.7 0 0
                    0     0     0   1 0"
          />
        </filter>
        <filter id="cb-tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95 0.05  0     0 0
                    0    0.433 0.567 0 0
                    0    0.475 0.525 0 0
                    0    0     0     1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}
