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
              320: { slidesPerView: 1, spaceBetween: 12 },
              576: { slidesPerView: 2, spaceBetween: 12 },
              768: { slidesPerView: 3, spaceBetween: 16 },
              1200: { slidesPerView: 4, spaceBetween: 20 },
              1440: { slidesPerView: 5, spaceBetween: 24 },
            }}
            className="!pb-0 md:!pb-0 custom-swiper premium-carousel-track"
          >
            {clubs.map((club) => (
              <SwiperSlide key={club.id} className="!h-auto flex">
                <Link href={`/clubs/${club.slug || club.id}`} className="w-full h-full flex">
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="group relative flex flex-col w-full h-full bg-card border border-border/50 rounded-[20px] overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-border/30 transition-all duration-500 p-6"
                  >
                    {/* Content */}
                    <div className="flex flex-col justify-between flex-1 h-full min-h-[auto]">
                      <div className="flex flex-col">
                        {club.logoUrl && (
                          <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center mb-4 border border-border/50 shrink-0">
                            <img src={club.logoUrl} alt={club.name} className="w-full h-full object-contain p-1.5" />
                          </div>
                        )}
                        <h3 className="text-[clamp(22px,1.4vw,30px)] font-[800] leading-[1.25] text-foreground mb-3 line-clamp-2 overflow-hidden break-words [overflow-wrap:anywhere] group-hover:text-foreground transition-colors normal-case">
                          {club.name}
                        </h3>

                        <div className="flex items-center gap-[8px] text-[16px] font-[600] text-muted-foreground mb-4 normal-case">
                          <MapPin className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="truncate">
                            {[club.city, club.state].filter(Boolean).join(', ') || 'India'}
                          </span>
                        </div>

                        <p className="text-[15px] leading-[1.7] text-muted-foreground line-clamp-2 overflow-hidden break-words [overflow-wrap:anywhere] mb-6 min-h-[auto]">
                          {club.description || 'India\'s leading kennel club organizing prestigious canine events.'}
                        </p>
                      </div>

                      <div className="mt-auto flex flex-col w-full pt-4 border-t border-border/50">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[15px] font-[700] text-foreground transition-colors uppercase">
                            VIEW CLUB
                          </span>
                          <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-foreground group-hover:scale-110 transition-all duration-300">
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-background transition-colors duration-300" />
                          </div>
                        </div>
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
