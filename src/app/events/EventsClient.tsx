'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Search, Filter, Trophy, ArrowRight, Share2, Heart, Award, Users, CreditCard, Clock, ChevronDown, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import api, { getImageUrl } from '@/lib/api';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { toTitleCase, formatTitle } from '@/lib/utils';

function EventsPageContent({ initialBannerData }: { initialBannerData?: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRegistrations, setUserRegistrations] = useState<Record<string, any>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/registrations').then(res => {
        if (res.success && res.data) {
          const regMap: Record<string, any> = {};
          res.data.forEach((r: any) => {
            regMap[r.eventId] = r;
          });
          setUserRegistrations(regMap);
        }
      }).catch(err => console.error(err));
    }
  }, []);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedClub, setSelectedClub] = useState(searchParams.get('clubId') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  
  const [selectedMonth, setSelectedMonth] = useState(searchParams.get('month') || '');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '');
  const [fromDate, setFromDate] = useState(searchParams.get('fromDate') || '');
  const [toDate, setToDate] = useState(searchParams.get('toDate') || '');
  const [quickFilter, setQuickFilter] = useState(searchParams.get('quickFilter') || '');
  
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
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

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedClub) params.set('clubId', selectedClub);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedMonth) params.set('month', selectedMonth);
    if (selectedYear) params.set('year', selectedYear);
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    if (quickFilter) params.set('quickFilter', quickFilter);
    if (page > 1) params.set('page', String(page));

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, selectedClub, selectedCity, selectedMonth, selectedYear, fromDate, toDate, quickFilter, page, router, pathname]);

  // Fetch filtered events
  const loadEvents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '12',
        sortBy: 'startDate',
        sortOrder: 'asc',
        isPublic: 'true'
      });

      if (debouncedSearch) queryParams.set('search', debouncedSearch);
      if (selectedClub) queryParams.set('clubId', selectedClub);
      if (selectedCity) queryParams.set('city', selectedCity);

      let effectiveMonth = selectedMonth;
      let effectiveYear = selectedYear;
      let effectiveFromDate = fromDate;
      let effectiveToDate = toDate;

      const today = new Date();
      if (quickFilter === 'upcoming') {
        effectiveFromDate = today.toISOString().split('T')[0];
        effectiveToDate = '';
        effectiveMonth = '';
        effectiveYear = '';
      } else if (quickFilter === 'past') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        effectiveToDate = yesterday.toISOString().split('T')[0];
        effectiveFromDate = '';
        effectiveMonth = '';
        effectiveYear = '';
      } else if (quickFilter === 'this_month') {
        effectiveMonth = String(today.getMonth() + 1);
        effectiveYear = String(today.getFullYear());
        effectiveFromDate = '';
        effectiveToDate = '';
      } else if (quickFilter === 'next_month') {
        let m = today.getMonth() + 2;
        let y = today.getFullYear();
        if (m > 12) { m = 1; y++; }
        effectiveMonth = String(m);
        effectiveYear = String(y);
        effectiveFromDate = '';
        effectiveToDate = '';
      } else if (quickFilter === 'today') {
        effectiveFromDate = today.toISOString().split('T')[0];
        effectiveToDate = today.toISOString().split('T')[0];
        effectiveMonth = '';
        effectiveYear = '';
      }

      if (effectiveMonth) queryParams.set('month', effectiveMonth);
      if (effectiveYear) queryParams.set('year', effectiveYear);
      if (effectiveFromDate) queryParams.set('fromDate', effectiveFromDate);
      if (effectiveToDate) queryParams.set('toDate', effectiveToDate);

      const endpoint = '/public/shows';

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
  }, [page, debouncedSearch, selectedClub, selectedCity, selectedMonth, selectedYear, fromDate, toDate, quickFilter]);

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

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3];

  const scrollToEvents = () => {
    setTimeout(() => {
      document.getElementById('events-listing')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    scrollToEvents();
  };

  const handleQuickFilter = (val: string) => {
    if (quickFilter === val) {
      setQuickFilter('');
    } else {
      setQuickFilter(val);
      // Clear manual date range when clicking quick filters to avoid confusion
      setFromDate('');
      setToDate('');
      setSelectedMonth('');
      setSelectedYear('');
    }
    setPage(1);
    scrollToEvents();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedClub('');
    setSelectedCity('');
    setSelectedMonth('');
    setSelectedYear('');
    setFromDate('');
    setToDate('');
    setQuickFilter('');
    setPage(1);
    scrollToEvents();
  };

  return (
    <PageContainer>
      
      <BreadcrumbBanner
        slug="events"
        fallbackTitle="DOG EVENTS & CHAMPIONSHIPS"
        fallbackSubtitle="Register your dogs in national and international competitions."
        fallbackImage="/images/events_banner.png"
        initialBannerData={initialBannerData}
      />

      {/* Filter / Search Bar */}
      <PublicContainer className="mb-12 mt-6">
        <div className="flex flex-col gap-6">
          
          {/* Row 1: Search Box */}
          <div className="w-full lg:w-[70%]">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search Event Name, Club Name, Location..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-[56px] pl-12 pr-4 rounded-[16px] bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-foreground text-base shadow-sm"
              />
            </div>
          </div>

          {/* Row 2: Quick Filter Tabs */}
          <div className="flex overflow-x-auto pb-2 -mb-2 gap-3 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button onClick={() => handleQuickFilter('upcoming')} className={`shrink-0 h-[44px] px-5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${quickFilter === 'upcoming' ? 'bg-foreground text-background' : 'bg-background border border-border text-foreground hover:bg-muted'}`}>Upcoming Shows</button>
            <button onClick={() => handleQuickFilter('this_month')} className={`shrink-0 h-[44px] px-5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${quickFilter === 'this_month' ? 'bg-foreground text-background' : 'bg-background border border-border text-foreground hover:bg-muted'}`}>This Month</button>
            <button onClick={() => handleQuickFilter('next_month')} className={`shrink-0 h-[44px] px-5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${quickFilter === 'next_month' ? 'bg-foreground text-background' : 'bg-background border border-border text-foreground hover:bg-muted'}`}>Next Month</button>
            <button onClick={() => handleQuickFilter('today')} className={`shrink-0 h-[44px] px-5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${quickFilter === 'today' ? 'bg-foreground text-background' : 'bg-background border border-border text-foreground hover:bg-muted'}`}>Today's Events</button>
            <button onClick={() => handleQuickFilter('past')} className={`shrink-0 h-[44px] px-5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${quickFilter === 'past' ? 'bg-foreground text-background' : 'bg-background border border-border text-foreground hover:bg-muted'}`}>Past Events</button>
          </div>

          {/* Row 3: Dropdowns */}
          <div className="flex flex-col md:flex-row flex-wrap gap-3 items-center w-full">
            <select
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(e.target.value); setQuickFilter(''); setPage(1); scrollToEvents(); }}
              className="h-[44px] px-4 bg-background border border-border rounded-xl text-sm font-medium text-muted-foreground outline-none focus:border-primary w-full md:w-auto"
            >
              <option value="">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setQuickFilter(''); setPage(1); scrollToEvents(); }}
              className="h-[44px] px-4 bg-background border border-border rounded-xl text-sm font-medium text-muted-foreground outline-none focus:border-primary w-full md:w-auto"
            >
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <select
              value={selectedClub}
              onChange={(e) => { setSelectedClub(e.target.value); setPage(1); scrollToEvents(); }}
              className="h-[44px] px-4 bg-background border border-border rounded-xl text-sm font-medium text-muted-foreground outline-none focus:border-primary w-full md:w-auto"
            >
              <option value="">All Clubs</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setPage(1); scrollToEvents(); }}
              className="h-[44px] px-4 bg-background border border-border rounded-xl text-sm font-medium text-muted-foreground outline-none focus:border-primary w-full md:w-auto"
            >
              <option value="">All Locations</option>
              {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <div className="flex items-center gap-2 h-[44px] bg-background border border-border rounded-xl px-3 w-full md:w-auto">
              <input 
                type="date" 
                value={fromDate} 
                onChange={e => { setFromDate(e.target.value); setQuickFilter(''); setPage(1); scrollToEvents(); }} 
                className="bg-transparent outline-none w-full text-sm font-medium text-muted-foreground min-w-[110px]" 
              />
              <span className="text-muted-foreground font-bold">-</span>
              <input 
                type="date" 
                value={toDate} 
                onChange={e => { setToDate(e.target.value); setQuickFilter(''); setPage(1); scrollToEvents(); }} 
                className="bg-transparent outline-none w-full text-sm font-medium text-muted-foreground min-w-[110px]" 
              />
            </div>

            <button 
              onClick={resetFilters}
              className="h-[44px] px-6 rounded-xl border border-border text-muted-foreground font-bold hover:bg-muted w-full md:w-auto bg-background transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </PublicContainer>

      {/* Shows Grid */}
      <PublicContainer className="pb-20" id="events-listing">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Dog Show Events</h2>
            <p className="text-muted-foreground mt-2 font-medium">Browse dynamic show schedules, dates, and locations.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-card rounded-[24px] overflow-hidden shadow-sm border border-border h-[320px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-24 font-bold text-lg">
                No dog shows match the selected filters.
              </div>
            ) : events.map((event, i) => {
              const showDate = new Date(event.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
              });
              const isRegistered = !!userRegistrations[event.id];
              const isClosed = event.status === 'CLOSED' || event.status === 'COMPLETED' || (event.registrationWindowEnd && new Date(event.registrationWindowEnd) < new Date());
              const isOpen = (event.status === 'REGISTRATION_OPEN' || event.status === 'ACTIVE') && !isClosed;
              
              const regFee = event.paymentSettings?.registrationFee ?? event.entryFee ?? 1500;
              const closingDate = event.registrationWindowEnd 
                ? new Date(event.registrationWindowEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A';

              return (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-[24px] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top section: banner image + status badge */}
                  <div className="w-full h-[150px] relative overflow-hidden bg-muted">
                    <OptimizedImage 
                      src={event.bannerUrl || '/images/events_banner.png'} 
                      alt={event.name} 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className={`inline-block text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                        isRegistered ? 'bg-green-600 text-white' : isClosed ? 'bg-red-600 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {isRegistered ? 'Registered ✓' : isClosed ? 'Registration Closed' : 'Registration Open'}
                      </span>
                    </div>
                  </div>

                  {/* Middle section: info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-border bg-white overflow-hidden flex items-center justify-center shrink-0">
                        {event.club?.logoUrl ? (
                          <img 
                            src={getImageUrl(event.club.logoUrl)} 
                            alt={event.club.name || 'Club Logo'} 
                            className="w-full h-full object-contain p-0.5"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/placeholder.webp';
                            }}
                          />
                        ) : (
                          <span className="text-xs font-black text-primary">
                            {(event.club?.name || 'KC').split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-black text-primary uppercase tracking-wider block truncate">
                          {event.club?.name || 'Kennel Club'}
                        </span>
                        <h4 className="text-sm font-bold text-foreground truncate mt-0.5" title={event.name}>
                          {formatTitle(event.name)}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground border-t border-b border-border/40 py-2.5">
                      <div className="flex justify-between">
                        <span>Event Date:</span>
                        <span className="font-bold text-foreground">{showDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Entry Fee:</span>
                        <span className="font-bold text-foreground">₹{regFee} / Dog</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Closing Date:</span>
                        <span className="font-bold text-red-500">{closingDate}</span>
                      </div>
                    </div>

                    {/* Bottom section: action buttons */}
                    <div className="flex gap-2 pt-1 w-full">
                      {isRegistered ? (
                        <Link href="/dashboard/events/registered" className="w-full">
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                            View Registration
                          </Button>
                        </Link>
                      ) : (
                        <>
                          <Link href={`/events/detail/${event.slug}`} className="flex-1">
                            <Button variant="outline" className="w-full border-border hover:bg-accent text-foreground font-bold text-xs py-2.5 rounded-xl">
                              View Details
                            </Button>
                          </Link>
                          {isOpen ? (
                            <Link href={`/events/detail/${event.slug}?register=true`} className="flex-1">
                              <Button className="w-full bg-[#38BDF8] hover:bg-blue-500 text-foreground font-bold text-xs py-2.5 rounded-xl">
                                Register Now
                              </Button>
                            </Link>
                          ) : (
                            <Button disabled className="flex-1 bg-muted text-muted-foreground font-bold text-xs py-2.5 rounded-xl">
                              Closed
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="border-border text-foreground hover:bg-card"
            >
              Previous
            </Button>
            <span className="text-sm font-bold text-muted-foreground px-4">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
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

export default function EventsClient({ initialBannerData }: { initialBannerData?: any }) {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center font-bold text-muted-foreground">Loading Calendar...</div>}>
      <EventsPageContent initialBannerData={initialBannerData} />
    </Suspense>
  );
}
