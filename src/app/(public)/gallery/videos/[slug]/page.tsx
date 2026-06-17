import type { Metadata } from 'next';
import VideoDetailClient from './VideoDetailClient';
import { getVideoBySlug, getAllVideos } from '@/lib/server-api';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
    const res = await fetch(`${baseUrl}/media/videos`);
    if (res.ok) {
      const data = await res.json();
      const videos = Array.isArray(data) ? data : data.data || [];
      return videos.map((video: any) => ({
        slug: video.slug,
      }));
    }
  } catch (error) {
    console.error("Failed to generate static params for videos", error);
  }
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Try to fetch metadata
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
    const res = await fetch(`${baseUrl}/media/videos/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const video = await res.json();
      return {
        title: `${video.title} | JuzDog Videography`,
        description: video.description || `Watch ${video.title} on JuzDog Videography.`,
        openGraph: {
          title: video.title,
          description: video.description || `Watch ${video.title} on JuzDog Videography.`,
          images: [{ url: video.thumbnailUrl || '/images/placeholder.webp' }],
        },
      };
    }
  } catch (error) {
    // ignore
  }

  return {
    title: 'Video Details | JuzDog',
  };
}

export const revalidate = 60;

export default async function VideoDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const [videoRes, allVideosRes] = await Promise.all([
    getVideoBySlug(slug),
    getAllVideos()
  ]);

  return <VideoDetailClient initialVideo={videoRes.data} initialVideos={allVideosRes.data} />;
}
