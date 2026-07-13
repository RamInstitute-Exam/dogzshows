// Fetches all club slugs from the backend at build time via the shared helper.
// All data rendering is handled client-side inside ClubSlugClient.
import ClubSlugClientPage from './ClubSlugClient';

export default function ClubSlugPage() {
  return <ClubSlugClientPage />;
}
