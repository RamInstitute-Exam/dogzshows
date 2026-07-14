// Server Component — exports generateStaticParams for output: 'export' compatibility.
// Fetches all show album IDs from the backend at build time via the shared helper.
// All data rendering is handled client-side inside ShowAlbumClient.
import ShowAlbumClientPage from './ShowAlbumClient';
import { getShowAlbumIds } from '@/lib/staticParams';

export { getShowAlbumIds as generateStaticParams };

export default function ShowAlbumPage() {
  return <ShowAlbumClientPage />;
}
