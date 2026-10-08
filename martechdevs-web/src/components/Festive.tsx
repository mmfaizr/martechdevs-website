/**
 * Celebration pieces shared by the acquisition ribbon and the startup offer.
 * Drawn rather than emoji, so they look the same on every platform and sit on
 * the site's colours.
 */

/**
 * Deep emerald into a teal-green glow, then forest green. Every stop is dark
 * enough that white text and the amber-200 link hold at least 4.5:1 contrast.
 */
export const RIBBON_GRADIENT = 'linear-gradient(90deg, #064E3B 0%, #0B6E5F 50%, #166534 100%)';

export function Popper({ flip = false, className = 'h-5 w-5' }: { flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} shrink-0`}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
    >
      <path d="M4 20l4.5-12 7.5 7.5z" fill="#F5B942" stroke="#F5B942" strokeWidth={1.5} />
      <path d="M6.6 14.6l2.8 2.8M8 10.8l5.2 5.2" stroke="#2B3B31" strokeWidth={1.2} />
      <path d="M14 4.5c.6 1.4.4 2.6-.6 3.6M19.5 10c-1.4-.6-2.6-.4-3.6.6" stroke="#5EEAD4" strokeWidth={1.75} />
      <path d="M17 3.5v2M20.5 6.5h-2" stroke="#FCA5A5" strokeWidth={1.75} />
      <circle cx="11" cy="3.5" r="1" fill="#FCA5A5" />
      <circle cx="20.5" cy="13.5" r="1" fill="#5EEAD4" />
    </svg>
  );
}

/** Confetti scattered behind a heading. Purely decorative, placed absolutely. */
// Kept to the outer edges, clear of the heading and the proof line.
const PIECES: [number, number, string, 'dot' | 'bar' | 'curl', number][] = [
  [2, 22, '#5EEAD4', 'bar', 30], [7, 58, '#FCA5A5', 'dot', 0], [6, 10, '#F5B942', 'curl', 0],
  [3, 84, '#0F766E', 'dot', 0], [9, 74, '#86EFAC', 'bar', -25], [9, 36, '#F5B942', 'dot', 0],
  [90, 12, '#FCA5A5', 'bar', 35], [94, 52, '#5EEAD4', 'dot', 0], [91, 80, '#F5B942', 'bar', -40],
  [96, 30, '#86EFAC', 'curl', 0], [89, 64, '#0F766E', 'dot', 0], [97, 88, '#FCA5A5', 'dot', 0],
];

export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block" aria-hidden="true">
      {PIECES.map(([left, top, color, shape, rotate], i) => (
        <span
          key={i}
          className="quote-confetti absolute"
          style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${i * 0.12}s` }}
        >
          {shape === 'dot' && <span className="block h-2 w-2 rounded-full" style={{ background: color }} />}
          {shape === 'bar' && <span className="block h-1.5 w-4 rounded-full" style={{ background: color, transform: `rotate(${rotate}deg)` }} />}
          {shape === 'curl' && (
            <svg viewBox="0 0 20 12" className="h-3 w-5" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
              <path d="M2 8c2-5 4-5 6 0s4 5 6 0 3-4 4-2" />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
}
