'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { openQuote } from '@/lib/quote';
import SiteHeader from '@/components/SiteHeader';
import HeroIcons from '@/components/HeroIcons';
import DiagramSection from '@/components/DiagramSection';

export default function HeroSection({ diagram }: { diagram?: React.ReactNode }) {
  return (
    <>
      <SiteHeader
        home
        links={[
          { label: 'Portfolio', href: '#testimonials' },
          { label: 'Testimonials', href: '#testimonials' },
        ]}
      />

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

              <HeroIcons />

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
      <DiagramSection diagram={diagram}>
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
      </DiagramSection>
    </>
  );
}
