import { getMagazineSlugs } from '@/lib/staticParams';
import MagazineViewerClientPage from './MagazineViewerClient';

export { getMagazineSlugs as generateStaticParams };

export default function MagazineViewerPage() {
  return <MagazineViewerClientPage />;
}
