'use client';

import { useEffect } from 'react';
import {
  pushEvent,
  labelFor,
  sectionFor,
  SCROLL_THRESHOLDS,
} from '@/lib/analytics';

/**
 * Click and scroll-depth tracking, pushed to the GTM dataLayer.
 *
 * Both listeners are delegated or passive and there is exactly one of each for
 * the whole page, which matters on this site: the service stack already runs
 * several scroll handlers of its own and the interaction budget is tight.
 *
 * Clicks are caught at the document rather than wired per component, so a new
 * button is tracked the day it is added without anyone remembering to
 * instrument it.
 */
export default function Analytics() {
  /* ------------------------------------------------------------- clicks */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest) return;

      const el = target.closest<HTMLElement>('a, button, [role="button"]');
      if (!el) return;

      // A named CTA reports under its own event name. Everything else lands as
      // element_click. One event per click either way, so a GTM tag that fires
      // on any custom event cannot double count a conversion.
      const named = el.dataset.track;
      const anchor = el instanceof HTMLAnchorElement ? el : null;

      pushEvent({
        event: named || 'element_click',
        click_text: labelFor(el),
        click_element: anchor ? 'link' : 'button',
        click_url: anchor?.getAttribute('href') || '',
        click_section: sectionFor(el),
        click_id: el.id || '',
      });
    };

    // Capture phase: several controls here stop propagation or unmount the tree
    // they live in (the mobile menu closes on click), and a bubble-phase
    // listener would never see those.
    document.addEventListener('click', onClick, { capture: true, passive: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  /* ------------------------------------------------------- scroll depth */
  useEffect(() => {
    const fired = new Set<number>();
    let docHeight = 0;

    const measure = () => {
      docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
    };

    // No rAF throttle here on purpose. The only costly read is scrollHeight,
    // which is cached below, and scrollY and innerHeight are plain lookups that
    // force no layout. Deferring to a frame would buy nothing and adds a real
    // failure mode: rAF does not run while the tab is hidden, so a queued
    // callback would leave the handler latched and drop every later scroll.
    const onScroll = () => {
      if (!docHeight) return;

      // Depth reached is the bottom of the viewport, so a page read to its end
      // registers 100 rather than stopping one screen short.
      const reached = ((window.scrollY + window.innerHeight) / docHeight) * 100;

      for (const threshold of SCROLL_THRESHOLDS) {
        if (reached >= threshold && !fired.has(threshold)) {
          fired.add(threshold);
          pushEvent({ event: 'scroll_depth', percent_scrolled: threshold });
        }
      }

      if (fired.size === SCROLL_THRESHOLDS.length) teardown();
    };

    // Height is cached rather than read per frame. Reading scrollHeight forces
    // layout, and the service stack changes the page height as its cards pin,
    // so an observer keeps the figure current without measuring on every tick.
    const observer = new ResizeObserver(() => {
      measure();
      onScroll();
    });

    function teardown() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      observer.disconnect();
    }

    measure();
    observer.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure, { passive: true });

    // A page that fits the viewport is already fully read, so settle the
    // initial state rather than waiting for a scroll that never comes.
    onScroll();

    return teardown;
  }, []);

  return null;
}
