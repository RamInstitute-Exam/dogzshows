// Server Component — exports generateStaticParams for output: 'export' compatibility.
// Fetches all club slugs from the backend at build time via the shared helper.
// All data rendering is handled client-side inside ClubSlugClient.
import ClubSlugClientPage from './ClubSlugClient';
import { getClubSlugs } from '@/lib/staticParams';

export { getClubSlugs as generateStaticParams };

export default function ClubSlugPage() {
  return <ClubSlugClientPage />;
}
