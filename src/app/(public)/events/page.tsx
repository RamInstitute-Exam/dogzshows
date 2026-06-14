'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Search, Filter, Trophy, ArrowRight, Share2, Heart, Award, Users, CreditCard, Clock, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import { config } from '@/lib/config';
import api from '@/lib/api';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const result = await api.get('/cms/events');
        if (result.success) {
          setEvents(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-fit bg-background font-sans">
      
      <BreadcrumbBanner
        slug="events"
        fallbackTitle="DOG EVENTS & CHAMPIONSHIPS"
        fallbackSubtitle="Register your dogs in national and international competitions."
        fallbackImage="/images/hero_banner.png"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-12 mt-12">
        <div className="bg-card rounded-[24px] p-4 shadow-sm border border-border flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search Event Name or Club..." 
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card border-transparent focus:bg-card focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all font-medium text-muted-foreground"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            {['Location', 'Breed Group', 'Date', 'Judge', 'Status'].map((filter) => (
              <button key={filter} className="px-4 py-3.5 bg-card hover:bg-input rounded-xl font-semibold text-muted-foreground text-sm flex items-center gap-2 transition-colors border border-transparent">
                {filter} <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          <div className="flex gap-3 ml-auto">
            <Button variant="outline" className="h-[52px] px-6 rounded-xl border-border text-muted-foreground font-bold hover:bg-card">
              <Filter className="w-4 h-4 mr-2" /> More Filters
            </Button>
            <Button className="h-[52px] px-8 rounded-xl bg-card hover:bg-foreground text-background text-foreground font-bold shadow-md shadow-gray-900/10">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Featured Events</h2>
            <p className="text-muted-foreground mt-2 font-medium">Discover top-tier dog shows happening soon.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground">Sort by: Date</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
             <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">No events found.</div>
            ) : events.map((event, i) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
              >
                <div className={`h-[220px] bg-gradient-to-r from-gray-900 to-indigo-900 relative p-5 flex flex-col justify-between overflow-hidden`}>
                  <img src={event.cardImage || event.bannerUrl || '/images/events_banner.png'} alt={event.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 group-hover:opacity-70 transition-opacity" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  
                  <div className="flex justify-between items-start relative z-10 w-full">
                    <span className="inline-block bg-card/90 backdrop-blur-md text-foreground text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      {event.status === 'REGISTRATION_OPEN' ? 'OPEN' : event.status}
                    </span>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-full bg-card/20 hover:bg-card backdrop-blur-md flex items-center justify-center text-foreground hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1 relative">
                  
                  <div className="absolute -top-10 right-6 bg-card rounded-xl shadow-lg border border-border p-2 text-center min-w-[70px]">
                    <span className="block text-brand-orange font-bold text-lg leading-none">{new Date(event.startDate).getDate()}</span>
                    <span className="block text-muted-foreground font-semibold text-xs uppercase">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                  </div>

                  <div className="space-y-4 mb-6 flex-1 pr-16">
                    <div>
                      <h3 className="text-xl font-extrabold text-foreground leading-tight mb-1 group-hover:text-brand-orange transition-colors line-clamp-2">{event.name}</h3>
                      <p className="text-sm font-semibold text-muted-foreground">{event.club?.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-muted-foreground font-medium">
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> <span className="truncate">{event.venue || 'TBA'}</span></div>
                      <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-muted-foreground" /> <span className="truncate">{event.eventType || 'All Breeds'}</span></div>
                      <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-muted-foreground" /> ₹{event.entryFee}</div>
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> Ends: {formatDate(event.registrationWindowEnd)}</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border flex gap-3 mt-auto">
                    <Link href={`/events/${event.slug}`} className="flex-1">
                      <Button variant="outline" className="w-full rounded-xl h-12 font-bold text-muted-foreground border-border hover:bg-card">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/events/${event.slug}/register`} className="flex-1">
                      <Button className="w-full bg-brand-orange hover:bg-orange-600 text-foreground rounded-xl h-12 shadow-md shadow-brand-orange/20 font-bold">
                        Register Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
