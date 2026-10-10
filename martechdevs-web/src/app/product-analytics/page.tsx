import ServicePage from '@/components/service/ServicePage';
import { serviceMetadata } from '@/components/service/metadata';
import content from '@/content/services/product-analytics';

export const metadata = serviceMetadata(content);

export default function Page() {
  return <ServicePage content={content} />;
}
