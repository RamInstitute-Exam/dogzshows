'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import PublicContainer from '../layout/PublicContainer';
import Link from 'next/link';
import { Trophy, ChevronRight, Image as ImageIcon } from 'lucide-react';
import OptimizedImage from '../shared/OptimizedImage';
import { getImageUrl } from '@/lib/api';
import WinnerPreviewModal from '../winners/WinnerPreviewModal';

interface WinnerProps {
  initialWinners?: any[];
}

export default function FeaturedWinnersSlider({ initialWinners = [] }: WinnerProps) {
  const [selectedWinner, setSelectedWinner] = useState<any | null>(null);

  if (!initialWinners || initialWinners.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-accent/5 overflow-hidden">
      <PublicContainer>
        <div className="flex flex-col md:flex-row items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-bold tracking-widest uppercase text-sm mb-3">
              <Trophy className="w-5 h-5" />
              <span>Champions</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              🏆 Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-300">Winners</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl text-lg font-medium">
              Celebrate the top dogs that stole the show at recent events.
            </p>
          </div>
          <Link href="/winners/categories" className="hidden md:flex items-center gap-2 font-bold text-amber-500 hover:text-amber-400 transition group mt-4 md:mt-0">
            Browse Categories
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative -mx-4 md:mx-0 px-4 md:px-0">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
              1536: { slidesPerView: 5 }
            }}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            className="w-full !pb-14 home-slider-nav"
          >
            {initialWinners.map((winner, idx) => {
              const displayImg = winner.winnerImage || winner.imageUrl;
              const dogName = winner.dogName || 'Champion';
              const awardTitle = winner.awardTitle || winner.awardCategory || 'Winner';
              
              return (
                <SwiperSlide key={winner.id || idx} className="h-auto pb-4">
                  <div 
                    onClick={() => setSelectedWinner(winner)}
                    className="cursor-pointer block h-full group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative"
                  >
                    <div className="relative aspect-[4/5] bg-muted w-full h-full flex items-center justify-center">
                      {displayImg ? (
                        <OptimizedImage
                          src={getImageUrl(displayImg)}
                          alt={dogName}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                      )}
                      
                      {/* Top Overlay Badge */}
                      <div className="absolute top-3 left-3 bg-black/75 border border-border/40 text-amber-400 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow backdrop-blur">
                        {awardTitle}
                      </div>

                      {/* Bottom Info Banner */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-10 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h4 className="text-white text-sm font-black tracking-tight line-clamp-1">{dogName}</h4>
                        <p className="text-amber-500 text-[10px] font-bold uppercase tracking-wider line-clamp-1">{winner.breed || winner.breedName || 'Unknown Breed'}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        <div className="mt-6 flex justify-center md:hidden">
          <Link href="/winners/categories">
            <button className="px-6 py-3 rounded-full border border-amber-500/30 text-amber-500 font-bold text-sm bg-amber-500/5 hover:bg-amber-500 hover:text-black transition-all">
              Browse Categories
            </button>
          </Link>
        </div>
      </PublicContainer>

      {/* Winner Detail Modal */}
      <WinnerPreviewModal 
        winner={selectedWinner}
        isOpen={!!selectedWinner}
        onClose={() => setSelectedWinner(null)}
      />
    </section>
  );
}
