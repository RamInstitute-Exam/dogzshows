'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';
import PublicContainer from '@/components/layout/PublicContainer';
import { toTitleCase } from '@/lib/utils';

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
      <PublicContainer>
        
        {/* Section Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="small-label text-[11px] uppercase tracking-wider font-semibold text-primary">
              Premium Showcases
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1 uppercase">
              FEATURED DOG SHOWS
            </h2>
          </div>
          <Link 
            href="/shows" 
            className="text-primary hover:opacity-75 font-bold flex items-center gap-1.5 transition-colors text-sm sm:text-base group uppercase"
          >
            VIEW ALL <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Horizontal Slider Wrapper */}
        <div className="netflix-slider-container hide-scrollbar">
          {shows.map((show) => {
            const imageSrc = getImageUrl(show.cardImage || show.bannerUrl || '/images/events_banner.png');
            return (
              <Link 
                key={show.id} 
                href={`/event-details?slug=${show.slug}`}
                className="netflix-card group"
              >
                {/* Image */}
                <div className="w-full h-full relative">
                  <Image
                    src={imageSrc}
                    alt={show.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, (max-width: 1600px) 25vw, 20vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Premium Netflix Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent z-10" />

                  {/* Card Content Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col items-start pointer-events-none">
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-2 tracking-tight line-clamp-2 normal-case">
                      {toTitleCase(show.name)}
                    </h3>
                    
                    {show.description && (
                      <p className="text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed">
                        {show.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </PublicContainer>
    </section>
  );
}
