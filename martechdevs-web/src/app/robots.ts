import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** The thank-you page stays crawlable so search engines can read its noindex. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
