'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Camera, Play, ThumbsUp, Eye, X, Share2, Download, RefreshCw, ZoomIn, Clock } from 'lucide-react';
import { useMediaImages, useMediaVideos, useMediaAlbums, useMediaCategories } from '@/hooks/useMedia';
import { getImageUrl } from '@/lib/api';
import api from '@/lib/api';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';
import Link from 'next/link';

interface MediaGalleryClientProps {
  initialTab?: 'photos' | 'videos';
  defaultCategorySlug?: string;
  title?: string;
  subtitle?: string;
}

export default function MediaGalleryClient({
  initialTab = 'photos',
  defaultCategorySlug,
  title = 'Media Gallery',
  subtitle = 'Explore high-quality captures of our champions, events, and community moments.'
}: MediaGalleryClientProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategorySlug || 'all');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  // Prevent body scrolling when a modal is open
  useEffect(() => {
    if (selectedPhoto || activeVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPhoto, activeVideo]);

  // Handle ESC key press to close active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
        setActiveVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, selectedCategory, selectedAlbum, searchQuery]);

  // Fetch filters
  const { data: categoriesRes } = useMediaCategories();
  const { data: albumsRes } = useMediaAlbums({ category: selectedCategory !== 'all' ? selectedCategory : undefined });

  const categories = categoriesRes?.success && Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
  const albums = albumsRes?.success && Array.isArray(albumsRes.data) ? albumsRes.data : [];

  // Filter out category choices depending on tab
  const filteredCategories = useMemo(() => {
    if (defaultCategorySlug) {
      return categories.filter((c: any) => c.slug === defaultCategorySlug);
    }
    // Filter categories based on active tab to prevent invalid lookups
    return categories;
  }, [categories, defaultCategorySlug]);

  // Fetch Items
  const queryParams = {
    page,
    limit: 12,
    search: searchQuery || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    album: selectedAlbum !== 'all' ? selectedAlbum : undefined
  };

  const { data: imagesRes, isLoading: imagesLoading, refetch: refetchImages } = useMediaImages(queryParams);
  const { data: videosRes, isLoading: videosLoading, refetch: refetchVideos } = useMediaVideos(queryParams);

  const images = imagesRes?.success && Array.isArray(imagesRes.items) ? imagesRes.items : [];
  const videos = videosRes?.success && Array.isArray(videosRes.items) ? videosRes.items : [];
  const totalPages = activeTab === 'photos' ? (imagesRes?.totalPages || 1) : (videosRes?.totalPages || 1);
  const totalCount = activeTab === 'photos' ? (imagesRes?.total || 0) : (videosRes?.total || 0);

  const loading = activeTab === 'photos' ? imagesLoading : videosLoading;

  const handleLike = async (e: React.MouseEvent, id: string, type: 'image' | 'video') => {
    e.stopPropagation();
    try {
      const res = await api.post(`/public/media/increment-likes/${id}`, { type });
      if (res.success) {
        if (type === 'image') {
          refetchImages();
          if (selectedPhoto && selectedPhoto.id === id) {
            setSelectedPhoto((prev: any) => prev ? { ...prev, likes: prev.likes + 1 } : null);
          }
        } else {
          refetchVideos();
          if (activeVideo && activeVideo.id === id) {
            setActiveVideo((prev: any) => prev ? { ...prev, likes: prev.likes + 1 } : null);
          }
        }
      }
    } catch (error) {
      console.error('Failed to like', error);
    }
  };

  const handleView = async (id: string, type: 'image' | 'video') => {
    try {
      await api.post(`/public/media/increment-views/${id}`, { type });
      if (type === 'image') refetchImages();
      else refetchVideos();
    } catch (error) {
      console.error('Failed to increment views', error);
    }
  };

  const handleOpenPhoto = (photo: any) => {
    setSelectedPhoto(photo);
    handleView(photo.id, 'image');
  };

  const handleOpenVideo = (video: any) => {
    setActiveVideo(video);
    handleView(video.id, 'video');
  };

  const copyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  return (
    <PageContainer>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-12 space-y-8">

        {/* Controls Container */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-card p-6 rounded-[2rem] border border-border shadow-xl">

          {/* Left: Tab Switching */}
          {!defaultCategorySlug && (
            <div className="flex bg-accent p-1.5 rounded-full w-fit border border-border self-start">
              <button
                onClick={() => { setActiveTab('photos'); setSelectedCategory('all'); setSelectedAlbum('all'); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'photos' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Camera className="w-4 h-4" /> Photos
              </button>
              <button
                onClick={() => { setActiveTab('videos'); setSelectedCategory('all'); setSelectedAlbum('all'); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'videos' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Play className="w-4 h-4" /> Videos
              </button>
            </div>
          )}

          {/* Center/Right: Dropdowns and Search */}
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            {/* Category Filter */}
            {!defaultCategorySlug && (
              <div className="flex flex-col min-w-[160px] w-full sm:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setSelectedAlbum('all'); }}
                  className="px-4 py-3 bg-background border border-border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {filteredCategories.map((c: any) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Album Filter */}
            <div className="flex flex-col min-w-[160px] w-full sm:w-auto">
              <select
                value={selectedAlbum}
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className="px-4 py-3 bg-background border border-border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
              >
                <option value="all">All Albums</option>
                {albums.map((a: any) => (
                  <option key={a.id} value={a.slug}>{a.title}</option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div className="relative flex-grow sm:flex-grow-0 sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={activeTab === 'photos' ? "Search photos..." : "Search videos..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-full text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (activeTab === 'photos' ? images : videos).length === 0 ? (
          <div className="text-center py-20 bg-card rounded-[2rem] border border-border text-muted-foreground font-semibold">
            No media items match your search or filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {activeTab === 'photos' ? (
                // Photos Grid
                images.map((photo: any, idx: number) => (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                  >
                    <Link
                      href={`/gallery/${photo.category?.slug === 'show-photos' ? 'show-photos' : 'photos'}/details?slug=${photo.slug}`}
                      className="bg-card rounded-[2rem] border border-border overflow-hidden cursor-pointer group hover:border-primary/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease flex flex-col justify-between h-full block"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-accent">
                        <img
                          src={getImageUrl(photo.imageUrl)}
                          alt={photo.altText || photo.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                            <ZoomIn className="w-5 h-5 text-primary-foreground" />
                          </div>
                        </div>
                        {photo.category?.name && (
                          <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {photo.category.name}
                          </span>
                        )}
                      </div>

                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-lg font-bold font-outfit text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                            {photo.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-2 font-semibold">
                            Date: {new Date(photo.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-4 text-xs font-bold text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {photo.views}</span>
                          <button
                            onClick={(e) => handleLike(e, photo.id, 'image')}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors active:scale-95"
                          >
                            <ThumbsUp className="w-4 h-4" /> {photo.likes}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                // Videos Grid
                videos.map((video: any, idx: number) => (
                  <motion.div
                    key={video.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                  >
                    <Link
                      href={`/gallery/${video.category?.slug === 'show-videos' ? 'show-videos' : 'videos'}/details?slug=${video.slug}`}
                      className="bg-card rounded-[2rem] border border-border overflow-hidden cursor-pointer group hover:border-primary/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease flex flex-col justify-between h-full block"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-accent">
                        <img
                          src={getImageUrl(video.thumbnail)}
                          alt={video.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/50">
                          <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transform transition-transform duration-300">
                            <Play className="w-6 h-6 fill-current text-primary-foreground ml-1" />
                          </div>
                        </div>
                        {video.duration && (
                          <span className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">
                            {video.duration || '00:00'}
                          </span>
                        )}
                        {video.category?.name && (
                          <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {video.category.name}
                          </span>
                        )}
                      </div>

                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-lg font-bold font-outfit text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                            {video.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-2 font-semibold">
                            Uploaded: {new Date(video.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-4 text-xs font-bold text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {video.views}</span>
                          <button
                            onClick={(e) => handleLike(e, video.id, 'video')}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors active:scale-95"
                          >
                            <ThumbsUp className="w-4 h-4" /> {video.likes}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-6 mt-8 text-sm font-semibold">
            <span className="text-muted-foreground">Showing page {page} of {totalPages} ({totalCount} total)</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-10 border-border text-foreground hover:bg-accent hover:text-foreground"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-10 border-border text-foreground hover:bg-accent hover:text-foreground"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX FOR PHOTO VIEW */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] bg-[rgba(0,0,0,0.9)] backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 lg:p-6"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              className="absolute top-4 right-4 md:top-6 md:right-6 text-foreground/70 hover:text-foreground bg-card/25 p-3 rounded-full backdrop-blur z-[100001] transition-colors border border-border"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl bg-card rounded-[16px] md:rounded-[24px] border border-border shadow-2xl overflow-hidden flex flex-col md:flex-row h-[calc(100vh-24px)] md:h-[calc(100vh-48px)] max-h-[850px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-grow bg-black/20 flex items-center justify-center p-4 md:p-6 min-h-[40vh] max-h-[55vh] md:max-h-none md:h-full md:w-2/3 lg:w-3/4">
                <img
                  src={getImageUrl(selectedPhoto.imageUrl)}
                  alt={selectedPhoto.altText || selectedPhoto.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-6 md:p-8 md:w-1/3 lg:w-1/4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border bg-card overflow-y-auto min-h-0 flex-grow md:flex-grow-0">
                <div className="space-y-6">
                  <div>
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                      {selectedPhoto.category?.name || 'Show Photos'}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold font-outfit text-foreground leading-snug">{selectedPhoto.title}</h2>
                    {selectedPhoto.album && (
                      <p className="text-sm font-semibold text-muted-foreground mt-2">Album: {selectedPhoto.album.title}</p>
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">{selectedPhoto.description || 'No description available for this portrait.'}</p>

                  <div className="flex flex-wrap gap-4 text-sm font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {selectedPhoto.views} Views</span>
                    <button
                      onClick={(e) => handleLike(e, selectedPhoto.id, 'image')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" /> {selectedPhoto.likes} Likes
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-border mt-8">
                  <button
                    onClick={() => copyShareLink(window.location.origin + `/media-gallery?photo=${selectedPhoto.slug}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/80 font-bold rounded-xl transition-colors border border-border text-sm text-foreground"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <a
                    href={getImageUrl(selectedPhoto.imageUrl)}
                    download={`${selectedPhoto.slug}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/95 font-bold rounded-xl transition-colors text-sm text-primary-foreground"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN PLAYER FOR VIDEOS */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] bg-[rgba(0,0,0,0.9)] backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 lg:p-6"
            onClick={() => setActiveVideo(null)}
          >
            <button
              className="absolute top-4 right-4 md:top-6 md:right-6 text-foreground/70 hover:text-foreground bg-card/25 p-3 rounded-full backdrop-blur z-[100001] transition-colors border border-border"
              onClick={() => setActiveVideo(null)}
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl w-full bg-card rounded-[16px] md:rounded-[24px] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video w-full bg-black">
                <video
                  src={activeVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-6 md:p-8 bg-card flex flex-col justify-between">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                      {activeVideo.category?.name || 'Show Videos'}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold font-outfit text-foreground leading-snug">{activeVideo.title}</h2>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={(e) => handleLike(e, activeVideo.id, 'video')}
                      className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-sm font-semibold"
                    >
                      <ThumbsUp className="w-4 h-4" /> {activeVideo.likes}
                    </button>
                    <button
                      onClick={() => copyShareLink(window.location.origin + `/media-gallery?video=${activeVideo.slug}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-xl transition-colors text-sm font-semibold border border-border"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
