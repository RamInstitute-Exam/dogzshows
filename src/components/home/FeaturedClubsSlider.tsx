'use client';

import { useState, useEffect, useRef } from 'react';

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
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const rawClubs = initialClubs || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!swiperInstance || !swiperInstance.autoplay) return;
    if (inView) {
      swiperInstance.autoplay.start();
    } else {
      swiperInstance.autoplay.stop();
    }
  }, [inView, swiperInstance]);
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
    <section ref={containerRef} className="featured-clubs-section w-full pt-16 pb-20 bg-background relative overflow-hidden">
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
            onSwiper={(swiper) => {
              setSwiperInstance(swiper);
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
                      className="group relative flex flex-col w-full h-[360px] sm:h-[400px] md:h-[440px] lg:h-[480px] bg-card rounded-[20px] sm:rounded-[24px] border border-border hover:border-border/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.15)] transition-all duration-500 ease-out cursor-pointer overflow-hidden"
                    >
                      {/* Top Logo Section */}
                      <div className="w-full h-[60%] shrink-0 relative overflow-hidden bg-white flex items-center justify-center p-4 sm:p-5">
                        <div className="relative z-10 w-full h-full flex items-center justify-center shrink-0 drop-shadow-sm transition-transform duration-500 group-hover:scale-105">
                          {club.logoUrl ? (
                            <img 
                              src={club.logoUrl} 
                              alt={club.name} 
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-accent/50 flex items-center justify-center">
                              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex flex-col flex-1 p-4 sm:p-5 text-center justify-start items-center bg-card">
                        <div className="mb-2 w-full">
                          <h3 className="text-sm sm:text-base md:text-lg font-black text-foreground leading-[1.2] mb-3 group-hover:text-foreground transition-colors break-words w-full shrink-0">
                            {club.name}
                          </h3>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground shrink-0 w-full mt-3">
                          {(club.city || club.state) && (
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                              <MapPin className="w-3.5 h-3.5 text-red-500" />
                              <span className="truncate max-w-[200px] text-left">{[club.city, club.state].filter(Boolean).join(', ')}</span>
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
