'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { openQuote } from '@/lib/quote';

/**
 * Acquisition ribbon ground: deep emerald into a teal-green glow behind the
 * text, then forest green. Every stop is dark enough that the amber-200 link
 * holds at least 4.5:1 contrast wherever the text wraps, white well above.
 */
const RIBBON_GRADIENT = 'linear-gradient(90deg, #064E3B 0%, #0B6E5F 50%, #166534 100%)';

/**
 * Party popper for the acquisition ribbon. Drawn here rather than an emoji, so
 * it looks the same on every platform and sits on the site's colours.
 */
function Popper() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M4 20l4.5-12 7.5 7.5z" fill="#F5B942" stroke="#F5B942" strokeWidth={1.5} />
      <path d="M6.6 14.6l2.8 2.8M8 10.8l5.2 5.2" stroke="#2B3B31" strokeWidth={1.2} />
      <path d="M14 4.5c.6 1.4.4 2.6-.6 3.6M19.5 10c-1.4-.6-2.6-.4-3.6.6" stroke="#5EEAD4" strokeWidth={1.75} />
      <path d="M17 3.5v2M20.5 6.5h-2" stroke="#FCA5A5" strokeWidth={1.75} />
      <circle cx="11" cy="3.5" r="1" fill="#FCA5A5" />
      <circle cx="20.5" cy="13.5" r="1" fill="#5EEAD4" />
    </svg>
  );
}

export default function HeroSection({ diagram }: { diagram?: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

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
            Growth and Analytics Partners
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
                href="#"
                aria-label="Back to top"
                onClick={(e) => {
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
              <a href="#testimonials" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">Portfolio</a>
              <a href="#services" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">Services</a>
              <a href="#testimonials" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">Testimonials</a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => openQuote('header')}
                data-track="quote_requested"
                className="hidden md:flex bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors items-center gap-2 cursor-pointer"
              >
                Get Instant Quote
              </button>
              <a
                href="#book-call"
                data-track="book_call"
                className="hidden md:flex bg-gray-50 hover:bg-gray-100 text-gray-900 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors items-center gap-2 border border-gray-200"
              >
                Book a call
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white pt-36 px-6 pb-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-center">
              <a
                href="#testimonials"
                className="text-xl font-medium text-gray-800 hover:text-emerald-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Portfolio
              </a>
              <a
                href="#services"
                className="text-xl font-medium text-gray-800 hover:text-emerald-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </a>
              <a
                href="#testimonials"
                className="text-xl font-medium text-gray-800 hover:text-emerald-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <button
                  data-track="quote_requested"
                  className="inline-flex bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors items-center gap-2 justify-center w-full max-w-xs mx-auto cursor-pointer"
                  onClick={() => { setMobileMenuOpen(false); openQuote('mobile_menu'); }}
                >
                  Get Instant Quote
                </button>
                <a
                  href="#book-call"
                  data-track="book_call"
                  className="inline-flex bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold transition-colors items-center gap-2 justify-center w-full max-w-xs mx-auto"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book a call
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Centered Content Only */}
      <section className="pt-44 md:pt-48 pb-12 bg-gradient-to-b from-gray-50 to-white w-full overflow-hidden">
        <div className="container mx-auto px-6 sm:px-12 lg:px-20 relative">

          {/* Top Tagline - Centered */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-2"
          >
            <p className="text-sm md:text-base text-gray-600">
              Big Agencies talk <span className="text-gray-400">&apos;Strategy&apos;</span> Your tech team shows <span className="text-gray-400">&apos;Backlog&apos;</span>.
            </p>
          </motion.div>

          {/* Main Heading with Floating Icons - Centered */}
          <div className="text-center mb-6 relative">
            <div className="relative inline-block">

              {/* Left Side Icons */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="absolute hidden xl:block z-10 top-[-30px] xl:left-[-120px] 2xl:left-[-160px]"
              >
                <Image
                  src="/assets/hero section logo icons/snowflake_hero_icon.svg"
                  alt="Snowflake"
                  width={72}
                  height={72}
                  className="w-18 h-18 object-contain hover:scale-110 transition-transform duration-300 ease-in-out cursor-default"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="absolute hidden xl:block z-10 top-[70px] xl:left-[-190px] 2xl:left-[-260px]"
              >
                <Image
                  src="/assets/hero section logo icons/segment_hero_icon.svg"
                  alt="Segment"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain hover:scale-110 transition-transform duration-300 ease-in-out cursor-default"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="absolute hidden xl:block z-10 bottom-[-20px] xl:left-[-135px] 2xl:left-[-180px]"
              >
                <Image
                  src="/assets/hero section logo icons/mixpanel_hero_icon.svg"
                  alt="Mixpanel"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain hover:scale-110 transition-transform duration-300 ease-in-out cursor-default"
                />
              </motion.div>

              {/* Right Side Icons */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="absolute hidden xl:block z-10 top-[-40px] xl:right-[-150px] 2xl:right-[-200px]"
              >
                <Image
                  src="/assets/hero section logo icons/hubspot hero icon.svg"
                  alt="HubSpot"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain hover:scale-110 transition-transform duration-300 ease-in-out cursor-default"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="absolute hidden xl:block z-10 top-[60px] xl:right-[-200px] 2xl:right-[-280px]"
              >
                <Image
                  src="/assets/hero section logo icons/intercom hero icon.svg"
                  alt="Intercom"
                  width={72}
                  height={72}
                  className="w-18 h-18 object-contain hover:scale-110 transition-transform duration-300 ease-in-out cursor-default"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="absolute hidden xl:block z-10 bottom-[-10px] xl:right-[-145px] 2xl:right-[-190px]"
              >
                <Image
                  src="/assets/hero section logo icons/braze hero icon.svg"
                  alt="Braze"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain hover:scale-110 transition-transform duration-300 ease-in-out cursor-default"
                />
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-5xl font-medium leading-tight tracking-tight"
              >
                <span className="text-gray-900">We </span>
                <span className="inline-flex items-center gap-3 bg-white rounded-full px-5 py-2 border border-gray-100 align-middle shadow-[0_8px_30px_rgb(0,0,0,0.04)] mx-2 rotate-[-2deg] hover:scale-105 transition-transform duration-300 ease-in-out hover:rotate-0 cursor-default">
                  <Image
                    src="/assets/icons/integrate icon.svg"
                    alt="Integrate"
                    width={24}
                    height={24}
                    className="w-5 h-5 md:w-6 md:h-6"
                  />
                  <span className="text-teal-600 font-bold text-xl md:text-2xl">Integrate</span>
                </span>
                <span className="text-gray-900">your</span>
                <br className="hidden md:block" />
                <span className="text-gray-900 block mt-2">Martech + Analytics + GTM + Agentic tools.</span>
                <span className="text-gray-900 block mt-2">Lightning fast.</span>
              </motion.h1>
            </div>
          </div>

          {/* Subheading - Centered */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center text-gray-600 text-base md:text-lg mb-8 font-medium max-w-2xl mx-auto"
          >
            Truly DFY. This is our priority <span className="text-teal-600 font-bold">#1</span>
          </motion.p>

          {/* The first thing to act on, directly under the headline, so a
              quote button is above the fold on every screen size. */}
          <div className="-mt-3 mb-2 text-center">
            <button
              onClick={() => openQuote('hero_top')}
              data-track="quote_requested"
              className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-lg font-semibold text-base shadow-md transition-colors"
            >
              Request a quote
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* CTA Button - Centered - REMOVED as requested */}
          {/*
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
          >
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-lg font-semibold text-base transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              See our flat pricing & timeline commitment
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </motion.div>
          */}
        </div>
      </section>

      {/* Content + Diagram Section - SEPARATE FROM HERO */}
      {/* overflow-x-clip: the diagram slides in from 20px right, and on phones
          that offset would widen the whole page until it animates. Clip, not
          hidden, so the sticky text column keeps working. */}
      <section className="bg-white py-12 w-full overflow-x-clip">
        <div className="w-full px-0 md:px-0">
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-start">

            {/* Left Column - Sticky Text */}
            <div className="lg:sticky lg:top-[calc(var(--header-bottom)_+_2.5rem)] lg:self-start space-y-6 px-4 md:pl-10 lg:pl-20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-lg md:text-xl leading-relaxed text-gray-600">
                  Get regulations compliant,{' '}
                  <span className="font-bold text-gray-900">hands-on MarTech implementation</span>{' '}
                  <span className="text-gray-400">from specialists who understand marketing nuances & make your tools actually talk to each other</span>
                  , live in <span className="font-bold text-gray-900">WEEKS</span>, not quarters.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <p className="text-lg md:text-xl leading-relaxed">
                  <span className="text-gray-400">Stop letting tech bottlenecks dictate your marketing roadmap. Every week your MarTech isn&apos;t optimized is a week of</span>{' '}
                  <span className="font-bold text-gray-900">lost data, missed conversions, and wasted ad spend</span>.
                </p>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden lg:block"
              >
                <button
                  onClick={() => openQuote('hero')}
                  data-track="quote_requested"
                  className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  Generate Instant Transparent Quote
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>

              {/* Marketing Attribution Box - REMOVED as requested */}
            </div>

            {/* Right Column - Full Diagram */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative pr-4 md:pr-10 lg:pr-20"
            >
              {diagram ?? (
                <Image
                  src="/assets/main hero image.svg"
                  alt="MarTech Architecture Diagram"
                  width={800}
                  height={1400}
                  className="w-full h-auto"
                  priority
                />
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
