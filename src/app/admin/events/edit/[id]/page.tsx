// Static shell for admin events edit dynamic route.
// generateStaticParams provides a placeholder so the build creates the page template.
// The actual redirect logic runs client-side via RedirectToEdit.
import RedirectToEdit from './RedirectToEdit';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function LegacyEditPage() {
  return <RedirectToEdit />;
}
