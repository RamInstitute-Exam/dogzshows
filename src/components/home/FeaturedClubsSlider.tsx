'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ClubData {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  city?: string;
  state?: string;
  description?: string;
  _count?: {
    clubGalleries?: number;
    events?: number;
  };
}

export default function FeaturedClubsSlider({ initialClubs = [] }: { initialClubs?: any[] }) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  const rawClubs = initialClubs || [];
  const clubs: ClubData[] = Array.from(
    new Map(
      rawClubs.map((club: any) => [
        (club.name || '').trim().toLowerCase(),
        club
      ])
    ).values()
  );

  if (!clubs.length) return null;

  return (
    <section className="featured-clubs-section w-full pt-16 pb-20 bg-background relative overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto px-[12px] sm:px-[16px] md:px-[24px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight uppercase">
              FEATURED CLUBS
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl">
              Discover India's leading kennel clubs organizing prestigious dog shows, championships, and canine events across the country.
            </p>
          </div>
        </div>

        <div className="carousel-wrapper w-full relative">
          {/* Custom Navigation Buttons will be placed below Swiper on mobile and sides on desktop */}

          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
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
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            loop={clubs.length > 5}
            breakpoints={{
              320: { slidesPerView: 1.8, spaceBetween: 12 },
              480: { slidesPerView: 2.2, spaceBetween: 12 },
              768: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 4, spaceBetween: 20 },
              1440: { slidesPerView: 5, spaceBetween: 24 },
            }}
            className="!pb-0 md:!pb-0 custom-swiper premium-carousel-track"
          >
            {clubs.map((club) => (
              <SwiperSlide key={club.id} className="!h-auto flex animate-none">
                <Link href={`/clubs/${club.slug || club.id}`} className="w-full h-full flex">
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="group relative flex flex-col h-full w-full bg-card border border-border rounded-[16px] sm:rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:border-blue-500/30"
                  >
                    {/* Top Logo Section */}
                    <div className="relative w-full aspect-[4/3] bg-muted/30 border-b border-border flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10 z-0"></div>
                      <div className="relative z-10 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 shrink-0 drop-shadow-xl transition-transform duration-500 group-hover:scale-105">
                        {club.logoUrl ? (
                          <img 
                            src={club.logoUrl} 
                            alt={club.name} 
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-accent/50 flex items-center justify-center">
                            <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-grow flex flex-col p-4 sm:p-6 text-center justify-between">
                      <div className="mb-2">
                        <h3 className="text-base sm:text-lg md:text-xl font-black text-foreground line-clamp-2 leading-tight">
                          {club.name}
                        </h3>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 font-medium">
                        {(club.city || club.state) && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground/50" />
                            <span className="line-clamp-1 text-left">{[club.city, club.state].filter(Boolean).join(', ') || 'India'}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Container - Mobile: Below, Tablet: Inside, Desktop: Outside */}
          <div className="flex md:absolute md:top-1/2 md:-translate-y-1/2 md:left-4 md:right-4 xl:-left-[64px] xl:-right-[64px] justify-center md:justify-between items-center gap-4 mt-6 md:mt-0 z-20 pointer-events-none">
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

        <div className="flex flex-col items-center justify-center mt-12 gap-3 text-center">
          <span className="text-sm font-medium text-muted-foreground uppercase">
            Showing 10 Featured Clubs
          </span>
          <Link
            href="/clubs"
            className="btn-primary-luxury group gap-2.5 px-8 uppercase"
          >
            View All Clubs
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>

    </section>
  );
}
