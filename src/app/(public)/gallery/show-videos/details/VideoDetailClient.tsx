'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, MapPin, Tag, Share2, ArrowLeft, Play, Clock, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import { useVideoBySlug, useMediaVideos } from '@/hooks/useMedia';

interface VideoDetailClientProps {
  initialVideo?: any;
  initialVideos?: any[];
}

export default function VideoDetailClient({ initialVideo, initialVideos }: VideoDetailClientProps) {
  const params = useParams();
  const slug = params.slug as string;
  const videoRef = useRef<HTMLVideoElement>(null);

  // Client-side query fallback
  const { data: dbVideoRes, isLoading: isVideoLoading } = useVideoBySlug(slug);
  const { data: dbVideosRes } = useMediaVideos();

  const video = dbVideoRes?.data || dbVideoRes || initialVideo;
  
  const allVideos = useMemo(() => {
    const list = dbVideosRes?.success && Array.isArray(dbVideosRes.items) 
      ? dbVideosRes.items 
      : (Array.isArray(dbVideosRes) ? dbVideosRes : initialVideos || []);
    return list;
  }, [dbVideosRes, initialVideos]);

  const related = useMemo(() => {
    if (!video) return [];
    return allVideos
      .filter((v: any) => v.slug !== video.slug && v.category?.id === video.category?.id)
      .slice(0, 4);
  }, [allVideos, video]);

  if (isVideoLoading && !video) {
    return (
      <PageContainer>
        <div className="flex-grow flex items-center justify-center p-24">
          <Loader2 className="w-12 h-12 text-brand-orange animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!video) {
    return (
      <PageContainer>
        <div className="flex-grow flex flex-col items-center justify-center gap-4 text-muted-foreground p-8">
          <Play className="w-16 h-16 opacity-30" />
          <p className="text-xl font-semibold">Video not found</p>
          <Link href="/gallery/videos" className="text-brand-orange hover:underline font-bold">← Back to Videos</Link>
        </div>
      </PageContainer>
    );
  }

  const videoSrc = video.s3VideoUrl || video.videoUrl || video.cdnUrl;
  const posterSrc = video.thumbnailUrl || video.thumbnail;

  return (
    <PageContainer>
      {/* Back */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-4">
        <Link
          href="/gallery/videos"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Videography
        </Link>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pb-16 space-y-8">

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl"
        >
          <div className="aspect-video w-full">
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              preload="metadata"
              poster={posterSrc}
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>

        {/* Meta + Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6"
        >
          {/* Left: Title + Description */}
          <div className="bg-card border border-border rounded-[2rem] p-8 space-y-5">
            <div>
              {video.category?.name && (
                <span className="inline-block bg-brand-orange/15 text-brand-orange text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                  {video.category.name}
                </span>
              )}
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">{video.title}</h1>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {video.views || 0} views</span>
              {video.duration && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {video.duration}</span>}
              {video.breed && <span>• {video.breed}</span>}
            </div>

            {video.description && (
              <p className="text-muted-foreground leading-relaxed text-sm border-t border-border pt-5">
                {video.description}
              </p>
            )}

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {(Array.isArray(video.tags) ? video.tags : []).map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-accent text-muted-foreground text-xs rounded-full font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/80 border border-border rounded-xl text-sm font-semibold text-foreground transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>

          {/* Right: Sidebar info */}
          <div className="bg-card border border-border rounded-[2rem] p-8 space-y-4">
            <h3 className="font-extrabold text-foreground text-base mb-2">Video Details</h3>
            {video.location && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 bg-green-500/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-semibold text-foreground break-words whitespace-normal leading-relaxed">{video.location}</p>
                </div>
              </div>
            )}
            {video.breed && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 bg-purple-500/10 rounded-full flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-purple-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Breed</p>
                  <p className="font-semibold text-foreground break-words whitespace-normal leading-relaxed">{video.breed}</p>
                </div>
              </div>
            )}
            <div className="text-xs text-muted-foreground pt-2">
              Uploaded: {video.createdAt ? new Date(video.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent'}
            </div>
          </div>
        </motion.div>

        {/* Related Videos */}
        {related.length > 0 && (
          <div className="pt-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-foreground">Related Videos</h2>
              <Link href="/gallery/videos" className="text-brand-orange hover:underline text-sm font-semibold flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((v: any, i: number) => {
                const rThumb = v.thumbnailUrl || v.thumbnail;
                return (
                  <Link key={v.id} href={`/gallery/show-videos/details?slug=${v.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="relative aspect-video bg-black overflow-hidden">
                        {rThumb ? (
                          <img src={rThumb} alt={v.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-accent"><Play className="w-8 h-8 text-muted-foreground" /></div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-brand-orange/90 flex items-center justify-center shadow">
                            <Play className="w-4 h-4 fill-current text-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="font-bold text-foreground text-sm line-clamp-2 group-hover:text-brand-orange transition-colors">{v.title}</p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
