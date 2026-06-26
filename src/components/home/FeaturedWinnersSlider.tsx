'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import PublicContainer from '../layout/PublicContainer';
import Link from 'next/link';
import { Trophy, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import WinnerCertificateCard from '../winners/WinnerCertificateCard';
import Image from 'next/image';

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

        <div className="space-y-16">
          {initialClubs.map((club, idx) => {
            const winners = club.winners || [];
            if (winners.length === 0) return null;

            return (
              <div key={club.id || idx} className="relative">
                {/* Club Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-card p-6 rounded-2xl border border-border shadow-sm mb-6">
                  <div className="flex items-center gap-6">
                    {club.bannerUrl && (
                      <div className="hidden md:block w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500/30 flex-shrink-0">
                        <Image src={club.bannerUrl} alt={club.name} width={80} height={80} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-black text-foreground">{club.name}</h3>
                      {club.eventName && (
                        <p className="text-amber-500 font-semibold text-sm md:text-base mt-1">{club.eventName}</p>
                      )}
                      {club.eventDate && (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(club.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {club._count?.winners || winners.length} Winners
                    </span>
                    <Link href={`/clubs/${club.slug}/winners`}>
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black transition-all text-sm font-bold shadow-sm">
                        View All Winners <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Winners Slider */}
                <div className="relative -mx-4 md:mx-0 px-4 md:px-0">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={24}
                    slidesPerView={1.2}
                    breakpoints={{
                      640: { slidesPerView: 2 },
                      1024: { slidesPerView: 3 },
                      1280: { slidesPerView: 4 }
                    }}
                    navigation
                    pagination={{ clickable: true, dynamicBullets: true }}
                    autoplay={{ delay: 4000 + (idx * 500), disableOnInteraction: false }}
                    className="w-full !pb-14 home-slider-nav"
                  >
                    {winners.map((winner: any, wIdx: number) => (
                      <SwiperSlide key={winner.id || wIdx} className="h-auto pb-4">
                        <WinnerCertificateCard winner={winner} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            );
          })}
        </div>

      </PublicContainer>
    </section>
  );
}
