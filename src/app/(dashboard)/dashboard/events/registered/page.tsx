'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Search, MapPin, Receipt, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { config } from '@/lib/config';

export default function RegisteredEvents() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('${config.apiUrl}/events/registered', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(r => r.event.name.toLowerCase().includes(search.toLowerCase()) || r.dog.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-8 space-y-8 text-muted-foreground bg-background min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" /> Registered Events
          </h1>
          <p className="text-muted-foreground">Track your upcoming shows and download entry passes.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by event or dog name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-[#7C8798] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-all shadow-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-card animate-pulse rounded-2xl border border-border"></div>
          ))}
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-xl">
          <Calendar className="w-16 h-16 text-[#1E293B] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No Registered Events</h3>
          <p className="text-muted-foreground mb-6">You haven't registered any dogs for an upcoming event yet.</p>
          <Link href="/dashboard/events/upcoming">
            <Button className="bg-brand-orange hover:bg-orange-600 text-foreground">Browse Upcoming Events</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRegistrations.map((reg, i) => (
            <motion.div 
              key={reg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-xl flex flex-col md:flex-row items-center gap-6"
            >
              <div className="w-full md:w-auto md:flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${reg.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'}`}>
                    {reg.status}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">{new Date(reg.event.startDate).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">{reg.event.name}</h3>
                <p className="text-muted-foreground text-sm flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4" /> {reg.event.venue}
                </p>
                <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border inline-flex">
                  <span className="text-muted-foreground text-sm">Dog Entry:</span>
                  <span className="text-foreground font-bold">{reg.dog.name}</span>
                  <span className="text-brand-orange text-xs uppercase ml-2">{reg.dog.kciNumber}</span>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-none border-border hover:bg-accent text-foreground">
                  <Receipt className="w-4 h-4 mr-2" /> Invoice
                </Button>
                {reg.status === 'CONFIRMED' && (
                  <Button className="flex-1 md:flex-none bg-[#38BDF8] hover:bg-blue-500 text-foreground font-bold">
                    <ExternalLink className="w-4 h-4 mr-2" /> Digital Pass
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
