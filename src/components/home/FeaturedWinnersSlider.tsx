'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import PublicContainer from '../layout/PublicContainer';
import Link from 'next/link';
import { Trophy, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/api';
import WinnerCertificateCard from '../winners/WinnerCertificateCard';

interface WinnerProps {
  initialWinners?: any[];
}

export default function FeaturedWinnersSlider({ initialWinners = [] }: WinnerProps) {
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
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 2.5 },
              1280: { slidesPerView: 3 },
              1536: { slidesPerView: 3.5 }
            }}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            className="w-full !pb-14 home-slider-nav"
          >
            {initialWinners.map((winner, idx) => (
              <SwiperSlide key={winner.id || idx} className="h-auto pb-4">
                <WinnerCertificateCard winner={winner} />
              </SwiperSlide>
            ))}
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
    </section>
  );
}
