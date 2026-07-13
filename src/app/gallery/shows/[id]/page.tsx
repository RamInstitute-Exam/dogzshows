// Fetches all show album IDs from the backend at build time via the shared helper.
// All data rendering is handled client-side inside ShowAlbumClient.
import ShowAlbumClientPage from './ShowAlbumClient';

export default function ShowAlbumPage() {
  return <ShowAlbumClientPage />;
}
