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

export default function ClubsClient({ initialBannerData }: { initialBannerData?: any }) {
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
      // Removed cache buster to utilize caching and improve load time
      let url = `/public/clubs?page=${page}&limit=20&status=ACTIVE`;
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
        fallbackTitle="CLUB DIRECTORY"
        fallbackSubtitle="Discover registered kennel clubs across India. Connect with local chapters for events, dog shows, and community support."
        fallbackImage="/images/clubs_banner.png"
        fallbackBreadcrumb="Club Directory"
        initialBannerData={initialBannerData}
      />

      {/* Filters Bar */}
      <section className="py-6 border-b border-border bg-card/50 backdrop-blur-md sticky top-[var(--nav-height, 84px)] z-40 shadow-sm">
        <PublicContainer>
          <div className="flex flex-col lg:flex-row items-center gap-4 justify-between">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clubs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-foreground outline-none text-foreground"
              />
            </div>
          </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-[1280px] mx-auto w-full place-items-center">
              {clubs.map((club, idx) => (
                <motion.div
                  key={club.id}
                  className="h-full flex justify-center w-full max-w-[330px] sm:max-w-none"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Link
                    href={`/clubs/${club.slug || club.id}`}
                    className="group relative flex flex-col h-full bg-card border border-border rounded-[16px] sm:rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-[4px] sm:hover:-translate-y-[6px] shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.15)] w-full"
                  >
                    {/* Top Logo Section */}
                    <div className="relative w-full h-[160px] sm:h-[180px] bg-muted/30 border-b border-border flex items-center justify-center p-3 sm:p-4 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10 z-0"></div>
                      <div className="relative z-10 w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] shrink-0 drop-shadow-sm transition-transform duration-500 group-hover:translate-y-[-2px]">
                        {club.logoThumbnailUrl || club.logoUrl ? (
                          <Image 
                            src={getImageUrl(club.logoThumbnailUrl || club.logoUrl)} 
                            alt={club.name} 
                            fill
                            className="object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-accent/50 flex items-center justify-center">
                            <Tent className="w-10 h-10 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-grow flex flex-col p-4 sm:p-[20px] text-center">
                      <div className="mb-2">
                        {club.clubType && (
                          <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[12px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-500 rounded-full mb-1.5 sm:mb-2">
                            {club.clubType}
                          </span>
                        )}
                        <h3 className="text-base sm:text-[20px] font-bold text-foreground line-clamp-2 leading-tight">
                          {club.name}
                        </h3>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1 sm:gap-1.5 text-muted-foreground mb-1 sm:mb-4 font-medium">
                        {(club.city || club.state) && (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-foreground/50" />
                            <span className="text-[13px] sm:text-[15px] line-clamp-1">{club.city ? `${club.city}, ` : ''}{club.state || 'India'}</span>
                          </div>
                        )}
                        {club.email && (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-[13px] sm:text-sm leading-none">📧</span>
                            <span className="text-[13px] sm:text-[14px] line-clamp-1">{club.email}</span>
                          </div>
                        )}
                        {club.phone && (
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0 sm:mt-0.5">
                            <span className="text-[13px] sm:text-sm leading-none">📞</span>
                            <span className="text-[13px] sm:text-[14px] line-clamp-1">{club.phone}</span>
                          </div>
                        )}
                      </div>

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
