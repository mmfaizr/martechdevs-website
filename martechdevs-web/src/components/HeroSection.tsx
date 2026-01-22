'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function HeroSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Navigation */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[95%] max-w-[1200px] z-50 bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-sm transition-all duration-300">
        <div className="px-6 md:px-10">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
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
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#portfolio" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">Portfolio</a>
              <a href="#services" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">Services</a>
              <a href="#testimonials" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">Testimonials</a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openChatQuote'))}
                className="hidden md:flex bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors items-center gap-2"
              >
                Get Instant Quote
              </button>
              <a
                href="#book-call"
                className="hidden md:flex bg-gray-50 hover:bg-gray-100 text-gray-900 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors items-center gap-2 border border-gray-200"
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 pb-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-center">
              <a
                href="#portfolio"
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
                  className="inline-flex bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors items-center gap-2 justify-center w-full max-w-xs mx-auto"
                  onClick={() => { setMobileMenuOpen(false); window.dispatchEvent(new CustomEvent('openChatQuote')); }}
                >
                  Get Instant Quote
                </button>
                <a
                  href="#book-call"
                  className="inline-flex bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-3 rounded-full text-lg font-semibold transition-colors items-center gap-2 justify-center w-full max-w-xs mx-auto"
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
      <section className="pt-36 md:pt-40 pb-12 bg-gradient-to-b from-gray-50 to-white w-full overflow-hidden">
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
                className="absolute hidden xl:block z-10"
                style={{ left: '-160px', top: '-30px' }}
              >
                <Image
                  src="/assets/hero section logo icons/snowflake_hero_icon.svg"
                  alt="Snowflake"
                  width={72}
                  height={72}
                  className="w-18 h-18 hover:scale-110 transition-transform duration-300 ease-in-out cursor-default"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="absolute hidden xl:block z-10"
                style={{ left: '-260px', top: '70px' }}
              >
                <Image
                  src="/assets/hero section logo icons/segment_hero_icon.svg"
                  alt="Segment"
                  width={64}
                  height={64}
                  className="w-16 h-16 hover:scale-110 transition-transform duration-300 ease-in-out cursor-default"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="absolute hidden xl:block z-10"
                style={{ left: '-180px', bottom: '-20px' }}
              >
                <Image
                  src="/assets/hero section logo icons/mixpanel_hero_icon.svg"
                  alt="Mixpanel"
                  width={64}
                  height={64}
                  className="w-16 h-16 hover:scale-110 transition-transform duration-300 ease-in-out cursor-default"
                />
              </motion.div>

              {/* Right Side Icons */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="absolute hidden xl:block z-10"
                style={{ right: '-200px', top: '-40px' }}
              >
                <Image
                  src="/assets/hero section logo icons/hubspot hero icon.svg"
                  alt="HubSpot"
                  width={64}
                  height={64}
                  className="w-16 h-16 hover:scale-110 transition-transform duration-300 ease-in-out cursor-default"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="absolute hidden xl:block z-10"
                style={{ right: '-280px', top: '60px' }}
              >
                <Image
                  src="/assets/hero section logo icons/intercom hero icon.svg"
                  alt="Intercom"
                  width={72}
                  height={72}
                  className="w-18 h-18 hover:scale-110 transition-transform duration-300 ease-in-out cursor-default"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="absolute hidden xl:block z-10"
                style={{ right: '-190px', bottom: '-10px' }}
              >
                <Image
                  src="/assets/hero section logo icons/braze hero icon.svg"
                  alt="Braze"
                  width={64}
                  height={64}
                  className="w-16 h-16 hover:scale-110 transition-transform duration-300 ease-in-out cursor-default"
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
                <span className="text-gray-900 block mt-2">Martech + Analytics tools.</span>
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
      <section className="bg-white py-12 w-full">
        <div className="w-full px-0 md:px-0">
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-start">

            {/* Left Column - Sticky Text */}
            <div className="lg:sticky lg:top-32 lg:self-start space-y-6 px-4 md:pl-10 lg:pl-20">
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
                  —live in <span className="font-bold text-gray-900">WEEKS</span>, not quarters.
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
                  onClick={() => window.dispatchEvent(new CustomEvent('openChatQuote'))}
                  className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
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
              <Image
                src="/assets/main hero image.svg"
                alt="MarTech Architecture Diagram"
                width={800}
                height={1400}
                className="w-full h-auto"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
