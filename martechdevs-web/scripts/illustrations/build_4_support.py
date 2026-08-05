#!/usr/bin/env python3
"""4/8 Support and CX. The record is what makes the instant answer possible.

Record on top, conversation below, which is the same grammar as the rest of the
set: what you already hold flows down into what it produces. The previous take
put the conversation on top and ran the connectors back up into it, so they
crossed the panel and were painted over its interior. A connector has no
business inside a panel, and that is what made this one look broken.

Both legs start on the record's bottom edge and finish on the conversation's top
edge, so every end sits on a real border with nothing floating.

The conversation happens in Intercom and says so once, in the header. The record
is the client's own data and stays on line icons.

The thread is a real thread, not two shapes: both turns have a sender and a
time, and the footer says what happened to the thousand threads that are not on
screen. All of that lives inside the two panels already here - the picture gains
depth, not another box.

The same rule governs the rest of the detail. The case's progress is drawn on the
record instead of being claimed by the words that name it. The footer's 84%
carries the trend that got to it. The thread sits on a stack of card edges, so
"the thousand threads" is shown as well as stated, and the band the two panels
hand off across is given a floor. Nothing here is another node.

The stack under the thread is paid off: the whole case turns over - who is
asking, what the case is about, the question and the reply that answers it - so
the picture shows a delivery, a billing and a plan case rather than one parcel
question standing in for every conversation support ever has.
"""
from kit import Scene, W, GREEN, GREEN_PALE, LINE, BAR, BAR_DARK, BORDER, INK, SURFACE

s = Scene("support", "ill-cx", note="Two facts leave the record and the reply writes itself.")

# The record gets a third fact, so it takes 14 units off the thread. Visibility
# is the first thing this section claims and two rows was not showing it: one
# fact about the person and one about the thing they bought is a lookup, three
# facts across identity, order and history is a view.
#
# Two more units of panel, and the three rows start two units higher, because
# three rows on a 28 pitch did not fit: row() lays a title and a meta across
# y+2..y+22 and puts its rule at y+28, so at that pitch the rule landed 1.6
# above the NEXT row's cap and the middle fact read as pinched between two
# lines. The rows are laid out here by their real ink instead, and the rules are
# placed where the white actually is rather than at a fixed offset.
REC_TOP, REC_BOT = 14, 124
CONV_TOP = 158
JOIN = 175
L, R = 32, 318          # the inner column both panels share


def feed(cx):
    """Down off the record, in along a short bus, down into the conversation."""
    turn = "0 0 0 10 10" if cx < JOIN else "0 0 1 -10 10"
    into = "0 0 1 10 10" if cx < JOIN else "0 0 0 -10 10"
    stop = JOIN - 10 if cx < JOIN else JOIN + 10
    return (f"M{cx} {REC_BOT} V132 a10 10 {turn} H{stop} "
            f"a10 10 {into} V{CONV_TOP}")


# The band the two panels hand off across was the only stretch of the canvas
# with nothing behind it, so the pipes read as crossing a hole rather than a
# floor. Laid before everything, and it stops short of both panels.
s.texture(20, 130, W - 40, 12)

# --- what support already knows -------------------------------------------
s.panel(16, REC_TOP, W - 32, REC_BOT - REC_TOP)
s.label(L, 30, "Customer record", size=10, weight=500, opacity=.5)
s.label(R, 30, "live", size=10, weight=500, opacity=.5, anchor="end")
# Three facts, one pitch, and every one of them turns over with the case below.
# row() lays out the chrome and the deck writes on row()'s own baselines. The
# lines it turns over are blank rather than omitted: given no meta at all, row()
# centres its title on the roundel and the rows would not share a baseline.
#
# The glyphs are chosen to survive the turn. A tag covers an order, an invoice
# and a subscription; a chat covers whatever the history is. A cart would be the
# wrong glyph two thirds of the time.
FACT_Y = (36, 64, 94)
for i, glyph in enumerate(("user", "tag", "chat")):
    s.row(L, FACT_Y[i], R - L, glyph, " ", " ", beat=0 if i == 0 else 25,
          rule=False)

# The rules are placed here, not by row(), because row()'s y+28 is measured from
# the row above and knows nothing about what is under it. These bisect the white
# they actually divide: the first has 5.6 above and 6.0 below, the second 7.9 and
# 8.0, where row()'s offset gave the second 1.6 below. Each also lands tangent to
# a roundel edge - the first on the bottom of row one's, the second on the top of
# row three's - which is where the eye already expects a divider to stop.
for _ry in (60, 94):
    s.add(f'<rect x="{L}" y="{_ry}" width="{R - L}" height="1" fill="{BORDER}"/>')

# One thread out of the thousands the footer counts. It goes down BEFORE the
# feeds so the bus passes in front of the back edges and behind the front panel,
# which is what makes it depth rather than a stray outline. The record above
# stays unstacked on purpose: a case has one customer on it and there are
# thousands of these conversations, and the two panels should not claim the
# same thing.
s.stack_behind(16, CONV_TOP, W - 32, 158, n=2, step=3)

# --- the two facts travel down into the thread -----------------------------
# Both resting lines before either pointer: they share their last few units into
# the panel, and drawing line-then-pointer per feed buries the first one there.
feeds = [feed(cx) for cx in (90, 260)]
for d in feeds:
    s.line(d)
lands = [s.sweep(d) for d in feeds]
s.node(JOIN, CONV_TOP, r=6, beat=lands[0])

# --- the conversation ------------------------------------------------------
s.panel(16, CONV_TOP, W - 32, 158)
# Interchangeable tools take turns rather than one of them getting the
# billing. A fixed mark here reads as the only one we do.
DESKS = [("intercom", "Intercom"), ("zendesk", "Zendesk")]
# On L, like every other column in both panels. At 30 this one pill was inset 14
# where the chip opposite it, the action chips two rows below it and both panels
# above are all inset 16.
#
# And at +10, not +12. The panel runs 158..316 and its four bands are spaced 10,
# 10 and 10; only the top pad was 12 and the bottom 8. Pulling the whole stack up
# two makes every gap in the card, including the two against its own edges, a 10.
s.brands(L, CONV_TOP + 10, DESKS)
# Names what the picture actually shows. "Answered in 4s" sold speed, which is
# not what this section is about and not what the two feeds above are carrying:
# the reply is good because the record was already open, not because it was fast.
_w = s.chip_width("Full context", marked=True)
# Outline, not solid. The one solid chip in this picture belongs to the action
# at the foot: holding the context is the setup, doing something with it is the
# payoff, and two solid chips would give them equal billing.
s.chip(R - _w, CONV_TOP + 10, "Full context", icon="check", beat=lands[0])

# the question
Q_Y, Q_H = 200, 32
s.add(f'<circle cx="44" cy="{Q_Y + Q_H / 2:g}" r="13" fill="{GREEN_PALE}"/>')
s.icon("user", 44, Q_Y + Q_H / 2, 14, color=GREEN)
# 196 wide, not 172. At 172 the bubble stopped 80 short of the panel edge and
# the thread read as a narrow column down the middle of a wide card.
s.add(f'<rect x="66" y="{Q_Y}" width="196" height="{Q_H}" rx="12" fill="#F4F6F5" '
      f'stroke="{BORDER}"/>')
# Times sit outside the bubbles, on the far side, which is the empty half of the
# panel each turn leaves behind it. Inside they would crowd copy that is already
# there; outside they give the white something to be.
s.label(272, Q_Y + 20, "10:42", size=9.5, weight=400, opacity=.5)

# the answer, written out of the record above it
A_Y, A_H = 242, 32
# White, with a soft green border to mark it as the outbound turn. Filled pale
# green it was the largest block of colour anywhere in the set, and it drowned
# its own copy. The border says which way the message is going; the fill does not
# need to say it again.
s.add(f'<rect x="98" y="{A_Y}" width="186" height="{A_H}" rx="12" fill="{SURFACE}" '
      f'stroke="{LINE}" class="tint" style="--base:{SURFACE};--hot:#F2FAF6;'
      f'animation-delay:{s.at(lands[0])}"/>')
s.label(90, A_Y + 20, "10:42 · seen", size=9.5, weight=400, opacity=.5, anchor="end")

# Who is answering, balancing the customer opposite. The sparkle rather than a
# second person: nobody typed this. It lights on the same beat as the bubble it
# belongs to, so the two read as one turn.
# 306, the mirror of the question's avatar at 44 about the panel's centre at 175,
# and R - 12 by the other derivation. At 312 the reply turn was not the question
# turn reflected: it left a 3-unit gutter against its own bubble where the turn
# above has 9, and 9 to the panel border where the question has 15. The bubble
# gives up the 12 units so both gutters are the same 9.
s.add(f'<circle cx="306" cy="{A_Y + A_H / 2:g}" r="13" fill="{GREEN_PALE}"'
      f'/>')
s.icon("spark", 306, A_Y + A_H / 2, 14, color=GREEN, beat=lands[0])


# --- the case, which is what actually turns over ---------------------------
# Three cases a desk is bought for separately - where is my parcel, why was I
# charged twice, can I have more seats - rather than one question with its nouns
# swapped, which would leave the stack of card edges promising something it never
# pays. The record and the thread turn over in ONE variant because they have to
# agree: a name on the record that changed while the question below it did not
# would be two people in one conversation.
#
# Drawn here, after both panels, for that reason. Nothing painted between the
# record's rows and this point reaches the record's text, so the late paint
# costs nothing and keeps a case in one place in the file.
#
# Only the six lines that differ are duplicated. Both panels, the rule, the
# roundels, the icons, the brand pill, the chip, the times, the placeholder lines
# and the stepper are drawn once, above.
#
# --- what can be done from here -------------------------------------------
# The footer used to carry an aggregate: "solved on first reply, 84%". True, but
# it is an outcome, and this section sells three things - that the agent can SEE
# the whole customer, that the facts on screen are the right ones for THIS case,
# and that they can ACT without leaving the thread. The first two are the panel
# above and the record above that. The third had nothing showing it at all.
#
# So the foot of the thread is now the actions themselves, and they turn over
# with the case: a billing question offered a parcel tracker would say the
# opposite of the point. The first is the one this context points to, so it is
# the solid chip and it lights as the context lands.
ACTION_Y = 284
# No caption over the actions: at y=278 it ran into the reply timestamp, and a
# row of verbs does not need to be told it is a row of verbs.


def actions(labels):
    x = L
    for j, a in enumerate(labels):
        s.chip(x, ACTION_Y, a, solid=(j == 0), beat=lands[0] if j == 0 else None)
        x += s.chip_width(a) + 8



# Every slot is matched on its longest string so nothing appears to resize as the
# card turns: the widest sub-line stops seventy short of the value column, the
# question is nineteen characters at most against a bubble that holds twenty-two,
# and the reply is nineteen against twenty.
def case(who, plan, thing, detail, state, past, open_, ask, reply, acts):
    # Rows one and three carry a single line, so their name and their value share
    # a baseline - both at +16, which is where row() puts a title it was given no
    # meta for. The name used to sit at +11, five above the value opposite it, and
    # a row whose two ends are on different lines reads as sagging.
    #
    # Row two is the only two-line fact, so it takes row()'s two-line baselines,
    # +10 and +20, and its value sits at +16 between them: the ink of the pair
    # runs 66..86 and its centre is 76, which is where an 11px line at +16 sits.
    s.label(L + 31, FACT_Y[0] + 16, who, size=11, weight=600)
    s.label(R, FACT_Y[0] + 16, plan, size=11, weight=600, anchor="end")
    s.label(L + 31, FACT_Y[1] + 10, thing, size=11, weight=600)
    s.label(L + 31, FACT_Y[1] + 20, detail, size=9.5, weight=400, opacity=.5)
    s.label(R, FACT_Y[1] + 16, state, size=11, weight=600, anchor="end")
    s.label(L + 31, FACT_Y[2] + 16, past, size=11, weight=600)
    s.label(R, FACT_Y[2] + 16, open_, size=11, weight=600, anchor="end")
    s.label(80, Q_Y + 20, ask, size=11, weight=500)
    s.label(112, A_Y + 20, reply, size=11, weight=600, color=INK)
    actions(acts)


CASES = [
    ("Mia Chen", "Pro plan", "Order #2481", "shipped 2 Aug, DHL", "In transit",
     "4 past tickets", "0 open",
     "Where is my order?", "Arrives Friday, DHL",
     ["Track parcel", "Resend", "Refund"]),
    ("Tomas Reyes", "Pro plan", "Invoice #4482", "charged twice, 1 Aug", "Refund sent",
     "2 past tickets", "1 open",
     "Was I billed twice?", "Refunded, 2-3 days",
     ["Refund", "Credit note", "Escalate"]),
    ("Nadia Haddad", "Team plan", "Subscription", "annual, 12 seats", "Renews 14 Sep",
     "9 past tickets", "0 open",
     "Can I add 5 seats?", "Added, $58 prorated",
     ["Add seats", "Quote", "Renew"]),
]
# Bound as defaults, not closed over: every variant would otherwise draw the last
# case in the list, three times.
s.deck([(lambda c=c: case(*c)) for c in CASES])

s.write(frame=30)
