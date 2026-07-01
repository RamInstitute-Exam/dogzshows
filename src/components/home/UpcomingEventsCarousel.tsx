'use client';

import { useState } from 'react';
import { useEventsCMS } from '@/hooks/useCMS';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight, Trophy, Tent, ChevronLeft, ChevronRight } from 'lucide-react';
import { toTitleCase, formatTitle } from '@/lib/utils';
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

  // Empty state — API returned zero records
  if (events.length === 0) {
    return (
      <section className="premium-section-spacing bg-background overflow-hidden">
        <div className="premium-container flex flex-col space-y-3 md:space-y-6 lg:space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-[11px] font-black tracking-widest uppercase text-muted-foreground mb-3 shadow-sm">
                <Calendar className="w-3 h-3 text-foreground" /> Upcoming Shows
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-[1.1] uppercase">
                DISCOVER INDIA'S BIGGEST <br className="hidden sm:block" />CHAMPIONSHIP DOG SHOWS.
              </h2>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-accent/40 flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Upcoming Shows</h3>
            <p className="text-muted-foreground font-medium max-w-sm">
              There are no upcoming championship shows scheduled at this time. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="premium-section-spacing bg-background overflow-hidden h-auto">
      <div className="premium-container flex flex-col space-y-3 md:space-y-6 lg:space-y-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-[11px] font-black tracking-widest uppercase text-muted-foreground mb-3 shadow-sm">
              <Calendar className="w-3 h-3 text-foreground" /> Upcoming Shows
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-[1.1] uppercase">
              DISCOVER INDIA'S BIGGEST <br className="hidden sm:block" />CHAMPIONSHIP DOG SHOWS.
            </h2>
          </motion.div>
        </div>

        {/* Event Swiper Slider */}
        <div className="premium-carousel-wrapper relative">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={16}
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
              320: { slidesPerView: 1, spaceBetween: 16 },
              768: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
              1440: { slidesPerView: 5, spaceBetween: 24 },
            }}
            className="events-swiper premium-carousel-track"
          >
            {events.map((event, i) => {
              const startDate = new Date(event.startDate);
              const hasError = imgErrors[event.id];
              const imageSrc = hasError
                ? '/images/events_banner.png'
                : getImageUrl(event.bannerUrl || event.cardImage || '/images/events_banner.png');

              return (
                <SwiperSlide key={event.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                    className="h-auto pb-1"
                  >
                    <Link
                      href={`/events/detail?slug=${event.slug}`}
                      className="group relative flex flex-col h-auto overflow-hidden bg-card rounded-[24px] border border-border hover:border-border/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.15)] transition-all duration-500 ease-out cursor-pointer p-3 md:p-4"
                    >
                      {/* 1. Banner Image */}
                      <div className="h-[140px] sm:h-[180px] md:h-[200px] w-full relative overflow-hidden shrink-0 bg-accent rounded-[16px]">
                        <Image
                          src={imageSrc}
                          alt={event.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out rounded-[16px]"
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
                        <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap items-center z-10">
                          {/* Location Badge */}
                          <div className="bg-black/45 backdrop-blur-md px-2.5 h-[26px] rounded-full text-white text-[10px] font-[700] flex items-center justify-center gap-1 border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:scale-[1.03] hover:shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:bg-black/55 transition-all duration-300 cursor-default">
                            <MapPin className="w-3 h-3 text-white/90" />
                            <span className="truncate max-w-[120px]">{toTitleCase(event.venue) || 'TBA'}</span>
                          </div>

                          {/* Championship Badge */}
                          <div className="bg-gradient-to-r from-[#A81F25] to-[#6F2B91] px-2.5 h-[26px] rounded-full text-white text-[10px] font-[800] tracking-wider flex items-center justify-center gap-1 border border-white/20 shadow-[0_2px_8px_rgba(168,31,37,0.3)] hover:scale-[1.03] hover:shadow-[0_0_10px_rgba(168,31,37,0.5)] transition-all duration-300 cursor-default uppercase">
                            <Trophy className="w-3 h-3 text-white" />
                            CHAMPIONSHIP
                          </div>
                        </div>
                      </div>

                      {/* 2. Body Container */}
                      <div className="flex flex-col gap-2 mt-3 flex-grow">
                        {/* Event Title */}
                        <h3 className="text-base sm:text-lg font-extrabold text-foreground leading-[1.2] line-clamp-2 mt-1 mb-1 md:mt-0 md:mb-3 group-hover:text-foreground transition-colors overflow-hidden break-words [overflow-wrap:anywhere] normal-case">
                          {formatTitle(event.name)}
                        </h3>

                        {/* Event Info Icons */}
                        <div className="flex flex-col gap-1.5 md:gap-2 mt-auto">
                          <div className="flex items-center gap-2.5 bg-accent/30 p-2.5 rounded-[12px] border border-border/50 my-1.5 md:my-0">
                            <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 text-foreground shadow-sm">
                              <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <p className="text-[10px] md:text-[11px] font-[600] uppercase tracking-wider text-[#8b8b8b] mb-0.5">Judging Panel</p>
                              <p className="text-[13px] md:text-[14px] font-[700] leading-[1.3] text-foreground truncate uppercase">{event.judgesCount ? `${event.judgesCount} International Judges` : 'TBA'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 bg-accent/30 p-2.5 rounded-[12px] border border-border/50 my-1.5 md:my-0">
                            <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 text-foreground shadow-sm">
                              <Tent className="w-3.5 h-3.5 text-[#38BDF8]" />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <p className="text-[10px] md:text-[11px] font-[600] uppercase tracking-wider text-[#8b8b8b] mb-0.5">Organizer</p>
                              <p className="text-[13px] md:text-[14px] font-[700] leading-[1.35] text-foreground line-clamp-2 normal-case">{toTitleCase(event.club?.name) || 'KCI Affiliate'}</p>
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

        {/* Show Counter and Button Layout Row */}
        <div className="flex flex-col items-center w-full select-none">

          {/* Show Counter (Gap between arrows and show counter: 8px max on mobile) */}
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
            Showing 10 Upcoming Shows
          </span>

          {/* Button: View All Shows (Gap between show counter and button: 12px max on mobile) */}
          <Link
            href="/events"
            className="btn-primary-luxury group gap-2.5 px-8 uppercase mt-3"
          >
            VIEW ALL SHOWS
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
