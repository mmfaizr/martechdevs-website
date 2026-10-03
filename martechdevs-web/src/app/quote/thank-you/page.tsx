import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import QuoteConversion from '@/components/QuoteConversion';

/**
 * Where the quote form lands. Its own URL so Google Ads can count a lead with
 * a page-load conversion, no code needed. Kept out of search so the only
 * visits it sees are real submissions.
 */
export const metadata: Metadata = {
  title: 'Thanks, your quote is on its way | martechdevs',
  robots: { index: false, follow: false },
};

const NEXT_STEPS = [
  { title: 'We review your stack', body: 'A specialist looks at the tools and areas you picked.' },
  { title: 'You get a fixed quote', body: 'Price, scope and timeline by email, usually within one business day.' },
  { title: 'We start when you are ready', body: 'Most projects are live within a few weeks.' },
];

export default function ThankYouPage() {
  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #F7FAF8, #FFFFFF 420px)' }}>
      <QuoteConversion />
      <header className="mx-auto flex max-w-5xl items-center px-5 py-6 sm:px-8">
        <Link href="/" aria-label="martechdevs home">
          <Image src="/assets/martechdevs_logo.svg" alt="MartechDevs" width={140} height={35} className="h-8 w-auto" style={{ width: 'auto' }} priority />
        </Link>
      </header>

      <section className="mx-auto max-w-2xl px-5 pb-20 pt-10 text-center sm:px-8 sm:pt-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-700 text-white shadow-md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Thanks, your quote is on its way</h1>
        <p className="mt-3 text-base text-gray-600 sm:text-lg">
          We have your details. Keep an eye on your inbox.
        </p>

        <ol className="mt-10 space-y-3 text-left">
          {NEXT_STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: '#E4E9E6' }}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-teal-800" style={{ background: '#F2F6F4' }}>
                {i + 1}
              </span>
              <span>
                <span className="block font-semibold text-gray-900">{s.title}</span>
                <span className="block text-sm text-gray-600">{s.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/#book-call" className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-teal-800">
            Book a call instead
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border bg-white px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-50" style={{ borderColor: '#E4E9E6' }}>
            Back to the site
          </Link>
        </div>
      </section>
    </main>
  );
}
