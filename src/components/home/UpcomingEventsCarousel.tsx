'use client';

import { useEventsCMS } from '@/hooks/useCMS';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight, Timer, Trophy, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';

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
  const events: EventData[] = data?.success && Array.isArray(data.data) ? data.data : [];

  const getDaysRemaining = (endDateStr: string) => {
    if (!endDateStr) return 'TBA';
    const diff = new Date(endDateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? `${days} Days` : 'Closed';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Skeleton Loader while API is loading
  if (isLoading) {
    return (
      <section className="w-full pt-8 lg:pt-10 pb-12 lg:pb-16 bg-background">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          {/* Skeleton Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-16 gap-4 sm:gap-6">
            <div className="space-y-3 w-full md:max-w-xl">
              <span className="small-label text-[10px] sm:text-sm uppercase tracking-wider font-semibold text-[#F59E0B] opacity-60">
                Upcoming Events
              </span>
              <div className="h-8 bg-muted/20 animate-pulse rounded w-3/4" />
            </div>
            <div className="h-10 sm:h-[52px] w-36 bg-muted/20 animate-pulse rounded-full" />
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="luxury-card relative flex flex-col overflow-hidden min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] animate-pulse bg-card/50 border border-border"
              >
                {/* Skeleton Image */}
                <div className="h-[120px] sm:h-[160px] lg:h-[220px] w-full bg-muted/20 shrink-0" />
                {/* Skeleton Body */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="h-4 bg-muted/20 rounded w-3/4 mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted/20 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-3 mt-auto">
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-muted/20 rounded w-1/4" />
                      <div className="h-3 bg-muted/20 rounded w-1/4" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-muted/20 rounded-xl flex-1" />
                      <div className="h-8 bg-muted/20 rounded-xl flex-1" />
                    </div>
                  </div>
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

  const featuredEvent = events[0];
  const remainingEvents = events.slice(1);

  return (
    <section className="w-full pt-8 lg:pt-10 pb-12 lg:pb-16 bg-background">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-16 gap-4 sm:gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="small-label text-[10px] sm:text-sm mb-1 sm:mb-2 text-[#F59E0B]">Upcoming Events</div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-2 sm:mb-3">Discover India's biggest championship dog shows and register today.</h2>
          </motion.div>
          <Button className="h-10 sm:h-[52px] px-6 sm:px-8 rounded-full bg-white/5 backdrop-blur-md border border-border text-foreground hover:bg-white/10 font-bold whitespace-nowrap text-sm sm:text-base">
            View All Shows <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* Event Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {events.map((event, i) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group luxury-card relative flex flex-col overflow-hidden min-h-[300px] sm:min-h-[360px] lg:min-h-[420px]"
            >
              {/* Card Image */}
              <div className="h-[120px] sm:h-[160px] lg:h-[220px] w-full relative overflow-hidden shrink-0">
                <img 
                  src={event.cardImage || event.bannerUrl || '/images/events_banner.png'} 
                  alt={event.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur px-2 py-1 rounded-lg text-foreground text-[10px] font-bold border border-border truncate max-w-[50%]">
                  {event.venue}
                </div>
                <div className="absolute top-2 right-2 bg-brand-orange/20 backdrop-blur px-2 py-1 rounded-lg text-brand-orange text-[10px] font-bold border border-brand-orange/50 flex items-center gap-1.5 truncate max-w-[45%]">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse shrink-0" /> 
                  <span className="truncate">{event.status === 'REGISTRATION_OPEN' ? 'Open' : event.status.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-lg font-bold text-foreground leading-tight line-clamp-2 mb-2 sm:mb-3">{event.name}</h3>

                  <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-4">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#F59E0B] shrink-0" />
                        <span className="truncate">{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-[#38BDF8] shrink-0" />
                        <span>{event.judgesCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div>
                      <p className="small-label text-[9px] sm:text-[10px] mb-0.5">Entry Fee</p>
                      <p className="text-xs sm:text-sm font-[700] text-foreground">₹{event.entryFee}</p>
                    </div>
                    <div className="text-right">
                      <p className="small-label text-[9px] sm:text-[10px] mb-0.5">Slots</p>
                      <p className="text-[10px] sm:text-xs font-[700] text-[#F59E0B] truncate max-w-[60px] sm:max-w-none">{getDaysRemaining(event.registrationWindowEnd)}</p>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 min-h-0 h-8 sm:h-10 py-1 px-2 btn-primary-luxury rounded-xl border-0 text-[10px] sm:text-sm">
                      Register
                    </Button>
                    <Button size="sm" className="flex-1 min-h-0 h-8 sm:h-10 py-1 px-2 btn-secondary-luxury rounded-xl text-[10px] sm:text-sm">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
