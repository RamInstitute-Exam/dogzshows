'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { MapPin, Image as ImageIcon, Film, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function FeaturedClubsSlider() {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['featured-clubs'],
    queryFn: async () => {
      return api.get('/public/clubs', { params: { limit: 10, featured: true } });
    },
    staleTime: 5 * 60 * 1000,
  });

  const clubs: ClubData[] = response?.data || response?.items || [];

  if (isLoading) {
    return (
      <section className="w-full pt-16 pb-20 bg-background relative overflow-hidden">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-12">
          <div className="mb-10 sm:mb-16">
            <div className="h-6 w-48 bg-accent animate-pulse rounded mb-4" />
            <div className="h-10 w-3/4 max-w-2xl bg-accent/40 animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[480px] bg-accent/20 animate-pulse rounded-[24px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!clubs.length) return null;

  return (
    <section className="featured-clubs-section w-full pt-16 pb-20 bg-background relative overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto px-[12px] sm:px-[16px] md:px-[24px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
              Featured Clubs
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl">
              Discover India's leading kennel clubs organizing prestigious dog shows, championships, and canine events across the country.
            </p>
          </div>
        </div>

        <div className="carousel-wrapper relative overflow-hidden w-full">
          {/* Custom Navigation Buttons */}
          <button
            ref={(node) => setPrevEl(node)}
            className="custom-swiper-prev absolute z-20 hidden md:flex w-12 h-12 lg:w-14 lg:h-14 items-center justify-center rounded-full bg-white dark:bg-black border border-[#E5E5E5] dark:border-[#2A2A2A] text-black dark:text-white shadow-lg transition-all duration-300 hover:bg-[#F9F9F9] dark:hover:bg-[#1A1A1A] hover:border-black dark:hover:border-[#444444] hover:scale-[1.05] disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>

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
            className="!pb-12 custom-swiper premium-carousel-track"
          >
            {clubs.map((club) => (
              <SwiperSlide key={club.id} className="!h-auto flex">
                <Link href={`/clubs/${club.slug || club.id}`} className="w-full">
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="group relative flex flex-col h-full bg-card border border-border/50 rounded-[20px] overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-border/30 transition-all duration-500 p-6"
                  >
                    {/* Content */}
                    <div className="flex flex-col justify-between flex-1 h-full">
                      <div className="flex flex-col">
                        <h3 className="text-[clamp(22px,1.4vw,30px)] font-[800] leading-[1.25] text-foreground mb-3 line-clamp-2 overflow-hidden break-words [overflow-wrap:anywhere] group-hover:text-foreground transition-colors">
                          {club.name}
                        </h3>
                        
                        <div className="flex items-center gap-[8px] text-[16px] font-[600] text-muted-foreground mb-4">
                          <MapPin className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="truncate">
                            {[club.city, club.state].filter(Boolean).join(', ') || 'India'}
                          </span>
                        </div>
  
                        <p className="text-[15px] leading-[1.7] text-muted-foreground line-clamp-3 overflow-hidden break-words [overflow-wrap:anywhere] mb-6">
                          {club.description || 'India\'s leading kennel club organizing prestigious canine events.'}
                        </p>
                      </div>
 
                      <div className="mt-auto flex flex-col w-full">
                        <div className="flex items-center gap-4 py-4 border-t border-b border-border/50 mb-4">
                          <div className="flex items-center gap-2 text-[15px] font-[600] text-foreground">
                            <ImageIcon className="w-[20px] h-[20px] text-muted-foreground" />
                            {club._count?.clubGalleries || 0} Photos
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-border" />
                          <div className="flex items-center gap-2 text-[15px] font-[600] text-foreground">
                            <Film className="w-[20px] h-[20px] text-muted-foreground" />
                            {0} Videos
                          </div>
                        </div>
 
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[15px] font-[700] text-foreground transition-colors">
                            View Club
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
 
          <button
            ref={(node) => setNextEl(node)}
            className="custom-swiper-next premium-slider-nav premium-slider-next"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>
        </div>
 
        <div className="flex flex-col items-center justify-center mt-12 gap-3 text-center">
          <span className="text-sm font-medium text-muted-foreground">
            Showing 10 Featured Clubs
          </span>
          <Link
            href="/clubs"
            className="btn-primary-luxury group gap-2.5 px-8"
          >
            View All Clubs
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>

    </section>
  );
}
