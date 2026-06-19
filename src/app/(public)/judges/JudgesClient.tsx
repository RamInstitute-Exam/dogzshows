'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, Sparkles, Search, MapPin, Filter, LayoutGrid, List as ListIcon, ChevronLeft, Loader2, UserX, Award, Shield } from 'lucide-react';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import { useJudges } from '@/hooks/useJudges';
import { usePageBanner } from '@/hooks/useCMS';
import { getImageUrl } from '@/lib/api';

function JudgesList() {
  const searchParams = useSearchParams();
  const showFeaturedOnly = searchParams.get('featured') === 'true';

  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Custom debounced search query
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Submit search on enter or blur
  const handleSearchSubmit = (e: React.FormEvent | React.FocusEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchQuery);
    setPage(1);
  };

  const { data, isLoading, isError } = useJudges({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    specialization: specializationFilter || undefined,
    category: categoryFilter || undefined,
    status: 'ACTIVE'
  });

  const judges = showFeaturedOnly 
    ? (data?.data || []).filter((j: any) => j.isFeatured) 
    : (data?.data || []);
  
  const totalPages = data?.totalPages || 1;

  const handleFilterChange = (setter: any, value: string) => {
    setter(value);
    setPage(1);
  };

  const { data: bannerData } = usePageBanner('judges');
  const customTitle = bannerData?.data?.title || (showFeaturedOnly ? "Featured Judges" : "Judges");
  const customSubtitle = bannerData?.data?.subtitle || "Meet the world-class professionals bringing decades of expertise to evaluate our champions.";
  const customImage = bannerData?.data?.bannerImage ? getImageUrl(bannerData.data.bannerImage) : '/images/judges-hero-premium.png';

  return (
    <PageContainer>
      <section className="relative w-full h-[320px] md:h-[420px] xl:h-[520px] flex items-center overflow-hidden bg-black">
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={customImage}
            alt="Judges Hero Banner"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Dark black gradient overlay (65-75% opacity) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.70) 50%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        <PublicContainer className="relative z-10 w-full py-10 flex flex-col justify-center h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 mb-4 font-medium text-sm md:text-base">
              <Link href="/" className="text-[rgba(255,255,255,0.75)] hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-[rgba(255,255,255,0.5)]" />
              <span className="text-[#F5B400]">{bannerData?.data?.breadcrumbTitle || 'Judges'}</span>
            </nav>

            {/* Title */}
            <h1 className="text-[32px] md:text-[42px] xl:text-[64px] font-[800] text-[#FFFFFF] leading-tight mb-4 drop-shadow-md">
              {customTitle}
            </h1>

            {/* Description */}
            <p className="text-[18px] xl:text-[22px] text-[rgba(255,255,255,0.92)] leading-[1.8] max-w-[650px] drop-shadow-sm">
              {customSubtitle}
            </p>
          </motion.div>
        </PublicContainer>
      </section>

      <PublicContainer className="py-12">
        <div className="flex flex-col gap-8">
          
          {showFeaturedOnly && (
            <div className="flex justify-center mb-2">
              <span className="px-4 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-bold tracking-wider flex items-center gap-1.5 border border-yellow-500/20">
                <Sparkles className="w-4 h-4 animate-pulse" /> FILTERED BY FEATURED ONLY
              </span>
            </div>
          )}

          {/* Filters Section */}
          <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center bg-background border border-border rounded-xl px-4 py-3 focus-within:ring-2 ring-brand-orange/50 transition-all">
              <Search className="w-5 h-5 text-muted-foreground mr-3" />
              <input
                type="text"
                placeholder="Search by judge name or location..."
                className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted-foreground text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={handleSearchSubmit}
              />
            </form>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[180px]">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <select 
                  className="w-full bg-background border border-border text-foreground text-sm rounded-xl pl-9 pr-4 py-3 appearance-none focus:outline-none focus:ring-2 ring-brand-orange/50"
                  value={specializationFilter}
                  onChange={(e) => handleFilterChange(setSpecializationFilter, e.target.value)}
                >
                  <option value="">All Specializations</option>
                  <option value="All Breed">All Breed</option>
                  <option value="Group">Group Judge</option>
                  <option value="Specialty">Specialty Judge</option>
                  <option value="Working">Working Class</option>
                </select>
              </div>
              
              <div className="hidden sm:flex items-center bg-background border border-border rounded-xl p-1 shrink-0 ml-auto xl:ml-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-brand-orange text-white' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-brand-orange text-white' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="min-h-[400px]">
            {isLoading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'}`}>
                {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                  <div key={n} className={`bg-card border border-border rounded-[2rem] p-6 animate-pulse ${viewMode === 'list' ? 'flex items-center gap-6' : 'flex flex-col items-center'}`}>
                    <div className={`rounded-full bg-muted ${viewMode === 'list' ? 'w-24 h-24 shrink-0' : 'w-32 h-32 mb-6'}`} />
                    <div className={`flex flex-col gap-3 w-full ${viewMode === 'list' ? '' : 'items-center text-center'}`}>
                      <div className="h-6 bg-muted rounded-md w-1/2" />
                      <div className="h-4 bg-muted rounded-md w-1/3" />
                      <div className="h-10 bg-muted rounded-md w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                  <UserX className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Failed to load judges</h3>
                <p className="text-muted-foreground">Please try again later or contact support.</p>
              </div>
            ) : judges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-3xl bg-card/50">
                <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No judges available.</h3>
                <p className="text-muted-foreground">We couldn't find any judges matching your current filters.</p>
                <button onClick={() => { setSearchQuery(''); setSpecializationFilter(''); setDebouncedSearch(''); setPage(1); }} className="mt-6 text-brand-orange font-medium hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'}`}>
                {judges.map((judge: any, i: number) => (
                  <motion.div
                    key={judge.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                  >
                    <Link
                      href={`/judge-details?slug=${judge.slug || judge.id}`}
                      className={`group bg-card rounded-[2rem] p-6 sm:p-8 shadow-sm border border-border hover:border-primary/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease cursor-pointer block ${viewMode === 'list' ? 'flex flex-col sm:flex-row items-center sm:items-stretch gap-6 sm:gap-8 text-center sm:text-left' : 'flex flex-col items-center text-center'}`}
                    >
                      <div className={`shrink-0 overflow-hidden relative border-[3px] border-[#1f2937] bg-[#f8fafc] shadow-[0_10px_30px_rgba(0,0,0,0.12)] rounded-[24px] ${viewMode === 'list' ? 'w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px] sm:self-center' : 'w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px] mb-[20px]'}`}>
                        {judge.photoUrl ? (
                          <img src={judge.photoUrl} alt={judge.name} className="w-full h-full object-cover object-top group-hover:scale-[1.05] transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-[#f8fafc] flex items-center justify-center text-[#64748b] text-[64px] font-[700] group-hover:scale-[1.05] transition-transform duration-300">
                            {judge.name?.[0]?.toUpperCase() || 'M'}
                          </div>
                        )}
                        {judge.isFeatured && (
                          <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-1">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex flex-col flex-1 ${viewMode === 'list' ? 'justify-center' : 'w-full'}`}>
                        <h3 className="text-2xl font-[800] text-foreground mb-1 flex items-center justify-center sm:justify-start gap-1.5 group-hover:text-primary transition-colors">
                          {judge.name}
                          {judge.isFeatured && (
                            <span title="Verified Judge">
                              <Shield className="w-5 h-5 text-blue-500 shrink-0" />
                            </span>
                          )}
                        </h3>
                        <p className={`text-primary font-[700] text-sm mb-3 flex items-center justify-center sm:justify-start gap-1.5`}>
                          <MapPin className="w-3.5 h-3.5" />
                          {judge.city ? `${judge.city}, ` : ''}{judge.state || judge.country || 'International'}
                        </p>
                        
                        <div className={`flex gap-4 mb-4 py-3 border-y border-border ${viewMode === 'list' ? 'justify-start max-w-md' : 'justify-center w-full'}`}>
                          <div className={`${viewMode === 'list' ? '' : 'w-full text-center'}`}>
                            <p className="text-foreground font-[700] text-sm line-clamp-1">{judge.qualifications || judge.specialization || 'Professional Judge'}</p>
                            <p className="small-label text-[10px]">Specialization</p>
                          </div>
                        </div>

                        <p className={`text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed ${viewMode === 'list' ? 'max-w-2xl' : ''}`}>
                          {judge.bio || 'Certified all breed international judge with credentials in evaluating multiple groups and working class breeds. Brings years of expertise and professionalism to every show ring.'}
                        </p>

                        {judge.source && (
                          <p className="text-[10px] text-muted-foreground/70 italic mb-2 truncate w-full" title={judge.source}>
                            📷 {judge.source}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && !isError && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-border">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-card border border-border text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1.5 px-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === i + 1 ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'bg-transparent text-muted-foreground hover:bg-accent'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-card border border-border text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      </PublicContainer>
    </PageContainer>
  );
}

export default function JudgesClient() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[500px] bg-background">
        <div className="flex flex-col items-center gap-4 text-brand-orange">
          <Loader2 className="w-10 h-10 animate-spin" />
          <span className="font-medium text-sm tracking-widest uppercase">Loading Judges...</span>
        </div>
      </div>
    }>
      <JudgesList />
    </Suspense>
  );
}
