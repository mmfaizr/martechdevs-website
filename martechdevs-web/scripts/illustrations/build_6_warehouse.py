#!/usr/bin/env python3
"""6/8 Data Warehouse. Five scattered systems are loaded into one warehouse, and
one modelled table comes back out of it.

Each source owns a path of its own - down, onto a shared bus, along it and into
the junction - rather than five curves meeting at a point, which knots up and
hides which line went where. Five sources is one more than cdp carries, and the
extra one is the reason the bus exists: at five, converging curves are a knot,
and the shared pipe reads as infrastructure instead.

The load is two legs, and it has to be. The five feeds stop at the junction; one
continuation carries on from there, through the slab and out to the modelled
table. Drawn as five complete paths, the stretch below the junction is shared by
all of them, so five pointers filed down it nose to tail - five errands passing
through a warehouse rather than one load being merged and put away.

Two real marks, and only where the thing really is that product. Fivetran is a
chip sitting on the pipe between the sources and the slab, because moving those
five systems into the warehouse is literally all it does. Snowflake is in the
slab's tile, because the slab is the warehouse. The five sources stay line icons:
they are a store, a CRM, an ad account - categories, not products we sell.

The slab is the widest, heaviest thing in the frame and everything above it is
small and pale, so the eye lands on the warehouse before it reads a word.

The second layer, added after the composition settled, is all time. A warehouse
is bought for freshness and the picture had none: five nightly runs now trail the
Warehouse headline, the slab carries the hour it loaded, and tonight's column is
the one that lights when the load lands. Read down the middle it is a timeline -
loaded 04:02, model updated 04:12 - rather than two panels each stating a number
on its own. The five sources are deliberately left as they are: a row count on
each caption is the move cdp makes, and it cannot be made here without Store and
Billing breaking the 14 margin.
"""
from kit import Scene, W, LINE, FLOW, BORDER, BAR_DARK, GREEN

s = Scene("warehouse", "ill-dwh", stages=2,
          note="Five sources land on the junction together, then one load carries through the warehouse.")

SRC = [("cart", "Store", 39), ("users", "CRM", 107), ("target", "Ads", 175),
       ("chat", "Tickets", 243), ("money", "Billing", 311)]

TOP = 79                          # where a source's connector leaves its caption
JOIN, BUS = 175, 92
JOIN_Y = BUS + 10                 # a radius below the bus: where the five are one
CHIP_TOP = 106
SLAB_TOP, SLAB_H = 140, 42
TABLE_TOP, TABLE_H = 207, 108

# The two edges everything in a panel holds, plus the right edge of the middle
# column. Every figure in the table is anchored to one of the last two, so the
# numbers stack instead of staircasing off their own leading digit.
L, R, MID = 32, 318, 200


def feed(cx):
    """Down from the source, elbow onto the bus, along it, elbow into the junction.
    The middle source is already on the join, so it just drops straight through.

    Every feed ENDS on the junction. The second elbow lands exactly on it, so
    there is nothing to add after the arc. Starts under the caption and finishes
    under the node, both drawn afterwards, so nothing stops in open space.
    """
    if cx == JOIN:
        return f"M{cx} {TOP} V{JOIN_Y}"
    turn = "0 0 0 10 10" if cx < JOIN else "0 0 1 -10 10"
    into = "0 0 1 10 10" if cx < JOIN else "0 0 0 -10 10"
    stop = JOIN - 10 if cx < JOIN else JOIN + 10
    return f"M{cx} {TOP} V{BUS - 10} a10 10 {turn} H{stop} a10 10 {into}"


# One pipe out of the junction, down through the warehouse and on to the modelled
# table. It runs behind the loader chip and behind the slab, and that is the
# point: a pointer that goes under the slab and comes out below it is what being
# put away in the warehouse looks like. Ends exactly on the table's top edge -
# overshoot by half a unit and the connector shows as a green notch chopped out
# of the card border, which at this size is a bite taken out of a box rather than
# a pipe going into one.
TRUNK = f"M{JOIN} {JOIN_Y} V{TABLE_TOP}"


# --- the scattered systems, tight across the top -------------------------
# Five of them rather than the four in cdp, but on the set's tile: 44 wide with
# the caption under it. Squeezing them to 38 to fit the extra source read as a
# smaller artboard next to the others, and the row still clears at 44 - the outer
# edges land on 17 and 333 with a 24 gutter. No caption carries a descender, so
# the baseline sits at 66; the connectors start at 79 rather than at the tile,
# because a pointer is half again as wide as the line it rides and at 76 it
# grazed the type on its way past.
#
# All five light on the same beat, and that is the honest picture: a warehouse
# load is one scheduled job pulling every system at once, not five systems each
# volunteering. The staggered version read as five unrelated events.
# The dot field is NOT carried up here, and it was tried. Behind the tiles it
# only survives in the four 24-unit gutters, so it lands as four isolated pairs
# of dots rather than as ground - the same failure as a dot row that disappears
# under a connector and reappears either side of it. Ground has to be continuous
# or it reads as dirt. The band below the captions is the only stretch of this
# canvas wide enough to carry it.
for icon, name, cx in SRC:
    s.tile(cx - 22, 10, 44, icon, beat=0)
    s.label(cx, 66, name, size=10, weight=500, opacity=.55, anchor="middle")

# --- every one of them runs the same bus into the junction ---------------
# All the resting lines go down before any pointer. Line-then-pointer per source
# would bury each stream under the next source's line along the bus, and the bus
# is most of what these five share.
feeds = [feed(cx) for _, _, cx in SRC]
# A dot grid under the bus, which is the one band of this canvas no panel covers.
# Painted first, at BORDER, so the resting connectors are still the lightest
# thing in the picture that has any weight. It stops short of the captions: a row
# of dots level with 10px type reads as speckle on the letters, not as ground.
s.texture(22, 84, W - 44, 54)
for d in feeds:
    s.line(d)
s.line(TRUNK)

# leg one: the five feeds, which now all land on the junction at the same instant
arrivals = [s.sweep(d, stage=0) for d in feeds]
at_join = arrivals[0]

# The junction sits a radius below the bus, where the five paths have actually
# become one, and its halo covers the short stub between the bus and the chip -
# left bare, that stub renders as a green square rather than a length of pipe.
# It goes down after the five, so it closes over their arrival, and before the
# continuation, so the pointer leaving it rides over it rather than out from
# under it.
s.node(JOIN, JOIN_Y, beat=at_join)

# leg two: one load carries on, through the warehouse and out to the model
out_land = s.sweep(TRUNK, stage=1)

# The warehouse is reached partway down that leg, not at either end of it,
# because the leg deliberately runs THROUGH the slab. The run is straight and the
# pointer is linear, so the share of its length above the slab is the share of
# its time, and this is the instant the pointer really does cross the slab's top
# edge rather than a round number picked to look responsive.
into_slab = at_join + (SLAB_TOP - JOIN_Y) / (TABLE_TOP - JOIN_Y) * 100 / s.stages

# --- named on the pipe, because that is where the loading happens --------
# A chip rather than a tile: it sits in the 34 units between bus and slab without
# crowding either, and the pipe runs behind it, so the flow is never broken.
# Interchangeable tools take turns rather than one of them getting the
# billing. A fixed mark here reads as the only one we do.
PIPES = [("fivetran", "Fivetran"), ("airbyte", "Airbyte")]
s.brands(JOIN - s.brands_width(PIPES) / 2, CHIP_TOP, PIPES)

# --- the warehouse slab, centre of gravity -------------------------------
# Painted after the trunk, so it covers the length of pipe running through it and
# swallows the pointer on its way past.
s.panel(16, SLAB_TOP, 318, SLAB_H)
s.tile(L, 146, 30, None, beat=into_slab)
s.logo("snowflake", 47, 161, 21)
# 159, not 157. The pair below runs from this cap height to the subtitle's
# baseline, 23.5 units, and the slab is 42, so the block belongs 9.3 down from
# 140. At 157 it had 7.5 above and 11 below and sat visibly high in its own slab.
s.label(71, 159, "Warehouse", size=13, weight=700)
# not "five sources, one schema": that is cdp's "one profile, four sources" with
# the nouns swapped, and these two services are already close enough in a
# prospect's head. Say the size and the cadence, which only this one has.
#
# The clock time is the freshness, and it is here rather than in a fourth thing
# on the slab because it costs nothing: "modelled" was already implied by the
# panel below titling itself a model whichever one it is showing, and trading
# that one word for the hour
# turns the table's orphaned "updated 04:12" into the far end of a timeline. The
# warehouse loads at 04:02, the model is out ten minutes later. Two numbers that
# agree is the whole argument for owning a warehouse, and it is now stated by the
# picture rather than claimed by it.
s.label(71, 173, "8.4M rows, nightly 04:02", size=10, weight=400, opacity=.5)
# The solid accent, and it answers the load arriving at the slab, not the five
# feeds arriving at the junction: by the time this lights, the sources are all in
# and there is only one pipe left to watch. It shares the beat with tonight's
# column in the run history below, which is the only other bright green up here -
# one arrival, two surfaces acknowledging it, six units of colour between them.
s.chip(R - s.chip_width("Loaded", marked=True), 150, "Loaded",
       solid=True, icon="check", beat=into_slab)
# "nightly" is a claim about time, and a still picture has none in it. Five
# columns - a working week of loads, rows per run - sit on the headline's
# baseline and top out at its cap height, so they read as part of the line rather
# than as a chart parked beside it. The warehouse has done this before, and the
# word no longer has to be taken on trust.
#
# The last column is tonight, and it is the only part of the run history that is
# not history. It rests grey with the other four and lights when the load reaches
# the slab, on the same beat as the Loaded chip, so the bars are not a chart
# parked next to the flow - the flow finishes IN them. Hand-drawn rather than
# passed to minibars() because a bar that answers an arrival needs a beat, and
# the primitive draws a static series.
# Five columns 6.8 wide, not the 5 wide a taller-than-square column wants. At 10
# high - the cap height, so the series tops out level with the W and sits on the
# same baseline as the type - a 5-wide bar with the kit's 1.5 corner is more
# corner than bar, and the short nights read as ticks. Wider and slightly squat
# reads as a chart; narrower reads as a stroke pattern.
RUN_X, RUN_Y, RUN_W, RUN_H, RUN_GAP = 154, 147, 46, 10, 3
RUNS = [.64, .8, .58, .9, 1.0]
BW = (RUN_W - RUN_GAP * (len(RUNS) - 1)) / len(RUNS)
s.minibars(RUN_X, RUN_Y, BW * 4 + RUN_GAP * 3, RUN_H, RUNS[:-1], gap=RUN_GAP)
_x, _h = RUN_X + 4 * (BW + RUN_GAP), RUNS[-1] * RUN_H
s.add(f'<rect class="tint" x="{_x:.1f}" y="{RUN_Y + RUN_H - _h:.1f}" width="{BW:.1f}" '
      f'height="{_h:.1f}" rx="1.5" fill="{BAR_DARK}" '
      f'style="--base:{BAR_DARK};--hot:{GREEN};animation-delay:{s.at(into_slab)}"/>')

# --- the modelled output --------------------------------------------------
# Real figures, not placeholder bars. The warehouse's whole claim is that the
# numbers are finally the same everywhere, and grey bars cannot make it.
# Card edges behind it, because a warehouse never holds one model. The trunk now
# lands on the back edge rather than the front card, which is the truer picture:
# the load goes into the stack, and this is the one on top of it.
s.stack_behind(16, TABLE_TOP, 318, TABLE_H, n=2)
s.panel(16, TABLE_TOP, 318, TABLE_H)
# "updated 04:12" and the header rule belong to the card, not to any one model,
# so they go down once and stay put while the contents turn over.
# 228, the same baseline the model title opposite it sits on. At 227 the two
# ends of one line were a unit apart, which is too small to read as deliberate
# and just large enough to look like the row is not sitting straight.
s.label(R, 228, "updated 04:12", size=10, weight=500, opacity=.5, anchor="end")
s.add(f'<rect x="{L}" y="256" width="{R - L}" height="1" fill="{BORDER}"/>')

for i in range(3):
    # One dot per row, all three signed off by the one arrival at the foot of the
    # trunk, because one load is what rebuilt the model. Staggering them would be
    # three surfaces lighting between arrivals, which is three surfaces
    # responding to nothing. The dot also holds the 32 edge, letting the labels
    # start where their own heading does; it is the only thing in the table that
    # can carry a beat, since text cannot light up without a shape behind it and
    # three shaded bands in a 108-unit card is more furniture than this needs.
    #
    # The dots stay OUT of the deck below. They are identical in every model and
    # they carry a beat, so duplicating them would triple the animated markup and
    # leave three stacked circles lighting on the same delay.
    s.add(f'<circle class="lit" cx="35.5" cy="{270 + i * 17 - 4}" r="3" fill="{LINE}" '
          f'style="--base:{LINE};--hot:{FLOW};'
          f'animation-delay:{s.at(out_land)}"/>')

# The card edges behind this panel say the warehouse holds more than one model,
# so the card turns over and shows three of them: what the business earned, who
# stayed, and what a customer is worth. Three different questions asked of the
# same load, rather than one table with its digits nudged - which is the argument
# for a warehouse in the first place.
#
# Headings and row labels turn over TOGETHER. Swapping "Orders" for "Signups"
# over rows still reading Direct and Paid search would leave the table plainly
# mislabelled, which is worse than never turning at all.
#
# Every slot is checked against its longest string so the card cannot appear to
# resize as it turns. Widest title "Retention model" ends at 149, clear of
# "updated 04:12" starting at 243; widest left label "Paid search" ends at 120,
# clear of the Orders column's values, which end at MID and start no further left
# than 162; the widest right figure "$128,400" starts at 265, clear of MID.
MODELS = [
    ("Revenue model", ("Channel", "Orders", "Revenue"),
     (("Direct", "3,912", "$128,400"),
      ("Paid search", "2,168", "$71,320"),
      ("Email", "1,431", "$46,090"))),
    ("Retention model", ("Cohort", "Signups", "Day 90"),
     (("Jan cohort", "4,206", "58.2%"),
      ("Feb cohort", "3,874", "61.4%"),
      ("Mar cohort", "4,530", "63.1%"))),
    ("LTV model", ("Segment", "Customers", "Avg LTV"),
     (("Enterprise", "312", "$18,400"),
      ("Mid-market", "1,845", "$6,120"),
      ("Self-serve", "12,480", "$840"))),
]


def model(title, heads, rows):
    """One version of the table: headline, three headings, three rows.

    228 is not a round number picked by eye. The block runs from the headline's
    cap height to the last row's baseline, and 228 is what centres that block in
    the card - the first draft hung it off a 20-unit top pad and left five at the
    foot. Every variant sits on these same baselines, so nothing shifts.

    Each heading sits on its own column's text, not on the dot gutter, so the
    three headings stand exactly over the three stacks of values.
    """
    s.label(L, 228, title, size=13, weight=700)
    s.label(47, 250, heads[0], size=9.5, weight=600, opacity=.5)
    s.label(MID, 250, heads[1], size=9.5, weight=600, opacity=.5, anchor="end")
    s.label(R, 250, heads[2], size=9.5, weight=600, opacity=.5, anchor="end")
    for i, (label, mid, right) in enumerate(rows):
        y = 270 + i * 17
        s.label(47, y, label, size=11, weight=600)
        s.label(MID, y, mid, size=11, weight=500, opacity=.5, anchor="end")
        s.label(R, y, right, size=11, weight=600, anchor="end")


s.deck([(lambda m=m: model(*m)) for m in MODELS])

s.write(frame=30)
