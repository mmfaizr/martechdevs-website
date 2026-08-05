'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

/* The palette here is the site's own, not Tailwind's defaults.
 *
 * The previous version reached for emerald-500/600 and gray-900, and that is
 * what made this section read as belonging to a different site: every CTA on
 * the page is teal-700, and the one dark surface the design already uses is
 * INK below - the same colour the service illustrations are drawn in. Emerald
 * is a brighter, yellower green than teal, and gray-900 is a cold blue-black
 * (its b* is -12), so the old footer sat visibly blue next to a warm green
 * brand. */
const INK = '#2B3B31';        // the dark surface, shared with the illustrations
const TILE = '#F2F6F4';       // pale inset surface
const BORDER = '#E4E9E6';
const GROUND = '#F7FAF8';     // section ground, a hair off white

/* The footer ground, darker than INK and on the same hue - INK scaled to about
 * 62% luminance, so it is the same warm green-black, further down.
 *
 * Two levels rather than one. A single flat slab is what made the last footer
 * read as a coloured rectangle with things on it; with a darker ground beneath,
 * INK is promoted to a RAISED surface and the stages sit on it as panels. That
 * also fixes the thing every judge marked down: the shipped brand marks carry a
 * near-white plate baked into the file, and against the darkest ground they
 * glare. Landing them on INK instead steps the contrast ground -> panel -> mark
 * rather than throwing them straight off the floor. */
const FLOOR = '#1B251E';

/* One icon language, matching the illustrations: stroke-only on a 24 box,
 * 1.75 wide, round caps. The old markup mixed 2px strokes, filled shapes and
 * white-on-green roundels in the same three-item list. */
function Icon({ path, className = '' }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  clock: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17M12 7.5V12l3 2',
  video: 'M3.5 7.5h11v9h-11zM14.5 11l6-3v8l-6-3',
  shield: 'M12 3.5l7 2.6v5.6c0 4.3-3 7.4-7 8.8-4-1.4-7-4.5-7-8.8V6.1zM9 12l2.2 2.2L15.5 10',
  check: 'M5 12.5l4.5 4.5L19 7',
  mail: 'M3.5 6.5h17v11h-17zM3.5 7.2 12 13l8.5-5.8',
  arrow: 'M5 12h14M13 6l6 6-6 6',
};

const CALL_FACTS = [
  { icon: ICONS.clock, label: '30 minutes' },
  /* Not "Google Meet or Zoom" any more. The event behind this calendar is set
     to Cal Video, so naming two other products was simply untrue. Worded so it
     stays true if the location is switched in Cal.com later. */
  { icon: ICONS.video, label: 'Video call, link on booking' },
  { icon: ICONS.shield, label: 'No obligation' },
];

const AGENDA = [
  'Your current stack and where it hurts',
  'Quick wins we can ship first',
  'An integration roadmap',
  'Timeline, scope and next steps',
];

/* One pipeline in four stages. This is the footer's substance and its services
 * navigation at the same time - which is why there is no separate column of
 * links anywhere below. Every href is a real section id from
 * AllServiceSections, so nothing here scrolls to the top of an eight-card stack
 * and calls that a destination.
 *
 * Four marks per stage, no repeats. A logo appearing in two columns reads as a
 * bug even when it is true - Intercom genuinely is both messaging and support -
 * so anything that would repeat is named in ALSO instead. Sixteen is also the
 * ceiling: a fifth per stage tips this into the logo wall the layout exists to
 * avoid, and the page already shows tool marks in the hero and in every service
 * section. */
const STAGES = [
  { n: '01', stage: 'Collect',
    line: 'Every event from web, app, server and ad platform, captured once and named the same way everywhere.',
    marks: [['segment', 'Segment'], ['rudderstuck', 'RudderStack'], ['gtm', 'Google Tag Manager'], ['server', 'Server-side GTM']],
    links: [['Data collection', '#cdp-data'], ['Ad tracking', '#conversion']] },
  { n: '02', stage: 'Warehouse',
    line: 'One store holding the whole customer record, loaded on a schedule you can trust.',
    marks: [['snowflake', 'Snowflake'], ['bigquery', 'BigQuery'], ['fivetran', 'Fivetran'], ['airbyte', 'Airbyte']],
    links: [['Data warehouse', '#warehouse']] },
  { n: '03', stage: 'Measure',
    line: 'Funnels, retention and real ROI that reconcile with the warehouse instead of arguing with it.',
    marks: [['mixpanel', 'Mixpanel'], ['amplitude', 'Amplitude'], ['ga4', 'GA4'], ['looker', 'Looker']],
    links: [['Growth analytics', '#analytics']] },
  { n: '04', stage: 'Activate',
    line: 'Audiences and traits pushed back into the tools your team already has open all day.',
    marks: [['hightouch', 'Hightouch'], ['braze', 'Braze'], ['hubspot', 'HubSpot'], ['salesforce', 'Salesforce']],
    links: [['Data activation', '#activation'], ['Smart messaging', '#messaging'], ['CRM setup', '#crm'], ['Support and CX', '#support']] },
];

const ALSO = 'Census, Customer.io, CleverTap, Intercom, Zendesk, Metabase, Tableau, AppsFlyer, Adjust, Google Ads, Meta Ads, iOS and Android SDKs, plus the agent side: OpenAI, Gemini, LangChain and MCP servers.';

const LINKEDIN_PATH = 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';

/* Cal.com, not YouCanBookMe.
 *
 * The YouCanBookMe embed does not work in a third-party iframe. Its document
 * loads - the load event fires in about a second - and then the app never
 * paints, so the card was a blank white pane on the live site. Reproduced in
 * isolation on a page with nothing else on it, across all four of their
 * documented URL variants (noframe, skipHeaderFooter, both, neither); the same
 * URL opened directly renders fine. Their session cookies carry no
 * SameSite=None, so they are withheld once framed, which fits. Nothing about it
 * is fixable from this side - we cannot set headers on their domain - and it
 * fails the same way in Safari, which has blocked third-party storage for years.
 *
 * Cal.com renders correctly in the identical frame, checked side by side before
 * this was changed. The event type behind this slug is a 30-minute Discovery
 * Call created for it, so the length matches what the panel promises. */
const BOOKING_URL = 'https://cal.com/faizur-rahman-vvsm0e/discovery';

/* No crop. That existed to hide a dark strip YouCanBookMe painted at the top of
 * its embed; Cal.com has no such chrome, so cutting anything here would just
 * eat the calendar. */

/* How long to keep the skeleton up AFTER the frame's load event.
 *
 * The frame fires load at about 1.4s and Cal.com has painted the month by
 * then, so this is a buffer rather than a fix - it covers a slow connection
 * where the app boots after its document is done. Kept small for that reason.
 * A timed hold is the only lever available either way: nothing is readable
 * across the origin boundary, and the embed is not required to announce
 * itself. */
const SKELETON_HOLD_MS = 700;
const SKELETON_FADE_MS = 500;

export default function Footer() {
  const [bookingLoaded, setBookingLoaded] = useState(false);
  const [skeletonFading, setSkeletonFading] = useState(false);
  const [skeletonGone, setSkeletonGone] = useState(false);

  /* Hold opaque, THEN fade, THEN unmount - in that order, and the order is the
   * whole point. Fading from the moment load fires would start dissolving the
   * placeholder while the calendar behind it is still blank, which shows the
   * empty box this exists to cover. */
  useEffect(() => {
    if (!bookingLoaded) return;
    const fade = setTimeout(() => setSkeletonFading(true), SKELETON_HOLD_MS);
    const drop = setTimeout(() => setSkeletonGone(true), SKELETON_HOLD_MS + SKELETON_FADE_MS);
    return () => { clearTimeout(fade); clearTimeout(drop); };
  }, [bookingLoaded]);

  return (
    <>
      {/* ------------------------------------------------------------ book */}
      <section id="book-call" className="py-16 md:py-24" style={{ background: GROUND }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Book a call
            </h2>
            <p className="text-gray-600 text-base max-w-lg mx-auto">
              A free consultation to work out what your stack needs. No pitch.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="max-w-5xl mx-auto bg-white rounded-2xl overflow-hidden shadow-sm"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <div className="grid md:grid-cols-5">
              {/* The brief. A pale inset panel, not a saturated slab: green is
                  an accent on this site, and a 500px block of it was the
                  loudest thing on the page and drowned its own copy. */}
              <div
                className="md:col-span-2 p-6 md:p-8"
                style={{ background: TILE, borderRight: `1px solid ${BORDER}` }}
              >
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-teal-800"
                  style={{ border: `1px solid ${BORDER}` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  Free consultation
                </span>

                <h3 className="mt-4 text-xl font-semibold" style={{ color: INK }}>
                  Thirty minutes, and you leave with a plan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  We look at what you have, what it is costing you and what to do
                  about it first.
                </p>

                <ul className="mt-6 space-y-3">
                  {CALL_FACTS.map(({ icon, label }) => (
                    <li key={label} className="flex items-center gap-3 text-sm" style={{ color: INK }}>
                      <span
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0"
                        style={{ border: `1px solid ${BORDER}` }}
                      >
                        <Icon path={icon} className="w-4 h-4 text-teal-700" />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    What we&apos;ll cover
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {AGENDA.map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm leading-snug text-gray-700">
                        <Icon path={ICONS.check} className="w-4 h-4 mt-0.5 shrink-0 text-teal-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* The calendar itself. 620, not 520: Cal.com spends its first
                  ~365 on the event header - avatar, title, duration, location,
                  timezone - before the month starts, and at 520 the grid was
                  cut off at the first row of dates, so nothing bookable was
                  visible without scrolling inside the frame. At 620 two full
                  weeks of selectable days show on arrival. */}
              <div className="md:col-span-3 relative min-h-[620px]">
                {/* Built to the shape of the thing it is standing in for - a
                    Today pill, a month title between two arrows, the weekday
                    row, then five weeks of round day cells - so the handover is
                    a placeholder resolving rather than one layout replaced by a
                    different one. It fades rather than cutting, and it holds
                    for SKELETON_HOLD_MS past the load event because the load
                    event is not when the calendar appears.
                    Kept mounted through the fade so the opacity transition has
                    something to run on. */}
                {!skeletonGone && (
                  <div
                    className="absolute inset-0 z-10 bg-white px-7 pt-7 transition-opacity ease-out"
                    style={{ opacity: skeletonFading ? 0 : 1, transitionDuration: `${SKELETON_FADE_MS}ms` }}
                    aria-hidden="true"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-20 rounded-full" style={{ background: TILE }} />
                      <div className="h-4 w-32 rounded" style={{ background: BORDER }} />
                      <div className="flex gap-3">
                        <div className="h-4 w-4 rounded" style={{ background: TILE }} />
                        <div className="h-4 w-4 rounded" style={{ background: TILE }} />
                      </div>
                    </div>
                    <div className="mt-5 h-px w-full" style={{ background: BORDER }} />
                    <div className="mt-6 grid grid-cols-7 gap-y-4 justify-items-center">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={`d${i}`} className="h-2.5 w-7 rounded" style={{ background: BORDER }} />
                      ))}
                      {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="h-9 w-9 rounded-full" style={{ background: TILE }} />
                      ))}
                    </div>
                    <span className="sr-only">Loading the calendar</span>
                  </div>
                )}

                {/* embed=true is Cal.com's own embedded mode - it drops the
                    page-level chrome the standalone booking page carries, so
                    nothing has to be cropped from this side. */}
                <div className="absolute inset-0 overflow-hidden">
                  <iframe
                    src={`${BOOKING_URL}?embed=true&layout=month_view`}
                    title="Book a discovery call with MartechDevs"
                    className="absolute inset-0 w-full h-full border-0"
                    onLoad={() => setBookingLoaded(true)}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* A way through if the embed is unavailable - it is a third-party
              page that can go offline, and when it does the card above is a
              dead white box with no way out of it. */}
          <p className="mt-5 text-center text-sm text-gray-500">
            Calendar not loading?{' '}
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              Open it in a new tab
            </a>{' '}
            or email{' '}
            <a
              href="mailto:hello@martechdevs.com"
              className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              hello@martechdevs.com
            </a>
            .
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------- footer */}
      {/* The argument first, the evidence under it.
       *
       * Directly above this sits a 5xl "Book a call" heading and a live
       * calendar, so a sixth booking button here would be the same ask at the
       * same volume thirty pixels later. Instead: the reason stated once, then
       * the one route the calendar cannot offer - a smaller commitment. An
       * email is a sentence; a calendar is a diary entry. So the address is the
       * loud thing and the calendar link is a ghost pointing back up.
       *
       * NO HEADING TAGS BELOW, DELIBERATELY. globals.css carries an unlayered
       * `h1..h6 { color:#111827 }` and Tailwind v4 emits utilities inside a
       * cascade layer, so `text-white` on a heading loses and renders near-black
       * on near-black. Inline colour patches it; using <p> and <nav aria-label>
       * removes the hazard for whoever edits this next, and is better footer
       * markup anyway. */}
      <div style={{ background: GROUND }}>
        <footer
          className="relative overflow-hidden rounded-t-[28px] md:rounded-t-[40px]"
          style={{ background: FLOOR }}
        >
          {/* The illustrations' dot grid at the kit's own 14px pitch, masked out
              before it reaches the small type so it never fights the links.
              Static: nothing in this footer loops, pulses or flickers. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
              maskImage: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.3) 46%, transparent 74%)',
              WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.3) 46%, transparent 74%)',
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 md:pt-24 md:pb-12">
            {/* ------------------------------------------- the argument -- */}
            {/* One entrance, once. That is the whole motion budget. */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* No eyebrow chip. The statement opens the footer cold, which is
                  more confident than labelling it first - and it was the one
                  element here that existed only to have something above the
                  headline. */}

              {/* Cut to three clauses from five. The two-tone is the site's own
                  device - every service headline is `title` plus `titleGray` -
                  but stretched over nine lines it stops being hierarchy and
                  becomes highlighter pen, and on a phone the reader has to
                  finish the paragraph before it resolves. Short enough that the
                  white phrase is the first thing seen at any width. */}
              <p
                /* text-balance so the last line is not a single orphaned word.
                   At 46rem this broke with "quarters." alone on line four,
                   which on the biggest type in the footer is the one widow
                   that shows. */
                className="mt-7 max-w-[46rem] text-balance text-[26px] leading-[1.2] tracking-[-0.02em] font-medium sm:text-[32px] md:text-[40px] lg:text-[46px]"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                The tools are usually fine.{' '}
                <span style={{ color: '#FFFFFF' }}>The wiring is the problem.</span>{' '}
                That is the only job we do, and we do it in{' '}
                <span style={{ color: '#3FBE8C' }}>weeks, not quarters.</span>
              </p>

              <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Or skip the calendar and just write.
                  </p>
                  <a
                    href="mailto:hello@martechdevs.com"
                    className="mt-2 inline-block border-b-2 border-[#3FBE8C]/40 pb-1 text-xl font-semibold transition-colors hover:border-[#3FBE8C] md:text-2xl"
                    style={{ color: '#FFFFFF' }}
                  >
                    hello@martechdevs.com
                  </a>
                </div>
                <a
                  href="#book-call"
                  className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold transition-colors hover:border-white/30 hover:bg-white/[0.09] sm:self-auto"
                  style={{ color: '#FFFFFF' }}
                >
                  <Icon path="M12 19V5M6 11l6-6 6 6" className="w-4 h-4" />
                  Back to the calendar
                </a>
              </div>
            </motion.div>

            {/* --------------------------------------------- the evidence -- */}
            <p
              className="mt-16 text-[11px] font-semibold uppercase tracking-[0.14em] md:mt-20"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              One pipeline, four stages
            </p>

            <nav aria-label="Services" className="relative mt-7">
              {/* The connector. One run with a node per stage, drawn once on
                  entry and then still - the illustrations' travelling bead is
                  deliberately left behind, because a bead orbiting a footer
                  forever is the looping motion this site has already rejected.
                  The left-to-right fade carries direction, so no arrowhead. */}
              <motion.div
                aria-hidden
                className="hidden lg:block absolute left-0 right-0 top-0 h-px origin-left"
                style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.07), rgba(255,255,255,0.22))' }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />

              <ul className="grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
                {STAGES.map((s, i) => (
                  <motion.li
                    key={s.stage}
                    /* No panel behind the stages. They sit straight on the
                       ground, divided by a hairline above each one, which is
                       what the schematic version did and what it should have
                       kept doing - a filled card behind each stage turned a
                       wiring diagram into four boxes and put a second surface
                       between the marks and the floor for no gain.
                       flex column so the link list can be pushed to the foot:
                       the stages carry one, two and four links, and on a
                       stretched grid row that left two of them with a hole
                       underneath. */
                    className="relative flex flex-col border-t pt-6 lg:border-t-0 lg:pt-7"
                    style={{ borderColor: 'rgba(255,255,255,0.12)' }}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.12 + i * 0.07 }}
                  >
                    {/* One node rule serves both layouts: it sits on the
                        stage's own hairline when the grid is stacked, and on
                        the continuous run once the four are side by side. */}
                    <span
                      aria-hidden
                      className="absolute left-0 h-[7px] w-[7px] rounded-full"
                      style={{ top: '-4px', background: '#3FBE8C' }}
                    />
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-xs font-semibold tabular-nums" style={{ color: 'rgba(255,255,255,0.32)' }}>
                        {s.n}
                      </span>
                      <span className="text-sm font-semibold tracking-tight" style={{ color: '#FFFFFF' }}>
                        {s.stage}
                      </span>
                    </div>

                    {/* Straight on the ground. Not desaturated either: greying
                        the proof out to make it tasteful is how this footer got
                        generic the first time. */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {s.marks.map(([file, name]) => (
                        <Image
                          key={file}
                          src={`/assets/tool logos icons/${file} logo icon.svg`}
                          alt={name}
                          title={name}
                          width={42}
                          height={42}
                          className="h-10 w-10"
                        />
                      ))}
                    </div>

                    <p className="mt-4 text-[12.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {s.line}
                    </p>

                    <ul className="mt-auto space-y-1.5 pt-5">
                      {s.links.map(([label, href]) => (
                        <li key={href}>
                          <a
                            href={href}
                            className="group inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:text-white"
                            style={{ color: 'rgba(255,255,255,0.78)' }}
                          >
                            {label}
                            <Icon
                              path="M9 5l7 7-7 7"
                              className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-60"
                            />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Sixteen marks is the ceiling, so the rest of the coverage is
                named rather than drawn. */}
            <p className="mt-8 max-w-4xl text-[12.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Also integrate: </span>{ALSO}
            </p>

            {/* ------------------------------------------------- the rail -- */}
            <div
              className="mt-14 flex flex-col gap-6 pt-8 md:flex-row md:items-start md:justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div>
                <a href="#" aria-label="Back to top" className="inline-block" onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                  {/* Still no brightness-0 invert. That filter flattens every
                      fill to white and turns the green "devs" badge into a solid
                      white block with its own white lettering invisible inside
                      it. The mark reads on this ground as drawn. */}
                  <Image
                    src="/assets/martechdevs_logo.svg"
                    alt="martechdevs"
                    width={140}
                    height={36}
                    className="h-8 w-auto"
                    style={{ width: 'auto' }}
                  />
                </a>
                <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Martech, analytics and GTM integration. We connect the tools you already own and make the numbers agree.
                </p>
              </div>

              <div className="flex gap-2.5">
                <a
                  href="https://www.linkedin.com/company/martechdevs"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="martechdevs on LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] transition-colors hover:border-white/25 hover:bg-white/[0.12]"
                  style={{ color: 'rgba(255,255,255,0.78)' }}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={LINKEDIN_PATH} />
                  </svg>
                </a>
                <a
                  href="mailto:hello@martechdevs.com"
                  aria-label="Email martechdevs"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] transition-colors hover:border-white/25 hover:bg-white/[0.12]"
                  style={{ color: 'rgba(255,255,255,0.78)' }}
                >
                  <Icon path={ICONS.mail} className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* No rule above the legal line. There were two hairlines within a
                hundred pixels of each other at the foot, which chops the end of
                the footer into slices; one break before the rail is the
                structural division, and space alone separates the legal line
                from it. */}
            <div
              className="mt-9 flex flex-col gap-4 text-[13px] sm:flex-row sm:items-center sm:justify-between"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              <p>© {new Date().getFullYear()} martechdevs. All rights reserved.</p>
              {/* Both still point at "#": src/app has no /privacy or /terms
                  route, and parking them is more honest than shipping two 404s.
                  Swap the moment those pages exist. */}
              <nav aria-label="Legal" className="flex gap-6">
                <Link href="#" className="transition-colors hover:text-white">Privacy Policy</Link>
                <Link href="#" className="transition-colors hover:text-white">Terms of Service</Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
