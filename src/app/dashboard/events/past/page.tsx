'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Archive, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { config } from '@/lib/config';

export default function PastEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiUrl}/events/past`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-8 space-y-8 text-muted-foreground bg-background min-h-[auto]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Archive className="w-8 h-8 text-muted-foreground" /> Past Events
          </h1>
          <p className="text-muted-foreground">View results, winners, and gallery for completed shows.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search past events..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-[#7C8798] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-all shadow-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-card animate-pulse rounded-2xl border border-border"></div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-xl">
          <Archive className="w-16 h-16 text-[#1E293B] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No Past Events</h3>
          <p className="text-muted-foreground">There are no completed events available to display.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, i) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden group hover:border-[rgba(255,255,255,0.15)] transition-all p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    {new Date(event.startDate).getFullYear()}
                  </span>
                  <h3 className="text-xl font-bold text-foreground leading-tight">{event.name}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center border border-border">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                <MapPin className="w-4 h-4" /> {event.venue}
              </div>

              <div className="flex gap-3">
                <Link href={`/winners?eventId=${event.id}`} className="flex-1">
                  <Button variant="outline" className="w-full border-border hover:bg-accent text-foreground">
                    View Results
                  </Button>
                </Link>
                <Link href={`/gallery?eventId=${event.id}`} className="flex-1">
                  <Button variant="outline" className="w-full border-border hover:bg-accent text-foreground">
                    Gallery
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
