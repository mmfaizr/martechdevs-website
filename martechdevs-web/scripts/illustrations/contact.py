#!/usr/bin/env python3
"""Contact sheet: every illustration side by side, resting and mid-motion.

The set has to be judged as a set, and eight files opened one at a time never
shows you that one of them is busier or emptier than the rest.

  python3 scripts/illustrations/contact.py            resting
  python3 scripts/illustrations/contact.py 24         frozen at 24% of each cycle
"""
import subprocess
import sys
from pathlib import Path

NAMES = ["cdp", "messaging", "analytics", "support",
         "conversion", "warehouse", "crm", "activation"]
COLS, CELL_W, CELL_H, GAP, LABEL = 4, 350, 330, 14, 20


def main():
    frame = len(sys.argv) > 1
    PREVIEW = Path("scripts/illustrations/.preview")
    PREVIEW.mkdir(parents=True, exist_ok=True)

    def source(n):
        """The live file, or the baked motion still. hrefs are relative to the
        contact sheet, which lives in .preview alongside the frames."""
        if frame:
            p = PREVIEW / f"{n}-frame.svg"
            return (p, f"{n}-frame.svg") if p.exists() else (p, None)
        p = Path("public/assets") / f"{n}-animated.svg"
        return (p, f"../../../public/assets/{n}-animated.svg")

    missing = [n for n in NAMES if not source(n)[0].exists()]

    rows = (len(NAMES) + COLS - 1) // COLS
    w = COLS * CELL_W + (COLS + 1) * GAP
    h = rows * (CELL_H + LABEL) + (rows + 1) * GAP

    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
             f'width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
             f'<rect width="{w}" height="{h}" fill="#F7FAF8"/>']
    for i, n in enumerate(NAMES):
        cx = GAP + (i % COLS) * (CELL_W + GAP)
        cy = GAP + (i // COLS) * (CELL_H + LABEL + GAP)
        src, href = source(n)
        parts.append(f'<rect x="{cx}" y="{cy}" width="{CELL_W}" height="{CELL_H}" fill="#fff" rx="8"/>')
        if src.exists() and href:
            parts.append(f'<image x="{cx}" y="{cy}" width="{CELL_W}" height="{CELL_H}" '
                         f'xlink:href="{href}"/>')
        else:
            parts.append(f'<text x="{cx + 12}" y="{cy + 30}" font-size="16" fill="#c00">missing</text>')
        parts.append(f'<text x="{cx}" y="{cy + CELL_H + 14}" font-family="sans-serif" '
                     f'font-size="13" fill="#2B3B31">{i + 1}. {n}</text>')
    parts.append("</svg>")

    out = PREVIEW / "_contact.svg"
    out.write_text("\n".join(parts), encoding="utf-8")
    print(f"{out}  ({len(NAMES) - len(missing)}/{len(NAMES)} present)")
    if missing:
        print("missing:", ", ".join(missing))
    subprocess.run(["node", "scripts/illustrations/render.js", "_contact"], check=False)


if __name__ == "__main__":
    main()
