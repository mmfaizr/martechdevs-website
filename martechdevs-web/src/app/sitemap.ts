import type { MetadataRoute } from 'next';
import { SERVICE_PAGES, SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    ...SERVICE_PAGES.map((page) => ({
      url: `${SITE_URL}/${page.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
