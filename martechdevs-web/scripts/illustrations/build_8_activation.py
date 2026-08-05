#!/usr/bin/env python3
"""8/8 Data Activation. A warehouse segment is pushed back into the tools.

Three bands: the segment as it is defined, the tool that syncs it, the tools it
lands in. Every one of them ends at 318 and opens with the same 28-wide icon
slot at 32, so there is one left column and one right column in the whole piece;
the destination rows indent because they hang off the spine, and only then. The
segment panel is a query rather than a message - two conditions and a count, so
it reads as something computed. It is ruled rather than slabbed, because this
card was the heaviest in the set by a distance and the weight bought nothing.

Logos carry the idea. Reverse ETL is only legible if you can see it is one real
tool writing into other real tools, so the hub is Hightouch and the three
destinations are Google Ads, HubSpot and Zendesk - the marks do the work the
labels cannot at thumbnail size. The segment panel keeps a line icon on purpose:
"a filter over warehouse data" is a concept, not a product, and a brand mark on
a concept is a lie about what the section sells.

Below the hub the flow is turned on its side. Drop a trunk onto a horizontal
bus, fan it out and land it on a row of four tiles and you have drawn the
messaging illustration, whatever the labels say - that piece owns the four-channel
fan and at thumbnail size the two were the same picture. So this one runs a single
spine down the left, taps it once per tool, and prints the same 4,182 on every row
it reaches. A reverse sync is not three different sends; it is one list turning up
intact in three places, and the repeated number is the only part of that a still
frame can say.

The flow runs in two legs: the trunk everything shares, then the three taps. Cut
as one leg, each tap carried its own copy of the shared spine, so three pointers
queued nose to tail down it before peeling off - three separate errands rather
than one list being split. Now one pointer runs the spine and three leave the
split the moment it lands.
"""
from kit import (Scene, W, FLOW, GREEN_PALE, BAR, BAR_DARK, BORDER, MUTED,
                 SURFACE, TILE, text_w)

s = Scene("activation", "ill-act", stages=2,
          note="The segment computes, Hightouch picks it up, then all three tools receive together.")

# --- the one column everything in a band obeys ----------------------------
L, R = 32, 318                      # content left / right edge inside any band
SLOT = 28                           # the icon slot every band opens with
SPINE = L + SLOT / 2                # its centre, and the only vertical in the piece
TX = L + SLOT + 12                  # text column, one gap clear of that slot

PANEL_Y, PANEL_H = 18, 106          # 18 .. 124
HUB_Y, HUB_H = 156, 46              # 156 .. 202

ROW_X, ROW_W, ROW_H = 78, 256, 28   # 78 .. 334, same right edge as the bands
ROW_CY = (230, 264, 298)            # pitch 34, 6 clear between rows
MARK_X, MARK_S = 94, 22             # 16 in from the row edge, same inset as a band

COUNT = "4,182"

# The middle column: the gap every band already has between its title and its
# right-hand value, and the only place in this piece with room for a second
# layer. Sized off the widest title and the widest value at their conservative
# widths, so nothing can collide in a fallback font. One x for all of them, so
# the detail stacks into a column of its own rather than scattering.
DX, DW, DH = 196, 52, 14

# Destination tools, not channels. Nothing here is in messaging's mail/bell/chat/
# phone row: these are places a list lands, and each is a real product.
DEST = (("google ads", "Google Ads"),
        ("hubspot", "HubSpot"),
        ("zendesk", "Zendesk"))

# --- the spine, in two legs ------------------------------------------------
# The trunk is everything the three destinations have in common: out of the
# panel, behind the hub, down to the first tap. It starts well up inside the
# panel so a pointer is already under way before the panel edge reveals it, and
# it does not stop at the hub - it passes under it, because a reverse sync is
# one list going through one tool, not two errands with a handover in the middle.
TRUNK_TOP = 96
SPLIT_Y = ROW_CY[0] - 10            # where the one spine first becomes three
TRUNK = f"M{SPINE} {TRUNK_TOP} V{SPLIT_Y}"


def tap(cy):
    """From the split, down as much of the spine as this row needs, then elbow
    into it. Ends 2 under the row's edge, so the pointer is taken by the row
    rather than stopping short of it.

    The first tap is the elbow on its own, and the last is the spine itself
    carrying on to the bottom row - the reading the piece already had, and worth
    keeping. Making that last one a branch like the other two is the whole point:
    all three then leave the split together instead of one of them owning the
    spine while the other two appear out of nothing halfway down it.
    """
    run = f" V{cy - 10}" if cy - 10 > SPLIT_Y else ""
    return f"M{SPINE} {SPLIT_Y}{run} a10 10 0 0 0 10 10 H{ROW_X - 2}"


def dot(cx, cy, r, beat):
    """A quiet marker that answers a beat by colour. The kit's `pop` drives a
    stroke, which a filled dot has none of, so this rides `lit` instead."""
    s.add(f'<circle class="lit" cx="{cx}" cy="{cy}" r="{r}" fill="{MUTED}" '
          f'style="--base:{MUTED};--hot:{FLOW};animation-delay:{s.at(beat)}"/>')


def livebar(x, y, w, h, beat):
    """One column of a minibars run that answers a beat. Same reason as dot():
    the kit's `pop` drives a stroke and a filled rect has none, so it rides
    `lit`, which repaints a fill."""
    s.add(f'<rect class="lit" x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
          f'rx="1.5" fill="{BAR_DARK}" style="--base:{BAR_DARK};--hot:{FLOW};'
          f'animation-delay:{s.at(beat)}"/>')


BRANCHES = [tap(cy) for cy in ROW_CY]

# Every resting line goes down before any pointer, and all of them before the
# three bands. Drawing line-then-pointer per branch would bury one branch's
# pointer under the next branch's line along the run of spine the lower two
# share, and drawing a band first would put a panel edge across a live wire.
s.line(TRUNK)
for d in BRANCHES:
    s.line(d)

# leg one: out of the panel, through the hub, down to the split.
at_split = s.sweep(TRUNK, stage=0)

# The node goes down BEFORE the pointers and the bands after, and the difference
# matters. Nothing should hide a pointer in the middle of a wire, so the node is
# a marker the pointers ride over; the hub is the one place a pointer is meant to
# disappear, because passing behind it is what going through the sync looks like.
s.node(SPINE, SPLIT_Y, beat=at_split)

# leg two: all three taps leave the split together the moment it lands
lands = [s.sweep(d, stage=1) for d in BRANCHES]

# The hub has no arrival of its own to answer - the trunk passes through it
# rather than stopping - so it lights on the moment a pointer really does reach
# its top edge, which is a measured fraction of the way along leg one rather than
# a round number.
hub_at = (HUB_Y - TRUNK_TOP) / (SPLIT_Y - TRUNK_TOP) * (100 / s.stages)

# --- band 1: the segment, as it is defined in the warehouse ----------------
s.panel(16, PANEL_Y, W - 32, PANEL_H)

head_cy = 41
# Holds still. The segment header is a label, not an indicator, and a roundel
# blinking at the top of the card was one of the things that made the set read
# as flashing.
s.add(f'<circle cx="{SPINE}" cy="{head_cy}" r="{SLOT / 2}" fill="{GREEN_PALE}"/>')
s.icon("filter", SPINE, head_cy, 15, beat=0)
# -4/+10 against the roundel's centre at 41, which is what cdp, messaging,
# conversion, warehouse and crm all use for this same 13/700 over 10/400 pair.
# At -2/+12 this was the outlier: the block sat a unit low of its own roundel
# and the descenders of "Warehouse segment" hung past the bottom of it.
s.label(TX, 37, "High LTV, at risk", size=13, weight=700)
s.label(TX, 51, "Warehouse segment", size=10, weight=400, opacity=.5)

# the one saturated accent in the piece, and it is the number the whole thing
# is about
people = f"{COUNT} people"
s.chip(R - (18 + text_w(people, 11, 600)), head_cy - 11, people, solid=True)

# --- the conditions. Ruled, not filled: this is a query being read, and cdp
#     already proved a hairline is enough to separate two rows.
for i, (field, value) in enumerate((("Lifetime value", "Top 10%"),
                                    ("Churn score", "0.71"))):
    cy = 79 + i * 30
    s.add(f'<rect x="{L}" y="{cy - 15}" width="{R - L}" height="1" fill="{BORDER}"/>')
    dot(SPINE, cy, 4, 0)
    s.label(TX, cy + 4, field, size=11, weight=600)
    s.label(R, cy + 4, value, size=10, weight=500, opacity=.5, anchor="end")
    # the condition, made visible in the gap the row already has. Grey, both of
    # them: a filter is not the live part of this picture.
    if i == 0:
        vals = [.14, .22, .3, .44, .62, 1]
        s.minibars(DX, cy - DH / 2, DW, DH, vals, tone=BAR)
        bw = (DW - 3 * (len(vals) - 1)) / len(vals)
        s.add(f'<rect x="{DX + (len(vals) - 1) * (bw + 3):.1f}" y="{cy - DH / 2:.1f}" '
              f'width="{bw:.1f}" height="{DH}" rx="1.5" fill="{BAR_DARK}"/>')
    else:
        s.ring(DX + DW - 8, cy, 7, .71, tone=BAR_DARK, width=3.5)

# --- band 2: the tool doing the syncing, sitting on the spine so the one stream
#     goes in at the top and comes out the bottom.
hub_cy = HUB_Y + HUB_H / 2
s.panel(16, HUB_Y, W - 32, HUB_H, r=12, fill=TILE, shadow=False, beat=hub_at)
s.panel(L, hub_cy - SLOT / 2, SLOT, SLOT, r=9, fill=SURFACE, shadow=False)
# drawn at the tile's own size: the shipped marks carry their padding inside a
# 42-box, so matching that box is what keeps them the weight the site shows.
# Hightouch and Census do the same job, so they take turns. A fixed mark here
# reads as the only one we do.
SYNCS = [("hightouch", "Hightouch"), ("census", "Census")]
for _i, (_mark, _name) in enumerate(SYNCS):
    _name_k, _secs, _rest = s.cycle_slot(_i, len(SYNCS))
    s.add(f'<g class="brand" style="{_rest}animation-name:{_name_k};'
          f'animation-duration:{_secs:g}s">')
    s.logo(_mark, SPINE, hub_cy, SLOT)
    s.label(TX, hub_cy - 2, _name, size=11, weight=600)
    s.add("</g>")
# Both lines one unit lower than they were. The pair runs from this cap height
# to the subtitle's baseline and has to sit centred in a 46-tall band; at -3/+9
# it sat 1.2 high of that, and 1.2 high of "Every hour" opposite it as well, so
# one unit settles the block in its band and squares it with the value beside it.
s.label(TX, hub_cy + 10, "Reverse ETL sync", size=9.5, weight=400, opacity=.5)
s.label(R, hub_cy + 4, "Every hour", size=10, weight=500, opacity=.5, anchor="end")

# The runs behind "Every hour". A cadence stated in words is a claim; the last
# seven runs standing next to it is the evidence, and it costs no new surface.
RUNS = [.5, .62, .55, .72, .6, .8, .95]
s.minibars(DX, hub_cy - DH / 2, DW, DH, RUNS, tone=BAR_DARK)
_bw = (DW - 3 * (len(RUNS) - 1)) / len(RUNS)
livebar(DX + (len(RUNS) - 1) * (_bw + 3), hub_cy + DH / 2 - RUNS[-1] * DH,
        _bw, RUNS[-1] * DH, hub_at)

# --- band 3: the tools. Same list, same number, three places ---------------
for (mark, name), cy, land in zip(DEST, ROW_CY, lands):
    # The row itself does NOT light. Tinting a 256x28 surface turns the whole
    # card green on every arrival, which is far more colour than "a segment
    # landed here" is worth and drowns the mark and the name sitting on it. The
    # small tile under the mark carries the arrival instead: same information,
    # a twentieth of the area.
    s.panel(ROW_X, cy - ROW_H / 2, ROW_W, ROW_H, r=ROW_H / 2, fill=SURFACE,
            shadow=False)
    s.tile(MARK_X, cy - MARK_S / 2, MARK_S, None, r=7, beat=land)
    s.logo(mark, MARK_X + MARK_S / 2, cy, MARK_S)
    s.label(MARK_X + MARK_S + 12, cy + 4, name, size=11, weight=600)
    # On DX, the detail column the two bands above already sit on. At 204 it was
    # centred inside that column instead of starting on it, so the one thing in
    # the card that is repeated three times was the one thing off the column.
    s.bar(DX, cy - 2.5, DW - 8, 5, tone=BAR, grow=land)
    s.label(R, cy + 4, f"{COUNT} synced", size=10, weight=500, opacity=.5,
            anchor="end")

# The pointers ride offset-path, which the rasteriser does not implement, so a
# still can only ever show the layout. Motion is checked in public/_lab.html.
s.write(frame=25)
