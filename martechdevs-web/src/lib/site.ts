/** The live origin. Canonicals, the sitemap and structured data are built on it. */
export const SITE_URL = 'https://www.martechdevs.com';

/**
 * The service landing pages, one per Google Ads ad group. The slugs are fixed:
 * the ads point at these exact URLs, so renaming one breaks a live ad.
 *
 * Kept here, apart from the page copy, because the header and footer import it
 * on every page and the copy is far heavier than this list.
 */
export const SERVICE_PAGES = [
  { slug: 'martech-integration', label: 'Martech integration', blurb: 'Audit and connect your whole stack' },
  { slug: 'analytics-tracking', label: 'Analytics & tracking', blurb: 'GA4, Tag Manager, server-side, CAPI' },
  { slug: 'data-warehouse-cdp', label: 'Data warehouse & CDP', blurb: 'Snowflake, BigQuery, Segment, reverse ETL' },
  { slug: 'crm-lifecycle', label: 'CRM & lifecycle', blurb: 'HubSpot, Salesforce, Braze, Intercom' },
  { slug: 'product-analytics', label: 'Product analytics', blurb: 'Mixpanel, Amplitude, AppsFlyer, Adjust' },
  { slug: 'gtm-engineering', label: 'GTM engineering', blurb: 'Clay, enrichment, cold email infrastructure' },
] as const;

export type ServiceSlug = (typeof SERVICE_PAGES)[number]['slug'];
