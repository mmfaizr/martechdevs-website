'use client';

import { useEffect } from 'react';
import {
  pushEvent,
  labelFor,
  sectionFor,
  onMixpanelReady,
  MIXPANEL_TOKEN,
  SCROLL_THRESHOLDS,
} from '@/lib/analytics';

/**
 * Click and scroll-depth tracking, and the Mixpanel loader.
 *
 * Events go to the GTM dataLayer and to Mixpanel through the same call, so the
 * two cannot drift. Mixpanel is loaded here rather than through GTM: it is the
 * app's own dependency, and loading it after hydration keeps a 60KB library and
 * its session recorder off the critical path on a page whose LCP is already
 * gated on hydration.
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

  /* ------------------------------------------------------------ intercom */
  /*
   * Messenger open and close. Intercom is installed through GTM, so it is not
   * there when this mounts; the callbacks are registered as soon as it appears.
   *
   * These two hooks hold a single handler each, so registering here claims
   * them. Anything else that needs to know the messenger opened should call
   * through this rather than re-registering and silently replacing it.
   */
  useEffect(() => {
    let waited = 0;

    const register = () => {
      if (typeof window.Intercom !== 'function') return false;
      window.Intercom('onShow', () => pushEvent({ event: 'intercom_open' }));
      window.Intercom('onHide', () => pushEvent({ event: 'intercom_close' }));
      return true;
    };

    if (register()) return;

    const timer = setInterval(() => {
      waited += 300;
      // 20s, matching the Mixpanel queue. A messenger that has not booted by
      // then is blocked or absent, and polling forever helps nobody.
      if (register() || waited >= 20000) clearInterval(timer);
    }, 300);

    return () => clearInterval(timer);
  }, []);

  /* ------------------------------------------------------------ mixpanel */
  /*
   * The package rather than the CDN snippet. The snippet installs a stub and
   * then loads the library over the network to replace it, and through
   * next/script that handoff never completed in production: window.mixpanel
   * stayed a stub with its init still queued and the library threw on startup,
   * so nothing was sent. Importing the module removes the handoff entirely.
   *
   * The import is dynamic so the library stays out of the initial bundle and
   * downloads after hydration, which is where it belongs on a page whose LCP is
   * already gated on hydration.
   */
  useEffect(() => {
    let cancelled = false;

    import('mixpanel-browser')
      .then(({ default: mixpanel }) => {
        if (cancelled) return;
        mixpanel.init(MIXPANEL_TOKEN, {
          // Pageviews only. Everything else autocapture offers duplicates what
          // this file already sends, with none of the meaning: its $mp_click
          // carries a list of CSS classes where our own click event carries the
          // label and the section, and its $mp_scroll fires on 25/50/75/100,
          // the very same thresholds as our scroll_depth.
          //
          // Each key has to be named. Passing an object merges over Mixpanel's
          // defaults rather than replacing them, so anything left out stays on.
          // page_leave is absent because it already defaults to off, and the
          // shipped types reject the key even though the runtime reads it.
          autocapture: {
            pageview: 'full-url',
            click: false,
            dead_click: false,
            rage_click: false,
            input: false,
            scroll: false,
            submit: false,
          },
          record_sessions_percent: 100,
        });
        // Expose it under the name the rest of the app already reads, and
        // release anything tracked while it was still downloading.
        window.mixpanel = mixpanel as unknown as Window['mixpanel'];
        onMixpanelReady();
      })
      .catch(() => {
        // Analytics must never take the page down with it.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
