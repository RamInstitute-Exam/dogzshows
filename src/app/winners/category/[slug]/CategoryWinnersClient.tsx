'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PublicContainer from '@/components/layout/PublicContainer';
import PageContainer from '@/components/layout/PageContainer';
import WinnerCertificateCard from '@/components/winners/WinnerCertificateCard';
import api, { getImageUrl } from '@/lib/api';
import { Search, MapPin, SlidersHorizontal, Trophy, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryWinnersClientProps {
  category: any;
  initialEvents: any[];
  initialClubs: any[];
  initialBreeds: any[];
}

export default function CategoryWinnersClient({
  category,
  initialEvents,
  initialClubs,
  initialBreeds
}: CategoryWinnersClientProps) {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedClubId, setSelectedClubId] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  
  // Mobile drawer state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  const fetchWinners = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit,
        categorySlug: category.slug,
        isPublic: 'true'
      };

      if (searchQuery.trim()) params.search = searchQuery;
      if (selectedYear !== 'All') params.year = selectedYear;
      if (selectedEventId) params.eventId = selectedEventId;
      if (selectedClubId) params.clubId = selectedClubId;
      if (selectedBreed) params.breed = selectedBreed;
      if (locationSearch.trim()) params.location = locationSearch;

      const res = await api.get('/public/winners', params);
      if (res.success) {
        setWinners(res.data || res.items || []);
        setTotalPages(res.totalPages || 1);
      } else {
        toast.error('Failed to load winners');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching winners');
    } finally {
      setLoading(false);
    }
  }, [category.slug, page, searchQuery, selectedYear, selectedEventId, selectedClubId, selectedBreed, locationSearch]);

  // Refetch when filters or page changes
  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  // Reset to page 1 on filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setPage(1);
    if (filterType === 'year') setSelectedYear(value);
    if (filterType === 'event') setSelectedEventId(value);
    if (filterType === 'club') setSelectedClubId(value);
    if (filterType === 'breed') setSelectedBreed(value);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedYear('All');
    setSelectedEventId('');
    setSelectedClubId('');
    setSelectedBreed('');
    setLocationSearch('');
    setPage(1);
    toast.success('Filters reset successfully');
  };

  return (
    <PageContainer>
      {/* Dynamic Hero Banner */}
      <div className="relative bg-zinc-950 pt-36 pb-20 border-b border-border/40 overflow-hidden">
        {/* Background images or gradients */}
        {category.bannerImage ? (
          <div className="absolute inset-0 z-0">
            <img 
              src={getImageUrl(category.bannerImage)} 
              alt={category.name} 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/80 to-zinc-950"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-zinc-950 to-zinc-950 opacity-40 z-0" />
        )}

        <PublicContainer className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-3xl mb-4">
            {category.icon || '🏆'}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase">
            {category.name} <span className="text-amber-500">Winners</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
            {category.description || `Explore all ${category.name} champions from dog shows conducted across India.`}
          </p>
        </PublicContainer>
      </div>

      <PublicContainer className="py-12 space-y-8 relative z-10">
        
        {/* Filter Bar */}
        <div className="bg-zinc-900/60 backdrop-blur border border-border/80 p-5 rounded-2xl shadow-xl space-y-4">
          
          {/* Top Row: Search and Mobile Filter Toggle */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search Dog, Owner, Breeder or Award Title..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-border/50 rounded-xl text-sm focus:border-amber-500 outline-none text-foreground placeholder:text-muted-foreground/60 transition"
              />
            </div>

            {/* Location Input */}
            <div className="relative w-full md:w-64">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Filter Location (City, State)..."
                value={locationSearch}
                onChange={(e) => { setLocationSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-border/50 rounded-xl text-sm focus:border-amber-500 outline-none text-foreground placeholder:text-muted-foreground/60 transition"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setShowMobileFilters(p => !p)}
              className="md:hidden flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition border border-border/30"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Desktop Filters: Dropdowns */}
          <div className={`hidden md:grid grid-cols-5 gap-4 pt-4 border-t border-border/30 items-end`}>
            
            {/* Year Filters */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider mb-2">Show Year</label>
              <select 
                value={selectedYear}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-border/50 rounded-xl text-xs focus:border-amber-500 outline-none"
              >
                <option value="All">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>

            {/* Event Dropdown */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider mb-2">Show Event</label>
              <select 
                value={selectedEventId}
                onChange={(e) => handleFilterChange('event', e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-border/50 rounded-xl text-xs focus:border-amber-500 outline-none text-ellipsis"
              >
                <option value="">All Events</option>
                {initialEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            {/* Club Dropdown */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider mb-2">Kennel Club</label>
              <select 
                value={selectedClubId}
                onChange={(e) => handleFilterChange('club', e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-border/50 rounded-xl text-xs focus:border-amber-500 outline-none text-ellipsis"
              >
                <option value="">All Clubs</option>
                {initialClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Breed Dropdown */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider mb-2">Dog Breed</label>
              <select 
                value={selectedBreed}
                onChange={(e) => handleFilterChange('breed', e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-border/50 rounded-xl text-xs focus:border-amber-500 outline-none"
              >
                <option value="">All Breeds</option>
                {initialBreeds.map((b, idx) => <option key={b.id || idx} value={b.name}>{b.name}</option>)}
              </select>
            </div>

            {/* Reset Button */}
            <button 
              onClick={handleResetFilters}
              className="py-2 px-3 bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-red-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

          </div>

          {/* Mobile Filters Drawer */}
          {showMobileFilters && (
            <div className="md:hidden pt-4 border-t border-border/30 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                
                {/* Year Select */}
                <div>
                  <label className="block text-[9px] font-black uppercase text-muted-foreground mb-1.5">Year</label>
                  <select 
                    value={selectedYear}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-border/50 rounded-xl text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="All">All Years</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>

                {/* Breed Select */}
                <div>
                  <label className="block text-[9px] font-black uppercase text-muted-foreground mb-1.5">Breed</label>
                  <select 
                    value={selectedBreed}
                    onChange={(e) => handleFilterChange('breed', e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-border/50 rounded-xl text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="">All Breeds</option>
                    {initialBreeds.map((b, idx) => <option key={b.id || idx} value={b.name}>{b.name}</option>)}
                  </select>
                </div>

              </div>

              {/* Event Select */}
              <div>
                <label className="block text-[9px] font-black uppercase text-muted-foreground mb-1.5">Show Event</label>
                <select 
                  value={selectedEventId}
                  onChange={(e) => handleFilterChange('event', e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-border/50 rounded-xl text-xs focus:border-amber-500 outline-none"
                >
                  <option value="">All Events</option>
                  {initialEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              {/* Club Select */}
              <div>
                <label className="block text-[9px] font-black uppercase text-muted-foreground mb-1.5">Kennel Club</label>
                <select 
                  value={selectedClubId}
                  onChange={(e) => handleFilterChange('club', e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-border/50 rounded-xl text-xs focus:border-amber-500 outline-none"
                >
                  <option value="">All Clubs</option>
                  {initialClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Reset Button */}
              <button 
                onClick={() => { handleResetFilters(); setShowMobileFilters(false); }}
                className="w-full py-2.5 bg-red-950/30 text-red-400 font-bold rounded-xl text-xs border border-red-500/20 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Filters</span>
              </button>

            </div>
          )}

        </div>

        {/* Winners Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10 max-w-[1600px] mx-auto px-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-zinc-900/40 rounded-2xl aspect-[4/5] animate-pulse border border-border/30" />
            ))}
          </div>
        ) : winners.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/20 border border-dashed border-border/50 rounded-3xl space-y-3">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <h3 className="text-lg font-bold text-foreground">No Champions Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">We couldn't find any winners matching your filters. Try resetting search parameters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10 max-w-[1600px] mx-auto px-4">
            {winners.map((winner) => (
              <WinnerCertificateCard 
                key={winner.id} 
                winner={winner} 
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-zinc-800 disabled:opacity-30 text-foreground hover:text-amber-500 rounded-lg border border-border/40 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 bg-zinc-800 disabled:opacity-30 text-foreground hover:text-amber-500 rounded-lg border border-border/40 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </PublicContainer>
    </PageContainer>
  );
}
