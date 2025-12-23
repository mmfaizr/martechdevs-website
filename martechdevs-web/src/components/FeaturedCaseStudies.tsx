'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const caseStudies = [
  {
    id: 1,
    company: 'FundedNext',
    logo: '/assets/client logos/fundednext.png',
    description: 'Proprietary Trading Firm',
    image: '/assets/main hero image.svg', // Placeholder - replace with actual case study image
    stats: [
      { label: 'Revenue Growth', value: '+156%' },
      { label: 'Data Accuracy', value: '99.9%' },
    ],
  },
  {
    id: 2,
    company: 'Foreplay',
    logo: '/assets/client logos/Foreplay.png',
    description: 'Ad Intelligence Platform',
    image: '/assets/main hero image.svg',
    stats: [
      { label: 'Conversion Rate', value: '+47%' },
      { label: 'Setup Time', value: '2 weeks' },
    ],
  },
  {
    id: 3,
    company: 'Steno',
    logo: '/assets/client logos/Steno.png',
    description: 'AI Meeting Assistant',
    image: '/assets/main hero image.svg',
    stats: [
      { label: 'User Insights', value: '+300%' },
      { label: 'Integration Speed', value: '10 days' },
    ],
  },
  {
    id: 4,
    company: 'Sevron',
    logo: '/assets/client logos/Sevron.png',
    description: 'SaaS Platform',
    image: '/assets/main hero image.svg',
    stats: [
      { label: 'Data Quality', value: '100%' },
      { label: 'ROI', value: '+280%' },
    ],
  },
];

export default function FeaturedCaseStudies() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid of case studies */}
        <div className="grid md:grid-cols-2 gap-8">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <Image
                  src={study.image}
                  alt={`${study.company} Case Study`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center p-2">
                    <Image
                      src={study.logo}
                      alt={study.company}
                      width={40}
                      height={40}
                      className="object-contain"
                      style={{ width: 'auto', height: 'auto', maxHeight: '32px' }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">{study.company}</h3>
                    <p className="text-gray-500 text-sm">{study.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {study.stats.map((stat, idx) => (
                    <div key={idx} className="bg-emerald-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-emerald-600">{stat.value}</div>
                      <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <button className="mt-6 text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition-colors flex items-center gap-2 group/btn">
                  View Case Study
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


