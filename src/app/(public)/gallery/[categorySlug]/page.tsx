// Server Component — exports generateStaticParams for output: 'export' compatibility.
import CategoryPhotosClientPage from './CategoryPhotosClient';
import { getGalleryCategorySlugs } from '@/lib/staticParams';

export { getGalleryCategorySlugs as generateStaticParams };

export default function CategoryPhotosPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  return <CategoryPhotosClientPage params={params} />;
}
