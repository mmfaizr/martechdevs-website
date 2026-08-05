"""Shared kit for the eight service illustrations.

Consistency is structural here, not a convention anyone has to remember: every
illustration is composed from the primitives below, so they cannot drift apart in
canvas size, palette, radius, type or motion. To change the set, change the kit.

The output is a plain .svg referenced with an img src, so all motion is CSS and
none of it can rely on script, hover, or the page's webfont.

Two rules that bite if forgotten:
  - No angle brackets inside the style block. It is parsed as XML and anything
    that looks like a tag takes the whole document down.
  - A beat may change colour but never geometry. An animated scale composes after
    an element's own transform, so it displaces whatever it is drawing attention
    to. That is what threw icons out of their tiles.
"""
import html
import json
import re
import sys
import xml.dom.minidom
from pathlib import Path

from pathlen import path_length

ASSETS = Path("public/assets")
# Preview stills are a working artefact, not part of the site, so they stay out
# of public/ where they would otherwise be served and committed.
PREVIEW = Path("scripts/illustrations/.preview")
# The real brand marks the site already ships and shows in each section's tool
# pills. Reused here so a tile that means "Segment" actually says Segment.
LOGO_DIR = ASSETS / "tool logos icons"

# ---------------------------------------------------------------- canvas ---
# The illustration column is max-w-[400px] with p-6, so these display at about
# 350px wide. The viewBox matches that 1:1 on purpose: a unit is a screen pixel,
# so a font-size of 12 really is 12px and nothing can be laid out at a size that
# turns out to be unreadable. The old Figma exports were ~480 wide and lost a
# quarter of their type size to the downscale.
W, H = 350, 330

# ------------------------------------------------------------------ ink ----
# Green is a hierarchy, not one colour. Saturated green everywhere flattens the
# picture and gives the eye nowhere to land, so only the moving pointer and one
# accent per illustration are allowed to be bright.
INK = "#2B3B31"
GREEN = "#3FBE8C"        # accents only: the one solid chip, a live highlight
FLOW = "#2A9E73"         # the travelling pointer, deeper so it reads on the line
GREEN_DEEP = "#2A9E73"
GREEN_PALE = "#E4F5EC"   # tinted surface
LINE = "#D3E8DD"         # resting connector, quiet enough for the pointer to show
MUTED = "#7B9188"        # icons for sources and destinations: present, not shouting
SURFACE = "#FFFFFF"
TILE = "#F2F6F4"         # inset surface inside a panel
BORDER = "#E4E9E6"
BAR = "#E8EDEA"          # placeholder text
BAR_DARK = "#D3DCD7"

# ----------------------------------------------------------------- scale ---
CHIP_WEIGHT = 500        # chips are statuses, not headings
ICON_STROKE = 1.4        # at 1.8 the icon set read heavier than the type beside it
R_PANEL = 14
R_TILE = 10
CONN = 7                 # connector stroke width

# --------------------------------------------------------------- rhythm ---
# TRAVEL is the time ANY line takes to cross, regardless of how long it is, and
# there is exactly one pointer on each. So every pointer in the set sits at the
# same fraction of its own line at the same instant, and a fan-out delivers to
# all its branches together.
#
# Deriving travel from length instead - constant speed - is what made this look
# random: the four branches of a fan-out are different lengths, so their pointers
# drifted apart and arrived at four different moments. Equal timing reads as one
# message going out; equal speed reads as noise. Timing wins.
# What read as blinking was never the speed, it was the number of things
# reacting: icons, roundels and bars all flashing on the same beat. Those are
# gone, so the pointer can move at a natural pace again. 1.3 was frantic, 3.2 was
# a crawl; 2.0 is a walk.
STAGE = 2.0             # seconds for a pointer to cross one leg
TRAVEL = STAGE          # kept for readability at call sites
CYCLE = STAGE           # a one-leg illustration; Scene(stages=n) lengthens it
FONT = ("Inter Tight, Inter, ui-sans-serif, system-ui, -apple-system, "
        "Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif")


def text_w(s, size, weight=500):
    """Conservative width estimate, used to size anything that wraps around a
    label. The file renders in whatever sans the viewer has, so containers are
    sized for the wide end rather than measured against one font."""
    per = 0.60 if weight >= 600 else 0.575
    return len(s) * size * per


# ------------------------------------------------------------------ icons --
# All drawn on a 24x24 box, stroke-only, so one style rule covers the set and
# any icon can be dropped into any tile at any size.
ICONS = {
    "user":     "M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4.5 20a7.5 7.5 0 0 1 15 0",
    "users":    "M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 20a6.5 6.5 0 0 1 13 0M16.5 5.2a3.5 3.5 0 0 1 0 6.6M18 14.4a6.5 6.5 0 0 1 3 5.6",
    "mail":     "M3.5 6.5h17v11h-17zM3.5 7.2 12 13l8.5-5.8",
    "chat":     "M4 5.5h16v11H9l-4 3.5v-3.5H4z",
    "bell":     "M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10M10 18.5a2.2 2.2 0 0 0 4 0",
    "phone":    "M8 3h8a1.5 1.5 0 0 1 1.5 1.5v15A1.5 1.5 0 0 1 16 21H8a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 8 3M10.5 18h3",
    "cursor":   "M6 4l12 6.2-5.1 1.6L11 18z",
    "cart":     "M3.5 5h2.2l2.1 9.2h9l1.9-6.7H7M9.5 19a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4M16.5 19a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4",
    "tag":      "M11.2 3.5H20v8.8l-8.6 8.6-8.8-8.8zM16 8.2h.01",
    "db":       "M12 3.5c4.1 0 7 1.2 7 2.6S16.1 8.8 12 8.8 5 7.6 5 6.1 7.9 3.5 12 3.5M5 6.1v11.8c0 1.4 2.9 2.6 7 2.6s7-1.2 7-2.6V6.1M5 12c0 1.4 2.9 2.6 7 2.6s7-1.2 7-2.6",
    "cloud":    "M7 18.5a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17.4 11a3.8 3.8 0 0 1-.4 7.5z",
    "server":   "M4 4.5h16v6H4zM4 13.5h16v6H4zM7.5 7.5h.01M7.5 16.5h.01",
    "chart":    "M4 20V9.5M10 20V4.5M16 20v-7M4 20h16",
    "trend":    "M4 16.5l5-5 3.5 3.5L20 7.5M20 7.5h-5M20 7.5v5",
    "funnel":   "M3.5 4.5h17l-6.6 7.6v7.4l-3.8-2.4v-5z",
    "target":   "M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8M12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4",
    "shield":   "M12 3.5l7 2.6v5.6c0 4.3-3 7.4-7 8.8-4-1.4-7-4.5-7-8.8V6.1zM9 12l2.2 2.2L15.5 10",
    "bolt":     "M13.5 3 5.5 13.5h5.5L10.5 21l8-10.5H13z",
    "sync":     "M20 12a8 8 0 0 1-13.7 5.6M4 12a8 8 0 0 1 13.7-5.6M4.5 17.5V13H9M19.5 6.5V11H15",
    "filter":   "M4 5.5h16M7 12h10M10 18.5h4",
    "check":    "M5 12.5l4.5 4.5L19 7",
    "spark":    "M12 3.5l2.2 5.3 5.3 2.2-5.3 2.2L12 18.5l-2.2-5.3L4.5 11l5.3-2.2zM18.5 16.5l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9z",
    "lock":     "M6.5 10.5h11v9h-11zM8.8 10.5V7.8a3.2 3.2 0 0 1 6.4 0v2.7",
    "grid":     "M4 4.5h6.5V11H4zM13.5 4.5H20V11h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z",
    "clock":    "M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17M12 7.5V12l3 2",
    "route":    "M6.5 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M17.5 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M6.5 8.5V14a4 4 0 0 0 4 4h4",
    "eye":      "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
    "star":     "M12 3.5l2.7 5.5 6 .9-4.35 4.2 1.03 6L12 17.25 6.62 20.1l1.03-6L3.3 9.9l6-.9z",
    "layers":   "M12 3.5 21 8l-9 4.5L3 8zM3 12.5l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5",
    "money":    "M3.5 6.5h17v11h-17zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6.5 9.5h.01M17.5 14.5h.01",
    "gauge":    "M4.5 17.5a8.5 8.5 0 1 1 15 0M12 13.5l4-4",
    "inbox":    "M3.5 13.5h5a3.5 3.5 0 0 0 7 0h5M3.5 13.5 6 5h12l2.5 8.5v5.5h-17z",
    "toggle":   "M8 7.5h8a4.5 4.5 0 0 1 0 9H8a4.5 4.5 0 0 1 0-9M16 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
    "search":   "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M16 16l4.5 4.5",
    "split":    "M3.5 12h5l4-6h7M8.5 12h4l4 6h4M17 3l3.5 3-3.5 3M17 15l3.5 3-3.5 3",
    "plug":     "M9 3.5v5M15 3.5v5M6.5 8.5h11v3a5.5 5.5 0 0 1-11 0zM12 17v3.5",
    "flag":     "M6 20.5v-17M6 4.5h11l-2.2 4L17 12.5H6",
}


def logo_names():
    return sorted(p.name[:-len(" logo icon.svg")] for p in LOGO_DIR.glob("* logo icon.svg"))


class Scene:
    """One illustration. Primitives append markup in call order, so later calls
    paint on top - compose back to front."""

    def __init__(self, name, ident, stages=1, cycle=None, note=""):
        """`stages` is how many legs the flow has end to end.

        A fan-out is two: the trunk, then the branches. Putting all of it on one
        leg meant four pointers queued along the shared trunk and only then
        diverged, which reads as four separate things milling about rather than
        one message being split. With two legs, one pointer runs the trunk and
        four leave the split together the moment it lands.
        """
        self.name = name
        self.id = ident
        self.stages = max(1, stages)
        self.cycle = round(cycle or self.stages * STAGE, 3)
        self.note = note
        self.body = []
        self.defs = []
        self.css = []
        self.sweeps = []
        self.n = 0

    # -- helpers -----------------------------------------------------------
    def _id(self, kind):
        self.n += 1
        return f"{self.id}-{kind}{self.n}"

    def add(self, markup):
        self.body.append(markup)

    def at(self, pct=0):
        """A cycle percent as an animation-delay.

        Feed it what sweep() returned. A beat at any other moment fires while the
        pointer is still mid-line and reads as unrelated blinking rather than as
        a response, so anything not tied to an arrival is better left off.
        """
        return f"{(pct or 0) / 100 * self.cycle:g}s"

    def _beat(self, kind, at, base=None, hot=None):
        """Inline style that hangs a named beat off the shared clock.

        A tint carries the element's OWN resting and lit colours as custom
        properties, because the keyframe cannot know them. Hard-coding one pair in
        the keyframe silently repainted every white panel to the tile grey the
        first time this was written.
        """
        if at is None:
            return ""
        v = ""
        if base:
            v += f"--base:{base};"
        if hot:
            v += f"--hot:{hot};"
        return f' class="{kind}" style="{v}animation-delay:{self.at(at)}"'

    # -- surfaces ----------------------------------------------------------
    def panel(self, x, y, w, h, r=R_PANEL, fill=SURFACE, shadow=True, beat=None):
        f = f' filter="url(#{self.id}-sh)"' if shadow else ""
        self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" '
                 f'stroke="{BORDER}"{f}{self._beat("tint", beat, fill, GREEN_PALE)}/>')

    def tile(self, x, y, s=44, icon=None, r=R_TILE, beat=None, live=False):
        """A pale rounded square holding an icon. `live` paints it in brand green."""
        fill = GREEN_PALE if live else TILE
        hot = "#C9E9D9" if live else "#DFF2E8"
        # rect and icon share one group so a hover can light both, and so the
        # whole tile is one hit target rather than the icon strokes being it
        self.add('<g class="hit">')
        self.add(f'<rect x="{x}" y="{y}" width="{s}" height="{s}" rx="{r}" fill="{fill}" '
                 f'stroke="{BORDER}"{self._beat("tint", beat, fill, hot)}/>')
        if icon:
            self.icon(icon, x + s / 2, y + s / 2, s * 0.48, beat=beat)
        self.add("</g>")

    def icon(self, name, cx, cy, size=18, color=MUTED, beat=None):
        # `beat` is accepted and ignored. An icon that changes colour every time a
        # pointer lands is six or seven things flickering on a busy card, and none
        # of them is the thing that actually received anything.
        beat = None
        """An icon from the set, centred on (cx, cy).

        The positioning transform and the animated scale live on SEPARATE
        elements, and they have to. CSS applies the independent `scale` property
        after the `transform` attribute, so with both on one element the
        transform-origin lands in the wrong coordinate space and the icon shoots
        away from its own position as it pops - measured at 50px for an icon
        near the right edge. Outer g places, inner g animates.
        """
        if name not in ICONS:
            sys.exit(f"[{self.id}] no icon '{name}'. have: {', '.join(sorted(ICONS))}")
        k = size / 24
        inner = (f'<g{self._beat("pop", beat, color, FLOW)} stroke="{color}" '
                 f'stroke-width="{ICON_STROKE / k:.2f}" '
                 f'stroke-linecap="round" stroke-linejoin="round" fill="none">'
                 f'<path d="{ICONS[name]}"/></g>')
        self.add(f'<g transform="translate({cx - size / 2:.2f} {cy - size / 2:.2f}) '
                 f'scale({k:.4f})">{inner}</g>')

    def rise_style(self, order=0, step=0.22):
        """Schedule something to appear just after the current deck card does.

        Inside a deck variant the pointer clock is the wrong clock: it repeats
        every couple of seconds regardless of which card is showing, so anything
        hung off it re-animates under a card that has been sitting there for ten
        seconds. This returns a delay on the DECK's clock instead, so a row of
        things can come in one after another once, as the card lands.
        """
        if not getattr(self, "_deck", None):
            return ""
        secs, start = self._deck
        return (f' class="rise" style="animation-delay:{start + order * step:g}s;'
                f'animation-duration:{secs:g}s"')

    def bar(self, x, y, w, h=7, tone=BAR, beat=None, grow=None, centred=False,
            rise=None):
        """Placeholder copy. `grow` makes it wipe in at that time.

        `centred` wipes from the middle outwards rather than from the left edge.

        `rise` settles the bar into place instead of changing its width, and
        schedules it on the deck clock. For anything whose WIDTH is the number
        it reports, a funnel row being the obvious case, animating the width
        reads as the figure itself changing.
        """
        extra = ""
        if rise is not None or grow is not None:
            # Both are ignored now. A bar that wipes itself in on the pointer
            # clock redraws every few seconds for as long as the page is open,
            # which reads as a fault rather than as data arriving. Where the bar
            # sits inside a deck, the card turning over IS its entrance.
            pass
        elif False:
            cls = "grow-c" if centred else "grow"
            extra = f' class="{cls}" style="animation-delay:{self.at(grow)}"'
        elif beat is not None:
            extra = self._beat("tint", beat, tone, GREEN_PALE)
        self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h / 2}" '
                 f'fill="{tone}"{extra}/>')

    def chip(self, x, y, label, solid=False, size=11, h=22, icon=None, logo=None, beat=None):
        """A pill. Width follows the label so nothing overflows in a fallback font.

        `logo` puts a real brand mark in it, which is how a tool gets named
        without spending a whole tile on it.
        """
        pad = 9
        iw = h * 0.62 if (icon or logo) else 0
        w = pad * 2 + iw + text_w(label, size, 600)
        fill, fg = (GREEN, "#FFFFFF") if solid else (SURFACE, INK)
        stroke = "none" if solid else BORDER
        self.add(f'<rect x="{x}" y="{y}" width="{w:.1f}" height="{h}" rx="{h / 2}" '
                 f'fill="{fill}" stroke="{stroke}"'
                 f'{self._beat("tint", beat, fill, GREEN_DEEP if solid else GREEN_PALE)}/>')
        tx = x + pad
        if logo:
            self.logo(logo, x + pad + iw * 0.4, y + h / 2, h * 0.72)
            tx = x + pad + iw
        elif icon:
            self.icon(icon, x + pad + iw * 0.4, y + h / 2, h * 0.5,
                      color="#FFFFFF" if solid else GREEN)
            tx = x + pad + iw
        # A chip is a status, not a heading. At 600 the set read as a wall of bold
        # labels all shouting at the same volume. Width is still measured against
        # the heavier estimate so nothing tightens up as a result.
        self.label(tx, y + h / 2 + size * 0.35, label, size=size, weight=CHIP_WEIGHT, color=fg)
        return w

    @staticmethod
    def chip_width(label, size=11, h=22, marked=False):
        """What chip() will come out as, so a caller can centre one."""
        return 18 + (h * 0.62 if marked else 0) + text_w(label, size, 600)

    def label(self, x, y, s, size=11, weight=500, color=INK, opacity=1, anchor="start"):
        self.add(f'<text x="{x:.1f}" y="{y:.1f}" font-family="{FONT}" font-size="{size}" '
                 f'font-weight="{weight}" fill="{color}" fill-opacity="{opacity}" '
                 f'text-anchor="{anchor}">{html.escape(s)}</text>')

    def row(self, x, y, w, icon, title, meta=None, beat=None, rule=True):
        """The list row every panel in this set uses: round icon, title, meta."""
        cy = y + 12
        self.add('<g class="hit">')
        # fill:none plus pointer-events:all gives the whole row a hit area without
        # painting anything. It carries a class so the hover rule below cannot
        # mistake it for a surface and light it up.
        self.add(f'<rect class="hitbox" x="{x - 8}" y="{y - 4}" width="{w + 16}" '
                 f'height="32" rx="8" fill="none" pointer-events="all"/>')
        # the roundel is a label, not an indicator, so it holds still
        self.add(f'<circle cx="{x + 12}" cy="{cy}" r="12" fill="{GREEN_PALE}"/>')
        self.icon(icon, x + 12, cy, 13, color=GREEN, beat=beat)
        # Both lines sit two units higher than the roundel's centre would suggest.
        # A descender on the meta line reaches within 3.7 of the rule below it,
        # which is close enough to read as touching; at this offset it clears by
        # nearly six and the pair still looks centred against the roundel.
        self.label(x + 31, cy + (-2 if meta else 4), title, size=11, weight=600)
        if meta:
            self.label(x + 31, cy + 8, meta, size=9.5, weight=400, opacity=.5)
        self.add("</g>")
        if rule:
            self.add(f'<rect x="{x}" y="{y + 28}" width="{w}" height="1" fill="{BORDER}"/>')

    def logo(self, name, cx, cy, size=24):
        """A real brand mark, centred on (cx, cy).

        The shipped files are 42x42 with their own pale rounded background and
        the artwork as a pattern over an embedded bitmap. The background is
        dropped so the mark sits in this kit's own tile and inherits its tint,
        and every internal id is rewritten, because eight of these in one
        document would otherwise all define an id of "a".
        """
        src = LOGO_DIR / f"{name} logo icon.svg"
        if not src.exists():
            sys.exit(f"[{self.id}] no logo '{name}'. have: {', '.join(logo_names())}")
        raw = src.read_text(encoding="utf-8")

        body = re.sub(r"^.*?<svg[^>]*>|</svg>\s*$", "", raw, flags=re.S)
        defs = "".join(re.findall(r"<defs>(.*?)</defs>", body, flags=re.S))
        body = re.sub(r"<defs>.*?</defs>", "", body, flags=re.S)
        # drop the file's own tile so this kit's tile shows through
        body = re.sub(r'<rect[^>]*fill="#F7F8F7"[^>]*/>', "", body, count=1)

        tag = f"{self.id}-l{len(self.defs)}"
        for old in sorted(set(re.findall(r'id="([^"]+)"', defs)), key=len, reverse=True):
            for pat in (f'id="{old}"', f'href="#{old}"', f'url(#{old})'):
                body = body.replace(pat, pat.replace(old, f"{tag}-{old}"))
                defs = defs.replace(pat, pat.replace(old, f"{tag}-{old}"))

        self.defs.append(defs)
        k = size / 42
        self.add(f'<g transform="translate({cx - size / 2:.2f} {cy - size / 2:.2f}) '
                 f'scale({k:.4f})">{body}</g>')

    def _cycle_css(self, n, secs, slide=0):
        """Keyframes for n things sharing one spot, each shown in turn.

        The handover is SEQUENTIAL, not a crossfade. The outgoing slot is fully
        gone before the incoming one starts, because two half-transparent copies
        of a card sitting on top of each other read as a rendering fault rather
        than a change: you see through one set of words to another.

        `slide` adds a small vertical move, out upwards and in from below, which
        is what makes it read as one card being replaced instead of a group of
        labels blinking. Safe to animate here: a deck group carries no transform
        of its own, so there is nothing for the move to compose against.

        Every slot gets its own keyframe name because the first has to be lit at
        both 0% and 100%, which one shared keyframe cannot express.
        """
        names = []
        f = 100 / n * 0.16          # the swap itself, as a share of the cycle
        up = f"translate:0 -{slide}px;" if slide else ""
        dn = f"translate:0 {slide}px;" if slide else ""
        mid = "translate:0 0;" if slide else ""
        for i in range(n):
            a, b = i / n * 100, (i + 1) / n * 100
            k = self._id("br")
            # One formula for every slot including the first. Special-casing slot
            # zero to be lit at both 0% and 100% is what put it in a crossfade
            # with the last slot at the loop wrap: the only place two cards were
            # still visible together.
            self.css.append(
                f"  @keyframes {k} {{ 0%,{a:.4g}% {{ opacity:0; {dn} }} "
                f"{a + f:.4g}% {{ opacity:1; {mid} }} "
                f"{b - f:.4g}% {{ opacity:1; {mid} }} "
                f"{b:.4g}%,100% {{ opacity:0; {up} }} }}")
            names.append(k)
        return names, secs

    def cycle_slot(self, i, n, per=3.2):
        """Keyframe name and duration for slot `i` of `n` sharing one spot.

        For anything richer than a pill: wrap the content in a g with these and
        it takes its turn like the marks in brands() do.
        """
        if not hasattr(self, "_slots") or self._slots[0] != (n, per):
            self._slots = ((n, per), self._cycle_css(n, per * n)[0])
        # same reason as brands(): slot 0 rests visible, the rest rest hidden
        return self._slots[1][i], per * n, ("" if i == 0 else "opacity:0;")

    def deck(self, variants, per=4.5):
        """Content that turns over in place, so one card carries several use cases.

        `variants` is a list of zero-argument callables, each drawing one version:

            s.deck([
                lambda: s.label(70, 178, "Amara Osei", size=13, weight=700),
                lambda: s.label(70, 178, "Dan Whitfield", size=13, weight=700),
            ])

        Pass only the parts that DIFFER, not the panel around them. Swapping the
        chrome as well multiplies the markup for no visible gain, and every one of
        these ships inlined in the page bundle.

        Slot one rests visible and the rest rest hidden, so reduced motion leaves
        one readable card rather than all of them stacked on each other.
        """
        keys, secs = self._cycle_css(len(variants), per * len(variants), slide=6)
        fade = secs / len(variants) * 0.16
        for i, (draw, k) in enumerate(zip(variants, keys)):
            rest = "" if i == 0 else "opacity:0;"
            self.add(f'<g class="card" style="{rest}animation-name:{k};'
                     f'animation-duration:{secs:g}s">')
            # anything drawn with rise= schedules itself against THIS card
            # arriving, not against the pointer clock
            self._deck = (secs, i * per + fade)
            draw()
            self._deck = None
            self.add("</g>")

    @staticmethod
    def brands_width(options, h=22, size=11):
        """What brands() will come out as, so a caller can centre one."""
        return 18 + h * 0.62 + max(text_w(lbl, size, 600) for _, lbl in options)

    def brands(self, x, y, options, h=22, size=11, per=3.2):
        """One pill that cycles through interchangeable tools.

        The section sells an integration, not an allegiance to one vendor, so a
        single fixed mark reads as "this is the only one we do". The pill is
        sized to the widest name in the list so nothing reflows as it turns over,
        and the whole thing runs on its own slow clock, well off the motion beat
        so the two never look like they are trying to line up.

        `options` is a list of (logo name, label).
        """
        n = len(options)
        keys, secs = self._cycle_css(n, per * n)
        pad, iw = 9, h * 0.62
        w = pad * 2 + iw + max(text_w(lbl, size, 600) for _, lbl in options)
        self.add(f'<rect x="{x}" y="{y}" width="{w:.1f}" height="{h}" rx="{h / 2}" '
                 f'fill="{SURFACE}" stroke="{BORDER}"/>')
        for i, ((mark, label), k) in enumerate(zip(options, keys)):
            # Every slot but the first is hidden in the resting state, and the
            # animation overrides that. Without it, reduced motion switches the
            # cycling off and leaves all of them stacked on one spot, printing
            # something like "SegmentStack".
            rest = "" if i == 0 else "opacity:0;"
            self.add(f'<g class="brand" style="{rest}animation-name:{k};'
                     f'animation-duration:{secs:g}s">')
            self.logo(mark, x + pad + iw * 0.4, y + h / 2, h * 0.72)
            self.label(x + pad + iw, y + h / 2 + size * 0.35, label,
                       size=size, weight=CHIP_WEIGHT, color=INK)
            self.add("</g>")
        return w

    def logo_tile(self, x, y, name, s_=44, beat=None):
        """This kit's tile with a real brand mark in it."""
        self.tile(x, y, s_, None, beat=beat)
        self.logo(name, x + s_ / 2, y + s_ / 2, s_ * 0.56)

    # -- detail ------------------------------------------------------------
    # Depth, not more things. These add texture and a second layer of information
    # inside a surface that already exists, rather than another node on the
    # canvas. Adding nodes is what turns a diagram into a mess.

    def spark(self, x, y, w, h, vals, tone=None, dot=True):
        """A small trend line. `vals` are 0..1, left to right."""
        n = len(vals)
        pts = " ".join(f"{x + i / (n - 1) * w:.1f},{y + h - v * h:.1f}"
                       for i, v in enumerate(vals))
        self.add(f'<polyline points="{pts}" fill="none" stroke="{tone or LINE}" '
                 f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>')
        if dot:
            self.add(f'<circle cx="{x + w:.1f}" cy="{y + h - vals[-1] * h:.1f}" r="2.6" '
                     f'fill="{FLOW}"/>')

    def minibars(self, x, y, w, h, vals, gap=3, tone=None):
        """A short column chart. `vals` are 0..1."""
        n = len(vals)
        bw = (w - gap * (n - 1)) / n
        for i, v in enumerate(vals):
            bh = max(2, v * h)
            self.add(f'<rect x="{x + i * (bw + gap):.1f}" y="{y + h - bh:.1f}" '
                     f'width="{bw:.1f}" height="{bh:.1f}" rx="1.5" '
                     f'fill="{tone or BAR_DARK}"/>')

    def ring(self, cx, cy, r, pct, tone=None, width=4):
        """A donut gauge. Drawn as two arcs so it needs no dash maths."""
        import math
        a = -math.pi / 2 + 2 * math.pi * max(0.001, min(0.999, pct))
        big = 1 if pct > 0.5 else 0
        ex, ey = cx + r * math.cos(a), cy + r * math.sin(a)
        self.add(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{TILE}" '
                 f'stroke-width="{width}"/>')
        self.add(f'<path d="M{cx} {cy - r} A{r} {r} 0 {big} 1 {ex:.2f} {ey:.2f}" fill="none" '
                 f'stroke="{tone or GREEN}" stroke-width="{width}" stroke-linecap="round"/>')

    def steps(self, x, y, n, active, gap=7, r=2.6):
        """Progress dots. The reached ones are solid, the rest are quiet."""
        for i in range(n):
            self.add(f'<circle cx="{x + i * gap}" cy="{y}" r="{r}" '
                     f'fill="{FLOW if i <= active else BORDER}"/>')

    def stack_behind(self, x, y, w, h, n=2, r=R_PANEL, step=5):
        """Card edges peeking out behind a panel, so it reads as one of many.

        Drawn before the panel, narrowing as they go back, which is what gives a
        flat illustration a sense of depth without another shadow.
        """
        for i in range(n, 0, -1):
            self.add(f'<rect x="{x + i * step}" y="{y - i * step}" width="{w - 2 * i * step}" '
                     f'height="{h}" rx="{r}" fill="{SURFACE}" stroke="{BORDER}"/>')

    def texture(self, x, y, w, h, gap=14, r=1):
        """A faint dot grid. Sits under everything and gives the white something
        to be, without competing with any of it.

        The field is CENTRED in the box it is given. A whole number of gaps
        rarely divides the box exactly, and laying the dots from the left edge
        spends the whole remainder on the right: the warehouse card asked for
        22..328 and got a field ending at 316, so the only textured band on a
        composition that is otherwise symmetric to the unit sat 12 units left of
        centre. Centring the remainder is what the callers all assumed was
        happening, and it costs at most half a gap on each side.
        """
        cols = int(w // gap)
        rows = int(h // gap)
        x += (w - cols * gap) / 2
        y += (h - rows * gap) / 2
        d = " ".join(f"M{x + c * gap:g} {y + rw * gap:g}h.01"
                     for rw in range(rows + 1) for c in range(cols + 1))
        self.add(f'<path d="{d}" stroke="{BORDER}" stroke-width="{r * 2}" '
                 f'stroke-linecap="round" opacity=".55"/>')

    # -- flow --------------------------------------------------------------
    def line(self, d, w=CONN):
        self._drawn = getattr(self, "_drawn", set())
        self._drawn.add(d)
        """A resting connector. Always paired with sweep() using the same d."""
        self.add(f'<path d="{d}" fill="none" stroke="{LINE}" stroke-width="{w}" '
                 f'stroke-linecap="round" stroke-linejoin="round"/>')

    def sweep(self, d, stage=0, start=None, span=None, **_):
        """One pointer crossing `d` during leg `stage` of the cycle.

        Every line on the same leg has the same duration and the same phase, so
        siblings move as one and land together. Timing is never derived from
        length: the branches of a fan-out are different lengths, and matching
        their speed instead of their timing is what had them arriving at four
        different moments.

        Returns the cycle percent at which it lands, which is what a receiving
        element beats on.
        """
        if stage >= self.stages:
            sys.exit(f"[{self.id}] stage {stage} on a {self.stages}-stage scene")
        a = stage / self.stages * 100
        b = (stage + 1) / self.stages * 100
        k = self._id("fl")
        hold = "" if self.stages == 1 else (
            f" 0%,{a:.4g}% {{ offset-distance:0%; opacity:0; }}"
            f" {a + 0.5:.4g}% {{ opacity:1; }}")
        tail = "" if self.stages == 1 else f" {b + 0.5:.4g}%,100% {{ opacity:0; }}"
        self.css.append(
            f"  @keyframes {k} {{{hold or ' from { offset-distance:0%; }'}"
            f" {b:.4g}% {{ offset-distance:100%; opacity:1; }}{tail} }}"
            if self.stages > 1 else
            f"  @keyframes {k} {{ from {{ offset-distance:0%; }} to {{ offset-distance:100%; }} }}")
        self.add(f'<g class="bead" style="offset-path:path(\'{d}\');animation-name:{k}">'
                 f'<circle r="{CONN * 0.92:.2f}" fill="#FFFFFF"/>'
                 f'<circle r="{CONN * 0.54:.2f}" fill="{FLOW}"/></g>')
        return b % 100

    def node(self, cx, cy, r=6.5, beat=None):
        """A junction on a line: white ring, green core, optional arrival ring."""
        # Deliberately draws nothing. A dot parked on the line is indistinguishable
        # from the pointer that travels it, so the eye reads a second pointer that
        # never moves. The moving circle is the only mark a line gets. Kept as a
        # method so call sites still document where a junction is.
        return

    # -- output ------------------------------------------------------------
    def _style(self):
        return f"""
<style>
  /* Motion is CSS so it runs with this file referenced as an img src, where
     script never executes and hover never fires. Keep angle brackets out of this
     block: it is parsed as XML and a tag-looking string kills the document.
     {self.note}
     One {self.cycle}s cycle drives everything. A delay is the moment the sweep
     actually arrives, so the artwork answers the flow rather than blinking on
     its own clock. */
  #{self.id} {{ --cyc:{self.cycle}s; }}
  #{self.id} text {{ letter-spacing:-.01em; }}

  /* Hover. Only reachable because these are inlined into the page rather than
     referenced with an img src: an img is an isolated document and never sees a
     pointer event. Kept to a lift, not a jump - the beats spent this whole build
     being stripped of anything that moves geometry. */
  #{self.id} .hit {{ cursor:default; }}
  #{self.id} .hit rect, #{self.id} .hit circle {{ transition:fill .18s ease; }}
  #{self.id} .hit g {{ transition:stroke .18s ease; }}
  /* !important is doing real work here rather than being laziness: these
     surfaces already carry a running arrival animation, and an animation
     outranks a normal declaration, so without it the hover never showed. */
  #{self.id} .hit:hover rect:not(.hitbox) {{ fill:var(--hot,#CFEDDF) !important; }}
  #{self.id} .hit:hover circle {{ fill:#C4EBD8 !important; }}
  #{self.id} .hit:hover g {{ stroke:{FLOW} !important; }}
  /* touch reports itself as hovering whatever was last tapped, and it sticks */
  @media (hover: none) {{
    #{self.id} .hit:hover rect:not(.hitbox) {{ fill:var(--base,{TILE}) !important; }}
    #{self.id} .hit:hover circle {{ fill:{GREEN_PALE} !important; }}
    #{self.id} .hit:hover g {{ stroke:{MUTED} !important; }}
  }}

  /* the pointer. linear, always: it is meant to read as something being carried
     at a steady rate, and easing makes two of them on different lines drift
     apart even when their speeds match. */
  /* the brand cycle runs on its own clock, deliberately unrelated to the motion
     beat, so the two never look like they are failing to line up */
  /* settles in place rather than stretching. A width wipe on a funnel bar
     reads as the bar being squeezed, which is the one thing a funnel row must
     not look like: its width IS the number. */
  #{self.id} .rise {{
    animation-name:rise; animation-iteration-count:infinite;
    animation-timing-function:cubic-bezier(.22,1,.36,1);
  }}
  @keyframes rise {{ 0% {{ opacity:0; translate:0 -7px; }} 5% {{ opacity:1; translate:0 0; }} 100% {{ opacity:1; translate:0 0; }} }}

  #{self.id} .brand, #{self.id} .card {{
    animation-timing-function:linear; animation-iteration-count:infinite;
  }}

  #{self.id} .bead {{
    offset-rotate:0deg;
    animation-duration:var(--cyc); animation-timing-function:linear;
    animation-iteration-count:infinite;
  }}

  /* Beats change colour and nothing else. Every scale here used to displace the
     thing it was drawing attention to: an icon left its tile, a node's ring swept
     hundreds of pixels across the canvas. A surface that lights up reads as
     "this responded" just as well and cannot drift. The one survivor is .grow,
     which wipes a bar inside its own box and so has nowhere to go. */
  #{self.id} .tint, #{self.id} .pulse, #{self.id} .lit,
  #{self.id} .pop, #{self.id} .grow, #{self.id} .grow-c {{
    animation-duration:var(--cyc); animation-iteration-count:infinite;
    animation-timing-function:cubic-bezier(.22,1,.36,1);
  }}
  #{self.id} .tint  {{ animation-name:tint; }}
  #{self.id} .pulse {{ animation-name:pulse; }}
  #{self.id} .lit   {{ animation-name:lit; }}
  #{self.id} .pop   {{ animation-name:pop; }}
  #{self.id} .grow   {{ animation-name:grow; transform-box:fill-box; transform-origin:0% 50%; }}
  #{self.id} .grow-c {{ animation-name:grow; transform-box:fill-box; transform-origin:50% 50%; }}

  /* The reaction has to be seen, or the pointer arrives somewhere that appears
     not to care. It fires on arrival, holds long enough to register, and is back
     to rest before the next pointer lands. */
  @keyframes tint  {{ 0% {{ fill:var(--base,{TILE}); }} 10% {{ fill:var(--hot,#DFF2E8); }} 34% {{ fill:var(--hot,#DFF2E8); }} 82%,100% {{ fill:var(--base,{TILE}); }} }}
  @keyframes pulse {{ 0% {{ fill:{GREEN_PALE}; }} 8% {{ fill:#B6E6CE; }} 30% {{ fill:#B6E6CE; }} 70%,100% {{ fill:{GREEN_PALE}; }} }}
  @keyframes lit   {{ 0% {{ fill:var(--base,{LINE}); }} 8% {{ fill:var(--hot,{FLOW}); }} 34% {{ fill:var(--hot,{FLOW}); }} 74%,100% {{ fill:var(--base,{LINE}); }} }}
  @keyframes pop   {{ 0% {{ stroke:var(--base,{MUTED}); }} 8% {{ stroke:var(--hot,{FLOW}); }} 30% {{ stroke:var(--hot,{FLOW}); }} 70%,100% {{ stroke:var(--base,{MUTED}); }} }}
  @keyframes grow  {{ 0% {{ scale:0 1; }} 26%,100% {{ scale:1 1; }} }}
{chr(10).join(self.css)}

  /* One blanket rule, so a beat added later cannot be forgotten here and keep
     moving for someone who asked it not to. */
  @media (prefers-reduced-motion: reduce) {{
    /* the brand cycle runs on its own clock, deliberately unrelated to the motion
     beat, so the two never look like they are failing to line up */
  /* settles in place rather than stretching. A width wipe on a funnel bar
     reads as the bar being squeezed, which is the one thing a funnel row must
     not look like: its width IS the number. */
  #{self.id} .rise {{
    animation-name:rise; animation-iteration-count:infinite;
    animation-timing-function:cubic-bezier(.22,1,.36,1);
  }}
  @keyframes rise {{ 0% {{ opacity:0; translate:0 -7px; }} 5% {{ opacity:1; translate:0 0; }} 100% {{ opacity:1; translate:0 0; }} }}

  #{self.id} .brand, #{self.id} .card {{
    animation-timing-function:linear; animation-iteration-count:infinite;
  }}

  #{self.id} .bead {{ display:none; }}
    #{self.id} * {{ animation:none !important; }}
  }}
</style>"""

    def _frame(self, pct):
        """The body with every sweep frozen where it would be at `pct` of the cycle.

        The rasteriser only ever draws frame 0, where each sweep sits just off the
        start of its line and every orb is still transparent. Without this there is
        no way to look at the motion outside a browser, which is where most of the
        mistakes in the first attempt hid. Orbs are omitted: they ride offset-path,
        which the rasteriser does not implement.
        """
        body = list(self.body)
        for idx, start, span, seg in self.sweeps:
            if pct <= start:
                off = seg
            elif pct >= start + span:
                off = -100
            else:
                off = seg - (pct - start) / span * (seg + 100)
            body[idx] = (body[idx]
                         .replace('class="sweep"', 'class="sweep-frozen"')
                         .replace(f'style="animation-name:{self.id}-sw', 'style="x-was:')
                         + "")
            body[idx] = body[idx].replace('pathLength="100"',
                                          f'pathLength="100" stroke-dashoffset="{off:.2f}"')
        return [b for b in body if 'class="orb"' not in b]

    def write(self, frame=None):
        defs = (f'<defs><filter id="{self.id}-sh" x="-30%" y="-30%" width="160%" height="160%">'
                f'<feDropShadow dx="0" dy="3" stdDeviation="7" flood-color="{INK}" '
                f'flood-opacity="0.07"/></filter>'
                + "".join(self.defs) + "</defs>")
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" '
               f'xmlns:xlink="http://www.w3.org/1999/xlink" id="{self.id}" width="{W}" '
               f'height="{H}" viewBox="0 0 {W} {H}" fill="none">'
               + self._style() + defs + "\n" + "\n".join(self.body) + "\n</svg>\n")

        out = ASSETS / f"{self.name}-animated.svg"
        out.write_text(svg, encoding="utf-8")
        try:
            xml.dom.minidom.parse(str(out))
        except Exception as e:
            sys.exit(f"[{self.id}] invalid XML: {e}")
        # An animated scale composes AFTER the transform attribute, so the two on
        # one element put transform-origin in the wrong space and the element
        # flies off as it beats. Caught here rather than left to be noticed.
        for tag in re.findall(r"<[a-z]+[^>]*>", svg):
            klass = re.search(r'class="([a-z]+)"', tag)
            if klass and klass.group(1) == "grow" \
                    and "transform=" in tag:
                sys.exit(f"[{self.id}] {klass.group(1)} and a transform attribute on one "
                         f"element - it will drift when it beats:\n  {tag[:120]}")
        sweeps = svg.count('class="sweep"')
        if frame is not None:
            still = (f'<svg xmlns="http://www.w3.org/2000/svg" '
                     f'xmlns:xlink="http://www.w3.org/1999/xlink" id="{self.id}" width="{W}" '
                     f'height="{H}" viewBox="0 0 {W} {H}" fill="none">'
                     + self._style().replace(".sweep {", ".sweep-frozen {") + defs + "\n"
                     + "\n".join(self._frame(frame)) + "\n</svg>\n")
            PREVIEW.mkdir(parents=True, exist_ok=True)
            (PREVIEW / f"{self.name}-frame.svg").write_text(still, encoding="utf-8")
        # Also written as a TS module, because hover only exists if these are
        # inlined into the page. Referenced with an img src the browser treats
        # each one as an isolated document that never receives a pointer event.
        bundle = ASSETS.parent.parent / "src/components/illustrations.generated.ts"
        cur = {}
        if bundle.exists():
            for m in re.finditer(r'^  "([a-z]+)": (".*?"),$', bundle.read_text(encoding="utf-8"), re.M):
                cur[m.group(1)] = m.group(2)
        cur[self.name] = json.dumps(svg)
        bundle.write_text(
            "// GENERATED by scripts/illustrations. Do not edit.\n"
            "// Inlined rather than referenced as an img src: an img is an isolated\n"
            "// document, so CSS hover inside it never fires and the page font never\n"
            "// reaches it. Rebuild with:\n"
            "//   for f in scripts/illustrations/build_*.py; do \\\n"
            "//     PYTHONPATH=scripts/illustrations python3 \"$f\"; done\n"
            "export const ILLUSTRATIONS: Record<string, string> = {\n"
            + "".join(f'  "{k}": {v},\n' for k, v in sorted(cur.items()))
            + "};\n", encoding="utf-8")

        beads = svg.count('class="bead"')
        print(f"{out.name}  {len(svg):,} bytes, {self.cycle}s cycle, {beads} pointers")
