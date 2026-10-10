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
import type { ServicePageContent } from '@/content/services/types';

/**
 * One service landing page. The shared parts are the homepage's own: header,
 * client logos, the animated stack diagram, testimonials, booking calendar,
 * footer, and the quote modal with its exit offer. The copy comes from
 * src/content/services.
 *
 * A server component, so the copy ships as HTML with no JavaScript. The hero
 * text renders visible from the first paint rather than fading in on
 * hydration, which keeps it the fast LCP on phones.
 */

/* Site palette, the same values the footer uses. */
const INK = '#2B3B31';
const TILE = '#F2F6F4';
const BORDER = '#E4E9E6';
const GROUND = '#F7FAF8';
const GREEN = '#3FBE8C';

const WRAP = 'mx-auto max-w-6xl px-5 sm:px-6 lg:px-8';
const H2 = 'mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl';
const PRIMARY =
  'inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-teal-800 sm:w-auto';
const SECONDARY =
  'inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-50 sm:w-auto';

/* Stroke icons on a 24 box, 1.75 wide, round caps: the footer's icon language. */
const PATHS = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7',
  plus: 'M12 5v14M5 12h14',
  dot: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17M9 9l6 6M15 9l-6 6',
  tag: 'M20.6 13.4l-7.2 7.2a1.5 1.5 0 0 1-2.1 0L3.5 12.8V3.5h9.3l7.8 7.8a1.5 1.5 0 0 1 0 2.1zM8 8h.01',
  mail: 'M3.5 6.5h17v11h-17zM3.5 7.2 12 13l8.5-5.8',
  clock: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17M12 7.5V12l3 2',
  video: 'M3.5 7.5h11v9h-11zM14.5 11l6-3v8l-6-3',
};

function Icon({ path, className = '' }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-800">{children}</p>;
}

/** JSON for a script tag, with `<` escaped so the copy can never close the tag. */
function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export default function ServicePage({ content: c }: { content: ServicePageContent }) {
  const source = (where: string) => `${c.source}_${where}`;
  const audit = `Book a free ${c.auditName}`;

  const offerCards = [
    {
      icon: PATHS.tag,
      title: 'Fixed price, no hourly billing',
      body: 'One price for the whole project, agreed before we start. No timesheets and no surprise invoices.',
    },
    {
      icon: PATHS.mail,
      title: 'Your quote in one business day',
      body: 'Tell us your stack and what you need. You get the price, scope and timeline by email, usually within one business day.',
    },
    {
      icon: PATHS.clock,
      title: 'Live in weeks, not quarters',
      body: 'Most projects are live within a few weeks, and the timeline is written into your quote.',
    },
    {
      icon: PATHS.video,
      title: `Free ${c.auditName}`,
      body: 'A 30-minute call on your stack: where it hurts, the quick wins, and what to fix first. No obligation.',
      link: true,
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faq.items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader
        links={[
          { label: 'Pricing', href: '#offer' },
          { label: 'FAQ', href: '#faq' },
        ]}
        sources={{ header: source('header'), mobile: source('mobile_menu') }}
      />

      {/* ---------------------------------------------------------- hero */}
      {/* The homepage hero's frame: centred copy, the same tool badges popping
          in around the heading on wide screens. */}
      <section id="hero" className="w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white pb-12 pt-36 md:pt-48">
        <div className="container relative mx-auto px-6 text-center sm:px-12 lg:px-20">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-xs font-medium text-teal-800 sm:text-sm"
            style={{ borderColor: BORDER }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
            {c.hero.eyebrow}
          </p>

          <div className="relative mb-6 mt-5">
            <div className="relative inline-block">
              <HeroIcons />
              <h1 className="mx-auto max-w-3xl text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl md:text-5xl">
                {c.hero.h1}
              </h1>
            </div>
          </div>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">{c.hero.intro}</p>
          {c.hero.aside && (
            <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500">
              {c.hero.aside.text}{' '}
              <a href={c.hero.aside.href} className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-800">
                {c.hero.aside.link}
              </a>
              .
            </p>
          )}

          <div id="hero-cta" className="mx-auto mt-8 flex max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row">
            <QuoteButton source={source('hero')} area={c.area} className={PRIMARY}>
              Get a fixed-price quote
              <Icon path={PATHS.arrow} className="h-4 w-4" />
            </QuoteButton>
            <a href="#book-call" data-track="book_call" className={SECONDARY}>
              {audit}
            </a>
          </div>

          <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-1.5">
              <Icon path={PATHS.check} className="h-4 w-4 text-teal-700" />
              Fixed price, no hourly billing
            </li>
            <li className="flex items-center gap-1.5">
              <Icon path={PATHS.check} className="h-4 w-4 text-teal-700" />
              Live in weeks, not quarters
            </li>
            <li className="flex items-center gap-1.5">
              <Icon path={PATHS.check} className="h-4 w-4 text-teal-700" />
              <a href="#offer" className="underline decoration-gray-300 underline-offset-2 hover:text-gray-900">
                Startups get 50% off
              </a>
            </li>
          </ul>

          <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Tools we set up and connect</p>
          <ul className="mx-auto mt-3 flex max-w-3xl flex-wrap justify-center gap-2">
            {c.tools.map((tool) => (
              <li
                key={tool.name}
                className="flex items-center gap-2 rounded-full border bg-white py-1.5 pl-2 pr-3.5 text-sm font-medium text-gray-700"
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
      </section>

      <ClientLogos />

      {/* -------------------------------------------------- what we set up */}
      <section id="what-we-set-up" className="scroll-mt-36 py-16 md:py-24">
        <div className={WRAP}>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>What we set up</Eyebrow>
            <h2 className={H2}>{c.setup.h2}</h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">{c.setup.lead}</p>
          </div>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.setup.items.map((item) => (
              <li key={item.title} className="rounded-2xl border bg-white p-6" style={{ borderColor: BORDER }}>
                <Image src={`/assets/icons/${item.icon}`} alt="" width={44} height={44} className="h-11 w-11" />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.body}</p>
              </li>
            ))}
          </ul>

          <div className="mt-10 text-center">
            <QuoteButton source={source('services')} area={c.area} className={PRIMARY}>
              Get a fixed-price quote
              <Icon path={PATHS.arrow} className="h-4 w-4" />
            </QuoteButton>
          </div>
        </div>
      </section>

      {/* ------------------------------------------- the stack, mid-page */}
      <DiagramSection id="stack" diagram={<LazyStackDiagram />}>
        <Eyebrow>The problem</Eyebrow>
        <h2 className="text-balance text-2xl font-semibold leading-tight tracking-tight md:text-3xl">Sound familiar?</h2>
        <ul className="space-y-3.5">
          {c.setup.problems.map((problem) => (
            <li key={problem} className="flex gap-3 text-base leading-relaxed text-gray-700">
              <Icon path={PATHS.dot} className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
              {problem}
            </li>
          ))}
        </ul>
        <p className="text-lg leading-relaxed md:text-xl">
          <span className="text-gray-400">Every week it stays that way is a week of</span>{' '}
          <span className="font-bold text-gray-900">lost data, missed conversions and wasted ad spend</span>.
        </p>
        <QuoteButton source={source('stack')} area={c.area} className={PRIMARY}>
          Get a fixed-price quote
          <Icon path={PATHS.arrow} className="h-4 w-4" />
        </QuoteButton>
      </DiagramSection>

      {/* --------------------------------------------------- how it works */}
      <section id="how-it-works" className="py-16 md:py-24" style={{ background: GROUND }}>
        <div className={WRAP}>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>How it works</Eyebrow>
            <h2 className={H2}>{c.steps.h2}</h2>
          </div>

          {/* The footer's pipeline device: a hairline per step with a node on it. */}
          <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {c.steps.items.map((step, i) => (
              <li key={step.title} className="relative border-t pt-6" style={{ borderColor: '#D5DED9' }}>
                <span aria-hidden className="absolute left-0 h-[7px] w-[7px] rounded-full" style={{ top: '-4px', background: GREEN }} />
                <p className="text-xs font-semibold tabular-nums text-gray-400">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-1.5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Testimonials />

      {/* ---------------------------------------------------------- offer */}
      <section id="offer" className="scroll-mt-36 py-16 md:py-24" style={{ background: GROUND }}>
        <div className={WRAP}>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className={H2}>{c.offer.h2}</h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">
              You know the price, the scope and the timeline before we start.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
            <ul className="grid gap-4 sm:grid-cols-2">
              {offerCards.map((card) => (
                <li key={card.title} className="flex flex-col rounded-2xl border bg-white p-6" style={{ borderColor: BORDER }}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: TILE }}>
                    <Icon path={card.icon} className="h-5 w-5 text-teal-700" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{card.body}</p>
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
                </li>
              ))}
            </ul>

            {/* The startup offer the ads promise, on the page itself rather
                than only in the exit popup. Same look as that popup. */}
            <div
              id="startup-offer"
              className="relative flex flex-col overflow-hidden rounded-3xl border p-7 sm:p-9"
              style={{ borderColor: BORDER, background: 'radial-gradient(90% 100% at 50% 0%, #E3F4EC 0%, #FFFFFF 75%)' }}
            >
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
                Same specialists and the same fixed-price quote, at half the price. Tell us your stack and the 50% discount
                is applied to your quote.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-gray-700">
                {['Fixed price, no hourly billing', 'Live in weeks, not quarters', 'Specialists, not generalists'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Icon path={PATHS.check} className="h-4 w-4 shrink-0 text-teal-700" />
                    {item}
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
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ faq */}
      <section id="faq" className="scroll-mt-36 py-16 md:py-24">
        <div className={`${WRAP} grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16`}>
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className={H2}>{c.faq.h2}</h2>
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
          </div>

          {/* Native details, so the answers are in the HTML and open without JavaScript. */}
          <div className="divide-y divide-[#E4E9E6] border-y border-[#E4E9E6]">
            {c.faq.items.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base font-semibold leading-snug sm:text-lg">{q}</h3>
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-gray-500 transition-transform duration-200 group-open:rotate-45"
                    style={{ borderColor: BORDER }}
                  >
                    <Icon path={PATHS.plus} className="h-4 w-4" />
                  </span>
                </summary>
                <p className="mt-3 pr-10 text-[15px] leading-relaxed text-gray-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      </section>

      {/* ---------------------------------------------------- closing cta */}
      <section id="get-quote" className="px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12 md:py-20" style={{ background: INK }}>
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
              {c.cta.h2}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base md:text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Three quick steps, under a minute. Price, scope and timeline by email, usually within one business day.
            </p>
            <div className="mx-auto mt-8 flex max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row">
              <QuoteButton
                source={source('closing')}
                area={c.area}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-[#1B251E] shadow-md transition-colors hover:bg-[#E3F4EC] sm:w-auto"
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
        </div>
      </section>

      <Footer />
      <QuoteModal area={c.area} />
      <MobileQuoteBar source={source('sticky')} area={c.area} />
    </main>
  );
}
