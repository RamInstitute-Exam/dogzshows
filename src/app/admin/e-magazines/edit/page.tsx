// Static route — compatible with output: 'export'.
// Magazine ID is passed as query param: /admin/e-magazines/edit?id=<uuid>
// EditMagazineClient reads it via useSearchParams() at runtime.
import EditMagazineClient from './[id]/EditMagazineClient';

export default function EditMagazinePage() {
  return <EditMagazineClient />;
}
