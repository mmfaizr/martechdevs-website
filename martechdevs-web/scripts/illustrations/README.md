# Service illustrations

The eight pictures beside the service sections in
[AllServiceSections.tsx](../../src/components/AllServiceSections.tsx). They are
**generated**, not drawn. Editing `public/assets/*-animated.svg` by hand means the
next build throws the edit away.

Build all eight:

```bash
cd martechdevs-web && for f in scripts/illustrations/build_*.py; do PYTHONPATH=scripts/illustrations python3 "$f"; done
```

## The system

`kit.py` is the design system, and it is the only place any of it lives. Canvas,
palette, radii, type, icons, motion. Each `build_*.py` only says what goes where
and when. Consistency is therefore structural: two illustrations cannot drift
apart in size or colour without someone editing the kit, which changes all eight.

- **Canvas is 350x330 and matches the display size 1:1.** The illustration column
  is `max-w-[400px]` with padding, so these render at about 350px wide. A unit is
  a screen pixel, so `font-size 11` really is 11px. The previous Figma exports were
  ~480 wide and lost a quarter of their type size to the downscale, which is why
  their labels were unreadable.
- **Green is reserved for live things**: the sweeps, nodes, icons, one solid chip.
  Everything else is white, near-white or grey. The section tint behind the card
  supplies the variety.
- **Text is a garnish.** These render as an `img src`, where the page's webfont is
  not available, so labels fall back to whatever sans the viewer has. Nothing may
  depend on text to be understood, and containers are sized off a deliberately wide
  estimate (`text_w`) so a fallback font cannot overflow them.

## The motion

One idea: a bright segment travels the connector, and whatever it reaches responds.

Every connector is drawn twice, with the same path data:

```python
d = "M52 76 V94 a10 10 0 0 0 10 10 H165 a10 10 0 0 1 10 10 V148"
s.line(d)                                   # the resting mint line
land = s.sweep(d, start=3, span=30)         # the bright travelling segment
s.chip(240, 171, "Merged", solid=True, beat=land)   # ...and what answers it
```

`sweep` returns the cycle percent at which the head lands, so arrival beats are
never hand-timed. Every path carries `pathLength="100"`, which normalises it to 100
units, so the dash maths is in percent and **no path ever has to be measured**.
Remove that attribute and the sweeps break.

Timings are all percentages of one cycle. Leave the last ~20% quiet; a loop with no
rest reads as frantic.

## Looking at your work

The rasteriser draws frame 0, where every sweep sits just off the start of its line,
so a plain render tells you nothing about the motion. `s.write(frame=N)` also bakes
a still with the sweeps frozen at `N` percent:

```bash
PYTHONPATH=scripts/illustrations python3 scripts/illustrations/build_1_cdp.py
RENDER_OUT=/tmp/ill node scripts/illustrations/render.js cdp cdp-frame
```

Stills land in `scripts/illustrations/.preview/`, which is gitignored. They are a
working artefact, so they deliberately do not go in `public/` where they would be
served and committed alongside the real files.

Orbs never appear in a still: they ride `offset-path`, which the rasteriser does not
implement. Judge motion from the bright segments.

To judge the set rather than one file, `python3 scripts/illustrations/contact.py`
lays all eight out side by side. That is the only reliable way to catch one of them
being busier or emptier than the rest.

## Traps

- **No angle brackets inside the style block.** It is parsed as XML and anything
  that looks like a tag takes the whole document down. This includes comments.
- **A tint beat carries its element's own colours** as `--base` and `--hot`, because
  the keyframe cannot know them. The first version hard-coded one pair and silently
  repainted every white panel to the tile grey.
- Accessibility: every file honours `prefers-reduced-motion` with one blanket rule,
  so a beat added later cannot be forgotten and keep moving.
