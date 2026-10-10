import Image from 'next/image';
import SiteHeader from '@/components/SiteHeader';
import HeroIcons from '@/components/HeroIcons';
import DiagramSection from '@/components/DiagramSection';
import ClientLogos from '@/components/ClientLogos';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import QuoteModal from '@/components/QuoteModal';
import { Popper } from '@/components/Festive';
import QuoteButton from './QuoteButton';
import MobileQuoteBar from './MobileQuoteBar';
import LazyStackDiagram from './LazyStackDiagram';
import Reveal from './Reveal';
import Rich, { plain } from './Rich';
import type { ServicePageContent } from '@/content/services/types';

/**
 * One service landing page. The shared parts are the homepage's own: header,
 * hero badges, client logos, the animated stack diagram, testimonials, booking
 * calendar, footer, and the quote modal with its exit offer. The copy comes
 * from src/content/services.
 *
 * The hero rises in with CSS, so it animates without waiting for hydration
 * and the heading still paints straight away on a phone. Everything below it
 * fades up as it scrolls into view, like the homepage.
 */

/* Site palette, the same values the footer uses. */
const INK = '#2B3B31';
const TILE = '#F2F6F4';
const BORDER = '#E4E9E6';
const GROUND = '#F7FAF8';
const GREEN = '#3FBE8C';

const WRAP = 'mx-auto max-w-6xl px-5 sm:px-6 lg:px-8';
const H2 = 'mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl';
/** Two-tone headings, as the homepage's service titles: the marked words dark, the rest grey. */
const HEAD_STRONG = 'font-semibold text-gray-900';
const HEAD_MUTED = 'text-gray-400';
const PRIMARY =
  'inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-lg sm:w-auto';
const SECONDARY =
  'inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-50 sm:w-auto';

/* Stroke icons on a 24 box, round caps: the footer's icon language. */
const PATHS = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7',
  plus: 'M12 5v14M5 12h14',
  cross: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17M9 9l6 6M15 9l-6 6',
  tag: 'M20.6 13.4l-7.2 7.2a1.5 1.5 0 0 1-2.1 0L3.5 12.8V3.5h9.3l7.8 7.8a1.5 1.5 0 0 1 0 2.1zM8 8h.01',
  mail: 'M3.5 6.5h17v11h-17zM3.5 7.2 12 13l8.5-5.8',
  clock: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17M12 7.5V12l3 2',
  video: 'M3.5 7.5h11v9h-11zM14.5 11l6-3v8l-6-3',
};

function Icon({ path, className = '', width = 1.75 }: { path: string; className?: string; width?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width}
         strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

/** A filled teal tick, the quote form's own. */
function Tick() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white">
      <Icon path={PATHS.check} width={2.5} className="h-3 w-3" />
    </span>
  );
}

/** Section label, the pill the homepage testimonials open with. */
function Label({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">{children}</span>;
}

/** JSON for a script tag, with `<` escaped so the copy can never close the tag. */
function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Hero pieces rise in one after another. */
const rise = (ms: number) => ({ animationDelay: `${ms}ms` });

export default function ServicePage({ content: c }: { content: ServicePageContent }) {
  const source = (where: string) => `${c.source}_${where}`;
  const audit = `Book a free ${c.auditName}`;

  const offerCards = [
    {
      icon: PATHS.tag,
      title: 'Fixed price, no hourly billing',
      body: 'One price for the whole project, **agreed before we start**. No timesheets and no surprise invoices.',
    },
    {
      icon: PATHS.mail,
      title: 'Your quote in one business day',
      body: 'Tell us your stack and what you need. You get **the price, scope and timeline by email**, usually within one business day.',
    },
    {
      icon: PATHS.clock,
      title: 'Live in weeks, not quarters',
      body: '**Most projects are live within a few weeks**, and the timeline is written into your quote.',
    },
    {
      icon: PATHS.video,
      title: `Free ${c.auditName}`,
      body: 'A 30-minute call on your stack: **where it hurts, the quick wins, and what to fix first**. No obligation.',
      link: true,
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faq.items.map(({ q, a }) => ({
      '@type': 'Question',
      name: plain(q),
      acceptedAnswer: { '@type': 'Answer', text: plain(a) },
    })),
  };

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader
        links={[
          { label: 'Testimonials', href: '#testimonials' },
          { label: 'Pricing', href: '#offer' },
          { label: 'FAQ', href: '#faq' },
        ]}
        sources={{ header: source('header'), mobile: source('mobile_menu') }}
      />

      {/* ---------------------------------------------------------- hero */}
      <section id="hero" className="w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white pb-12 pt-36 md:pt-48">
        <div className="container relative mx-auto px-6 text-center sm:px-12 lg:px-20">
          <p
            className="rise-in inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-xs font-medium text-teal-800 sm:text-sm"
            style={{ borderColor: BORDER }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
            {c.hero.eyebrow}
          </p>

          <div className="relative mb-7 mt-5">
            {/* The homepage heading's own frame, 868 by 190, so the badges
                land in the same spots on every page whatever this heading's
                length. They pop in on wide screens only, as on the homepage. */}
            <div className="pointer-events-none absolute left-1/2 top-0 hidden h-[190px] w-[868px] -translate-x-1/2 xl:block [&>div]:pointer-events-auto">
              <HeroIcons />
            </div>
            <h1
              className="rise-in mx-auto max-w-3xl text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl md:text-5xl"
              style={rise(80)}
            >
              <Rich text={c.hero.h1} strong="font-medium text-gray-900" muted={HEAD_MUTED} />
            </h1>
          </div>

          <p className="rise-in mx-auto max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl" style={rise(160)}>
            <Rich text={c.hero.problem} />
          </p>
          <p className="rise-in mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg" style={rise(220)}>
            <Rich text={c.hero.solution} />
          </p>
          {c.hero.aside && (
            <p className="rise-in mx-auto mt-3 max-w-2xl text-sm text-gray-500" style={rise(260)}>
              {c.hero.aside.text}{' '}
              <a href={c.hero.aside.href} className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-800">
                {c.hero.aside.link}
              </a>
              .
            </p>
          )}

          <div
            id="hero-cta"
            className="rise-in mx-auto mt-8 flex max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row"
            style={rise(300)}
          >
            <QuoteButton source={source('hero')} area={c.area} className={PRIMARY}>
              Get a fixed-price quote
              <Icon path={PATHS.arrow} className="h-4 w-4" />
            </QuoteButton>
            <a href="#book-call" data-track="book_call" className={SECONDARY}>
              {audit}
            </a>
          </div>

          <ul className="rise-in mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-gray-600" style={rise(360)}>
            <li className="flex items-center gap-2">
              <Tick />
              <span>
                <Rich text="**Fixed price**, no hourly billing" />
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Tick />
              <span>
                <Rich text="Live in **weeks**, not quarters" />
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Tick />
              <a href="#offer" className="font-semibold text-teal-700 underline decoration-teal-700/30 underline-offset-4 hover:decoration-teal-700">
                Startups get 50% off
              </a>
            </li>
          </ul>

          <div className="rise-in" style={rise(420)}>
            <p className="mt-10 text-sm text-gray-500">Tools we set up and connect</p>
            <ul className="mx-auto mt-3 flex max-w-3xl flex-wrap justify-center gap-2">
              {c.tools.map((tool) => (
                <li
                  key={tool.name}
                  className="flex items-center gap-2 rounded-full border bg-white py-1.5 pl-2 pr-3.5 text-sm font-medium text-gray-700 transition-transform hover:-translate-y-0.5"
                  style={{ borderColor: BORDER }}
                >
                  {tool.icon ? (
                    <Image
                      src={`/assets/tool logos icons/${tool.icon} logo icon.svg`}
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5 rounded"
                    />
                  ) : (
                    <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-teal-600" />
                  )}
                  {tool.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ClientLogos />

      {/* -------------------------------------------------- what we set up */}
      <section id="what-we-set-up" className="scroll-mt-36 py-16 md:py-24">
        <div className={WRAP}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <Label>What we set up</Label>
            <h2 className={H2}>
              <Rich text={c.setup.h2} strong={HEAD_STRONG} muted={HEAD_MUTED} />
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">
              <Rich text={c.setup.lead} />
            </p>
          </Reveal>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.setup.items.map((item, i) => (
              <Reveal
                as="li"
                key={item.title}
                delay={(i % 3) * 0.08}
                className="rounded-2xl border bg-white p-6 transition-shadow hover:shadow-md"
                style={{ borderColor: BORDER }}
              >
                <Image src={`/assets/icons/${item.icon}`} alt="" width={44} height={44} className="h-11 w-11" />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.body}</p>
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-10 text-center">
            <QuoteButton source={source('services')} area={c.area} className={PRIMARY}>
              Get a fixed-price quote
              <Icon path={PATHS.arrow} className="h-4 w-4" />
            </QuoteButton>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------- the stack, mid-page */}
      <DiagramSection id="stack" diagram={<LazyStackDiagram />}>
        <Reveal>
          <Label>The problem</Label>
          <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight tracking-tight md:text-3xl">Sound familiar?</h2>
        </Reveal>
        <ul className="space-y-4">
          {c.setup.problems.map((problem, i) => (
            <Reveal as="li" key={problem} delay={i * 0.06} className="flex gap-3 text-lg leading-relaxed text-gray-400 md:text-xl">
              <Icon path={PATHS.cross} className="mt-1 h-5 w-5 shrink-0 text-gray-300 md:mt-1.5" />
              <span>
                <Rich text={problem} strong="font-bold text-gray-900" />
              </span>
            </Reveal>
          ))}
        </ul>
        <Reveal>
          <p className="text-lg leading-relaxed md:text-xl">
            <span className="text-gray-400">Every week it stays that way is a week of</span>{' '}
            <span className="font-bold text-gray-900">lost data, missed conversions and wasted ad spend</span>.
          </p>
        </Reveal>
        <Reveal>
          <QuoteButton source={source('stack')} area={c.area} className={PRIMARY}>
            Get a fixed-price quote
            <Icon path={PATHS.arrow} className="h-4 w-4" />
          </QuoteButton>
        </Reveal>
      </DiagramSection>

      {/* --------------------------------------------------- how it works */}
      <section id="how-it-works" className="py-16 md:py-24" style={{ background: GROUND }}>
        <div className={WRAP}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <Label>How it works</Label>
            <h2 className={H2}>
              <Rich text={c.steps.h2} strong={HEAD_STRONG} muted={HEAD_MUTED} />
            </h2>
          </Reveal>

          {/* The footer's pipeline device: a hairline per step with a node on it. */}
          <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {c.steps.items.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={(i % 3) * 0.08}
                className="relative border-t pt-6"
                style={{ borderColor: '#D5DED9' }}
              >
                <span aria-hidden className="absolute left-0 h-[7px] w-[7px] rounded-full" style={{ top: '-4px', background: GREEN }} />
                <p className="text-xs font-semibold tabular-nums text-teal-700">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-1.5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <Testimonials />

      {/* ---------------------------------------------------------- offer */}
      <section id="offer" className="scroll-mt-36 py-16 md:py-24" style={{ background: GROUND }}>
        <div className={WRAP}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <Label>Pricing</Label>
            <h2 className={H2}>
              <Rich text={c.offer.h2} strong={HEAD_STRONG} muted={HEAD_MUTED} />
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">
              <Rich text="You know **the price, the scope and the timeline** before we start." />
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
            <ul className="grid gap-4 sm:grid-cols-2">
              {offerCards.map((card, i) => (
                <Reveal
                  as="li"
                  key={card.title}
                  delay={(i % 2) * 0.08}
                  className="flex flex-col rounded-2xl border bg-white p-6"
                  style={{ borderColor: BORDER }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: TILE }}>
                    <Icon path={card.icon} className="h-5 w-5 text-teal-700" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                    <Rich text={card.body} />
                  </p>
                  {card.link && (
                    <a
                      href="#book-call"
                      data-track="book_call"
                      className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-teal-700 hover:text-teal-800"
                    >
                      {audit}
                      <Icon path={PATHS.arrow} className="h-4 w-4" />
                    </a>
                  )}
                </Reveal>
              ))}
            </ul>

            {/* The startup offer the ads promise, on the page itself rather
                than only in the exit popup. Same look as that popup. */}
            <Reveal
              delay={0.12}
              className="relative flex flex-col overflow-hidden rounded-3xl border p-7 sm:p-9"
              style={{ borderColor: BORDER, background: 'radial-gradient(90% 100% at 50% 0%, #E3F4EC 0%, #FFFFFF 75%)' }}
            >
              <div id="startup-offer" className="flex h-full flex-col">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                  <Popper className="h-5 w-5" />
                  Startup offer
                </span>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Startups get{' '}
                  <span className="relative whitespace-nowrap text-teal-700">
                    50% off
                    <svg viewBox="0 0 120 10" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-2 w-full" aria-hidden="true">
                      <path d="M2 7c30-5 70-6 116-2" fill="none" stroke="#5EEAD4" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>
                </h3>
                <p className="mt-5 text-base leading-relaxed text-gray-600">
                  <Rich text="Same specialists and the same fixed-price quote, **at half the price**. Tell us your stack and the 50% discount is applied to your quote." />
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-gray-600">
                  {['**Fixed price**, no hourly billing', 'Live in **weeks**, not quarters', '**Specialists**, not generalists'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Tick />
                      <span>
                        <Rich text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <QuoteButton
                    source={source('startup')}
                    offer="startup_50"
                    area={c.area}
                    className={`${PRIMARY} sm:w-full`}
                  >
                    Claim 50% off
                    <Icon path={PATHS.arrow} className="h-4 w-4" />
                  </QuoteButton>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ faq */}
      <section id="faq" className="scroll-mt-36 py-16 md:py-24">
        <div className={`${WRAP} grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16`}>
          <Reveal>
            <Label>FAQ</Label>
            <h2 className={H2}>
              <Rich text={c.faq.h2} strong={HEAD_STRONG} muted={HEAD_MUTED} />
            </h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              Something else on your mind? Email{' '}
              <a href="mailto:hello@martechdevs.com" className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-800">
                hello@martechdevs.com
              </a>{' '}
              or{' '}
              <a href="#book-call" className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-800">
                book a free {c.auditName}
              </a>
              .
            </p>
          </Reveal>

          {/* Native details, so the answers are in the HTML and open without JavaScript. */}
          <Reveal delay={0.08} className="divide-y divide-[#E4E9E6] border-y border-[#E4E9E6]">
            {c.faq.items.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base font-semibold leading-snug transition-colors group-hover:text-teal-800 sm:text-lg">{q}</h3>
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-gray-500 transition-all duration-200 group-open:rotate-45 group-open:border-teal-700 group-open:bg-teal-700 group-open:text-white"
                    style={{ borderColor: BORDER }}
                  >
                    <Icon path={PATHS.plus} className="h-4 w-4" />
                  </span>
                </summary>
                <p className="mt-3 pr-10 text-[15px] leading-relaxed text-gray-600">
                  <Rich text={a} />
                </p>
              </details>
            ))}
          </Reveal>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      </section>

      {/* ---------------------------------------------------- closing cta */}
      <section id="get-quote" className="px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
        <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12 md:py-20" style={{ background: INK }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
              maskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 75%)',
            }}
          />
          <div className="relative">
            {/* Inline colour: globals.css pins every heading to near-black. */}
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl" style={{ color: '#FFFFFF' }}>
              <Rich text={c.cta.h2} strong="font-semibold text-white" muted="text-white/55" />
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base md:text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <Rich text="Three quick steps, under a minute. **Price, scope and timeline by email**, usually within one business day." strong="font-semibold text-white" />
            </p>
            <div className="mx-auto mt-8 flex max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row">
              <QuoteButton
                source={source('closing')}
                area={c.area}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-[#1B251E] shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#E3F4EC] sm:w-auto"
              >
                Get a fixed-price quote
                <Icon path={PATHS.arrow} className="h-4 w-4" />
              </QuoteButton>
              <a
                href="#book-call"
                data-track="book_call"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-base font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5 sm:w-auto"
              >
                {audit}
              </a>
            </div>
            <p className="mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Startup?{' '}
              <QuoteButton
                source={source('closing_startup')}
                offer="startup_50"
                area={c.area}
                className="font-semibold text-[#3FBE8C] underline underline-offset-2 hover:text-[#5EEAD4]"
              >
                Get 50% off your quote
              </QuoteButton>
            </p>
          </div>
        </Reveal>
      </section>

      <Footer />
      <QuoteModal area={c.area} />
      <MobileQuoteBar source={source('sticky')} area={c.area} />
    </main>
  );
}
