'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';

export interface ShowData {
  id: string;
  name: string;
  slug: string;
  cardImage?: string | null;
  bannerUrl?: string | null;
  description?: string | null;
}

interface FeaturedShowsSliderProps {
  shows: ShowData[];
}

export default function FeaturedShowsSlider({ shows }: FeaturedShowsSliderProps) {
  // Conditional Rendering: If no featured shows exist, show simple minimal message
  if (!shows || shows.length === 0) {
    return (
      <section className="w-full bg-background" style={{ height: 'auto', minHeight: 'auto', paddingTop: '24px', paddingBottom: '24px' }}>
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <p className="text-muted-foreground text-sm sm:text-base font-medium">Coming Soon</p>
        </div>
      </section>
    );
  }

  return (
    <section className="netflix-shows-section w-full bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        
        {/* Section Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="small-label text-[11px] uppercase tracking-wider font-semibold text-[#F59E0B]">
              Premium Showcases
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
              Featured Dog Shows
            </h2>
          </div>
          <Link 
            href="/shows" 
            className="text-[#F59E0B] hover:text-[#ffb020] font-bold flex items-center gap-1.5 transition-colors text-sm sm:text-base group"
          >
            View All <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Horizontal Slider Wrapper */}
        <div className="netflix-slider-container hide-scrollbar">
          {shows.map((show) => {
            const imageSrc = getImageUrl(show.cardImage || show.bannerUrl || '/images/events_banner.png');
            return (
              <Link 
                key={show.id} 
                href={`/events/${show.slug}`}
                className="netflix-card group"
              >
                {/* Image */}
                <div className="w-full h-full relative">
                  <Image
                    src={imageSrc}
                    alt={show.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Premium Netflix Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent z-10" />

                  {/* Card Content Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col items-start pointer-events-none">
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-2 tracking-tight line-clamp-2">
                      {show.name}
                    </h3>
                    
                    {show.description && (
                      <p className="text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed mb-4">
                        {show.description}
                      </p>
                    )}

                    <div className="h-10 px-5 bg-[#F59E0B] text-black font-extrabold text-xs sm:text-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-[#ffb020] group-hover:scale-105 pointer-events-auto">
                      View Details
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
