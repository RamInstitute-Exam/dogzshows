import AlbumDetailsClientPage from './AlbumDetailsClient';

export default function AlbumDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  return <AlbumDetailsClientPage params={params} />;
}
