#!/usr/bin/env python3
"""7/8 CRM Setup. Three signals score a lead, then the lead walks the pipeline.

The card and the pipeline are the same system, so the HubSpot mark is spent once,
in the card header, and nothing else in the picture carries a brand. The stages are
stages, not products, and the three signals are behaviours, so both stay unbranded.

One column pair governs everything: L=32 and R=318. The rule, the score row, the
meter track and the whole chip row all begin at 32 and end at 318, which is what
stops the lower half reading as three loose objects at three different insets.

The meter is three separate pills rather than one bar because each one is a named
signal's share of the score, and the caption under it says which. A single bar hides
its own joints, so the captions beneath it would have looked randomly spaced.

The depth is all second layers inside surfaces that already exist, never another
thing on the canvas. Each signal tile carries its own volume under its icon, so a
tile says how much as well as what. The score row's 200 units of white between the
label and the number carry the trend that got to it, which is the one thing this
section actually sells. The meter's grey tail gets named, so it reads as the gap to
100 rather than as a bar that stopped early.

The card turns over between three leads, because the card edge behind it promises
there are others. Name, source, score, the three shares and the tail all belong to
one variant, so the numbers on the card always add up to each other.
"""
from kit import Scene, GREEN, BAR, BAR_DARK, BORDER, text_w

# Five legs, because this is a walk and not a burst: the three signals score
# the lead, the lead drops into the pipeline, then it moves a stage at a time.
# On one leg all seven pointers ran at once and every beat fired together, so
# the lead never appeared to go anywhere.
s = Scene("crm", "ill-crm", stages=5, note="Three signals score the lead, then the lead moves stage to stage.")

L, R = 32, 318                  # the only two x values anything in the card holds
JOIN, BUS = 175, 98
CARD_TOP, CARD_BOT = 114, 234
ROW_Y, ROW_H = 268, 24
MID = ROW_Y + ROW_H / 2

# behaviours, so line icons. Nothing here is a product. The outer two sit on L and
# R as well, so the tile row, the meter track and the chip row all share two edges
# down the whole picture. The four values are that signal's last four weeks, drawn
# inside the tile: the icon says which behaviour, the columns say how much of it.
SIG = [("cursor", "Site visits", L + 22, [.34, .5, .68, 1]),
       ("mail", "Email opens", 175, [.56, .34, .8, .62]),
       ("eye", "Pricing views", R - 22, [.22, .38, .54, 1])]
# The card edge behind the panel says this is the lead currently open rather than
# the only record in the system, so the card turns over and shows the other ways a
# lead arrives: a content enquiry, a self-serve trial, a partner referral. Each is
# a different motion with a different amount of behaviour behind it, which is why
# the score moves with the name rather than staying put.
#
# The three shares turn over with it and always add up to the score, and the grey
# tail's caption is whatever is left of 100, so no two numbers on the card can
# disagree. The behaviours themselves never change: the three tiles above name
# them and those do not turn over.
#
# Every slot is fixed width by construction - an eleven-character name, a source
# line at the 24 the sub-line has always been capped at, two digits everywhere a
# number appears - so nothing can appear to resize as the card turns.
SIG_CAP = ("Visits", "Opens", "Pricing")
LEADS = [
    ("Priya Raman", "Northwind Labs · Inbound", 82, (34, 26, 22)),
    ("Marcus Hale", "Halcyon Freight · Trial", 74, (30, 26, 18)),
    ("Ana Beltran", "Kestrel Health · Partner", 67, (27, 23, 17)),
]
for _n, _c, _score, _sh in LEADS:
    assert sum(_sh) == _score, f"{_n}: the shares do not add up to {_score}"
    assert len(_c) <= 24, f"{_n}: source line reaches the brand pill"
# The first lead sets the meter geometry, and it is the same for all of them. The
# pills are what the card turns over UNDER, so they hold still: a bar that resized
# mid-crossfade would be the one thing in the picture that jumps, and the widths
# are never seen side by side to be compared anyway.
SHARE, TOP = LEADS[0][3], LEADS[0][2]
# eight weeks of the score itself, ending on the number beside it. The number is
# the last point of this, which is why the two sit on one line with nothing between.
TREND = [.12, .2, .16, .34, .43, .58, .7, 1]
STAGE = ["New", "MQL", "Demo"]
REP = "Dana R."


def feed(cx):
    """Down from the signal, elbow onto the bus, along it, down into the card.

    Every feed runs a few units PAST the card top. The card is painted after the
    lines, so the cap is buried and the trunk reads as entering the panel rather
    than stopping just short of it. The middle signal is already on the join, so
    it drops straight through, the same shape analytics and warehouse use.
    """
    if cx == JOIN:
        return f"M{cx} 85 V{CARD_TOP + 6}"
    turn = "0 0 0 10 10" if cx < JOIN else "0 0 1 -10 10"
    into = "0 0 1 10 10" if cx < JOIN else "0 0 0 -10 10"
    stop = JOIN - 10 if cx < JOIN else JOIN + 10
    return (f"M{cx} 85 V{BUS - 10} a10 10 {turn} H{stop} "
            f"a10 10 {into} V{CARD_TOP + 6}")


# The pipeline is laid out first because the card has to know where it drains to.
# It spans exactly L..R, so the chip row sits directly under the meter track and
# the two share both edges.
WIDTHS = [s.chip_width(l, h=ROW_H) for l in STAGE] + [s.chip_width(REP, h=ROW_H, marked=True)]
GAP = (R - L - sum(WIDTHS)) / 3
XS, _x = [], float(L)
for _w in WIDTHS:
    XS.append(_x)
    _x += _w + GAP
FIRST = XS[0] + WIDTHS[0] / 2

# --- the three behaviour signals -----------------------------------------
# The tile is drawn without its icon so the icon can sit high and leave the lower
# third of the 44 for the columns. Nothing moves outside the tile: this is a second
# layer inside a surface that was already there, not another thing on the canvas.
for i, (icon, name, cx, vol) in enumerate(SIG):
    beat = 1 + i * 7
    s.tile(cx - 22, 14, 44, None, beat=beat)
    s.icon(icon, cx, 30, 19, beat=beat)
    # grey, and short. Loud columns here would out-shout the scoring meter below,
    # which is the thing they are evidence for.
    s.minibars(cx - 13, 44, 26, 8, vol)
    # the two tightest clearances in the picture sit either side of this label, so
    # they are set equal: 6.8 from the tile above, 6.8 from the feed head below.
    s.label(cx, 72, name, size=10, weight=500, opacity=.55, anchor="middle")

# One card edge behind the panel, so this reads as the lead currently open rather
# than the only record in the system. It goes down BEFORE the feeds on purpose: the
# stem then passes in front of the back edge and behind the front one, which is what
# makes it depth rather than a stray outline. A second edge would land at 104 and
# collide with the junction's halo, so there is one.
s.stack_behind(16, CARD_TOP, 318, CARD_BOT - CARD_TOP, n=1)

# Every resting line goes down before any pointer. Drawn per feed instead, the
# later feeds paint over the earlier feed's pointer along the last dozen units
# into the junction, which all three share, and it vanishes just before it lands.
feeds = [feed(cx) for _, _, cx, _v in SIG]
for d in feeds:
    s.line(d)
scored = [s.sweep(d, stage=0) for d in feeds]

# --- the lead leaves the card for the first stage -------------------------
# Straight down the first chip's centre line into the top of that chip, so the eye
# goes New, MQL, Demo, Dana R. without ever turning round. seg is raised because the
# drop is a quarter the length of a feed, and the kit's default segment on 34 units
# is a stub barely longer than the stroke is wide.
exit_d = f"M{FIRST:.1f} {CARD_BOT} V{ROW_Y}"
s.line(exit_d)
enters = s.sweep(exit_d, stage=1)

# --- the lead card ---------------------------------------------------------
s.panel(16, CARD_TOP, 318, CARD_BOT - CARD_TOP)
# the junction sits ON the bus, not below it, so the stem into the card stays one
# unbroken run. Below the bus its halo eats the stem and leaves a floating crumb.
s.node(JOIN, BUS, beat=scored[0])

# header. The avatar halo overshoots L by a hair, which is how a circle sits level
# with a flat edge, and the chip is centred on the avatar rather than on the two
# text baselines it sits beside.
s.add(f'<circle cx="46" cy="142" r="15" fill="{GREEN}" fill-opacity=".14"/>')
s.icon("user", 46, 142, 17)
# The name and the sub-line are drawn further down, with the rest of what turns
# over. The roundel stays here: it is the same shape for every lead, so putting it
# in the deck would draw it three times for no visible gain.
# the CRM, named once. The card and the pipeline below are both inside it, so
# nothing else in the picture needs a mark.
# Interchangeable tools take turns rather than one of them getting the
# billing. A fixed mark here reads as the only one we do.
CRMS = [("hubspot", "HubSpot"), ("salesforce", "Salesforce")]
s.brands(R - s.brands_width(CRMS), 131, CRMS)

s.add(f'<rect x="{L}" y="168" width="{R - L}" height="1" fill="{BORDER}"/>')

s.label(L, 186, "Lead score", size=11, weight=600)

# The 200 units between the label and the number were the largest hole in the file,
# and the trend is the one thing that belongs in it: 82 is not a fact about today,
# it is where eight weeks of these behaviours got to. Sat on the type's own optical
# band rather than floating, and grey, so the only bright mark is the last point,
# which is the live one and is what the green 82 to its right is reading.
s.spark(212, 176, 74, 14, TREND, tone=BAR_DARK)

# the meter is three pills, not one bar, so each signal wipes in its own named
# share and the caption under it has something to align to. 4 of air between them
# is enough to read as separate at 7 high without looking gappy.
TRACK = R - L
s.bar(L, 194, TRACK, h=7, tone=BAR)
CAP_X, _x = [], float(L)
for i, pts in enumerate(SHARE):
    _w = pts / TOP * (0.82 * TRACK - 8)     # the three pills plus two gaps are the score
    s.bar(_x, 194, _w, h=7, tone=GREEN, grow=scored[i])
    # where the caption under this pill starts, kept so the deck can align to the
    # pills without redrawing them
    CAP_X.append(_x)
    _x += _w + 4


def lead(name, source, score, shares):
    """Everything on the card that is about WHICH lead this is.

    The header, the number, the three shares and the grey tail's caption are one
    variant because they have to agree: a score that changed while the shares under
    it did not would be three numbers calling each other liars.
    """
    s.label(70, 138, name, size=13, weight=700)
    # the sub-line carries two facts instead of one: who they work for and how they
    # arrived, which is what the three signals above are evidence of. One text
    # element, so the header gains a fact without gaining an object. It has to stay
    # under 24 characters or it reaches the brand pill in a wide fallback font.
    s.label(70, 152, source, size=10, weight=400, opacity=.5)
    s.label(R, 186, str(score), size=13, weight=700, color=GREEN, anchor="end")
    for x, sig, pts in zip(CAP_X, SIG_CAP, shares):
        s.label(x, 218, f"{sig} +{pts}", size=9.5, weight=500, opacity=.5)
    # the grey tail of the track was the only stretch of the meter nothing claimed,
    # and it is exactly the points that are not there yet. Named on the same caption
    # row and on R, so the row sums to 100 and the tail reads as the gap rather than
    # as a bar that stopped early.
    s.label(R, 218, f"{100 - score} left", size=9.5, weight=500, opacity=.5, anchor="end")


s.deck([(lambda l=l: lead(*l)) for l in LEADS])

# --- the pipeline ----------------------------------------------------------
hops = [f"M{XS[i] + WIDTHS[i] - 2:.1f} {MID} H{XS[i + 1] + 2:.1f}" for i in range(3)]
for d in hops:
    s.line(d)
# one hop per leg, so the lead is only ever on one stretch of the pipeline
lands = [enters] + [s.sweep(d, stage=2 + i) for i, d in enumerate(hops)]

for i, stage in enumerate(STAGE):
    s.chip(XS[i], ROW_Y, stage, h=ROW_H, beat=lands[i])

# the lead ends on a person, which is the only solid chip in the picture
s.chip(XS[3], ROW_Y, REP, solid=True, icon="user", h=ROW_H, beat=lands[3])
s.label(XS[3] + WIDTHS[3] / 2, 308, "Rep assigned", size=9.5, weight=500,
        opacity=.5, anchor="middle")

# 54 is the only still that carries both halves at once: the bus lit either side of
# the join, and the lead already a third of the way from New to MQL.
# The rasteriser measures the dash in real units rather than the percent pathLength
# declares, which costs two things. A finished sweep parks its tail on any path over
# 100 units, so the bus keeps a segment it would not have in a browser - it points
# at the join, which is where the flow goes anyway. And a pipeline hop is only 33
# units, so its whole sweep is on and off inside the first third of its own window:
# past about 60 the still catches nothing down there at all.
s.write(frame=54)
