'use client';

import { useEffect, useRef, useState } from 'react';

const SRC = '/assets/martech-stack-animated.svg';

/**
 * The homepage's animated stack diagram, fetched once it comes within a
 * screen or so of the viewport.
 *
 * Inlined like MartechStack, so hover and the page font still reach it, but
 * kept out of the HTML: at 275KB it would ship twice (markup and React
 * payload) and be most of a service page's weight on a phone. The box is held
 * at the diagram's own proportions, so nothing moves when it lands.
 */
export default function LazyStackDiagram({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        fetch(SRC)
          .then((res) => (res.ok ? res.text() : ''))
          .then(setSvg)
          .catch(() => {
            // No diagram is a missing picture, not a broken page.
          });
      },
      { rootMargin: '800px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`w-full [&_svg]:h-auto [&_svg]:w-full ${className}`}
      style={{ aspectRatio: '701 / 1196' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
