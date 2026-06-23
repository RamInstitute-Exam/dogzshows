'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Filter, ChevronDown, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Tent, Users, CalendarDays, Award } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import api from '@/lib/api';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';

export default function ClubsClient() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') || '';

  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [breedFilter, setBreedFilter] = useState('');
  const [kciApproved, setKciApproved] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      // Added a cache buster timestamp to instantly invalidate the old 24h stale cache
      let url = `/public/clubs?page=${page}&limit=20&status=ACTIVE&_cb=${Date.now()}`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (stateFilter) url += `&state=${encodeURIComponent(stateFilter)}`;
      if (cityFilter) url += `&city=${encodeURIComponent(cityFilter)}`;
      if (breedFilter) url += `&breed=${encodeURIComponent(breedFilter)}`;
      if (kciApproved) url += `&kciApproved=true`;
      if (typeParam) url += `&type=${encodeURIComponent(typeParam)}`;
      if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;
      
      const res = await api.get(url);
      if (res.success) {
        const rawClubs = res.data || res.clubs || [];
        const uniqueClubs = Array.from(
          new Map(
            rawClubs.map((club: any) => [
              (club.name || '').trim().toLowerCase(),
              club
            ])
          ).values()
        );
        setClubs(uniqueClubs);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || res.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to load clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/public/clubs/locations');
        if (res.success && res.data) {
          setAvailableStates(res.data.states || []);
          setAvailableCities(res.data.cities || []);
        }
      } catch (error) {
        console.error('Failed to load locations:', error);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [typeParam]);

  useEffect(() => {
    fetchClubs();
  }, [page, debouncedSearch, stateFilter, cityFilter, breedFilter, kciApproved, sortBy, typeParam]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <PageContainer>
      <BreadcrumbBanner
        slug="clubs"
        fallbackTitle={
          typeParam.toLowerCase() === 'all-breeds' ? 'All Breeds Clubs' :
          typeParam.toLowerCase() === 'specialty' ? 'Specialty Clubs' :
          typeParam.toLowerCase() === 'kennel' ? 'Kennel Clubs' :
          typeParam.toLowerCase() === 'state' ? 'State Clubs' : 'Club Directory'
        }
        fallbackSubtitle="Discover registered kennel clubs across India. Connect with local chapters for events, dog shows, and community support."
        fallbackImage="/images/dogshows_banner.png"
      />

      {/* Filters Bar */}
      <section className="py-6 border-b border-border bg-card/50 backdrop-blur-md sticky top-[var(--nav-height, 84px)] z-40 shadow-sm">
        <PublicContainer>
          <div className="flex flex-col lg:flex-row items-center gap-4 justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clubs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-foreground outline-none text-foreground"
              />
            </div>

            {/* Filter Toggle & Sort */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl font-medium transition-colors flex-1 lg:flex-none justify-center ${isFilterOpen ? 'bg-foreground text-white border-border' : 'bg-background border-border text-foreground hover:bg-accent'}`}
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
              
              <div className="relative flex-1 lg:flex-none">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 appearance-none bg-background border border-border rounded-xl font-medium text-foreground focus:ring-2 focus:ring-foreground outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name_asc">Name (A-Z)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">State</label>
                  <select value={stateFilter} onChange={(e) => { setStateFilter(e.target.value); setPage(1); }} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground">
                    <option value="">All States</option>
                    {availableStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">City</label>
                  <select value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setPage(1); }} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground">
                    <option value="">All Cities</option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Breed Focus</label>
                  <input type="text" value={breedFilter} onChange={(e) => { setBreedFilter(e.target.value); setPage(1); }} placeholder="e.g. German Shepherd" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
                <div className="flex items-end pb-2.5">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${kciApproved ? 'bg-foreground border-border' : 'border-border group-hover:border-border'}`}>
                      {kciApproved && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-foreground">KCI Approved Only</span>
                    <input type="checkbox" className="hidden" checked={kciApproved} onChange={(e) => { setKciApproved(e.target.checked); setPage(1); }} />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PublicContainer>
      </section>

      {/* Listing Section */}
      <section className="py-12 bg-background min-h-[500px]">
        <PublicContainer>
          
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Results <span className="text-muted-foreground font-normal text-sm ml-2">({totalCount} clubs found)</span></h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="animate-pulse bg-card rounded-2xl border border-border h-[340px]"></div>
              ))}
            </div>
          ) : clubs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {clubs.map((club, idx) => (
                <motion.div
                  key={club.id}
                  className="h-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Link
                    href={`/clubs/${club.slug || club.id}`}
                    className="group relative flex flex-col h-full bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#222222] rounded-2xl p-6 transition-all duration-[350ms] ease-in-out cursor-pointer hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-[0_10px_30px_rgba(255,255,255,0.06)]"
                  >


                    {/* Logo Area */}
                    <div className="flex justify-center pt-6 pb-4 relative">
                      <div className="w-[90px] h-[90px] rounded-full bg-white dark:bg-[#111111] border-[3px] border-[#E5E7EB] dark:border-[#222222] group-hover:border-border shadow-md overflow-hidden flex items-center justify-center transition-all duration-[350ms] ease group-hover:scale-108 group-hover:rotate-[5deg] shrink-0 relative">
                        {club.logoUrl ? (
                          <Image 
                            src={getImageUrl(club.logoUrl)} 
                            alt={club.name} 
                            width={90} 
                            height={90} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Tent className="w-10 h-10 text-foreground/60" />
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-grow flex flex-col items-center text-center">
                      <h3 className="text-lg font-bold text-[#111111] dark:text-white mb-2 line-clamp-2 min-h-[3rem] flex items-center justify-center text-center font-outfit">
                        {club.name}
                      </h3>
                      
                      <div className="flex items-center text-sm text-muted-foreground mb-4 justify-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-foreground" />
                        <span className="line-clamp-1">{club.city ? `${club.city}, ` : ''}{club.state || 'India'}</span>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 text-center min-h-[2.5rem] overflow-hidden">
                        {club.description || 'A registered kennel club organizing dog shows and events.'}
                      </p>

                      {/* Stats Section */}
                      {((club.memberCount || 0) > 0 || (club.eventCount || 0) > 0) && (
                        <div className="grid grid-cols-2 gap-3 w-full mt-auto">
                          <div className="bg-[#F8F8F8] dark:bg-[#1A1A1A] rounded-xl p-2.5 flex flex-col items-center justify-center border border-[#E5E7EB] dark:border-[#222222]">
                            <div className="flex items-center gap-1.5 text-foreground mb-0.5">
                              <Users className="w-4 h-4" />
                              <span className="font-bold text-base leading-none">{club.memberCount || 0}</span>
                            </div>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Members</span>
                          </div>
                          <div className="bg-[#F8F8F8] dark:bg-[#1A1A1A] rounded-xl p-2.5 flex flex-col items-center justify-center border border-[#E5E7EB] dark:border-[#222222]">
                            <div className="flex items-center gap-1.5 text-blue-500 mb-0.5">
                              <CalendarDays className="w-4 h-4" />
                              <span className="font-bold text-base leading-none">{club.eventCount || 0}</span>
                            </div>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Events</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-3xl border border-border">
              <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-6 border border-border">
                <Tent className="w-10 h-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {typeParam ? "No clubs available in this category." : "No Clubs Found"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                {typeParam 
                  ? "Check back later or browse other categories." 
                  : "We couldn't find any clubs matching your current filters. Try adjusting your search terms or clearing the filters."}
              </p>
              {!typeParam && (
                <button 
                  onClick={() => { setSearch(''); setStateFilter(''); setCityFilter(''); setBreedFilter(''); setKciApproved(false); }}
                  className="bg-foreground text-background font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12 gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex flex-wrap items-center justify-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 shrink-0 rounded-lg text-sm font-bold transition-colors ${
                      page === i + 1 
                        ? 'bg-foreground text-white border-transparent' 
                        : 'border border-border bg-card text-foreground hover:bg-accent'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </PublicContainer>
      </section>
    </PageContainer>
  );
}
