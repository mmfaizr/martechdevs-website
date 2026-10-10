import type { Metadata } from 'next';
import type { ServicePageContent } from '@/content/services/types';

/** Title, description, canonical and Open Graph for a service page. */
export function serviceMetadata({ slug, meta }: ServicePageContent): Metadata {
  const url = `/${slug}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: 'martechdevs',
      type: 'website',
      locale: 'en_US',
    },
  };
}
