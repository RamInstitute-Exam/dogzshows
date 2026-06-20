// Server Component — exports generateStaticParams for output: 'export' compatibility.
import AlbumDetailsClientPage from './AlbumDetailsClient';
import { getGalleryAlbumSlugs } from '@/lib/staticParams';

export { getGalleryAlbumSlugs as generateStaticParams };

export default function AlbumDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  return <AlbumDetailsClientPage params={params} />;
}
