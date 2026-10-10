import type { QuoteArea } from '@/lib/quote';
import type { ServiceSlug } from '@/lib/site';
import type { HeroBadge } from '@/components/HeroIcons';

/**
 * The copy for one service landing page. Each page backs up the headlines of
 * the Google Ads ad group that points at it, so check the ads before cutting a
 * claim from here.
 */
export type ServicePageContent = {
  slug: ServiceSlug;
  /** Ticked on the quote form. Left out where no single need fits. */
  area?: QuoteArea;
  /** Start of the `source` on every quote the page opens, for reporting. */
  source: string;
  meta: { title: string; description: string };
  /**
   * Headings and paragraphs take **marks**: in a heading the marked words are
   * the dark half and the rest is grey, in a paragraph they are bold.
   */
  hero: {
    h1: string;
    /** What we set up, with the tool names. */
    solution: string;
    /** One extra line under the intro, with a link. */
    aside?: { text: string; link: string; href: string };
  };
  /** The free audit, named for this page: "tracking audit", "CRM audit". */
  auditName: string;
  /** `icon` is the file name under /assets/tool logos icons, minus " logo icon.svg". */
  tools: { name: string; icon?: string }[];
  /**
   * The six badges around the hero heading on wide screens, in slot order:
   * left top, left middle, left bottom, right top, right middle, right
   * bottom. A tool logo by `icon`, or a stroke `path` where we ship no logo.
   */
  heroBadges: HeroBadge[];
  setup: {
    h2: string;
    lead: string;
    /** Shown beside the stack diagram, mid-page. */
    problems: string[];
    /** `icon` is a file in /assets/icons. */
    items: { title: string; body: string; icon: string }[];
  };
  steps: { h2: string; items: { title: string; body: string }[] };
  offer: { h2: string };
  faq: { h2: string; items: { q: string; a: string }[] };
  cta: { h2: string };
};
