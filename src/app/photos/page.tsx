'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Share2, ZoomIn, X, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';
import { useMediaPhotos, useMediaCategories } from '@/hooks/useMedia';
import Link from 'next/link';

export default function PhotoGallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  // Fetch Categories and Photos
  const { data: categoriesRes } = useMediaCategories();
  const { data: photosRes, isLoading } = useMediaPhotos({
    search: searchQuery || undefined,
    category: activeCategory !== 'All' ? activeCategory : undefined
  });

  const categories = useMemo(() => {
    const cats = categoriesRes?.success && Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
    return ['All', ...cats.map((c: any) => c.name)];
  }, [categoriesRes]);

  const photos = useMemo(() => {
    if (!photosRes) return [];
    if (photosRes.success && Array.isArray(photosRes.items)) return photosRes.items;
    if (Array.isArray(photosRes)) return photosRes;
    return [];
  }, [photosRes]);

  // Prevent body scrolling when a modal is open
  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPhoto]);

  // Handle ESC key press to close active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <PageContainer>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-outfit font-extrabold text-brand-dark mb-4 text-foreground">Photo Gallery</h1>
            <p className="text-muted-foreground font-medium max-w-xl">Explore our premium collection of dog show photography, studio portraits, and action captures.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-12 pr-4 py-3 rounded-full border border-border bg-card focus:outline-none focus:ring-2 focus:ring-foreground/50 focus:border-border shadow-sm font-medium transition-all text-foreground"
              />
            </div>
            

          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-10 pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full whitespace-nowrap font-semibold transition-all duration-300 ${
                activeCategory === category 
                  ? 'bg-foreground text-foreground shadow-md shadow-black/20' 
                  : 'bg-card text-muted-foreground hover:bg-input border border-transparent'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-12 h-12 text-foreground animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground bg-card rounded-[2rem] border border-border border-dashed">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold">No photos available.</p>
            <p className="text-sm text-muted-foreground mt-1">Please check back later.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            <AnimatePresence>
              {photos.map((photo: any) => {
                const photoSrc = photo.s3Url || photo.imageUrl || photo.cdnUrl;
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    key={photo.id}
                    className="break-inside-avoid relative rounded-[20px] overflow-hidden group cursor-zoom-in bg-input shadow-sm"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img 
                      src={photoSrc} 
                      alt={photo.altText || photo.title}
                      loading="lazy"
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <span className="text-foreground text-xs font-bold uppercase tracking-wider mb-2 block">
                          {photo.category?.name || photo.category}
                        </span>
                        <h3 className="text-foreground font-bold font-outfit text-lg mb-1 leading-snug">{photo.title}</h3>
                        <p className="text-muted-foreground text-sm font-medium">{photo.location}</p>
                        
                        <div className="flex gap-2 mt-4">
                          <button className="w-10 h-10 rounded-full bg-card/20 hover:bg-foreground backdrop-blur text-white flex items-center justify-center transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
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
              <X className="w-6 h-6 text-white" />
            </button>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl bg-card rounded-[16px] md:rounded-[24px] border border-border shadow-2xl overflow-hidden flex flex-col md:flex-row h-[calc(100vh-24px)] md:h-[calc(100vh-48px)] max-h-[850px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-grow bg-black/20 flex items-center justify-center p-4 md:p-6 min-h-[40vh] max-h-[55vh] md:max-h-none md:h-full md:w-2/3 lg:w-3/4">
                <img 
                  src={selectedPhoto.s3Url || selectedPhoto.imageUrl || selectedPhoto.cdnUrl} 
                  alt={selectedPhoto.altText || selectedPhoto.title}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="p-6 md:p-8 md:w-1/3 lg:w-1/4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border bg-card overflow-y-auto min-h-0 flex-grow md:flex-grow-0">
                <div className="space-y-6">
                  <div>
                    <span className="bg-foreground/20 text-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                      {selectedPhoto.category?.name || selectedPhoto.category}
                    </span>
                    <Link href={`/gallery/show-photos/details?slug=${selectedPhoto.slug}`}>
                      <h2 className="text-xl md:text-2xl font-bold font-outfit text-foreground leading-snug hover:text-foreground transition-colors">{selectedPhoto.title}</h2>
                    </Link>
                    <p className="text-sm font-semibold text-muted-foreground mt-2">Location: {selectedPhoto.location}</p>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">{selectedPhoto.description || 'High quality professional photography.'}</p>
                </div>

                <div className="flex gap-4 pt-6 border-t border-border mt-8">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + `/gallery/show-photos/details?slug=${selectedPhoto.slug}`);
                      alert('Share link copied to clipboard!');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/80 font-bold rounded-xl transition-colors border border-border text-sm text-foreground"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
