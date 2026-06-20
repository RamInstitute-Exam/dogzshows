'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Search, Filter, Trophy, ArrowRight, Share2, Heart, Award, Users, CreditCard, Clock, ChevronDown, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import api from '@/lib/api';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load clubs once for filter
  useEffect(() => {
    async function loadClubs() {
      try {
        const res = await api.get('/public/shows/active-clubs');
        if (res.success) {
          setClubs(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load clubs:', err);
      }
    }
    loadClubs();
  }, []);

  // Load cities once for filter
  useEffect(() => {
    async function loadCities() {
      try {
        const res = await api.get('/public/shows/active-cities');
        if (res.success) {
          setCities(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    }
    loadCities();
  }, []);

  // Fetch filtered events
  const loadEvents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '12',
        search: debouncedSearch,
        clubId: selectedClub,
        city: selectedCity,
      });

      const endpoint = '/public/shows/upcoming';

      const res = await api.get(`${endpoint}?${queryParams.toString()}`);
      if (res.success) {
        let fetchedEvents = res.data || res.items || [];
        
        // Guarantee strict ascending chronological sorting & push past events to the bottom
        fetchedEvents = [...fetchedEvents].sort((a: any, b: any) => {
          const aDate = new Date(a.startDate).getTime();
          const bDate = new Date(b.startDate).getTime();
          const now = new Date().setHours(0, 0, 0, 0);
          
          const aIsPast = aDate < now;
          const bIsPast = bDate < now;
          
          if (aIsPast && !bIsPast) return 1;
          if (!aIsPast && bIsPast) return -1;
          
          return aDate - bDate;
        });

        setEvents(fetchedEvents);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [page, debouncedSearch, selectedClub, selectedCity]);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get list of unique cities from existing shows for filters
  const uniqueCities = cities;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'REGISTRATION_OPEN':
        return 'bg-green-500 text-white';
      case 'ONGOING':
        return 'bg-yellow-500 text-foreground';
      case 'COMPLETED':
        return 'bg-blue-500 text-white';
      case 'CANCELLED':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'REGISTRATION_OPEN') return 'REGISTRATION OPEN';
    return status;
  };

  return (
    <PageContainer>
      
      <BreadcrumbBanner
        slug="events"
        fallbackTitle="DOG EVENTS & CHAMPIONSHIPS"
        fallbackSubtitle="Register your dogs in national and international competitions."
        fallbackImage="/images/events_banner.png"
      />

      {/* Filter / Search Bar */}
      <PublicContainer className="mb-12 mt-12">
        <div className="bg-card rounded-[24px] p-5 shadow-sm border border-border flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search Event Name or Club..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-foreground"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Club filter */}
            <select
              value={selectedClub}
              onChange={(e) => { setSelectedClub(e.target.value); setPage(1); }}
              className="px-4 py-3.5 bg-background border border-border rounded-xl font-semibold text-muted-foreground text-sm outline-none focus:border-primary"
            >
              <option value="">All Clubs</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {/* City/Location filter */}
            <select
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }}
              className="px-4 py-3.5 bg-background border border-border rounded-xl font-semibold text-muted-foreground text-sm outline-none focus:border-primary"
            >
              <option value="">All Locations</option>
              {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex gap-3 ml-auto">
            <Button 
              onClick={() => {
                setSearch('');
                setSelectedClub('');
                setSelectedCity('');
                setPage(1);
              }}
              variant="outline" 
              className="h-[52px] px-6 rounded-xl border-border text-muted-foreground font-bold hover:bg-card"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </PublicContainer>

      {/* Shows Grid */}
      <PublicContainer className="pb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Dog Show Events</h2>
            <p className="text-muted-foreground mt-2 font-medium">Browse dynamic show schedules, dates, and locations.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="bg-card rounded-[24px] overflow-hidden shadow-sm border border-border h-[450px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {events.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-24 font-bold text-lg">
                No dog shows match the selected filters.
              </div>
            ) : events.map((event, i) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/events/detail?slug=${event.slug}`}
                  className="bg-card rounded-[24px] overflow-hidden border border-border hover:border-primary/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease flex flex-col group relative text-foreground h-full cursor-pointer block"
                >
                  <div className="h-[220px] bg-accent relative overflow-hidden flex flex-col justify-between p-5 w-full">
                    <img 
                      src={event.bannerUrl || '/images/events_banner.png'} 
                      alt={event.name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    
                    <div className="flex justify-between items-start relative z-10 w-full">
                      <span className={`inline-block text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm ${getStatusBadgeClass(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1 relative w-full">
                    {/* Date Badge */}
                    <div className="absolute -top-10 right-6 bg-card rounded-xl shadow-lg border border-border p-2.5 text-center min-w-[75px] z-10">
                      <span className="block text-primary font-black text-xl leading-none">{new Date(event.startDate).getDate()}</span>
                      <span className="block text-muted-foreground font-black text-xs uppercase mt-0.5">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                    </div>

                    <div className="space-y-4 flex-1 pr-6">
                      <div>
                        <h3 className="text-xl font-black text-foreground leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">{event.name}</h3>
                        <p className="text-sm font-semibold text-muted-foreground">{event.club?.name || 'TBA'}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-y-2 text-sm text-muted-foreground font-semibold">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary shrink-0" /> 
                          <span className="truncate">{event.city ? `${event.city}, ${event.state || ''}` : event.venue || 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-primary shrink-0" /> 
                          <span className="truncate">{event.type || 'Championship Show'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="border-border text-foreground hover:bg-card"
            >
              Previous
            </Button>
            <span className="text-sm font-bold text-muted-foreground px-4">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="border-border text-foreground hover:bg-card"
            >
              Next
            </Button>
          </div>
        )}
      </PublicContainer>
    </PageContainer>
  );
}
