'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

/**
 * Tool badges that pop in around the hero heading on wide screens. Place it
 * inside a `relative inline-block` that wraps the h1; the badges hang off its
 * left and right edges. Decorative, so hidden below xl.
 */
export default function HeroIcons() {
  return (
    <>
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
    </>
  );
}
