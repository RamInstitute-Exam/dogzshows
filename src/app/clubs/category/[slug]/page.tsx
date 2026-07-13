// Fetches all club category slugs from the backend at build time via the shared helper.
// All data rendering is handled client-side inside CategoryClient.
import CategoryClientPage from './CategoryClient';

export default function CategoryPage() {
  return <CategoryClientPage />;
}
