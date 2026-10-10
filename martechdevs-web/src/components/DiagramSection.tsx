'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

/**
 * Copy on the left, held in place on wide screens, and the animated stack
 * diagram on the right. The homepage runs it straight under the hero; the
 * service pages run it mid-page with their own copy.
 */
export default function DiagramSection({
  diagram,
  children,
  id,
}: {
  diagram?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    /* overflow-x-clip: the diagram slides in from 20px right, and on phones
       that offset would widen the whole page until it animates. Clip, not
       hidden, so the sticky text column keeps working. */
    <section id={id} className="bg-white py-12 w-full overflow-x-clip">
      <div className="w-full px-0 md:px-0">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-start">

          {/* Left Column - Sticky Text */}
          <div className="lg:sticky lg:top-[calc(var(--header-bottom)_+_2.5rem)] lg:self-start space-y-6 px-4 md:pl-10 lg:pl-20">
            {children}
          </div>

          {/* Right Column - Full Diagram */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative pr-4 md:pr-10 lg:pr-20"
          >
            {diagram ?? (
              <Image
                src="/assets/main hero image.svg"
                alt="MarTech Architecture Diagram"
                width={800}
                height={1400}
                className="w-full h-auto"
                priority
              />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
