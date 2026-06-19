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
      return api.get('/public/clubs', { params: { isFeatured: true } });
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
    <section className="w-full pt-16 pb-20 bg-background relative overflow-hidden">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
              Featured Clubs
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl">
              Discover India's leading kennel clubs organizing prestigious dog shows, championships, and canine events across the country.
            </p>
          </div>
          <Link href="/clubs" className="group hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-orange hover:text-brand-orange/80 transition-colors">
            View All Clubs
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative !overflow-visible">
          {/* Custom Navigation Buttons */}
          <button
            ref={(node) => setPrevEl(node)}
            className="custom-swiper-prev absolute -left-4 lg:-left-10 xl:-left-16 top-[160px] -translate-y-1/2 z-20 hidden md:flex w-12 h-12 lg:w-14 lg:h-14 items-center justify-center rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] text-white shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-brand-orange hover:to-pink-500 hover:border-transparent hover:scale-[1.08] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} className="text-white" />
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
            loop={clubs.length > 4}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="!pb-12 custom-swiper !overflow-visible"
          >
            {clubs.map((club) => (
              <SwiperSlide key={club.id}>
                <Link href={`/clubs/${club.slug || club.id}`}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="group relative flex flex-col h-[320px] bg-card border border-border/50 rounded-[20px] overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-brand-orange/30 transition-all duration-500 p-6"
                  >
                    {/* Content */}
                    <div className="flex-1 flex flex-col h-full">
                      <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3 line-clamp-1 group-hover:text-brand-orange transition-colors">
                        {club.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4 text-brand-orange" />
                        <span className="truncate">
                          {[club.city, club.state].filter(Boolean).join(', ') || 'India'}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                        {club.description || 'India\'s leading kennel club organizing prestigious canine events.'}
                      </p>

                      <div className="mt-auto flex flex-col">
                        <div className="flex items-center gap-4 py-4 border-t border-b border-border/50 mb-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <ImageIcon className="w-4 h-4 text-brand-orange" />
                            {club._count?.clubGalleries || 0} Photos
                          </div>
                          <div className="w-1 h-1 rounded-full bg-border" />
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Film className="w-4 h-4 text-brand-orange" />
                            {0} Videos
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground group-hover:text-brand-orange transition-colors">
                            View Club
                          </span>
                          <div className="w-8 h-8 rounded-full bg-brand-orange/5 flex items-center justify-center group-hover:bg-brand-orange group-hover:scale-110 transition-all">
                            <ArrowRight className="w-4 h-4 text-brand-orange group-hover:text-white transition-colors" />
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
            className="custom-swiper-next absolute -right-4 lg:-right-10 xl:-right-16 top-[160px] -translate-y-1/2 z-20 hidden md:flex w-12 h-12 lg:w-14 lg:h-14 items-center justify-center rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] text-white shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-brand-orange hover:to-pink-500 hover:border-transparent hover:scale-[1.08] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight size={22} className="text-white" />
          </button>
        </div>
        
        <Link href="/clubs" className="md:hidden mt-8 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-orange border border-brand-orange/20 rounded-xl py-4 hover:bg-brand-orange/5 transition-colors">
          View All Clubs
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <style jsx global>{`
        /* Hide Swiper default navigation icons inside our custom buttons */
        .custom-swiper-prev.swiper-button-prev::after,
        .custom-swiper-next.swiper-button-next::after {
          display: none !important;
          content: "" !important;
        }
        
        /* Prevent Swiper from overriding custom button positions and sizes */
        .custom-swiper-prev.swiper-button-prev,
        .custom-swiper-next.swiper-button-next {
          position: absolute !important;
          top: 160px !important;
          transform: translateY(-50%) !important;
          margin-top: 0 !important;
          display: flex !important;
          width: 48px !important;
          height: 48px !important;
          z-index: 20 !important;
        }

        .custom-swiper-prev.swiper-button-prev {
          left: -16px !important;
        }

        .custom-swiper-next.swiper-button-next {
          right: -16px !important;
        }

        @media (min-width: 1024px) {
          .custom-swiper-prev.swiper-button-prev,
          .custom-swiper-next.swiper-button-next {
            width: 56px !important;
            height: 56px !important;
          }
          .custom-swiper-prev.swiper-button-prev {
            left: -40px !important;
          }
          .custom-swiper-next.swiper-button-next {
            right: -40px !important;
          }
        }

        @media (min-width: 1280px) {
          .custom-swiper-prev.swiper-button-prev {
            left: -64px !important;
          }
          .custom-swiper-next.swiper-button-next {
            right: -64px !important;
          }
        }

        /* Disable Swiper default styling affecting layout */
        .custom-swiper-prev.swiper-button-disabled,
        .custom-swiper-next.swiper-button-disabled {
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </section>
  );
}
