// Static route — compatible with output: 'export'.
// Event ID is passed as query param: /admin/events/edit?id=<uuid>
// EditEventClient reads it via useSearchParams() at runtime.
import EditEventClient from './EditEventClient';

export default function EditEventPage() {
  return <EditEventClient />;
}
