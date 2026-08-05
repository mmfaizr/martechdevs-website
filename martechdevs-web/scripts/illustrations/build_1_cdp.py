#!/usr/bin/env python3
"""1/8 Data Collection. Four sources merge into one profile.

Each source gets a complete path of its own, down onto a shared bus and along to
the junction, rather than four curves meeting at a point. Four curves converging
knotted up at the join and you could not tell which line went where.

Two legs, and the mirror of the messaging piece's fan-out: the four sources run
the bus down to the junction under the CDP pill, then one pointer carries the
merged profile the short run into the panel. On one leg every source route also
owned that last stretch, so four pointers queued nose to tail down it behind the
pill, which reads as four separate deliveries arriving rather than one profile
being assembled out of four sources.
"""
from kit import Scene, W, GREEN, BAR_DARK, FONT, INK

s = Scene("cdp", "ill-cdp", stages=2,
          note="Four sources reach the junction together, then one merged profile goes in.")

# The volume is what tells the four apart. Without it they are four identical
# taps; with it the row reads as one firehose, one hose and two trickles, which
# is the actual argument for putting a CDP in front of them.
#
# The figure states the size and the columns show it. They are drawn to one
# shared scale across all four tiles, so the row can be read across without
# reading any of the numbers - which is the point, and something four identical
# captions could never do however different their digits were.
#
# The smallest feed is floored well above minibars' own 2px minimum. Scaled
# honestly it clipped to four identical stubs and read as a dotted rule or a
# disabled tile rather than as a trickle that is still moving.
SRC = [("cursor", "Web", 52, "2.4M", [.7, .84, .76, 1.0]),
       ("phone", "App", 134, "1.1M", [.5, .62, .54, .72]),
       ("server", "Server", 216, "860k", [.5, .42, .54, .6]),
       ("cart", "Billing", 298, "240k", [.26, .34, .28, .42])]
JOIN, BUS, PANEL_TOP = 175, 104, 150

# The ground the whole flow sits on. Nothing above the panel had anything behind
# it, so the top third read as a hole rather than as space.
s.texture(14, 18, W - 28, 128)

# The panel is one profile out of many, which is the whole point of a CDP and
# was previously only stated in words. Drawn before every line so the trunk
# still runs over it and lands on the front card.
s.stack_behind(16, PANEL_TOP, W - 32, 168, n=2, step=3)


def source(cx):
    """Down from the source, elbow onto the bus, along it, elbow down to the join.

    Stops exactly on the junction, which is where the four become one. Carrying
    on to the panel from here is what made this a single overlapping leg.
    """
    turn = "0 0 0 10 10" if cx < JOIN else "0 0 1 -10 10"
    into = "0 0 1 10 10" if cx < JOIN else "0 0 0 -10 10"
    stop = JOIN - 10 if cx < JOIN else JOIN + 10
    # Starts at 80, not 76. A connector is stroked at CONN=7 with a round cap, so
    # the paint reaches 3.5 ABOVE wherever the path starts: at 76 the visible head
    # was at 72.5 and the caption's descenders cleared it by 2.34, not the eight
    # units the caption comment budgets. Moving the pipe rather than the caption
    # is the safe direction - it cannot spend the caption's gap to the tile above.
    return f"M{cx} 80 V{BUS - 10} a10 10 {turn} H{stop} a10 10 {into}"


# the shared stretch: junction, behind the CDP pill, into the panel's top edge.
# It stops two short of the edge because the round cap adds three and a half, so
# it meets the panel rather than punching a notch through its border.
TRUNK = f"M{JOIN} {BUS + 10} V{PANEL_TOP - 2}"

# --- every source runs the bus down to the join --------------------------
# All five resting lines go down before any pointer. Drawing line-then-pointer
# per route would bury each stream under the next route's line along the bus,
# which is most of what these routes share.
sources = [source(cx) for _, _, cx, _, _ in SRC]
for d in sources:
    s.line(d)
s.line(TRUNK)

# leg one: the four sources arrive at the junction together
joins = [s.sweep(d, stage=0) for d in sources]

# The node goes down BETWEEN the two legs, and the order matters: nothing should
# hide a pointer in the middle of a wire, so it is a marker the merged pointer
# rides out of rather than a lid over the arrivals.
s.node(JOIN, BUS + 10, beat=joins[0])

# leg two: one merged run into the profile
arrive = s.sweep(TRUNK, stage=1)

# the CDP doing the merging, named on the pipe itself. A chip rather than a tile:
# it sits in the 46 units between the bus and the panel without crowding either.
# Painted after the pointer, because passing behind it is what going through the
# engine looks like.
# Interchangeable tools take turns rather than one of them getting the
# billing. A fixed mark here reads as the only one we do.
CDPS = [("segment", "Segment"), ("rudderstuck", "RudderStack")]
s.brands(JOIN - s.brands_width(CDPS) / 2, 119, CDPS)

# --- sources across the top ----------------------------------------------
# All four light on the same beat, because with the routes on one leg all four
# pointers now leave at the same instant. The old staggered beats were left from
# when each route ran the whole way on its own clock, and against the split they
# would fire at three moments when nothing is being collected.
for icon, name, cx, vol, shape in SRC:
    # The tile goes down without its icon so the icon can sit high and leave the
    # lower third of the 44 to the columns. Nothing new arrives on the canvas:
    # this is a second layer inside a surface that was already here.
    s.tile(cx - 22, 10, 44, None, beat=0)
    s.icon(icon, cx, 26, 19, beat=0)
    # Grey and short, on the same scale for all four, so the row reads as one
    # firehose and three smaller feeds at a glance. Any louder and they would
    # out-shout the profile, which is what the whole picture is actually about.
    # Four columns, not six: at this size the gaps are what cost width, and thin
    # columns read as a dotted rule rather than as a chart.
    s.minibars(cx - 13, 40, 26, 8, shape, gap=2.5)
    # Name and volume share the caption line rather than stacking: the eight
    # units between the caption and the head of the pipe are not a line of type,
    # and anything put there fouls the pipe's cap.
    #
    # One text element with two tspans, not two labels, because text_w is a
    # deliberate over-estimate and centring two separate labels off it put a
    # 1px gap after "Web" and a 10px one after "Server". The browser measures
    # the run for us; all this has to say is "centred here, with a gap".
    s.add(f'<text x="{cx}" y="68" font-family="{FONT}" font-size="10" '
          f'text-anchor="middle" fill="{INK}">'
          f'<tspan font-weight="500" fill-opacity=".55">{name}</tspan>'
          f'<tspan dx="5" font-size="9.5" font-weight="400" '
          f'fill-opacity=".5">{vol}</tspan></text>')

# --- the unified profile --------------------------------------------------
s.panel(16, PANEL_TOP, W - 32, 168)
# The same 24-unit roundel as the three rows below, on the same column. At r=15
# it sat on its own centre (46 against their 44) and its label had to start at 70
# against their 63, so a panel that is one list top to bottom had two roundel
# columns and a seven-unit staircase down its left edge. The messaging card is
# the same construction and already carries this fix; this is the one that was
# missed. Hierarchy comes from the name being 13/700, not from a wider disc.
s.add(f'<circle cx="44" cy="182" r="12" fill="{GREEN}" fill-opacity=".14"/>')
s.icon("user", 44, 182, 14)
# The stack behind this card says there are more where this came from, so the
# card turns over and shows them. Only the parts that differ are duplicated.
PROFILES = [
    ("Amara Osei", "one profile, four sources"),
    ("Dan Whitfield", "merged from 3 devices"),
    ("Rui Almeida", "web, app and billing"),
]
s.deck([(lambda n=n, m=m: (
    s.label(63, 178, n, size=13, weight=700),
    s.label(63, 192, m, size=10, weight=400, opacity=.5),
)) for n, m in PROFILES])
# Measured off R rather than parked on a literal. At x=240 the chip ended at
# 311.2 while the rules end at 318, the ring paints to 317.75 and the trend to
# 317, so the one green thing on that edge was the one that stopped short of it.
s.chip(318 - s.chip_width("Merged", marked=True), 171, "Merged", solid=True,
       icon="check", beat=arrive)

# "four sources" was only ever a claim. Four segments in the proportions of the
# four volumes above make the subtitle true, and they are the one thing that
# ties the panel back to the top of the picture rather than restating a number
# the row already prints. Grey, so it stays under the green.
seg = 63
for w in (52, 24, 18, 9):
    # 201, not 198. At 198 the segments sat 3.8 under the subtitle's descenders,
    # close enough that four grey bars directly beneath a line of grey type read
    # as skeleton copy waiting to load rather than as a breakdown of it. At 201
    # they clear the text by 6.8 and the first row below by 6, so they read as
    # their own band.
    s.bar(seg, 201, w, 5, tone=BAR_DARK)
    seg += w + 3

for i, (icon, title, meta) in enumerate((
        ("cart", "Lifetime value", "$4,280"),
        ("clock", "Last seen", "2 min ago"),
        ("target", "Propensity to buy", "78%"))):
    s.row(32, 210 + i * 35, W - 64, icon, title, meta,
          beat=arrive + 2 + i * 3, rule=i < 2)

# The rows state three numbers and show none of them. One trend on the money
# row turns the panel from a caption into a record: the profile has history,
# which is the thing a merged profile has that four raw feeds do not. Grey and
# dotless, so it stays underneath the green hierarchy.
s.spark(266, 215, 50, 14, [.08, .22, .18, .38, .46, .6, .74, 1], tone=BAR_DARK, dot=False)

# A propensity is a proportion, so it gets drawn as one. It ends at 316 where the
# trend above it ends, so the panel's right edge holds and the two read as one
# column of evidence rather than two loose marks. The figure stays in the row's
# meta line; putting it in the ring as well would say 78% twice.
s.ring(306, 292, 10, .78, tone=BAR_DARK, width=3.5)

# The middle row keeps nothing on its right and that is deliberate. Columns there
# made three marks down one edge, which turns the panel into a chart gallery and
# pulls the eye off the name and the merge; and rising columns under a rising
# trend read as the same fact printed twice. "2 min ago" is already the evidence.

s.write(frame=22)
