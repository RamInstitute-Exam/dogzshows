'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Filter, ChevronDown, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Tent, Users, CalendarDays, Award } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import api from '@/lib/api';

export default function ClubsClient() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [breedFilter, setBreedFilter] = useState('');
  const [kciApproved, setKciApproved] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const fetchClubs = async () => {
    setLoading(true);
    try {
      let url = `/public/clubs?page=${page}&limit=12&status=ACTIVE`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (stateFilter) url += `&state=${encodeURIComponent(stateFilter)}`;
      if (breedFilter) url += `&breed=${encodeURIComponent(breedFilter)}`;
      if (kciApproved) url += `&kciApproved=true`;
      
      const res = await api.get(url);
      if (res.success) {
        setClubs(res.data || res.clubs || []);
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
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchClubs();
  }, [page, debouncedSearch, stateFilter, breedFilter, kciApproved, sortBy]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden border-b border-border bg-black">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-brand-orange/20 blur-[120px]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white">
              Club <span className="text-brand-orange">Directory</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Discover registered kennel clubs across India. Connect with local chapters for events, dog shows, and community support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="py-6 border-b border-border bg-card/50 backdrop-blur-md sticky top-[var(--nav-height, 84px)] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-4 justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clubs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-orange outline-none text-foreground"
              />
            </div>

            {/* Filter Toggle & Sort */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl font-medium transition-colors flex-1 lg:flex-none justify-center ${isFilterOpen ? 'bg-brand-orange text-white border-brand-orange' : 'bg-background border-border text-foreground hover:bg-accent'}`}
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
              
              <div className="relative flex-1 lg:flex-none">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 appearance-none bg-background border border-border rounded-xl font-medium text-foreground focus:ring-2 focus:ring-brand-orange outline-none"
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
                className="overflow-hidden mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">State</label>
                  <select value={stateFilter} onChange={(e) => { setStateFilter(e.target.value); setPage(1); }} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground">
                    <option value="">All States</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Breed Focus</label>
                  <input type="text" value={breedFilter} onChange={(e) => { setBreedFilter(e.target.value); setPage(1); }} placeholder="e.g. German Shepherd" className="w-full p-2.5 bg-background border border-border rounded-lg text-sm text-foreground" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${kciApproved ? 'bg-brand-orange border-brand-orange' : 'border-border group-hover:border-brand-orange'}`}>
                      {kciApproved && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-foreground">KCI Approved Only</span>
                    <input type="checkbox" className="hidden" checked={kciApproved} onChange={(e) => { setKciApproved(e.target.checked); setPage(1); }} />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Listing Section */}
      <section className="py-12 bg-background min-h-[500px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Results <span className="text-muted-foreground font-normal text-sm ml-2">({totalCount} clubs found)</span></h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-card rounded-2xl border border-border h-[400px]"></div>
              ))}
            </div>
          ) : clubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clubs.map((club, idx) => (
                <motion.div 
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-40 bg-accent overflow-hidden">
                    {club.bannerUrl ? (
                      <img src={club.bannerUrl} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-orange/20 to-orange-600/10 flex items-center justify-center">
                        <Tent className="w-12 h-12 text-brand-orange/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                      {club.kciApproved && (
                        <div className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-md">
                          <CheckCircle2 className="w-3 h-3" /> KCI Approved
                        </div>
                      )}
                      {club.establishedYear && (
                        <div className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                          Est. {club.establishedYear}
                        </div>
                      )}
                    </div>

                    {/* Logo */}
                    <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-xl bg-card border-4 border-card shadow-lg overflow-hidden flex items-center justify-center z-10">
                      {club.logoUrl ? (
                        <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="bg-brand-orange text-white font-bold text-xl flex items-center justify-center w-full h-full">
                          {club.name.substring(0,2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-10 flex-1 flex flex-col">
                    <h3 className="text-xl font-extrabold text-foreground mb-1 line-clamp-1 group-hover:text-brand-orange transition-colors">
                      <Link href={`/clubs/${club.slug || club.id}`} className="focus:outline-none before:absolute before:inset-0">
                        {club.name}
                      </Link>
                    </h3>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-brand-orange" />
                      <span className="line-clamp-1">{club.city ? `${club.city}, ` : ''}{club.state || 'India'}</span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                      {club.description || 'A registered kennel club organizing dog shows and events.'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-accent/50 rounded-xl p-3 flex flex-col items-center justify-center border border-border/50">
                        <div className="flex items-center gap-1.5 text-brand-orange mb-1">
                          <Users className="w-4 h-4" />
                          <span className="font-bold text-lg leading-none">{club.memberCount || 0}</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Members</span>
                      </div>
                      <div className="bg-accent/50 rounded-xl p-3 flex flex-col items-center justify-center border border-border/50">
                        <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                          <CalendarDays className="w-4 h-4" />
                          <span className="font-bold text-lg leading-none">{club.eventCount || 0}</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Events</span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <button className="w-full py-2.5 bg-accent text-foreground font-semibold rounded-xl group-hover:bg-brand-orange group-hover:text-white transition-colors flex items-center justify-center gap-2">
                        View Profile
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-3xl border border-border">
              <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-6 border border-border">
                <Tent className="w-10 h-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No Clubs Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                We couldn't find any clubs matching your current filters. Try adjusting your search terms or clearing the filters.
              </p>
              <button 
                onClick={() => { setSearch(''); setStateFilter(''); setBreedFilter(''); setKciApproved(false); }}
                className="bg-foreground text-background font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                Clear All Filters
              </button>
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
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                      page === i + 1 
                        ? 'bg-brand-orange text-white border-transparent' 
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
        </div>
      </section>
    </PageContainer>
  );
}
