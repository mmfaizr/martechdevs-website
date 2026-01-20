'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const LoadingIcons = {
  calendar: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" className="fill-emerald-200" />
      <path d="M3 10h18M8 2v4M16 2v4" className="stroke-emerald-600" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="14" width="3" height="3" rx="0.5" className="fill-emerald-500" />
    </svg>
  ),
  search: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" className="fill-emerald-200 stroke-emerald-600" strokeWidth="2" />
      <path d="M16 16l4 4" className="stroke-emerald-600" strokeWidth="2" strokeLinecap="round" />
      <circle cx="11" cy="11" r="3" className="fill-emerald-500/50" />
    </svg>
  ),
  globe: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" className="fill-emerald-200 stroke-emerald-600" strokeWidth="2" />
      <ellipse cx="12" cy="12" rx="3" ry="9" className="stroke-emerald-500" strokeWidth="1.5" />
      <path d="M3 12h18M12 3c-2 2.5-2 6.5 0 9s2 6.5 0 9" className="stroke-emerald-500" strokeWidth="1.5" />
    </svg>
  ),
  sparkle: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z" className="fill-emerald-200 stroke-emerald-600" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2" className="fill-emerald-500" />
    </svg>
  ),
};

const loadingSteps = [
  { text: 'Loading calendar...', icon: 'calendar' },
  { text: 'Fetching availability...', icon: 'search' },
  { text: 'Syncing time zones...', icon: 'globe' },
  { text: 'Almost ready...', icon: 'sparkle' },
];

export default function Footer() {
  const [isBookingLoaded, setIsBookingLoaded] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (isBookingLoaded) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
    }, 700);
    return () => clearInterval(interval);
  }, [isBookingLoaded]);

  return (
    <>
      {/* Book a Call Section */}
      <section id="book-call" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Book a call
            </h2>
            <p className="text-gray-600 text-base max-w-lg mx-auto">
              Schedule a free consultation to discuss your Martech & Analytics needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
          >
            <div className="grid md:grid-cols-5">
              {/* Info Panel */}
              <div className="md:col-span-2 bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 md:p-8 text-white">
                <h3 className="text-xl font-semibold mb-1">Free Consultation</h3>
                <p className="text-emerald-100 text-sm mb-6">
                  30-minute strategy call to discuss your data and growth challenges.
                </p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                        <path strokeLinecap="round" strokeWidth="2" d="M12 6v6l4 2"/>
                      </svg>
                    </span>
                    30 minutes
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                    </span>
                    Google Meet / Zoom
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </span>
                    No obligation
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/20 text-sm">
                  <p className="text-emerald-100 mb-3">What we&apos;ll cover:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Your current stack & challenges
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Quick wins & opportunities
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Integration roadmap
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Timeline & next steps
                    </li>
                  </ul>
                </div>
              </div>

              {/* YouCanBook.me */}
              <div className="md:col-span-3 min-h-[500px] overflow-hidden relative">
                {/* Loading State */}
                <AnimatePresence>
                  {!isBookingLoaded && (
                    <motion.div 
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10"
                    >
                      <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" />
                        <motion.span 
                          key={loadingStep}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          {LoadingIcons[loadingSteps[loadingStep].icon as keyof typeof LoadingIcons]}
                        </motion.span>
                      </div>
                      <motion.p 
                        key={`text-${loadingStep}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-gray-600 text-sm font-medium"
                      >
                        {loadingSteps[loadingStep].text}
                      </motion.p>
                      <div className="flex gap-1.5 mt-4">
                        {loadingSteps.map((_, idx) => (
                          <div 
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                              idx <= loadingStep ? 'bg-emerald-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="relative" style={{ height: '500px', overflow: 'hidden' }}>
                  <iframe
                    src="https://martechdevs.youcanbook.me/?noframe=true&skipHeaderFooter=true"
                    style={{ width: '100%', height: '540px', border: 'none', marginBottom: '-40px' }}
                    title="Book a Discovery Call with MartechDevs"
                    allow="payment"
                    onLoad={() => setTimeout(() => setIsBookingLoaded(true), 2500)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <Image
                src="/assets/martechdevs_logo.svg"
                alt="MartechDevs"
                width={140}
                height={36}
                className="h-8 w-auto brightness-0 invert mb-4"
                style={{ width: 'auto' }}
              />
              <p className="text-gray-400 text-sm max-w-sm mb-5">
                We integrate your Martech + Analytics tools. Lightning fast. Get accurate data, automated messaging, and unified customer views.
              </p>
              <div className="flex gap-3">
                <a href="https://www.linkedin.com/company/martechdevs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-emerald-500 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="mailto:hello@martechdevs.com" className="w-9 h-9 bg-gray-800 hover:bg-emerald-500 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">Services</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#services" className="hover:text-emerald-400 transition-colors">Marketing Automation</Link></li>
                <li><Link href="#services" className="hover:text-emerald-400 transition-colors">Analytics Setup</Link></li>
                <li><Link href="#services" className="hover:text-emerald-400 transition-colors">CDP Implementation</Link></li>
                <li><Link href="#services" className="hover:text-emerald-400 transition-colors">Data Warehouse</Link></li>
                <li><Link href="#services" className="hover:text-emerald-400 transition-colors">CRM Integration</Link></li>
              </ul>
            </div>

            {/* Tools */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">Tools We Work With</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Segment / RudderStack</li>
                <li>Mixpanel / Amplitude</li>
                <li>Braze / Customer.io</li>
                <li>HubSpot / Salesforce</li>
                <li>Snowflake / BigQuery</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} MartechDevs. All rights reserved.</p>
            <div className="flex gap-5">
              <Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
