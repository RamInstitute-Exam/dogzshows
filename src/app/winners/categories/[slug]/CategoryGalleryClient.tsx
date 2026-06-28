'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import WinnerCertificateCard from '@/components/winners/WinnerCertificateCard';

interface CategoryGalleryClientProps {
  initialWinners: any[];
  categories: any[];
  currentCategory: any; // the currently active category object (or null for 'all')
}

const ITEMS_PER_PAGE = 12;

export default function CategoryGalleryClient({ initialWinners, categories, currentCategory }: CategoryGalleryClientProps) {
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [currentCategory]);

  // Flatten all winner images and their gallery images, then sort Newest First (Desc by date/createdAt/year)
  const sortedImages = useMemo(() => {
    let allImages: any[] = [];
    
    initialWinners.forEach(winner => {
      // 1. Add main winner image
      const mainImage = [winner.winnerImage, winner.imageUrl].find(
        (img) => img && typeof img === 'string' && img.trim() !== '' && img.trim() !== 'null' && img.trim() !== 'undefined'
      );
      if (mainImage) {
        allImages.push({
          ...winner,
          displayImage: mainImage,
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

  const totalPages = Math.ceil(sortedImages.length / ITEMS_PER_PAGE);
  const paginatedImages = sortedImages.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      
      // Calculate offset for scroll to account for the sticky header (approx 120px)
      if (gridRef.current) {
        const y = gridRef.current.getBoundingClientRect().top + window.scrollY - 140;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <div>
      {/* Top Filter Bar (Sticky) */}
      <div className="sticky top-[70px] z-40 bg-background/95 backdrop-blur-md pt-4 pb-2 mb-6 border-b border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex overflow-x-auto gap-[12px] pb-2 scrollbar-hide no-scrollbar snap-x scroll-smooth items-center w-full max-w-[1600px] mx-auto">
          <Link href="/winners/categories/all" className="snap-start shrink-0">
            <button
              className={`h-[46px] flex items-center justify-center shrink-0 rounded-full text-[14px] font-[600] tracking-[0.2px] whitespace-nowrap transition-all duration-300 ease-in-out ${
                currentCategory === null
                  ? 'bg-[#111111] text-[#FFFFFF] shadow-[0_8px_20px_rgba(0,0,0,0.18)] px-[22px] border border-transparent'
                  : 'bg-[#FFFFFF] text-[#555555] border border-[#E6E6E6] hover:bg-[#F8F8F8] px-[18px] lg:px-[22px]'
              }`}
            >
              ALL
            </button>
          </Link>
          
          {categories.map((cat) => (
            <Link key={cat.id || cat.slug} href={`/winners/categories/${cat.slug}`} className="snap-start shrink-0">
              <button
                className={`h-[46px] flex items-center justify-center shrink-0 rounded-full text-[14px] font-[600] tracking-[0.2px] whitespace-nowrap transition-all duration-300 ease-in-out ${
                  currentCategory?.slug === cat.slug
                    ? 'bg-[#111111] text-[#FFFFFF] shadow-[0_8px_20px_rgba(0,0,0,0.18)] px-[22px] border border-transparent'
                    : 'bg-[#FFFFFF] text-[#555555] border border-[#E6E6E6] hover:bg-[#F8F8F8] px-[18px] lg:px-[22px]'
                }`}
              >
                {cat.name}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div ref={gridRef} className="scroll-mt-[140px]">
        {sortedImages.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No images uploaded for this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10 max-w-[1600px] mx-auto px-4">
            {paginatedImages.map((winner, idx) => {
            // override winnerImage with the specific gallery image if applicable
            const displayWinner = {
              ...winner,
              winnerImage: winner.displayImage,
              awardTitle: winner.awardTitle || winner.awardCategory || winner.category?.name || currentCategory?.name
            };

            return (
              <WinnerCertificateCard 
                key={`${winner.id}-${idx}`} 
                winner={displayWinner} 
              />
            );
          })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12 pb-12">
          <button 
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-border text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-wrap items-center justify-center gap-1.5 px-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`w-10 h-10 shrink-0 rounded-full text-sm font-bold transition-all ${
                  page === i + 1 
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                    : 'bg-transparent text-muted-foreground hover:bg-accent border border-border'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-border text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
