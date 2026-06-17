import type { Metadata } from 'next';
import PhotoDetailClient from '../../show-photos/[slug]/PhotoDetailClient';
import { getPhotoBySlug, getAllPhotos } from '@/lib/server-api';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
    const res = await fetch(`${baseUrl}/public/media/photos?category=championship`);
    if (res.ok) {
      const data = await res.json();
      const photos = Array.isArray(data) ? data : data.data || [];
      if (photos.length > 0) {
        return photos.map((photo: any) => ({
          slug: photo.slug,
        }));
      }
    }
  } catch (error) {
    console.error("Failed to generate static params for championship photos", error);
  }
  return [{ slug: 'default' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
    const res = await fetch(`${baseUrl}/public/media/photos/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const responseJson = await res.json();
      const photo = responseJson.data || responseJson;
      return {
        title: photo.seoTitle || `${photo.title} | JuzDog Photography`,
        description: photo.seoDescription || photo.description || `View ${photo.title} on JuzDog Photography.`,
        openGraph: {
          title: photo.seoTitle || photo.title,
          description: photo.seoDescription || photo.description || `View ${photo.title} on JuzDog Photography.`,
          images: [{ url: photo.cdnUrl }],
        },
      };
    }
  } catch (error) {
    // ignore
  }

  return {
    title: 'Photo Details | JuzDog',
  };
}

export const revalidate = 60;

export default async function PhotoDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const [photoRes, allPhotosRes] = await Promise.all([
    getPhotoBySlug(slug),
    getAllPhotos()
  ]);

  return <PhotoDetailClient initialPhoto={photoRes.data} initialPhotos={allPhotosRes.data} />;
}
