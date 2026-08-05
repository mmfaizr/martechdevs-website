#!/usr/bin/env python3
"""2/8 Smart Messaging. One behaviour fires, Braze sends on four channels.

The mirror of the data-collection piece: the panel sits at the top and the flow
runs down out of it. Each channel gets a complete path of its own from the panel
bottom, so the four routes share one spine and part of one bus rather than
forking at a point. Four curves leaving a single point knotted up at the join and
you could not tell which line went where.

The pointers run on the kit's heartbeat, so the picture answers it rather than
setting its own: the two near channels are one pulse from the panel and light on
the half beat, the two far ones are two pulses out and light on the whole. That
staging is the honest thing to show anyway - a send does not reach every channel
at the same instant.

The panel keeps two text columns and nothing else: 63 for every title and 318
for every value. That is why the header roundel is r=12 like the row roundels
rather than the r=15 of the profile card - at r=15 its label has to start at 70
and the panel gains a seven pixel staircase for no gain.

The detail layer is deliberately small, because this is the densest of the eight,
and every part of it is a second layer inside a surface that already exists
rather than another thing on the canvas: what each channel actually sent, the
contest behind the variant the panel already names, the spread of hours behind
the send time it already names, the card edges that make this one journey out of
many and the card turning over to show three of them, and a dot grid so the half
of the canvas the panel does not cover is a surface instead of a hole. No new
node, tile, panel or connector.
"""
from kit import Scene, W, BAR, BAR_DARK, BORDER, GREEN, GREEN_PALE

# Two legs: the trunk out of the panel, then the four branches. On one leg the
# four routes overlapped along the trunk, so four pointers queued down it nose to
# tail and only then diverged, which reads as four separate errands rather than
# one send being split.
s = Scene("messaging", "ill-msg", stages=2,
          note="The trigger leaves the panel, then all four channels go together.")

# The fourth column is what actually went out on that channel. Four tiles with an
# icon and a name only say "we can do these"; the count says the split is real and
# uneven, which is the thing worth knowing and costs one line of 9.5 grey.
CH = [("mail", "Email", 52, "8,240"), ("bell", "Push", 134, "5,180"),
      ("chat", "In-app", 216, "2,910"), ("phone", "SMS", 298, "1,460")]
SPLIT = 175
PANEL_TOP, PANEL_BOT = 20, 147
# The tiles come up 10 so the caption can carry a second line and still keep the
# 14 of clear air at the bottom edge. Nothing else in the flow moves.
CHIP_Y, NODE_Y, BUS, TILE_TOP = 155, 189, 204, 240
L, R = 32, 318            # the panel's content columns, held by everything in it
TXT = L + 31              # where every title and every meta line starts, roundel included
ROW_Y, PITCH = 74, 35     # one pitch for the list, same as the profile card


TRUNK = f"M{SPLIT} {PANEL_BOT - 2} V{BUS}"


def branch(cx):
    """Down the shared spine, square onto the bus, along it, elbow down to a tile.

    The spine runs all the way to the bus and every route turns at the same
    point, which is the whole reason the split is a clean T. Elbowing off the
    spine ten pixels early instead - the mirror of how the sources merge - builds
    a little hill out of four arcs with white nicks between them, and strands the
    node on top of the hill instead of on the wire.

    Starts inside the panel and finishes inside the tile, both of which are drawn
    afterwards, so every line is tucked under the thing it connects and nothing
    stops in open space.
    """
    into = "0 0 0 -10 10" if cx < SPLIT else "0 0 1 10 10"
    stop = cx + 10 if cx < SPLIT else cx - 10
    return f"M{SPLIT} {BUS} H{stop} a10 10 {into} V{TILE_TOP + 4}"


# --- the send-out ---------------------------------------------------------
# All four resting lines go down before any pointer. Drawing line-then-pointer
# per route would bury each stream under the next route's line along the spine
# and the inner half of the bus, which is most of what these routes share.
branches = [branch(cx) for _, _, cx, _ in CH]
# A dot grid under the send-out, so the half of the canvas the panel does not
# cover is a surface rather than a hole. Painted first, at BORDER, quiet enough
# that the resting connectors are still the lightest thing with weight.
# Sized off the 14 pitch rather than the margins: 300 wide is 22 columns centred
# exactly on the spine, and 124 tall stops the last row at the tiles. Run to the
# bottom edge instead and a row of dots lands between each channel name and its
# count, which is the one place in this picture that cannot take any noise.
# x=25, not 28: texture() now centres its field in the box, and this band's
# 300 holds 21 gaps with 6 over. The field still lands on 28..322, where it has
# always been and where it is square on the canvas; only the box moved.
s.texture(25, 160, 300, 124)
s.line(TRUNK)
for d in branches:
    s.line(d)

# The node goes down BEFORE the pointers and the chip after, and the difference
# matters. Nothing should hide a pointer in the middle of a wire, so the node is
# a marker the pointers ride over; the chip is the one place a pointer is meant
# to disappear, because passing behind it is what going through the engine looks
# like.
# Both beats are moments a pointer really is on that stretch rather than round
# numbers: the spine is 44 units from the panel down to the node, which at the
# kit's speed is most of the first tenth of the cycle.
# leg one: out of the panel and down to the split
at_split = s.sweep(TRUNK, stage=0)
s.node(SPLIT, BUS, beat=at_split)

# leg two: all four branches leave the split together the moment it lands
lands = [s.sweep(d, stage=1) for d in branches]

# The engine doing the sending, named on the pipe itself rather than spending a
# tile on it, exactly as the source-side piece names Segment.
# The engine, named on the pipe itself. It turns over the tools this section
# actually covers rather than planting a flag on one of them.
ENGINES = [("braze", "Braze"), ("customerio", "Customer.io"), ("clevertap", "CleverTap")]
s.brands(SPLIT - s.brands_width(ENGINES) / 2, CHIP_Y, ENGINES)

# --- what happened, and what the automation decided -----------------------
# One journey out of the many already running, which is what an automation
# platform actually is and was previously only implied by the word "Automated".
# The panel starts at 20 rather than 14 to pay for it: two edges at a 3 step put
# the back card's top on 14 exactly, and the roundel then has the same 14 of
# clear above it as the bottom row has below.
s.stack_behind(16, PANEL_TOP, W - 32, PANEL_BOT - PANEL_TOP, n=2, step=3)
# Painted after the lines so the panel edge covers the head of the spine.
s.panel(16, PANEL_TOP, W - 32, PANEL_BOT - PANEL_TOP)
# The trigger roundel is the same 24px as the two below it, so the panel keeps
# one roundel column: the header earns its rank from 13/700 type, the chip on
# its line and the rule under it, not from being a size nobody else is.
s.add(f'<circle cx="44" cy="46" r="12" fill="{GREEN_PALE}"'
      f'/>')
# A flag rather than the cart it used to be. The trigger turns over now, so a
# cart would be the wrong glyph two thirds of the time; a raised flag is what all
# three headlines actually have in common - an event fired and the journey ran.
# It also stays out of the way of the bolt on the chip beside it and the bell on
# the Push tile below, so no glyph appears twice in one picture.
s.icon("flag", 44, 46, 14, color=GREEN, beat=0)
_a = s.chip_width("Automated", marked=True)
s.chip(R - _a, 35, "Automated", solid=True, icon="bolt", beat=2)
s.add(f'<rect x="{L}" y="66" width="{R - L}" height="1" fill="{BORDER}"/>')

for i, (icon, title, meta) in enumerate((
        # Row one's meta line turns over with the trigger, so row() lays out the
        # chrome and the deck below writes the line on row()'s own baseline.
        # Blank rather than omitted: given no meta at all, row() centres its title
        # on the roundel and this row would sit five pixels off the one under it.
        ("spark", "Message picked", " "),
        ("clock", "Send time", "Optimized per user"))):
    s.row(L, ROW_Y + i * PITCH, R - L, icon, title, meta, beat=4 + i * 2, rule=i == 0)

# The card edges behind this panel say there are more journeys where this came
# from, so the card turns over and shows them. Three campaigns that a lifecycle
# tool is bought for separately - win back a basket, convert a trial before it
# lapses, catch demand the warehouse missed - rather than one campaign with its
# numbers nudged, which would leave the stack promising something it never pays.
#
# Only the five lines that differ are duplicated. The panel, the rule, the
# roundels, the icons, the chip and both row titles are drawn once, above.
#
# Every slot is matched on its longest string so nothing appears to resize as the
# card turns: the widest subtitle stops twenty short of the Automated chip, the
# value column is nine characters in all three and the time is five in all three.
TRIGGERS = [
    ("Cart abandoned", "Amara Osei · 2 items",
     "Reminder · 10% off", "Variant B", "18:40"),
    ("Trial ending", "Priya Raman · 2 days left",
     "Upgrade · annual plan", "Variant A", "09:15"),
    ("Back in stock", "Marcus Lund · on waitlist",
     "Restock · 4 left", "Variant C", "20:05"),
]
# Bound as defaults, not closed over: every variant would otherwise draw the last
# row of the table, three times.
s.deck([(lambda t=t, who=who, msg=msg, var=var, when=when: (
    s.label(TXT, 42, t, size=13, weight=700),
    s.label(TXT, 56, who, size=10, weight=400, opacity=.5),
    # +20, which is row()'s OWN meta baseline (cy + 8). At +22 this row had two
    # competing baselines for one line: row() reserved 94 and the deck wrote 96.
    # It cost three things at once - the descenders came within 3.95 of the rule
    # instead of nearly six, this row's leading was 12 against row two's 10, and
    # the pair's centre fell a unit below both the roundel and the value opposite.
    s.label(TXT, ROW_Y + 20, msg, size=9.5, weight=400, opacity=.5),
    # optically centred on the roundel, not on the two-line block beside it
    s.label(R, ROW_Y + 16, var, size=11, weight=600, anchor="end"),
    s.label(R, ROW_Y + PITCH + 16, when, size=11, weight=600, anchor="end"),
)) for t, who, msg, var, when in TRIGGERS])

# The row already names the winner, so the two columns only have to show there
# was a contest and it was not close. Drawn as two calls rather than one pair,
# because the loser in BAR and the winner in BAR_DARK is what stops an even-toned
# pair reading as a signal-strength glyph. Neither goes green: the taller one is
# the picked variant, and lighting it would be a third bright spot in a picture
# that is allowed one chip and one pointer.
# Sat on the value's own baseline and capped at its cap height, so it reads as
# part of "Variant B" rather than as a stray mark parked near it.
s.minibars(244, ROW_Y + 7, 6, 10, [0.42], tone=BAR)
s.minibars(253, ROW_Y + 7, 6, 10, [1.0], tone=BAR_DARK)

# "Optimized per user" is the one claim in the panel with nothing behind it: as
# printed it could equally be one blast at 18:40. A day's worth of send times
# with a hump on the evening says the hour is a per-person answer and 18:40 is
# only where the crowd is. A curve rather than a second set of bars, so the two
# rows read as two different facts and not as one repeated glyph, and it sits on
# the same 244 column and the same baseline as the pair above it. Grey and
# dotless: the pointer and the one solid chip keep the green.
s.spark(244, ROW_Y + PITCH + 6, 34, 11,
        [.05, .1, .28, .62, 1, .7, .3, .08], tone=BAR_DARK, dot=False)

# --- the channels ---------------------------------------------------------
for i, (icon, name, cx, sent) in enumerate(CH):
    s.tile(cx - 22, TILE_TOP, 44, icon, beat=lands[i])
    s.label(cx, TILE_TOP + 58, name, size=10, weight=500, opacity=.55, anchor="middle")
    s.label(cx, TILE_TOP + 70, sent, size=9.5, weight=500, opacity=.5, anchor="middle")
    # A share bar under each count was tried here and taken out. Four centred bars
    # under four centred numbers read as underlines rather than as data, and they
    # only restate the proportion the numbers already give. The counts are the
    # second layer on these tiles; a third would be the clutter.

s.write(frame=42)
