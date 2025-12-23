'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const logosRow1 = [
  'fundednext.png', 'Foreplay.png', 'Steno.png', 'Sevron.png', 
  'Submagic.png', 'Intellivy.png', 'MuslimkidsTV.png', 'Sedai.png',
  'Geonadir.png', 'Evaboot.png', 'Crosscourt.png',
];

const logosRow2 = [
  'a2hosting.png', 'doteasy.png', 'fixed.net.png', 'Liveeasy.png',
  'MelbourneIT.png', 'Mochahost.png', 'Stablepoint.png', 'Upmind.png',
  'webcentral.png', 'World Host Group.png',
];

function MarqueeRow({ logos, reverse = false }: { logos: string[]; reverse?: boolean }) {
  const duplicated = [...logos, ...logos, ...logos];
  
  return (
    <div className="marquee-mask overflow-hidden py-3">
      <div
        className={`flex items-center gap-12 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{ width: 'max-content' }}
      >
        {duplicated.map((logo, idx) => (
          <div key={`${logo}-${idx}`} className="flex-shrink-0 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300">
            <Image
              src={`/assets/client logos/${logo}`}
              alt={logo.replace('.png', '')}
              width={120}
              height={40}
              className="h-8 md:h-10 w-auto object-contain"
              style={{ width: 'auto', height: 'auto', maxHeight: '40px' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClientLogos() {
  return (
    <section className="py-12 md:py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <p className="text-gray-400 text-xs uppercase tracking-widest font-medium mb-1">
            Trusted by ambitious companies
          </p>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Trusted by leading companies
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-2"
        >
          <MarqueeRow logos={logosRow1} />
          <MarqueeRow logos={logosRow2} reverse />
        </motion.div>
      </div>
    </section>
  );
}
