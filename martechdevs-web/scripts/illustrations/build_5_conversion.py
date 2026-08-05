#!/usr/bin/env python3
"""5/8 Ad Tracking. A conversion clears consent, goes server-side, reaches the platforms.

The consent gate is the point of the picture, so it is not a caption off to one
side: it sits on the main line as a tile the flow has to pass through, and it
lights the instant the sweep lands on it. Everything downstream hangs off that
arrival, so nothing leaves the server until the gate has answered.

Three legs, and only the last one fans. The top of the picture is a relay, not a
fan-out: the hit reaches the gate, the gate hands it on, and only then do the
platforms take it. On one leg every pointer set off together and the picture
claimed the platforms were counting a conversion that had not cleared consent
yet, which is the one thing this illustration exists to deny.

The tag server is an engine on leg two rather than a stop of its own, the same
way the messaging piece runs its send behind the Braze pill and the collection
piece runs its profile behind Segment. Passing behind the mark is what going
through the thing looks like, and it keeps the relay to three legs so the whole
cycle stays on the kit's beat instead of stretching to four.

The three drops out of the panel are NOT a fan in the trunk sense: they leave the
panel bottom at three different x and share no stretch of line, so there is
nothing to split and they run as one leg.

Website and the gate are ideas, so they keep the line icons. Everything that is
a product carries its own mark: the tag server is GTM, and the three things the
conversion lands in are Google Ads, Meta Ads and GA4. A mark names its tile
better than a caption can, so the captions under them are gone rather than
repeating in words what the logo already says.

Lines are laid down before anything else so the panel and the tiles cover their
ends, so no route can paint over another route's pointer, and so every beat can
be hung on the value sweep() hands back rather than on a number that has to be
kept in step by hand.
"""
from kit import Scene, W, GREEN, FONT, INK, BORDER
from pathlen import path_length

s = Scene("conversion", "ill-ads", stages=3,
          note="The hit clears the consent gate, then goes through the tag server "
               "into the record, then all three platforms take it together.")

SITE, GATE, SRV = 58, 175, 292      # the three columns the whole scene sits on
TILE_TOP = 14
CY = TILE_TOP + 22                  # the top chain runs at tile mid-height
PANEL_TOP, PANEL_BOT = 100, 230
# The platforms sit 12 higher than they used to, which buys the 16 units under
# them that a per-destination count needs. The drop is 30 rather than 42, still
# long enough to hold a port halfway down with clear line either side of it.
DEST_TOP = 258
L, R = 32, 318                      # the panel's own left and right edge

# leg one: the hit off the site, up to the gate.
TO_GATE = f"M80 {CY} H153"

# leg two: out of the gate, through the tag server, down into the record.
#
# The captions hang under the top tiles like every other row in the set, so the
# descent cannot drop out of the server's underside without running through the
# word Server. It leaves the right edge instead, then comes back to the middle
# well below the caption band and drops into the panel.
#
# It runs UNDER the server tile, which is painted over it later, so the pointer
# vanishes into the mark and comes out the far side. Turning down at 324 rather
# than 321 is worth the 3 units of canvas margin it costs: at 321 the line ran 3
# clear of the tile and read as touching it, and at 324 that gap is 6 while the
# stroke's outer edge is still 22 clear of the canvas. The last leg is a real
# vertical that runs PAST the panel's top edge, so it terminates on the card
# rather than curling to a stop in the air above it - which is what it used to
# do, the trailing V being a no-op.
THROUGH = (f"M197 {CY} H314 a10 10 0 0 1 10 10 V74 a10 10 0 0 1 -10 10 "
           f"H185 a10 10 0 0 0 -10 10 V{PANEL_TOP + 4}")

# leg three: three drops, no shared trunk. They leave the panel bottom at three
# different x and touch nowhere, so there is no stretch for pointers to queue
# down and nothing here to split into a trunk and branches.
OUT = [f"M{cx} {PANEL_BOT - 2} V{DEST_TOP}" for cx in (SITE, GATE, SRV)]

# A faint dot field under the whole thing. The empty stretches here are real
# layout - the band the drops cross, the air either side of the top chain - and
# left as bare white they read as unfinished rather than as breathing room.
s.texture(14, 14, W - 28, 302)

# --- every resting line goes down before any pointer ----------------------
# Line-then-pointer per route would bury a stream under the next route's line
# wherever two of them meet, and the drops all cross the same band of canvas.
s.line(TO_GATE)
s.line(THROUGH)
for d in OUT:
    s.line(d)

# leg one: the site hands the hit to the gate
at_gate = s.sweep(TO_GATE, stage=0)

# leg two: the gate hands it on, it goes behind the tag server and into the card
at_panel = s.sweep(THROUGH, stage=1)

# The server lights at the moment the pointer really reaches it: the share of leg
# two's length spent getting to the tile's left edge, added to the moment leg two
# starts. A round number here would fire while the pointer was still crossing the
# gap and read as the tile blinking on its own.
at_srv = at_gate + (path_length(f"M197 {CY} H{SRV - 22}") / path_length(THROUGH)
                    * 100 / s.stages)

# The three ports go down BETWEEN the legs, and the order matters: nothing should
# hide a pointer in the middle of a wire, so they are markers the drops ride over
# rather than lids on top of them. They sit halfway down each drop rather than on
# the panel edge: a node paints a white halo, and on the edge that halo eats a
# hole in the card's border. All three fire together, because with the drops on
# one leg all three pointers leave the same instant the record is written.
for cx in (SITE, GATE, SRV):
    s.node(cx, (PANEL_BOT + DEST_TOP) / 2, r=6, beat=at_panel)

# leg three: all three platforms take it together
lands = [s.sweep(d, stage=2) for d in OUT]

# one size, one baseline: the gate earns its emphasis from the beat that lights
# it, not from being a few units bigger than its neighbours. The site fires at
# the top of the cycle, which is the same instant the platforms take delivery of
# the hit before it - the loop closing, not two unrelated things blinking.
s.tile(36, TILE_TOP, 44, "cursor", beat=0)
s.tile(153, TILE_TOP, 44, "shield", beat=at_gate)
s.logo_tile(270, TILE_TOP, "gtm", 44, beat=at_srv)
# captions sit under their tiles, on one baseline. "Server" stays short on
# purpose: the descent turns down at x=321 and a longer word runs into it.
# The gate's caption names the signal it is actually reading. It is the one
# caption allowed to run long, because it is the one the picture is about, and
# it stays on the same baseline at the same size so the band still reads as a
# band. A second line under it was the alternative and there is nowhere to put
# one: leg two's return run crosses that space at y=84.
#
# The gate's caption also carries the ANSWER, not just the question. The tile
# tints when the pointer lands on it, but that only exists in motion: sitting
# still, the one thing this illustration is about had no state on it at all, and
# a shield above the word Consent could as easily be a gate that said no. The
# signal and its value share one caption line the way the collection piece's
# sources share theirs, so it is a second reading inside a line that was already
# there rather than a second line of type there is no room for - leg two's return
# run crosses that space at y=84.
for cx, name, state in ((SITE, "Website", None),
                        (GATE, "Consent", "ad_storage granted"),
                        (SRV, "Server", None)):
    if state is None:
        s.label(cx, TILE_TOP + 58, name, size=10, weight=500, opacity=.55,
                anchor="middle")
        continue
    # One text element with two tspans, not two labels: text_w is a deliberate
    # over-estimate, so centring two separate labels off it leaves a gap that is
    # right for neither. The browser measures the run; this only says "centred
    # here, with a gap".
    s.add(f'<text x="{cx}" y="{TILE_TOP + 58}" font-family="{FONT}" font-size="10" '
          f'text-anchor="middle" fill="{INK}">'
          f'<tspan font-weight="500" fill-opacity=".55">{name}</tspan>'
          f'<tspan dx="5" font-size="9.5" font-weight="400" '
          f'fill-opacity=".5">{state}</tspan></text>')

# --- the conversion, counted ----------------------------------------------
# Header, then two counters on one 35 pitch. The header takes the same 24px disc
# and the same text column as the rows below it rather than the wider one the
# set's profile card uses: with two sizes of disc the titles start 7 apart and
# the card has a staircase down its left edge. The header is told apart by its
# type and its deeper disc, not by being bigger. Every disc starts at L, every
# value ends at R.
#
# One card edge behind it, because this is one conversion out of a day of them
# and a single floating card claims it is the only one. Two edges was a deck and
# it ate the last of the descent, so the pointer vanished long before it landed.
# The edge is a promise the card now keeps: see the deck at the foot of this file.
s.stack_behind(16, PANEL_TOP, W - 32, PANEL_BOT - PANEL_TOP, n=1, step=5)
s.panel(16, PANEL_TOP, W - 32, PANEL_BOT - PANEL_TOP)
HEAD = PANEL_TOP + 30
TEXT = L + 31
s.add(f'<circle cx="{L + 12}" cy="{HEAD}" r="12" fill="{GREEN}" fill-opacity=".14"/>')
# A flag, not a cart. The card turns over three kinds of conversion and only one
# of them is a basket, so a cart in the roundel would be wrong two thirds of the
# time. A flag is what all three have in common: a goal was reached. It is drawn
# once and stays put - the deck below carries only what actually differs.
s.icon("flag", L + 12, HEAD, 14)
_w = s.chip_width("Deduped", marked=True)
s.chip(R - _w, HEAD - 11, "Deduped", solid=True, icon="check", beat=at_panel)

# The divider under the header, which this card was missing while the messaging
# card two along has one. Without it the header and the first counter ran
# together at the top and the card then divided its two counters from each
# other, which is the one join that did not need marking.
#
# 148 is the white between them: the header's value line ends at 142.2 and the
# first counter's cap starts at 155, and 148 sits in the gap between the two
# roundels as well, so it stops where the eye expects rather than cutting one.
s.add(f'<rect x="{L}" y="148" width="{R - L}" height="1" fill="{BORDER}"/>')

# one pitch of 35 all the way down, header disc included, so the three discs are
# evenly spaced and the card's top and bottom padding come out the same 18
#
# Both rows carry a meta line, which is where the argument of the picture
# actually lives. A bare "Event match rate 98%" is a good number with nothing to
# be good against; "up from 71% client-side" is the reason the hit was routed
# through a server at all. Same for the count: 1,284 on its own is a fact, 1,284
# against yesterday is a direction, and the columns beside it are then the shape
# of that direction rather than decoration.
ROW1, ROW2 = HEAD + 23, HEAD + 58
# The meta lines are the two things on these rows that turn over, so they are
# drawn by the deck below rather than here. A single space is what reserves the
# slot: row() lays the title out for one line or two depending on whether it was
# given a meta at all, and a bare None would slide both titles down four units
# every time the card turned. The roundel, the icon, the title and the rule are
# chrome and are drawn once.
META = " "
s.row(L, ROW1, R - L, "target", "Conversions today", META, beat=at_panel + 2)
s.row(L, ROW2, R - L, "gauge", "Event match rate", META,
      beat=at_panel + 5, rule=False)

# A count on its own is a fact with no shape. The columns are that count read
# hour by hour, so the number gains a direction without gaining a row. They stay
# BAR_DARK: this is texture behind a figure, not a second thing to look at. The
# shape is the same for all three events on purpose - a day of conversions rises
# into the afternoon whatever is being counted, and redrawing seven bars per
# variant would spend real markup restating that.
s.minibars(219, ROW1 + 4, 54, 16, [.32, .48, .4, .62, .55, .8, .95])

# The match rate is a proportion, so it gets drawn as one: number then gauge,
# both hard against R, so this row's value column lines up with the count above it.
#
# The figure sits OUTSIDE the ring. Inside, it had 25.5 units of clear bore to fit
# a string that measures about 21.6 in a real font, and any font wider than the
# estimate put the text on the arc. Outside, the ring is free to be small and the
# number is free to be the same 11/600 as every other value on the card.
RING, RING_W = 9, 2.5
RING_CX = R - RING - RING_W / 2
s.ring(RING_CX, ROW2 + 12, RING, .98, width=RING_W)
s.label(RING_CX - RING - RING_W / 2 - 8, ROW2 + 16, "98%", size=11, weight=600,
        anchor="end")

# Everything on this card that turns over is drawn at the foot of the file, so
# the whole of what varies is in one place and can be read against itself.

# --- where it lands --------------------------------------------------------
# Still no captions - the mark is the name and a word under it would only say it
# twice - but a count is not the name repeated, it is what each one actually
# took. Three identical tiles claim the three platforms receive the same thing;
# they do not. GA4 gets every conversion, the ad platforms only the ones they can
# be matched to, and GA4's figure is the same one the card above is counting.
#
# Which is why the three counts turn over with the card rather than staying put.
# They are derived from it, so a fixed 1,284 under GA4 while the card read "Lead
# form / 248" would have the picture contradicting itself once every four and a
# half seconds. The tiles and the marks are chrome and are drawn once here; only
# the figures go in the deck.
DEST = ((SITE, "google ads"), (GATE, "meta ads"), (SRV, "ga4"))
for (cx, name), arrive in zip(DEST, lands):
    s.logo_tile(cx - 22, DEST_TOP, name, 44, beat=arrive)

# --- the same route, three kinds of conversion ------------------------------
# The card edge behind the panel says there are more conversions where this one
# came from, so the card turns over and shows them. Three conversion types, not
# three sizes of the same sale: a basket, a form fill and a plan starting - an
# ecommerce checkout, a B2B enquiry and a subscription beginning. Three different
# businesses on the one server-side route, which is the argument this picture is
# making and one that a single frozen purchase could not make on its own.
#
# 98% stays. All three land on the same match rate, which is the point of routing
# through the tag server; what turns over is the client-side figure each came up
# from. So the ring is a constant result and the meta line beside it is the
# varying reason for it, and the arc never has to be redrawn.
#
# Every slot is sized against its own longest string, so the card cannot appear
# to resize as it turns. The header runs out at "Subscription start", which at
# 13/700 stops around 35 short of the Deduped chip; the value line runs out at
# "$4,200 pipeline value", shorter still; the count meta runs out at "vs 1,142
# yesterday" and is clear of the columns at x=219; the rate meta is a fixed
# 23 characters and is clear of the ring at x=289; and the count and the three
# platform figures are anchored end and middle, so they cannot drift at all.
EVENTS = [
    ("Purchase", "$186.40 order value",
     "vs 1,142 yesterday", "1,284", "up from 71% client-side",
     ("612", "437", "1,284")),
    ("Lead form", "$4,200 pipeline value",
     "vs 214 yesterday", "248", "up from 64% client-side",
     ("119", "84", "248")),
    ("Subscription start", "$49/mo Growth plan",
     "vs 76 yesterday", "83", "up from 58% client-side",
     ("40", "28", "83")),
]


def face(title, value, since, count, rate, took):
    s.label(TEXT, HEAD - 4, title, size=13, weight=700)
    s.label(TEXT, HEAD + 10, value, size=10, weight=400, opacity=.5)
    # row() was handed a blank meta so it would lay its title out for two lines;
    # this is the line that goes in the gap it left - and it goes on row()'s OWN
    # meta baseline, +20, not the +22 it had drifted to. Two units matters twice
    # here: at +22 the line came within 3.95 of the rule beneath it, and the
    # value opposite, which is centred on the pair, was left a unit high of it.
    s.label(TEXT, ROW1 + 20, since, size=9.5, weight=400, opacity=.5)
    s.label(R, ROW1 + 16, count, size=11, weight=600, anchor="end")
    s.label(TEXT, ROW2 + 20, rate, size=9.5, weight=400, opacity=.5)
    for (cx, _), n in zip(DEST, took):
        s.label(cx, DEST_TOP + 57, n, size=10, weight=500, opacity=.55,
                anchor="middle")


# A default argument per field, or all three variants close over the last row of
# the list and the card turns over three identical faces.
s.deck([(lambda e=e: face(*e)) for e in EVENTS])

s.write(frame=58)
