import DogDetailsClient from './DogDetailsClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function DogDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <DogDetailsClient id={resolvedParams.id} />;
}
