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
}

export default function MartechChat({
  apiUrl,
  customerInfo,
  theme = 'light',
  autoOpen = true,
  autoOpenDelay = 3000
}: Props) {
  const chatRef = useRef<MartechChatInstance | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

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

    loadScript()
      .then(() => {
        chatRef.current = window.initMartechChat({
          apiUrl,
          customerInfo: customerInfo || {
            customer_id: `visitor_${Date.now()}`,
          },
          theme,
          autoOpen,
          autoOpenDelay
        });
      })
      .catch(console.error);

    return () => {
      chatRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (chatRef.current && customerInfo) {
      chatRef.current.updateCustomerInfo(customerInfo);
    }
  }, [customerInfo]);

  return null;
}

