'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

/** A badge on a service page: a tool logo by file name, or a stroke icon path. */
export type HeroBadge = { name: string; icon?: string; path?: string };

/* Six slots, three each side of the heading, popping in one after another.
   The box is the homepage badge's own size. */
const SLOTS = [
  { place: 'top-[-30px] xl:left-[-120px] 2xl:left-[-160px]', delay: 0.3, size: 72 },
  { place: 'top-[70px] xl:left-[-190px] 2xl:left-[-260px]', delay: 0.4, size: 64 },
  { place: 'bottom-[-20px] xl:left-[-135px] 2xl:left-[-180px]', delay: 0.5, size: 64 },
  { place: 'top-[-40px] xl:right-[-150px] 2xl:right-[-200px]', delay: 0.6, size: 64 },
  { place: 'top-[60px] xl:right-[-200px] 2xl:right-[-280px]', delay: 0.7, size: 72 },
  { place: 'bottom-[-10px] xl:right-[-145px] 2xl:right-[-190px]', delay: 0.8, size: 64 },
];

/* The homepage's own drawn badges, in slot order. */
const HOME = [
  ['snowflake_hero_icon.svg', 'Snowflake'],
  ['segment_hero_icon.svg', 'Segment'],
  ['mixpanel_hero_icon.svg', 'Mixpanel'],
  ['hubspot hero icon.svg', 'HubSpot'],
  ['intercom hero icon.svg', 'Intercom'],
  ['braze hero icon.svg', 'Braze'],
];

/**
 * A service page's badge: a tilted logo in a white round chip. Always white,
 * since the logo files carry a light plate that looks pasted on over a dark
 * chip. The bigger slots get a bigger chip, as on the homepage.
 */
function Badge({ badge, size }: { badge: HeroBadge; size: number }) {
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className={`flex ${size > 64 ? 'h-14 w-14' : 'h-[52px] w-[52px]'} cursor-default items-center justify-center rounded-full bg-white shadow-[0_10px_22px_-8px_rgba(27,37,30,0.35)] ring-1 ring-black/5 transition-transform duration-300 ease-in-out hover:scale-110`}
      >
        {badge.icon ? (
          <Image
            src={`/assets/tool logos icons/${badge.icon} logo icon.svg`}
            alt={badge.name}
            width={30}
            height={30}
            className="h-[30px] w-[30px] -rotate-12 rounded-md"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 -rotate-12 text-teal-700"
            role="img"
            aria-label={badge.name}
          >
            <path d={badge.path} />
          </svg>
        )}
      </div>
    </div>
  );
}

/**
 * Tool badges that pop in around the hero heading on wide screens. Place it
 * inside a positioned box the size of the heading; the badges hang off its
 * left and right edges. Decorative, so hidden below xl.
 *
 * With no `badges` it draws the homepage's six. A service page passes six of
 * its own tools, in slot order.
 */
export default function HeroIcons({ badges }: { badges?: HeroBadge[] }) {
  return (
    <>
      {SLOTS.map((slot, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: slot.delay, duration: 0.4 }}
          className={`absolute hidden xl:block z-10 ${slot.place}`}
        >
          {badges ? (
            <Badge badge={badges[i]} size={slot.size} />
          ) : (
            <Image
              src={`/assets/hero section logo icons/${HOME[i][0]}`}
              alt={HOME[i][1]}
              width={slot.size}
              height={slot.size}
              className={`${slot.size === 72 ? 'w-18 h-18' : 'w-16 h-16'} object-contain hover:scale-110 transition-transform duration-300 ease-in-out cursor-default`}
            />
          )}
        </motion.div>
      ))}
    </>
  );
}
