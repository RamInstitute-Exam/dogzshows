'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '@/lib/api';
import WinnerLightbox from '@/components/winners/WinnerLightbox';
import Link from 'next/link';

interface CategoryGalleryClientProps {
  initialWinners: any[];
  categories: any[];
  currentCategory: any; // the currently active category object (or null for 'all')
}

export default function CategoryGalleryClient({ initialWinners, categories, currentCategory }: CategoryGalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // Flatten all winner images and their gallery images, then sort Newest First (Desc by date/createdAt/year)
  const sortedImages = useMemo(() => {
    let allImages: any[] = [];
    
    initialWinners.forEach(winner => {
      // 1. Add main winner image
      if (winner.winnerImage || winner.imageUrl) {
        allImages.push({
          ...winner,
          displayImage: winner.imageUrl || winner.winnerImage,
          isMainImage: true,
        });
      }
      
      // 2. Add gallery images
      if (winner.galleryImages) {
        try {
          const parsedGallery = typeof winner.galleryImages === 'string' ? JSON.parse(winner.galleryImages) : winner.galleryImages;
          if (Array.isArray(parsedGallery)) {
            parsedGallery.forEach((galImg: string) => {
              if (galImg) {
                allImages.push({
                  ...winner,
                  displayImage: galImg,
                  isMainImage: false,
                });
              }
            });
          }
        } catch (e) {
          console.error('Failed to parse gallery images for winner:', winner.id);
        }
      }
    });

    allImages.sort((a, b) => {
      const yearA = a.year || a.showYear || 0;
      const yearB = b.year || b.showYear || 0;
      if (yearA !== yearB) return yearB - yearA;
      
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    return allImages;
  }, [initialWinners]);

  return (
    <div>
      {/* Top Filter Bar (Sticky) */}
      <div className="sticky top-[70px] z-40 bg-background/80 backdrop-blur-md py-4 mb-8 border-b border-border -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide no-scrollbar snap-x">
          <Link href="/winners/categories/all">
            <button
              className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-semibold transition-all snap-start ${
                currentCategory === null
                  ? 'bg-foreground text-background shadow-md'
                  : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground border border-border'
              }`}
            >
              All
            </button>
          </Link>
          
          {categories.map((cat) => (
            <Link key={cat.id || cat.slug} href={`/winners/categories/${cat.slug}`}>
              <button
                className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-semibold transition-all snap-start ${
                  currentCategory?.slug === cat.slug
                    ? 'bg-foreground text-background shadow-md'
                    : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground border border-border'
                }`}
              >
                {cat.name}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      {sortedImages.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          No images uploaded for this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {sortedImages.map((winner, idx) => {
              const imageUrl = getImageUrl(winner.displayImage);
              const eventName = winner.event?.name || winner.competition;
              const year = winner.year || winner.showYear;
              const badgeUrl = winner.badgeUrl;
              
              if (!imageUrl) return null;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={`${winner.id}-${idx}`}
                  className="group relative aspect-[3/4] md:aspect-auto md:h-80 w-full overflow-hidden rounded-xl bg-card cursor-pointer shadow-lg hover:shadow-xl hover:shadow-foreground/5 transition-all border border-border"
                  onClick={() => setLightboxIndex(idx)}
                >
                  <img
                    src={imageUrl}
                    alt={winner.dogName || 'Winner'}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Badge */}
                  {badgeUrl && (
                    <div className="absolute top-3 right-3 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full p-1 shadow-lg shadow-black/50">
                      <img src={badgeUrl} alt="Award Badge" className="w-full h-full object-contain" />
                    </div>
                  )}

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-bold text-sm md:text-base line-clamp-1 mb-1 shadow-sm">
                      {winner.awardTitle || winner.awardCategory || winner.category?.name || currentCategory?.name}
                    </p>
                    
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/20">
                      {eventName && (
                        <p className="text-white text-xs font-medium line-clamp-1 truncate flex-1">
                          {eventName}
                        </p>
                      )}
                      {year && (
                        <span className="text-slate-300 text-xs font-semibold bg-white/10 px-2 py-0.5 rounded">
                          {year}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox */}
      <WinnerLightbox
        isOpen={lightboxIndex !== null}
        winner={lightboxIndex !== null ? { ...sortedImages[lightboxIndex], winnerImage: sortedImages[lightboxIndex].displayImage } : null}
        onClose={() => setLightboxIndex(null)}
        onNext={lightboxIndex !== null && lightboxIndex < sortedImages.length - 1 ? () => setLightboxIndex(lightboxIndex + 1) : undefined}
        onPrev={lightboxIndex !== null && lightboxIndex > 0 ? () => setLightboxIndex(lightboxIndex - 1) : undefined}
      />
    </div>
  );
}
