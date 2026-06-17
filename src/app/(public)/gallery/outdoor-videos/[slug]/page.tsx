import type { Metadata } from 'next';
import VideoDetailClient from '../../show-videos/[slug]/VideoDetailClient';
import { getVideoBySlug, getAllVideos } from '@/lib/server-api';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
    const res = await fetch(`${baseUrl}/public/media/videos?category=outdoor`);
    if (res.ok) {
      const data = await res.json();
      const videos = Array.isArray(data) ? data : data.data || [];
      if (videos.length > 0) {
        return videos.map((video: any) => ({
          slug: video.slug,
        }));
      }
    }
  } catch (error) {
    console.error("Failed to generate static params for outdoor videos", error);
  }
  return [{ slug: 'default' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
    const res = await fetch(`${baseUrl}/public/media/videos/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const responseJson = await res.json();
      const video = responseJson.data || responseJson;
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
