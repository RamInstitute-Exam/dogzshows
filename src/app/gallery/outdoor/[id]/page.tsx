// Fetches all outdoor album IDs from the backend at build time via the shared helper.
// All data rendering is handled client-side inside OutdoorAlbumClient.
import OutdoorAlbumClientPage from './OutdoorAlbumClient';

export default function OutdoorAlbumPage() {
  return <OutdoorAlbumClientPage />;
}
