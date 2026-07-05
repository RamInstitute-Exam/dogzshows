'use client';

import { EventService } from '@/services/event.service';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, MapPin, ArrowRight, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

export default function UpcomingEvents() {
  const { showLoader, hideLoader } = useGlobalLoading();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    showLoader();
    try {
      const data = await EventService.getUpcomingEvents();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const filteredEvents = events.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-8 space-y-8 text-muted-foreground bg-background min-h-[auto]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-foreground" /> Upcoming Events
          </h1>
          <p className="text-muted-foreground">Browse and register for upcoming KCI certified dog shows.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search events by name or location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-[#7C8798] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-all shadow-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-card animate-pulse rounded-2xl border border-border"></div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-xl">
          <Calendar className="w-16 h-16 text-[#1E293B] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No upcoming events</h3>
          <p className="text-muted-foreground">There are currently no active events matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, i) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden group hover:border-[rgba(255,255,255,0.15)] transition-all flex flex-col"
            >
              <div className="h-48 bg-card relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent z-10" />
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/20 backdrop-blur-md">
                    Registration Open
                  </span>
                </div>
                {/* Placeholder Event Image */}
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-all duration-500 transform group-hover:scale-105" />
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">{event.club?.name || 'KCI Official'}</p>
                  <h3 className="text-xl font-bold text-foreground line-clamp-2 leading-tight mb-2">{event.name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" /> {event.venue}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 mt-auto pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Event Date</p>
                    <p className="text-sm font-bold text-foreground">{new Date(event.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Entry Fee</p>
                    <p className="text-sm font-bold text-foreground">₹{event.entryFee}</p>
                  </div>
                </div>

                <Link href={`/events/detail/${event.slug || event.id}`}>
                  <Button className="w-full bg-card text-foreground hover:bg-foreground hover:text-foreground transition-all font-bold">
                    View Details <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
