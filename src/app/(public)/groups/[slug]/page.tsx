import FCIGroupDetailClient from './FCIGroupDetailClient';

export function generateStaticParams() {
  return [{ slug: '1' }];
}

export default async function FCIGroupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <FCIGroupDetailClient slug={resolvedParams.slug} />;
}
