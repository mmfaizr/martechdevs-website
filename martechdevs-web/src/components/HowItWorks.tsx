'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const toolLogos = [
  'segment logo icon.svg',
  'mixpanel logo icon.svg',
  'hubspot logo icon.svg',
  'braze logo icon.svg',
  'snowflake logo icon.svg',
  'intercom logo icon.svg',
];

const whatWeDoItems = [
  { icon: '🎯', title: 'Discovery & Strategy', desc: 'Analyze your current stack, identify gaps, create tailored roadmap.' },
  { icon: '🏗️', title: 'Architecture Design', desc: 'Design scalable data architecture with best practices.' },
  { icon: '⚙️', title: 'Implementation', desc: 'Expert hands-on setup of SDKs, APIs, tracking, pipelines.' },
  { icon: '🔗', title: 'Tool Integration', desc: 'Connect all tools into a unified, data-rich ecosystem.' },
  { icon: '✅', title: 'Testing & Validation', desc: 'Rigorous QA for data accuracy and seamless communication.' },
  { icon: '📚', title: 'Documentation & Training', desc: 'Comprehensive docs so your team can maintain and extend.' },
];

const whatYouGetItems = [
  { icon: '📊', title: 'Unified Customer View', desc: 'Single trusted profile combining all customer interactions.' },
  { icon: '🎯', title: 'Accurate Attribution', desc: 'Know exactly which channels drive real revenue.' },
  { icon: '🚀', title: 'Automated Workflows', desc: 'Trigger personalized messages based on user behavior.' },
  { icon: '💡', title: 'Actionable Insights', desc: 'Dashboards answering your critical business questions.' },
  { icon: '⚡', title: 'Faster Decision Making', desc: 'Real-time data access for quick, confident action.' },
  { icon: '📈', title: 'Improved ROI', desc: 'Better data leads to optimized spend and growth.' },
];

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'whatWeDo' | 'whatYouGet'>('whatWeDo');
  const items = activeTab === 'whatWeDo' ? whatWeDoItems : whatYouGetItems;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tool Icons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          {toolLogos.map((logo) => (
            <div key={logo} className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center p-1.5 border border-gray-100">
              <Image
                src={`/assets/tool logos icons/${logo}`}
                alt={logo}
                width={22}
                height={22}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Backed & fueled by comprehensive
            <br />
            <span className="text-emerald-500">data-nourishing workflows</span>
          </h2>
          <p className="text-gray-600 text-base max-w-xl mx-auto">
            We don&apos;t just connect tools—we build intelligent systems that transform your data into growth.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setActiveTab('whatWeDo')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'whatWeDo'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              What we&apos;ll do
            </button>
            <button
              onClick={() => setActiveTab('whatYouGet')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'whatYouGet'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              What you&apos;ll get
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-xl mb-3">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <a
            href="#book-call"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-emerald-500/20"
          >
            Get Started Today
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
