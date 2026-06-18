// Server component — satisfies output: 'export' static build requirement.
// generateStaticParams fetches real event IDs from the backend at build time.
// Renders RedirectToEdit which sends the user to /admin/events/edit?id=<uuid>.
import RedirectToEdit from './RedirectToEdit';
import { getEventIds } from '@/lib/staticParams';

export { getEventIds as generateStaticParams };

export default function LegacyEditPage() {
  return <RedirectToEdit />;
}

