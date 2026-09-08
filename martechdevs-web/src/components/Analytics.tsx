'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import {
  pushEvent,
  labelFor,
  sectionFor,
  MIXPANEL_TOKEN,
  SCROLL_THRESHOLDS,
} from '@/lib/analytics';

/**
 * Mixpanel's official loader, verbatim.
 *
 * It is inlined rather than replaced with a plain `<script src>` because the
 * library refuses to initialise without it: the snippet installs a stub that
 * queues `init` on `_i`, and a bare library load with a separate `init` call
 * fails with a version mismatch. String.raw keeps the regex backslashes intact.
 */
const MIXPANEL_SNIPPET = String.raw`(function(e,c){if(!c.__SV){var l,h;window.mixpanel=c;c._i=[];c.init=function(q,r,f){function t(d,a){var g=a.split(".");2==g.length&&(d=d[g[0]],a=g[1]);d[a]=function(){d.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var b=c;"undefined"!==typeof f?b=c[f]=[]:f="mixpanel";b.people=b.people||[];b.toString=function(d){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);d||(a+=" (stub)");return a};b.people.toString=function(){return b.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
for(h=0;h<l.length;h++)t(b,l[h]);var n="set set_once union unset remove delete".split(" ");b.get_group=function(){function d(p){a[p]=function(){b.push([g,[p].concat(Array.prototype.slice.call(arguments,0))])}}for(var a={},g=["get_group"].concat(Array.prototype.slice.call(arguments,0)),m=0;m<n.length;m++)d(n[m]);return a};c._i.push([q,r,f])};c.__SV=1.2;var k=e.createElement("script");k.type="text/javascript";k.async=!0;k.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===
e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=e.getElementsByTagName("script")[0];e.parentNode.insertBefore(k,e)}})(document,window.mixpanel||[]);
mixpanel.init('${MIXPANEL_TOKEN}', { autocapture: true, record_sessions_percent: 100 });`;

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

  /* ------------------------------------------------------------ mixpanel */
  // afterInteractive, matching the GTM container above it. The snippet defines
  // window.mixpanel synchronously once it runs, and anything tracked before
  // that is held by the queue in lib/analytics and replayed.
  return (
    <Script
      id="mixpanel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: MIXPANEL_SNIPPET }}
    />
  );
}
