'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ServiceItem {
  iconFile: string;
  title: string;
  description: string;
}

interface ServiceSectionProps {
  toolLogos: Array<{ icon: string; name: string }>;
  title: string;
  titleGray: string;
  description: string;
  illustration: string;
  bgColor: string;
  textColor?: string;
  accentColor?: string;
  whatWeDo: ServiceItem[];
  whatYouGet: ServiceItem[];
}

export default function ServiceSection({
  toolLogos,
  title,
  titleGray,
  description,
  illustration,
  bgColor,
  whatWeDo,
  whatYouGet,
}: ServiceSectionProps) {
  const [activeTab, setActiveTab] = useState<'whatWeDo' | 'whatYouGet'>('whatWeDo');
  const currentItems = activeTab === 'whatWeDo' ? whatWeDo : whatYouGet;

  return (
    <section className={`${bgColor} py-12 md:py-16 lg:py-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP HEADER: Logos + Title */}
        <div className="mb-8 md:mb-10">
          {/* Tool Logos Row */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {toolLogos.map((tool, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100/50 shadow-sm">
                <Image
                  src={`/assets/tool logos icons/${tool.icon}`}
                  alt={tool.name}
                  width={28}
                  height={28}
                  className="w-5 h-5 md:w-7 md:h-7 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-base font-semibold text-gray-700">{tool.name}</span>
              </div>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight">
            <span className="text-gray-900">{title} </span>
            <span className="text-gray-400">{titleGray}</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-6 lg:gap-8 items-start">
          
          {/* LEFT - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-24 lg:self-start w-full lg:max-w-[400px]"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-5 md:p-6 shadow-sm border border-white/50 w-full">
              <Image
                src={illustration}
                alt={title}
                width={600}
                height={500}
                className="w-full h-auto"
              />
            </div>
          </motion.div>

          {/* RIGHT - Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            {/* Description */}
            <p className="text-lg text-gray-700 leading-relaxed">
              {description}
            </p>

            {/* Tab Buttons */}
            <div className="inline-flex flex-col sm:flex-row bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-full p-1 shadow-inner border border-gray-100/50 w-full sm:w-auto gap-1">
              <button
                onClick={() => setActiveTab('whatWeDo')}
                className={`px-4 md:px-6 py-2.5 rounded-lg sm:rounded-full text-sm font-semibold transition-all duration-300 w-full sm:w-auto ${
                  activeTab === 'whatWeDo'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-100'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                What we&apos;ll do
              </button>
              <button
                onClick={() => setActiveTab('whatYouGet')}
                className={`px-4 md:px-6 py-2.5 rounded-lg sm:rounded-full text-sm font-semibold transition-all duration-300 w-full sm:w-auto ${
                  activeTab === 'whatYouGet'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-100'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                What you&apos;ll get
              </button>
            </div>

            {/* Tab Content - List */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
              >
                {currentItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {/* Icon - No Wrapper */}
                    <div className="flex-shrink-0 mt-0.5">
                      <Image
                        src={`/assets/icons/${item.iconFile}`}
                        alt={item.title}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base mb-0.5">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
