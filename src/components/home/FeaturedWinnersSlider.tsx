'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import PublicContainer from '../layout/PublicContainer';
import Link from 'next/link';
import { Trophy, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import WinnerCard from '../winners/WinnerCard';

function ClubWinnersRow({ club }: { club: any }) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
  
  const rawWinners = club.winners || [];
  const winners = [...rawWinners].sort((a: any, b: any) => {
    const getNumber = (winner: any) => {
      const text = (winner.eventName || winner.event?.name || winner.awardTitle || '').toLowerCase();
      const match = text.match(/(\d+)(st|nd|rd|th)/);
      return match ? parseInt(match[1], 10) : 999;
    };
    return getNumber(a) - getNumber(b);
  });

  // Gracefully handle empty clubs by hiding them from the homepage
  if (winners.length === 0) return null;

  return (
    <div className="relative py-8 border-b border-border/60 last:border-0 space-y-6">
      {/* Club Header Section */}
      <div className="space-y-1">
        <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">
          {club.name}
        </h3>
        {club.eventName && (
          <p className="text-amber-500 font-bold text-sm md:text-lg">
            {club.eventName}
          </p>
        )}
      </div>

      {/* Winners Slider */}
      <div className="relative px-1 home-featured-winners-slider">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 28 },
            1280: { slidesPerView: 4, spaceBetween: 32 }
          }}
          navigation={{
            prevEl,
            nextEl,
          }}
          onBeforeInit={(swiper) => {
            // @ts-ignore
            swiper.params.navigation.prevEl = prevEl;
            // @ts-ignore
            swiper.params.navigation.nextEl = nextEl;
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="w-full !pb-14 home-slider-nav"
          style={{ alignItems: 'stretch' } as React.CSSProperties}
        >
          {winners.map((winner: any, wIdx: number) => (
            <SwiperSlide key={winner.id || wIdx} className="!h-auto px-1">
              <WinnerCard winner={winner} compact />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Container */}
        <div className="flex md:absolute md:top-1/2 md:-translate-y-1/2 md:left-2 md:right-2 xl:-left-[50px] xl:-right-[50px] justify-center md:justify-between items-center gap-4 mt-6 md:mt-0 z-20 pointer-events-none">
          <button
            ref={(node) => setPrevEl(node)}
            className="pointer-events-auto shrink-0 flex items-center justify-center !w-[52px] !h-[52px] !min-w-[52px] !max-w-[52px] bg-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:scale-[1.08] active:scale-[0.96] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-border/5"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} className="text-black" />
          </button>
          <button
            ref={(node) => setNextEl(node)}
            className="pointer-events-auto shrink-0 flex items-center justify-center !w-[52px] !h-[52px] !min-w-[52px] !max-w-[52px] bg-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:scale-[1.08] active:scale-[0.96] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-border/5"
            aria-label="Next slide"
          >
            <ChevronRight size={20} className="text-black" />
          </button>
        </div>
      </div>

      {/* View All Winners Link */}
      <div className="flex justify-end pt-2">
        <Link 
          href={`/clubs/${club.slug}/winners`} 
          className="group inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-black tracking-wider uppercase text-sm transition-colors"
        >
          View All Winners <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

interface FeaturedWinnersProps {
  initialClubs?: any[];
}

export default function FeaturedWinnersSlider({ initialClubs = [] }: FeaturedWinnersProps) {
  if (!initialClubs || initialClubs.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-accent/5 overflow-hidden">
      <PublicContainer>
        <div className="flex flex-col md:flex-row items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-bold tracking-widest uppercase text-sm mb-3">
              <Trophy className="w-5 h-5" />
              <span>Champions</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              🏆 Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-300">Winners</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl text-lg font-medium">
              Celebrate the top dogs that stole the show at recent club events.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {initialClubs.map((club, idx) => (
            <ClubWinnersRow key={club.id || idx} club={club} />
          ))}
        </div>
      </PublicContainer>
    </section>
  );
}
