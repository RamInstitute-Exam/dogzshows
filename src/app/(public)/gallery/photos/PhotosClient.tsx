'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Camera, Eye, User, X, Share2, ZoomIn } from 'lucide-react';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';

interface PhotosClientProps {
  initialPhotos: any[];
}

export default function PhotosClient({ initialPhotos }: PhotosClientProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  const categories = ['All', ...Array.from(new Set(initialPhotos.map((p: any) => p.category?.name).filter(Boolean)))];

  const filtered = initialPhotos.filter((p: any) => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.photographer?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'All' || p.category?.name === activeFilter;
    return matchSearch && matchFilter;
  });

  // Lock scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = selectedPhoto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedPhoto]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedPhoto(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <PageContainer>
      {/* Filters */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card border border-border rounded-[1.5rem] p-5">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat as string}
                onClick={() => setActiveFilter(cat as string)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  activeFilter === cat
                    ? 'bg-brand-orange text-foreground border-brand-orange shadow-md'
                    : 'bg-background text-muted-foreground border-border hover:border-brand-orange hover:text-foreground'
                }`}
              >
                {cat as string}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search photos, photographers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-full text-sm text-foreground outline-none focus:border-brand-orange transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground bg-card rounded-[2rem] border border-border border-dashed">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold">No media items match your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((photo: any, index: number) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: (index % 12) * 0.04 }}
                className="group bg-card border border-border rounded-[1.5rem] overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-accent">
                  <img
                    src={photo.s3Url || photo.imageUrl || photo.cdnUrl}
                    alt={photo.altText || photo.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                      <ZoomIn className="w-5 h-5 text-foreground" />
                    </div>
                  </div>
                  {photo.category?.name && (
                    <span className="absolute top-4 left-4 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {photo.category.name}
                    </span>
                  )}
                  {photo.featured && (
                    <span className="absolute top-4 right-4 bg-brand-orange text-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-foreground group-hover:text-brand-orange transition-colors line-clamp-1 text-base">
                    {photo.title}
                  </h3>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    {photo.photographer && (
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{photo.photographer}</span>
                    )}
                    <span className="flex items-center gap-1 ml-auto"><Eye className="w-3.5 h-3.5" />{photo.views || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              className="absolute top-5 right-5 p-3 bg-card/20 hover:bg-card/50 border border-border text-white rounded-full backdrop-blur z-10 transition-colors"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-6xl bg-card rounded-[2rem] border border-border shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="flex-1 bg-black flex items-center justify-center min-h-[300px]">
                <img
                  src={selectedPhoto.s3Url || selectedPhoto.imageUrl || selectedPhoto.cdnUrl}
                  alt={selectedPhoto.altText || selectedPhoto.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Info Panel */}
              <div className="w-full md:w-80 p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border bg-card overflow-y-auto">
                <div className="space-y-5">
                  {selectedPhoto.category?.name && (
                    <span className="inline-block bg-brand-orange/15 text-brand-orange text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {selectedPhoto.category.name}
                    </span>
                  )}
                  <Link href={`/gallery/show-photos/${selectedPhoto.slug}`}>
                    <h2 className="text-xl font-extrabold text-foreground leading-snug hover:text-brand-orange hover:underline">{selectedPhoto.title}</h2>
                  </Link>
                  {selectedPhoto.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedPhoto.description}</p>
                  )}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {selectedPhoto.photographer && <p><span className="font-bold text-foreground">📷</span> {selectedPhoto.photographer}</p>}
                    {selectedPhoto.album?.title && <p><span className="font-bold text-foreground">📁</span> {selectedPhoto.album.title}</p>}
                    {selectedPhoto.breed && <p><span className="font-bold text-foreground">🐕</span> {selectedPhoto.breed}</p>}
                    {selectedPhoto.location && <p><span className="font-bold text-foreground">📍</span> {selectedPhoto.location}</p>}
                    <p className="flex items-center gap-1"><Eye className="w-4 h-4" /> {selectedPhoto.views || 0} views</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-6 border-t border-border mt-6">
                  <button
                    onClick={() => { navigator.clipboard.writeText(window.location.origin + `/gallery/show-photos/${selectedPhoto.slug}`); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent/80 border border-border rounded-xl text-sm font-semibold text-foreground transition-colors"
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
