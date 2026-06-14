import DogProfileClient from './DogProfileClient';

export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default async function DogProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <DogProfileClient id={resolvedParams.id} />;
}
