// Server Component — exports generateStaticParams for output: 'export' compatibility.
// Fetches all outdoor album IDs from the backend at build time via the shared helper.
// All data rendering is handled client-side inside OutdoorAlbumClient.
import OutdoorAlbumClientPage from './OutdoorAlbumClient';
import { getOutdoorAlbumIds } from '@/lib/staticParams';

export { getOutdoorAlbumIds as generateStaticParams };

export default function OutdoorAlbumPage() {
  return <OutdoorAlbumClientPage />;
}
