'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Trophy, Star, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function ClosedEntriesPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadClosedEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/public/shows?status=COMPLETED&search=${debouncedSearch}&limit=50`);
      if (res.success) {
        setEvents(res.data || res.items || []);
      }
    } catch (err) {
      console.error('Failed to load closed events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClosedEvents();
  }, [debouncedSearch]);

  return (
    <PageContainer>
      <BreadcrumbBanner
        slug="entries/closed"
        fallbackTitle="CLOSED SHOWS ARCHIVE"
        fallbackSubtitle="Browse past Covered Shows, results archives, and Best In Show winners."
        fallbackImage="/images/hero_banner.png"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-12 mt-12">
        <div className="bg-card rounded-[24px] p-5 shadow-sm border border-border flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search Archives..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-background border border-border focus:border-border focus:ring-2 focus:ring-foreground/20 outline-none transition-all font-medium text-foreground"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-[24px] overflow-hidden shadow-sm border border-border h-[450px] animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-muted-foreground py-24 font-bold text-lg">
            No completed events found in the database archive.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, i) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-[24px] overflow-hidden shadow-lg border border-border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative text-foreground"
              >
                <div className="h-[220px] bg-accent relative overflow-hidden flex flex-col justify-between p-5">
                  <img 
                    src={event.bannerUrl || '/images/events_banner.png'} 
                    alt={event.name} 
                    className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-black/55" />
                  <div className="flex justify-between items-start relative z-10 w-full">
                    <span className="inline-block text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider bg-accent/90 text-foreground shadow-sm">
                      ARCHIVED SHOW
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow relative">
                  <div className="absolute -top-10 right-6 bg-card rounded-xl shadow-lg border border-border p-2.5 text-center min-w-[75px] z-10">
                    <span className="block text-foreground font-black text-xl leading-none">{new Date(event.startDate).getDate()}</span>
                    <span className="block text-muted-foreground font-black text-xs uppercase mt-0.5">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                  </div>

                  <div className="space-y-4 mb-6 flex-grow pr-12">
                    <div>
                      <h3 className="text-xl font-black text-foreground leading-tight mb-1 group-hover:text-foreground transition-colors line-clamp-2">{event.name}</h3>
                      <p className="text-sm font-semibold text-muted-foreground">{event.club?.name || 'TBA'}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-y-2 text-sm text-muted-foreground font-semibold">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-foreground shrink-0" /> 
                        <span className="truncate">{event.city ? `${event.city}, ${event.state || ''}` : event.venue || 'TBA'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-foreground shrink-0" /> 
                        <span className="truncate">{event.type || 'Championship Show'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-foreground shrink-0" /> 
                        <span>Status: Completed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border flex gap-3 mt-auto">
                    <Link href={`/events/detail?slug=${event.slug}`} className="w-full">
                      <Button variant="outline" className="w-full rounded-xl h-12 font-bold text-muted-foreground border-border hover:bg-card flex items-center justify-center gap-1.5">
                        View Show Results & Details <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
