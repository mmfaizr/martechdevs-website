'use client';

import { useEffect, useRef } from 'react';

interface CustomerInfo {
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
  [key: string]: string | undefined;
}

interface MartechChatConfig {
  apiUrl: string;
  customerInfo?: CustomerInfo;
  theme?: 'light' | 'dark';
  autoOpen?: boolean;
  autoOpenDelay?: number;
  calLink?: string;
}

interface MartechChatInstance {
  init: () => void;
  updateCustomerInfo: (info: CustomerInfo) => void;
  destroy: () => void;
}

declare global {
  interface Window {
    MartechChat: new (config: MartechChatConfig) => MartechChatInstance;
    initMartechChat: (config: MartechChatConfig) => MartechChatInstance;
  }
}

interface Props {
  apiUrl: string;
  customerInfo?: CustomerInfo;
  theme?: 'light' | 'dark';
  autoOpen?: boolean;
  autoOpenDelay?: number;
  calLink?: string;
}

export default function MartechChat({
  apiUrl,
  customerInfo,
  theme = 'light',
  autoOpen = true,
  autoOpenDelay = 3000,
  calLink = 'https://cal.com/faizur-rahman-vvsm0e/15min'
}: Props) {
  const chatRef = useRef<MartechChatInstance | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const startedAt = Date.now();

    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.MartechChat) {
          resolve();
          return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/chat/martech-chat.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = '/chat/martech-chat.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load chat widget'));
        document.body.appendChild(script);
      });
    };

    const start = () =>
      loadScript()
        .then(() => {
          let visitorId = localStorage.getItem('mtd_visitor_id');
          if (!visitorId) {
            visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('mtd_visitor_id', visitorId);
          }

          chatRef.current = window.initMartechChat({
            apiUrl,
            customerInfo: customerInfo || {
              customer_id: visitorId,
            },
            theme,
            autoOpen,
            // Deduct the time spent waiting for idle so the widget still opens
            // roughly autoOpenDelay after page load, not after the script lands.
            autoOpenDelay: Math.max(0, autoOpenDelay - (Date.now() - startedAt)),
            calLink
          });
        })
        .catch(console.error);

    // The widget bundle is ~170KB and nothing above the fold needs it, so keep
    // it off the critical path and fetch it once the browser goes idle.
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(start, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(start, 1500);
    }

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      chatRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (chatRef.current && customerInfo) {
      chatRef.current.updateCustomerInfo(customerInfo);
    }
  }, [customerInfo]);

  /**
   * Give the floating orb a dismiss control.
   *
   * The widget ships as a prebuilt bundle, so rather than editing that artifact
   * the button is attached to the launcher wrapper once it appears. Dismissal
   * is remembered for the session, so it does not reappear on the next route
   * change or scroll.
   */
  useEffect(() => {
    const DISMISS_KEY = 'mtd_chat_dismissed';
    let observer: MutationObserver | null = null;

    const attach = () => {
      const wrap = document.querySelector<HTMLElement>('.chat-launcher-wrap');
      if (!wrap || wrap.querySelector('.mtd-chat-dismiss')) return false;

      if (sessionStorage.getItem(DISMISS_KEY) === '1') {
        wrap.style.display = 'none';
        return true;
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mtd-chat-dismiss';
      btn.setAttribute('aria-label', 'Hide chat');
      btn.title = 'Hide chat';
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        sessionStorage.setItem(DISMISS_KEY, '1');
        wrap.style.display = 'none';
      });

      wrap.appendChild(btn);
      return true;
    };

    if (!attach()) {
      observer = new MutationObserver(() => {
        if (attach()) observer?.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => observer?.disconnect();
  }, []);

  return (
    <style>{`
      /* The wrap is already position:fixed (widget CSS), so it is a containing
         block as-is - do not restate position here, it would drop the orb out
         of its floating placement and into normal flow.
         It is a 250x250 box anchored bottom-centre with pointer-events:none,
         while the visible orb sits ~55-115px up from its bottom edge, so the
         button is placed against that corner rather than the box's own. */
      .mtd-chat-dismiss {
        position: absolute;
        bottom: 104px;
        left: calc(50% + 20px);
        z-index: 2;
        pointer-events: auto;
        display: grid;
        place-items: center;
        width: 22px;
        height: 22px;
        border-radius: 9999px;
        border: 1px solid rgba(43, 59, 49, 0.12);
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(4px);
        color: #2B3B31;
        cursor: pointer;
        opacity: 0;
        transform: scale(.85);
        transition: opacity .18s ease, transform .18s ease, background .18s ease;
        box-shadow: 0 2px 8px rgba(43, 59, 49, .16);
      }
      /* The wrap itself has pointer-events:none, so it never receives :hover -
         the launcher button does. The dismiss control is appended after it,
         which makes the sibling combinator the reliable trigger. */
      .chat-launcher:hover ~ .mtd-chat-dismiss,
      .mtd-chat-dismiss:hover,
      .mtd-chat-dismiss:focus-visible {
        opacity: 1;
        transform: scale(1);
      }
      .mtd-chat-dismiss:hover { background: #fff; }
      /* touch devices have no hover, so keep it permanently visible there */
      @media (hover: none) {
        .mtd-chat-dismiss { opacity: 1; transform: none; }
      }
    `}</style>
  );
}

