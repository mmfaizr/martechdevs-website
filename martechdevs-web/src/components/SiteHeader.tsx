'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { openQuote } from '@/lib/quote';
import { SERVICE_PAGES } from '@/lib/site';
import { Popper, RIBBON_GRADIENT } from '@/components/Festive';

export type NavLink = { label: string; href: string };

/**
 * The acquisition ribbon and the floating navigation, on every page.
 *
 * The service pages are plain links rather than next/link on purpose. Each one
 * is then a full page load, so GTM, GA4 and Mixpanel count the page view
 * exactly as they do when an ad lands someone there.
 */
export default function SiteHeader({
  home = false,
  links,
  sources = { header: 'header', mobile: 'mobile_menu' },
}: {
  /** On the homepage the logo scrolls to the top rather than reloading it. */
  home?: boolean;
  /** In-page links shown after Services. */
  links: NavLink[];
  /** `source` for the quote button in the header and in the mobile menu. */
  sources?: { header: string; mobile: string };
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const allServices = home ? '#services' : '/#services';

  // Publish where the header ends as --header-bottom. The services nav hangs
  // from it and the pinned service cards pad below it, and its position moves
  // with the ribbon above, which wraps to two lines on narrow screens.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const publish = () =>
      document.documentElement.style.setProperty(
        '--header-bottom',
        `${Math.round(header.getBoundingClientRect().bottom)}px`
      );
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(header.parentElement ?? header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  // The services menu opens on hover with CSS alone. This state is the click
  // and tap path, for touch screens wide enough to get the desktop nav.
  useEffect(() => {
    if (!servicesOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!servicesRef.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setServicesOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [servicesOpen]);

  return (
    <>
      {/* Ribbon and navigation share one fixed frame, so the header sits under
          the ribbon at whatever height the ribbon wraps to on small screens.
          The frame passes clicks through its empty margins. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div
        className="pointer-events-auto flex items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium leading-snug text-white sm:text-sm"
        style={{ background: RIBBON_GRADIENT }}
      >
        <Popper />
        <span>
          martechdevs has been acquired by{' '}
          <a
            href="https://www.growthandanalytics.com/"
            target="_blank"
            rel="noopener"
            data-track="acquisition_ribbon"
            className="font-semibold text-[#FDE68A] underline decoration-[#FDE68A]/40 underline-offset-2 transition-colors hover:decoration-[#FDE68A]"
          >
            Growth and Analytics Partners LLC
          </a>
        </span>
        <Popper />
      </div>

      {/* Navigation */}
      <header ref={headerRef} className="pointer-events-auto mx-auto mt-3 w-[95%] max-w-[1200px] bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-sm transition-all duration-300">
        <div className="px-6 md:px-10">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <a
                href={home ? '#' : '/'}
                aria-label={home ? 'Back to top' : 'martechdevs home'}
                onClick={(e) => {
                  if (!home) return;
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <Image
                  src="/assets/martechdevs_logo.svg"
                  alt="MartechDevs"
                  width={140}
                  height={35}
                  className="h-8 w-auto"
                  style={{ width: 'auto' }}
                  loading="eager"
                  priority
                />
              </a>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <div ref={servicesRef} className="group relative">
                <button
                  type="button"
                  aria-expanded={servicesOpen}
                  aria-controls="services-menu"
                  onClick={() => setServicesOpen((o) => !o)}
                  className="flex items-center gap-1 text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Services
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-3.5 w-3.5 transition-transform group-hover:rotate-180 ${servicesOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {/* pt-4 bridges the gap to the panel, so the pointer can travel
                    from the button to a link without the hover dropping. */}
                <div
                  id="services-menu"
                  className={`absolute left-1/2 top-full w-[540px] -translate-x-1/2 pt-4 transition-opacity duration-150 ${
                    servicesOpen ? 'visible opacity-100' : 'invisible opacity-0 group-hover:visible group-hover:opacity-100'
                  }`}
                >
                  <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
                    <ul className="grid grid-cols-2 gap-1">
                      {SERVICE_PAGES.map((page) => (
                        <li key={page.slug}>
                          <a
                            href={`/${page.slug}`}
                            onClick={() => setServicesOpen(false)}
                            className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-[#F2F6F4]"
                          >
                            <span className="block text-sm font-semibold text-gray-900">{page.label}</span>
                            <span className="mt-0.5 block text-xs text-gray-500">{page.blurb}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={allServices}
                      onClick={() => setServicesOpen(false)}
                      className="mt-1 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-teal-800 transition-colors hover:bg-[#F2F6F4]"
                    >
                      All services
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              {/* Only the first link on tablets: with the dropdown and both
                  buttons, the rest would squeeze the buttons onto two lines. */}
              {links.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors ${i > 0 ? 'hidden lg:inline' : ''}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => openQuote(sources.header)}
                data-track="quote_requested"
                className="hidden md:flex whitespace-nowrap bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors items-center gap-2 cursor-pointer"
              >
                Get Instant Quote
              </button>
              <a
                href="#book-call"
                data-track="book_call"
                className="hidden md:flex whitespace-nowrap bg-gray-50 hover:bg-gray-100 text-gray-900 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors items-center gap-2 border border-gray-200"
              >
                Book a Free Audit
              </a>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      </div>

      {/* Mobile Menu Overlay. Scrolls, because six services plus the page
          links outgrow a short phone. */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-white pt-36 px-6 pb-8 md:hidden"
          >
            <div className="mx-auto max-w-sm">
              <p className="px-3 text-sm font-semibold text-gray-500">Services</p>
              <ul className="mt-2 space-y-0.5">
                {SERVICE_PAGES.map((page) => (
                  <li key={page.slug}>
                    <a
                      href={`/${page.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-lg font-medium text-gray-800 transition-colors hover:bg-[#F2F6F4]"
                    >
                      {page.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={allServices}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-base font-semibold text-teal-800 transition-colors hover:bg-[#F2F6F4]"
                  >
                    All services
                  </a>
                </li>
              </ul>

              <div className="mt-5 border-t border-gray-100 pt-5 flex flex-col gap-1">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="rounded-xl px-3 py-2.5 text-lg font-medium text-gray-800 hover:text-emerald-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="pt-6 mt-4 border-t border-gray-100 space-y-3">
                <button
                  data-track="quote_requested"
                  className="inline-flex bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors items-center gap-2 justify-center w-full cursor-pointer"
                  onClick={() => { setMobileMenuOpen(false); openQuote(sources.mobile); }}
                >
                  Get Instant Quote
                </button>
                <a
                  href="#book-call"
                  data-track="book_call"
                  className="inline-flex bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold transition-colors items-center gap-2 justify-center w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book a Free Audit
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
