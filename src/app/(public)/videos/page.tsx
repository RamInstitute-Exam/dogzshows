'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Eye, Calendar, X, Loader2, Video } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { useMediaVideos, useVideoCategories } from '@/hooks/useMedia';
import Link from 'next/link';

export default function VideoGallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  // Fetch categories and videos
  const { data: categoriesRes } = useVideoCategories();
  const { data: videosRes, isLoading } = useMediaVideos({
    category: activeCategory !== 'All' ? activeCategory : undefined
  });

  const categories = useMemo(() => {
    const cats = categoriesRes?.success && Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
    return ['All', ...cats.map((c: any) => c.name)];
  }, [categoriesRes]);

  const videos = useMemo(() => {
    if (!videosRes) return [];
    if (videosRes.success && Array.isArray(videosRes.items)) return videosRes.items;
    if (Array.isArray(videosRes)) return videosRes;
    return [];
  }, [videosRes]);

  const relatedVideos = useMemo(() => {
    if (!activeVideo) return [];
    return videos.filter((v: any) => v.id !== activeVideo.id).slice(0, 3);
  }, [activeVideo, videos]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = activeVideo ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activeVideo]);

  return (
    <PageContainer>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-outfit font-extrabold text-brand-dark mb-4 text-foreground">Video Gallery</h1>
          <p className="text-muted-foreground font-medium max-w-xl">Watch our cinematic dog show recaps, behind-the-scenes event coverage, and premium dog videography.</p>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-10 pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full whitespace-nowrap font-semibold transition-all duration-300 ${
                activeCategory === category 
                  ? 'bg-brand-orange text-foreground shadow-lg' 
                  : 'bg-card text-muted-foreground hover:bg-input border border-transparent'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-12 h-12 text-brand-orange animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground bg-card rounded-[2rem] border border-border border-dashed">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold">No videos available.</p>
            <p className="text-sm text-muted-foreground mt-1">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {videos.map((video: any) => {
                const videoSrc = video.s3VideoUrl || video.videoUrl || video.cdnUrl;
                const thumbSrc = video.thumbnailUrl || video.thumbnail || video.cdnUrl;
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    key={video.id}
                    className="bg-card rounded-[2rem] overflow-hidden premium-shadow group cursor-pointer border border-border"
                    onClick={() => setActiveVideo(video)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={thumbSrc} 
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-brand-orange/90 backdrop-blur text-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current ml-1 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {video.duration || '0:00'}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <span className="text-brand-orange text-xs font-bold uppercase tracking-wider mb-2 block">
                        {video.category?.name || video.category}
                      </span>
                      <h3 className="text-xl font-bold font-outfit text-foreground mb-4 line-clamp-2 group-hover:text-brand-orange transition-colors">{video.title}</h3>
                      <div className="flex items-center text-muted-foreground text-sm font-medium gap-4">
                        <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {video.views || 0}</span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" /> 
                          {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Fullscreen Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
            onClick={() => setActiveVideo(null)}
          >
            <button 
              className="absolute top-6 right-6 text-foreground/70 hover:text-foreground bg-card/10 p-2 rounded-full backdrop-blur z-10 transition-colors"
              onClick={() => setActiveVideo(null)}
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 mt-10 h-full max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
              {/* Main Player */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex-grow flex flex-col"
              >
                <div className="relative w-full bg-foreground text-background rounded-2xl overflow-hidden shadow-2xl flex-grow aspect-video lg:aspect-auto">
                  <video 
                    src={activeVideo.s3VideoUrl || activeVideo.videoUrl || activeVideo.cdnUrl}
                    poster={activeVideo.thumbnailUrl || activeVideo.thumbnail}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-6 text-foreground">
                  <Link href={`/gallery/show-videos/${activeVideo.slug}`}>
                    <h2 className="text-2xl font-bold font-outfit mb-2 hover:underline hover:text-brand-orange transition-colors">{activeVideo.title}</h2>
                  </Link>
                  <div className="flex items-center text-muted-foreground text-sm font-medium gap-6">
                    <span>{activeVideo.views || 0} views</span>
                    <span>{activeVideo.createdAt ? new Date(activeVideo.createdAt).toLocaleDateString() : 'Recent'}</span>
                    <span className="bg-brand-orange/20 text-brand-orange px-2 py-0.5 rounded-md">
                      {activeVideo.category?.name || activeVideo.category}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Related Videos Sidebar */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-full lg:w-80 shrink-0 flex flex-col gap-4 overflow-y-auto hide-scrollbar pb-10"
              >
                <h3 className="text-foreground font-bold font-outfit text-xl mb-2">Up Next</h3>
                {relatedVideos.map((video: any) => {
                  const rVideoSrc = video.s3VideoUrl || video.videoUrl || video.cdnUrl;
                  const rThumbSrc = video.thumbnailUrl || video.thumbnail || video.cdnUrl;
                  return (
                    <div 
                      key={video.id} 
                      className="flex gap-3 cursor-pointer group"
                      onClick={() => setActiveVideo(video)}
                    >
                      <div className="relative w-32 aspect-video rounded-xl overflow-hidden shrink-0">
                        <img src={rThumbSrc} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-bold">
                          {video.duration || '0:00'}
                        </div>
                      </div>
                      <div className="flex flex-col py-1">
                        <h4 className="text-foreground text-sm font-bold line-clamp-2 group-hover:text-brand-orange transition-colors leading-snug">{video.title}</h4>
                        <p className="text-muted-foreground text-xs mt-1">{video.views || 0} • {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Recent'}</p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
