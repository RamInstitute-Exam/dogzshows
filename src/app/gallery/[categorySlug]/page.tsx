import CategoryPhotosClientPage from './CategoryPhotosClient';

export default function CategoryPhotosPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  return <CategoryPhotosClientPage params={params} />;
}
