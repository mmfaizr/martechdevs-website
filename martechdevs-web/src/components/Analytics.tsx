'use client';

import { useEffect } from 'react';
import {
  pushEvent,
  labelFor,
  sectionFor,
  clickEventName,
  clickDepth,
  registerSuperProps,
  markContextReady,
  EVENTS,
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
  /* -------------------------------------------------------------- ip */
  /*
   * The visitor's IP, for telling real traffic from datacenters. Mixpanel
   * already reads the address off the request to resolve city and country, but
   * it does not keep it as a property, and a browser cannot see its own, so it
   * takes a round trip to our own server to get one.
   *
   * Mixpanel only. It is deliberately not pushed to the dataLayer: GA4's terms
   * forbid sending IP addresses, and everything in the dataLayer is one tag away
   * from ending up there.
   */
  useEffect(() => {
    let cancelled = false;

    // Hold the queue until this settles, so the page view carries the address
    // rather than racing the library for it. Capped, because a lookup that
    // never answers must not sit on the events for ever. The lookup runs about
    // a second in production, so the cap is headroom rather than the usual path.
    const release = setTimeout(markContextReady, 2000);

    // Release early if the visitor leaves first. A page view without the
    // address still counts the visit; one that never sent counts nothing, and
    // load-once-and-leave is exactly the behaviour being investigated here.
    // Delivery on unload is best effort, which still beats a certain loss.
    const releaseOnLeave = () => markContextReady();
    window.addEventListener('pagehide', releaseOnLeave);

    fetch('/api/client-ip', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ip?: string } | null) => {
        if (cancelled) return;
        if (data?.ip) registerSuperProps({ ip_address: data.ip });
      })
      .catch(() => {
        // An address we could not read is not worth a broken page.
      })
      .finally(() => {
        clearTimeout(release);
        markContextReady();
      });

    return () => {
      cancelled = true;
      clearTimeout(release);
      window.removeEventListener('pagehide', releaseOnLeave);
    };
  }, []);

  /* ---------------------------------------------------------- page view */
  /*
   * Sent by hand rather than left to autocapture, so it carries user_id and the
   * same properties as every other event and lands in both destinations under a
   * name we chose.
   *
   * Once per load. This is a single page with in-page anchors, so a hash change
   * is someone jumping to a section, not viewing a new page.
   */
  useEffect(() => {
    const referrer = document.referrer;
    pushEvent({
      event: EVENTS.pageViewed,
      page_path: window.location.pathname,
      page_title: document.title,
      ...(referrer ? { page_referrer: referrer } : {}),
    });
  }, []);

  /* ------------------------------------------------------------- clicks */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest) return;

      const el = target.closest<HTMLElement>('a, button, [role="button"]');
      if (!el) return;

      const anchor = el instanceof HTMLAnchorElement ? el : null;
      const href = anchor?.getAttribute('href') || '';
      const cta = el.dataset.track;

      // One event per click, named after the control. The stable name a CTA was
      // instrumented with rides along as cta_id, so a conversion can still be
      // counted after someone rewords the button.
      //
      // Properties that do not apply are left out rather than sent empty. A
      // button has no href and most elements have no id, and an empty string
      // still creates the property in Mixpanel, so every report then has to
      // filter it back out.
      pushEvent({
        event: clickEventName(el),
        click_text: labelFor(el),
        click_element: anchor ? 'link' : 'button',
        click_tag: el.tagName.toLowerCase(),
        click_section: sectionFor(el),
        click_position_percent: clickDepth(el),
        ...(cta ? { cta_id: cta } : {}),
        ...(href ? { click_url: href } : {}),
        ...(el.id ? { click_id: el.id } : {}),
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
          pushEvent({ event: EVENTS.scrolled, percent_scrolled: threshold });
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
      window.Intercom('onShow', () => pushEvent({ event: EVENTS.intercomOpened }));
      window.Intercom('onHide', () => pushEvent({ event: EVENTS.intercomClosed }));
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
          // localStorage rather than the cookie default: it survives cookie
          // clearing policies that shorten script-set cookies, and is not sent
          // on every request to this domain.
          persistence: 'localStorage',
          debug: process.env.NODE_ENV !== 'production',
          // Off in full. Everything autocapture offered duplicated what this
          // file already sends, with none of the meaning: its $mp_click carried
          // a list of CSS classes where our click event carries the label and
          // the section, its $mp_scroll fired on the very same 25/50/75/100
          // thresholds, and its page view arrived as [Auto] Page View with no
          // user_id on it. The page view is sent explicitly below instead.
          //
          // Session replay is a separate subsystem and is unaffected by this.
          autocapture: false,
          record_sessions_percent: 100,
        });

        // Context that belongs on every event rather than being repeated at
        // each call site.
        registerSuperProps({ platform: 'web' });
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
