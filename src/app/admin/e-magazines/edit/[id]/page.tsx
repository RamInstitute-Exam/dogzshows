import RedirectToEdit from './RedirectToEdit';

// Static export: generateStaticParams provides a placeholder shell.
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function LegacyEditPage() {
  return <RedirectToEdit />;
}
