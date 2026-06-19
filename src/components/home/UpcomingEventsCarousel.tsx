'use client';

import { useEventsCMS } from '@/hooks/useCMS';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight, Trophy, Tent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

export default function UpcomingEventsCarousel() {
  const { data, isLoading } = useEventsCMS();
  let events: EventData[] = data?.success && Array.isArray(data.data) ? data.data : [];

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

  // Skeleton Loader while API is loading
  if (isLoading) {
    return (
      <section className="w-full pt-12 lg:pt-20 pb-16 lg:pb-24 bg-background">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-12">
          {/* Skeleton Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 sm:mb-16 gap-6">
            <div className="space-y-4 w-full md:max-w-2xl">
              <div className="h-4 w-32 bg-accent animate-pulse rounded" />
              <div className="h-10 bg-accent/40 animate-pulse rounded w-3/4" />
            </div>
            <div className="h-[52px] w-40 bg-accent/20 animate-pulse rounded-[16px]" />
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="relative flex flex-col overflow-hidden h-[600px] animate-pulse bg-card border border-border rounded-[24px]"
              >
                <div className="h-[240px] w-full bg-accent/20 shrink-0" />
                <div className="p-6 flex-1 flex flex-col space-y-6">
                  <div className="h-6 bg-accent/20 rounded w-full" />
                  <div className="space-y-4">
                    <div className="h-12 bg-accent/10 rounded w-full" />
                    <div className="h-12 bg-accent/10 rounded w-full" />
                  </div>
                  <div className="mt-auto h-24 bg-accent/10 rounded-2xl" />
                  <div className="h-12 bg-accent/20 rounded-[16px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If loading is complete and no events exist, hide the section completely
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="w-full pt-12 lg:pt-20 pb-16 lg:pb-24 bg-background overflow-hidden">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 sm:mb-16 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-[11px] font-black tracking-widest uppercase text-brand-orange mb-4 shadow-sm">
              <Calendar className="w-3 h-3" /> Upcoming Shows
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-[1.1]">
              Discover India's biggest <br className="hidden sm:block" />championship dog shows.
            </h2>
          </motion.div>
          <Button className="h-12 sm:h-[56px] px-8 rounded-[16px] bg-white text-black hover:bg-gray-100 font-extrabold shadow-lg shadow-black/5 whitespace-nowrap text-sm sm:text-base transition-transform hover:scale-105 border border-gray-200">
            View All Calendar <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Event Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
          {events.map((event, i) => {
            
            // Stable Pseudo-Random logic for UI demonstration of slots
            const totalSlots = 100;
            const slotsLeft = ((event.name.length * 13) % 40) + 5; // Between 5 and 44
            const percentFilled = ((totalSlots - slotsLeft) / totalSlots) * 100;
            
            let progressColor = 'bg-green-500';
            let statusText = 'Registration Open';
            let dotColor = 'bg-green-500';
            let pingColor = 'bg-green-400';

            if (slotsLeft < 15) {
              progressColor = 'bg-red-500';
              statusText = 'Last Few Slots';
              dotColor = 'bg-red-500';
              pingColor = 'bg-red-400';
            } else if (slotsLeft < 30) {
              progressColor = 'bg-yellow-500';
              statusText = 'Filling Fast';
              dotColor = 'bg-yellow-500';
              pingColor = 'bg-yellow-400';
            }

            const startDate = new Date(event.startDate);

            return (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                className="h-full"
              >
                <Link 
                  href={`/events/detail?slug=${event.slug}`}
                  className="group relative flex flex-col h-full overflow-hidden bg-card rounded-[24px] border border-border hover:border-brand-orange/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)] transition-all duration-500 ease-out cursor-pointer"
                >
                  {/* 1. Banner Image */}
                  <div className="h-[200px] w-full relative overflow-hidden shrink-0 bg-accent">
                    <img 
                      src={event.cardImage || event.bannerUrl || '/images/events_banner.png'} 
                      alt={event.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      loading="lazy"
                    />
                    
                    {/* Dark Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                    
                    {/* Floating Date Badge (Top Right) */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-[12px] shadow-2xl flex flex-col items-center justify-center py-1.5 px-2.5 min-w-[56px] border border-black/5 transform group-hover:-translate-y-1 transition-transform duration-500">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-[-4px]">
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
                    <div className="absolute bottom-4 left-4 flex gap-3 flex-wrap items-center">
                      {/* Location Badge */}
                      <div className="bg-black/40 backdrop-blur-md px-3.5 h-[34px] rounded-full text-white text-[13px] font-[600] flex items-center justify-center gap-1.5 border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-black/50 transition-all duration-300 cursor-default">
                        <MapPin className="w-[14px] h-[14px] text-white/80" />
                        <span className="truncate max-w-[140px]">{event.venue || 'TBA'}</span>
                      </div>
                      
                      {/* Championship Badge */}
                      <div className="bg-gradient-to-r from-[#e52d27] to-[#b31217] px-3.5 h-[34px] rounded-full text-white text-[13px] font-[700] flex items-center justify-center gap-1.5 border border-white/20 shadow-[0_4px_12px_rgba(229,45,39,0.3)] hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(229,45,39,0.5)] transition-all duration-300 cursor-default">
                        <Trophy className="w-[14px] h-[14px] text-white" />
                        Championship
                      </div>
                    </div>
                  </div>

                  {/* 2. Body Container */}
                  <div className="p-4 flex-1 flex flex-col">
                    
                    {/* Event Title */}
                    <h3 className="text-lg font-extrabold text-foreground leading-[1.2] line-clamp-2 mb-3 group-hover:text-brand-orange transition-colors">
                      {event.name}
                    </h3>

                    {/* Event Info Icons */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2.5 bg-accent/30 p-2 rounded-[12px] border border-border/50">
                        <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 text-foreground shadow-sm">
                          <Users className="w-3.5 h-3.5 text-brand-orange" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Judging Panel</p>
                          <p className="text-xs font-bold text-foreground truncate">{event.judgesCount ? `${event.judgesCount} International Judges` : 'TBA'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 bg-accent/30 p-2 rounded-[12px] border border-border/50">
                        <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 text-foreground shadow-sm">
                          <Tent className="w-3.5 h-3.5 text-[#38BDF8]" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Organizer</p>
                          <p className="text-xs font-bold text-foreground truncate">{event.club?.name || 'KCI Affiliate'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
