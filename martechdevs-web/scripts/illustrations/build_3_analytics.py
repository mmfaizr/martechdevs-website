#!/usr/bin/env python3
"""3/8 Growth Analytics. Raw events go in, a funnel you can spend against comes out.

Three event streams drop onto a short bus and enter the panel as one pipe, the
same merge shape the CDP illustration uses, so the set reads as one system. The
main beat is inside the panel: the four funnel stages wipe in one after another
once the last event has landed, so the picture says "this was computed from what
just arrived" rather than "here is a chart". Spend is tied on at the end, with
its own run into the ROAS chip, so the money line answers the funnel instead of
sitting beside it.

The panel is somebody's product, so it says whose: a Mixpanel chip closes the
header at the 318 column. The spend that feeds ROAS comes from the ad platform,
not from the funnel, so it carries the Google Ads mark - and it is a chip rather
than loose text so the run into ROAS starts on an edge instead of in the air.
The three tiles across the top stay line icons: those are event types, not
products, and a brand mark on one would be a lie.

One event stream answers more than one question, so the panel turns over and
asks three of them off the same three feeds: how the site converts, where the
checkout leaks, and whether the paid clicks were worth buying. Only the header
and the four rows swap; the panel, the roundel, the trend and the tool pill are
drawn once and stay put.

Two numbers rules that kept the layout honest:
  - Every stage name starts at 32 and every value ends at 318, and the widest
    bar is 160 in every variant, so it clears an eight-character stage name on
    one side and a five-character percentage on the other by 10 rather than by 1.
  - The figures agree with each other, across the swap as well as within it.
    42,180 sessions at 3.9% is 1,645 orders, which at a ~$32 basket is ~$52k
    against $12,480 of spend: 4.2x. The checkout funnel starts on the 6,411
    carts the tile above it counts and ends on those same 1,645 orders, and the
    paid funnel's 24,900 clicks against $12,480 is a 50c click.

The centre stream drops straight down and is a quarter the length of the two
that elbow along the bus. pathLength normalises every path to 100, so a shared
seg would make its bright segment a few pixels long. It gets its own.

The second layer, added after the composition settled, is all inside surfaces
that were already on the canvas - no extra tile, panel or connector. The events
carry their volume as a figure and as a gauge along the floor of their own tile,
so the top row tapers before the funnel does; the header carries a trend; and
Orders carries a delta. Between them they say the three things four bars and
three icons cannot: how much came in, how it is shared out, and which way it is
going.
"""
from kit import Scene, W, GREEN, BORDER, BAR, BAR_DARK, FONT, INK, text_w

# Two legs: the events land and fill the funnel, then the spend line resolves
# into ROAS. On one leg the ROAS chip lit while its own pointer was still
# leaving the spend chip.
s = Scene("analytics", "ill-roi", stages=2, note="Events land, the funnel fills stage by stage, then ROAS settles.")

# Event names as an analytics tool would show them - singular, one per tile, and
# each one feeding a stage of the funnel below it. The count is that stage's own
# numerator, so the top states the volume and the funnel states the rate and
# neither repeats the other: 19,400 of 42,180 sessions is the 46% below it.
#
# The last figure is how full that event's gauge sits inside its tile: the
# funnel bar it feeds against the full 160 of Sessions, scaled to the 26 units
# of track a tile holds. So the three tiles already taper before the funnel
# formalises it, and the tile stops being a plain grey square whose only
# distinguishing mark is its icon.
#
# Every one of them has to leave headroom, which is why the track is Sessions
# and not the widest event. Filled to the end, the first gauge stopped being a
# measurement and read as an underline of its icon, and with nothing to be short
# of, the other two read as two more underlines of arbitrary length.
#          icon     caption        count       cx  start  gauge
EV = [("eye", "Page view", "19,400", 70, 2, 20),
      ("cart", "Add to cart", "6,411", 175, 12, 14),
      ("money", "Purchase", "1,645", 280, 22, 9)]
JOIN, BUS, PANEL_TOP = 175, 100, 120
CX = 175                      # funnel centre line, also the panel centre

# The ground the flow sits on. The band above the panel was the only part of the
# canvas with nothing behind it, so it read as a hole rather than as space. It
# stops well clear of the bus: a dot row under a connector is hidden along the
# stretch the connector covers and visible either side of it, which looks like a
# mistake rather than like texture.
s.texture(14, 18, W - 28, 70)


def fade(a):
    """The brand green mixed down toward white.

    The funnel is the subject of the picture, so it carries brand colour rather
    than the kit's placeholder grey, which elsewhere in the set means "text we
    are not asking you to read". Mixing rather than fill-opacity keeps the tone
    a flat hex the rasteriser and the browser agree on.
    """
    rgb = (int(GREEN[i:i + 2], 16) for i in (1, 3, 5))
    return "#%02X%02X%02X" % tuple(round(255 - a * (255 - c)) for c in rgb)


def route(cx):
    """Down from the tile, elbow onto the bus, along it, elbow into the panel."""
    if cx == JOIN:
        return f"M{cx} 80 V{PANEL_TOP - 2}"
    turn = "0 0 0 10 10" if cx < JOIN else "0 0 1 -10 10"
    into = "0 0 1 10 10" if cx < JOIN else "0 0 0 -10 10"
    stop = JOIN - 10 if cx < JOIN else JOIN + 10
    return (f"M{cx} 80 V{BUS - 10} a10 10 {turn} H{stop} "
            f"a10 10 {into} V{PANEL_TOP - 2}")


# --- raw events across the top -------------------------------------------
for icon, name, count, cx, start, gauge in EV:
    s.tile(cx - 22, 10, 44, icon, beat=start)
    # A gauge along the floor of the tile, in the tile, not another mark beside
    # it. Track and fill both, because a lone bar of three different lengths
    # reads as an underline of the icon; against a track it reads as a
    # measurement. It sits below where any of the three icons actually inks -
    # the paths stop around 38 - so the tile is layered, not crowded.
    s.bar(cx - 13, 45, 26, 3, tone=BAR)
    s.bar(cx - 13, 45, gauge, 3, tone=BAR_DARK)
    # Name and count share the caption line rather than stacking. The twelve
    # units between the caption and the head of the pipe are not a line of type:
    # anything set there is centred on the pipe and fouls its cap.
    # One text element with two tspans, not two labels positioned off text_w.
    # text_w is a deliberate over-estimate, so laying the pair out from it makes
    # the gap after the name the estimate's error rather than the 5 asked for,
    # and it differs per string: the cdp card measured 1 after "Web" and 10 after
    # "Server" from this same code. The browser measures the run for us; all this
    # has to say is "centred here, with a gap".
    s.add(f'<text x="{cx}" y="68" font-family="{FONT}" font-size="10" '
          f'text-anchor="middle" fill="{INK}">'
          f'<tspan font-weight="500" fill-opacity=".55">{name}</tspan>'
          f'<tspan dx="5" font-size="9.5" font-weight="400" '
          f'fill-opacity=".5">{count}</tspan></text>')

# All resting lines first. Per event instead, the later routes paint over the
# earlier one's pointer along the last few units into the junction, which all
# three share, and it disappears right before it lands.
routes = [route(cx) for _, _, _, cx, _, _ in EV]
for d in routes:
    s.line(d)
lands = [s.sweep(d, stage=0) for d in routes]

# The junction sits on the bus rather than below it, so the stem that drops into
# the panel stays one unbroken line. It beats when the first sweep is actually
# ON it, not when that sweep reaches the panel: the join is about 77% of the way
# along the outer route, and hanging the beat off the arrival instead fired it
# half a second after the head had gone past.
s.node(JOIN, BUS, beat=lands[0])

# --- the funnel -----------------------------------------------------------
arrive = max(lands)

# No stack_behind here, though the CDP profile carries one. There the panel has
# 46 units of air above it and one trunk coming in; this one has 20 and three
# pipes elbowing through them. Two card edges in that band put the trunk's cap
# down on a stack of rules, which reads as a misprint rather than as depth, and
# takes the clearance between the bus and the panel with it.
s.panel(16, PANEL_TOP, W - 32, 198)
s.add(f'<circle cx="46" cy="142" r="14" fill="{GREEN}" fill-opacity=".14"/>')
s.icon("funnel", 46, 142, 16)
# The words "in 30 days" are traded for the 30 days themselves. Four bars are a
# shape with no time in them, so the panel could say how the funnel converts and
# not whether it is getting better, which is the only question anyone asks of it.
# Grey and dotless, the same as the trend on the CDP profile: this sits under the
# green hierarchy, it is not a second live thing.
#
# The trend is drawn before the header rather than after it because the header
# now turns over: one mark that outlives the swap, painted once.
#
# Ten points across 48 units gave each one five pixels of run, so the line
# jittered around its own middle and read as a stray pen mark rather than as a
# trend. Seven points over 54, with the climb actually using the height of the
# box, is the same claim made once instead of ten times.
s.spark(164, 142, 50, 12, [.16, .3, .24, .46, .58, .74, 1], tone=BAR_DARK, dot=False)
# whose funnel this is. Sized off the kit so the pill ends on 318 like every
# other right-hand value in the panel, rather than near it.
# Interchangeable tools take turns rather than one of them getting the
# billing. A fixed mark here reads as the only one we do.
SUITES = [("mixpanel", "Mixpanel"), ("amplitude", "Amplitude")]
s.brands(318 - s.brands_width(SUITES), 131, SUITES)

# Stage name in the panel's left column, share in its right, the bar centred
# between them: the funnel tapers without the labels stepping in after it. The
# widest bar is 160, which is what keeps 10 clear of an eight-character stage
# name on one side and a five-character percentage on the other. Every variant
# below opens on 160 for that reason, and because the top stage is always the
# 100% the rest are read against.
#
# Three funnels off one event stream, because that is what the stream is for:
# the same three feeds answer whether the site converts, whether the checkout
# holds, and whether the clicks were worth paying for. Not one funnel with its
# digits moved - the questions are different, and so is the shape of the answer.
# The rates fall harder on the first than on the second on purpose: a checkout
# that keeps a quarter of its carts is a normal checkout, a site that orders on
# 3.9% of its sessions is a normal site, and flattening them to one taper would
# make the swap decorative.
#
# Every slot is sized against the widest string that lands in it, so nothing
# reflows as it turns: 8 characters of stage name (Sessions, Checkout), 5 of
# percentage (15.2%, 17.3%), and a last row that stays 4 or fewer so the delta
# beside it keeps its clearance.
TONES = (1, .74, .56, .42)
FUNNELS = [
    ("Conversion funnel", "42,180 sessions",
     (("Sessions", "100%", 160), ("Views", "46%", 122),
      ("Carts", "15.2%", 88), ("Orders", "3.9%", 58))),
    ("Checkout funnel", "6,411 carts",
     (("Carts", "100%", 160), ("Checkout", "61%", 128),
      ("Payment", "41%", 104), ("Orders", "26%", 82))),
    ("Ad click funnel", "24,900 clicks",
     (("Clicks", "100%", 160), ("Sessions", "68%", 118),
      ("Carts", "17.3%", 76), ("Orders", "4.4%", 52))),
]


def funnel(title, sub, rows):
    """One version of the header and the four rows. Nothing else."""
    s.label(68, 139, title, size=13, weight=700)
    s.label(68, 153, sub, size=10, weight=400, opacity=.5)
    for i, (name, pct, w) in enumerate(rows):
        y = 166 + i * 26
        # Each stage settles into place just after its card lands, one after
        # another down the funnel. It does NOT wipe its width: a funnel bar's
        # width is the number it is reporting, so animating the width reads as
        # the figure changing. And it runs on the deck clock, because on the
        # pointer clock it re-animated every 2.6s under a card that had been
        # sitting there for ten seconds.
        s.bar(CX - w / 2, y, w, 18, tone=fade(TONES[i]), rise=i)
        s.label(32, y + 12.5, name, size=11, weight=600)
        s.label(318, y + 12.5, pct, size=11, weight=700, anchor="end")


# Bound as defaults, or all three variants close over the last funnel in the list
# and the card turns over three copies of the same thing.
s.deck([(lambda t=t, b=b, r=r: funnel(t, b, r)) for t, b, r in FUNNELS])

# One delta, on the stage the money below actually depends on. Four of them
# would turn the funnel into a table and the taper is the point; on Orders alone
# it says the rate moved, and it says it in the row ROAS is computed from.
#
# It stays out of the deck. Parked off the widest last-row percentage the three
# funnels can put there, it clears all of them, and a rate that improved is true
# of every one - so duplicating it three times would buy a label that never
# changes. The last row is capped at four characters for the same reason: a
# fifth digit would close the gap this is sitting in.
s.label(318 - text_w("3.9%", 11, 700) - 8, 256.5, "+0.4 pts",
        size=9.5, weight=400, opacity=.5, anchor="end")

# --- spend tied to the outcome -------------------------------------------
# Spend is a chip and not a line of text because the run into ROAS has to leave
# an edge. As text it started in mid-air a dozen pixels past the last glyph.
#
# The run is measured off the two chips and drawn BEFORE them, so each round cap
# ends up 3 units inside a pill and is painted over. Drawn after, the cap sat on
# the white pill's border and nicked it.
s.add(f'<rect x="32" y="274" width="286" height="1" fill="{BORDER}"/>')
_sp, _roas = (s.chip_width(t, marked=True) for t in ("Spend $12,480", "ROAS 4.2x"))

spend = f"M{32 + _sp - 3:.1f} 295 H{318 - _roas + 3:.1f}"
s.line(spend, w=5)
landed = s.sweep(spend, stage=1, w=5)

s.chip(32, 284, "Spend $12,480", logo="google ads", beat=arrive)
s.chip(318 - _roas, 284, "ROAS 4.2x", solid=True, icon="trend", beat=landed)

s.write(frame=24)
