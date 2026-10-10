'use client';

import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';

/** Fades content up once as it scrolls into view, as the homepage sections do. */
export default function Reveal({
  children,
  delay = 0,
  className,
  style,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'li';
}) {
  const Tag = as === 'li' ? motion.li : motion.div;
  return (
    <Tag
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}
