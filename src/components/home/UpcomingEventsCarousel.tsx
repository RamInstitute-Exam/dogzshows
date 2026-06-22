'use client';

import { useState } from 'react';
import { useEventsCMS } from '@/hooks/useCMS';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight, Trophy, Tent, ChevronLeft, ChevronRight } from 'lucide-react';
import { toTitleCase } from '@/lib/utils';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface EventData {
  id: string;
  name: string;
  slug: string;
  bannerUrl: string;
  cardImage: string;
  featuredImage: string;
  description: string;
  startDate: string;
  venue: string;
  entryFee: number;
  judgesCount: number;
  prizePool: string;
  status: string;
  isFeatured: boolean;
  registrationWindowEnd: string;
  club: { name: string };
}

export default function UpcomingEventsCarousel({ initialEvents = [] }: { initialEvents?: any[] }) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  let events: EventData[] = initialEvents;

  // Guarantee strict ascending chronological sorting & push past events to the bottom
  events = [...events].sort((a, b) => {
    const aDate = new Date(a.startDate).getTime();
    const bDate = new Date(b.startDate).getTime();
    const now = new Date().setHours(0, 0, 0, 0); // Start of today

    const aIsPast = aDate < now;
    const bIsPast = bDate < now;

    // If one is past and the other is upcoming, push past to the bottom
    if (aIsPast && !bIsPast) return 1;
    if (!aIsPast && bIsPast) return -1;

    // If both are same (both past or both upcoming), sort ascending (nearest first)
    return aDate - bDate;
  });

  // Limit to latest 10
  events = events.slice(0, 10);
  // If loading is complete and no events exist, hide the section completely
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="premium-section-spacing bg-background overflow-hidden">
      <div className="premium-container">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 sm:mb-16 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-[11px] font-black tracking-widest uppercase text-muted-foreground mb-4 shadow-sm">
              <Calendar className="w-3 h-3 text-foreground" /> Upcoming Shows
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-[1.1] uppercase">
              DISCOVER INDIA'S BIGGEST <br className="hidden sm:block" />CHAMPIONSHIP DOG SHOWS.
            </h2>
          </motion.div>
        </div>

        {/* Event Swiper Slider */}
        <div className="premium-carousel-wrapper">
          {/* Custom Navigation Buttons */}
          <button
            ref={(node) => setPrevEl(node)}
            className="events-swiper-prev premium-slider-nav premium-slider-prev"
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
            autoplay={false}
            loop={events.length > 5}
            breakpoints={{
              320: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
              1440: { slidesPerView: 5 },
            }}
            className="!pb-12 events-swiper premium-carousel-track"
          >
            {events.map((event, i) => {
              const startDate = new Date(event.startDate);
              const hasError = imgErrors[event.id];
              const imageSrc = hasError
                ? '/images/events_banner.png'
                : getImageUrl(event.cardImage || event.bannerUrl || '/images/events_banner.png');

              return (
                <SwiperSlide key={event.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                    className="h-full pb-4"
                  >
                    <Link
                      href={`/events/detail?slug=${event.slug}`}
                      className="group relative flex flex-col h-[460px] overflow-hidden bg-card rounded-[24px] border border-border hover:border-border/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.15)] transition-all duration-500 ease-out cursor-pointer"
                    >
                      {/* 1. Banner Image */}
                      <div className="h-[200px] w-full relative overflow-hidden shrink-0 bg-accent">
                          <Image
                            src={imageSrc}
                            alt={event.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            loading={i < 2 ? undefined : "lazy"}
                            priority={i < 2}
                            quality={80}
                            onError={() => {
                              setImgErrors((prev) => ({ ...prev, [event.id]: true }));
                            }}
                          />

                        {/* Dark Gradient Overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                        {/* Floating Date Badge (Top Right) */}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-[12px] shadow-2xl flex flex-col items-center justify-center py-1.5 px-2.5 min-w-[56px] border border-black/5 transform group-hover:-translate-y-1 transition-transform duration-500 z-10">
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-[-4px]">
                            {startDate.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-black text-black leading-none mt-1">
                            {startDate.getDate()}
                          </span>
                          <span className="text-[9px] font-extrabold text-gray-500 mt-[2px]">
                            {startDate.getFullYear()}
                          </span>
                        </div>

                        {/* Bottom Overlay Badges */}
                        <div className="absolute bottom-4 left-4 flex gap-3 flex-wrap items-center z-10">
                          {/* Location Badge */}
                          <div className="bg-black/40 backdrop-blur-md px-3.5 h-[34px] rounded-full text-white text-[13px] font-[600] flex items-center justify-center gap-1.5 border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-black/50 transition-all duration-300 cursor-default">
                            <MapPin className="w-[14px] h-[14px] text-white/80" />
                            <span className="truncate max-w-[140px]">{toTitleCase(event.venue) || 'TBA'}</span>
                          </div>

                          {/* Championship Badge */}
                          <div className="bg-gradient-to-r from-[#A81F25] to-[#6F2B91] px-3.5 h-[34px] rounded-full text-white text-[13px] font-[700] flex items-center justify-center gap-1.5 border border-white/20 shadow-[0_4px_12px_rgba(168,31,37,0.3)] hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(168,31,37,0.5)] transition-all duration-300 cursor-default uppercase">
                            <Trophy className="w-[14px] h-[14px] text-white" />
                            CHAMPIONSHIP
                          </div>
                        </div>
                      </div>

                      {/* 2. Body Container */}
                      <div className="p-4 flex-1 flex flex-col justify-between h-full">
                        <div className="flex flex-col h-full justify-between">
                          {/* Event Title */}
                          <h3 className="text-lg font-extrabold text-foreground leading-[1.2] line-clamp-2 mb-3 group-hover:text-foreground transition-colors overflow-hidden break-words [overflow-wrap:anywhere] normal-case">
                            {toTitleCase(event.name)}
                          </h3>

                          {/* Event Info Icons */}
                          <div className="flex flex-col gap-2 mt-auto">
                            <div className="flex items-center gap-2.5 bg-accent/30 p-2 rounded-[12px] border border-border/50">
                              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 text-foreground shadow-sm">
                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                              <div className="overflow-hidden flex-1">
                                <p className="text-[11px] font-[600] uppercase tracking-wider text-[#8b8b8b] mb-0.5">Judging Panel</p>
                                <p className="text-[clamp(13px,1vw,17px)] font-[700] leading-[1.3] text-foreground truncate overflow-hidden break-words [overflow-wrap:anywhere] uppercase">{event.judgesCount ? `${event.judgesCount} International Judges` : 'TBA'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 bg-accent/30 p-2 rounded-[12px] border border-border/50">
                              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 text-foreground shadow-sm">
                                <Tent className="w-3.5 h-3.5 text-[#38BDF8]" />
                              </div>
                              <div className="overflow-hidden flex-1">
                                <p className="text-[11px] font-[600] uppercase tracking-wider text-[#8b8b8b] mb-0.5">Organizer</p>
                                <p className="text-[clamp(13px,1vw,16px)] font-[700] leading-[1.35] text-foreground line-clamp-2 overflow-hidden break-words [overflow-wrap:anywhere] normal-case">{toTitleCase(event.club?.name) || 'KCI Affiliate'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <button
            ref={(node) => setNextEl(node)}
            className="events-swiper-next premium-slider-nav premium-slider-next"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Centered View All Pill Button */}
        <div className="flex flex-col items-center justify-center mt-12 gap-3 text-center">
          <span className="text-sm font-medium text-muted-foreground uppercase">
            Showing 10 Upcoming Shows
          </span>
          <Link
            href="/events"
            className="btn-primary-luxury group gap-2.5 px-8 uppercase"
          >
            VIEW ALL SHOWS
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        /* Hide Swiper default navigation icons inside our custom buttons */
        .events-swiper-prev.swiper-button-prev::after,
        .events-swiper-next.swiper-button-next::after {
          display: none !important;
          content: "" !important;
        }
        
        /* Prevent Swiper from overriding custom button positions and sizes */
        .events-swiper-prev.swiper-button-prev,
        .events-swiper-next.swiper-button-next {
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          margin-top: 0 !important;
          display: flex !important;
          width: 48px !important;
          height: 48px !important;
          z-index: 20 !important;
        }

        .events-swiper-prev.swiper-button-prev {
          left: -16px !important;
        }

        .events-swiper-next.swiper-button-next {
          right: -16px !important;
        }

        @media (min-width: 1024px) {
          .events-swiper-prev.swiper-button-prev,
          .events-swiper-next.swiper-button-next {
            width: 56px !important;
            height: 56px !important;
          }
          .events-swiper-prev.swiper-button-prev {
            left: -40px !important;
          }
          .events-swiper-next.swiper-button-next {
            right: -40px !important;
          }
        }

        @media (min-width: 1280px) {
          .events-swiper-prev.swiper-button-prev {
            left: -64px !important;
          }
          .events-swiper-next.swiper-button-next {
            right: -64px !important;
          }
        }

        /* Disable Swiper default styling affecting layout */
        .events-swiper-prev.swiper-button-disabled,
        .events-swiper-next.swiper-button-disabled {
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </section>
  );
}
