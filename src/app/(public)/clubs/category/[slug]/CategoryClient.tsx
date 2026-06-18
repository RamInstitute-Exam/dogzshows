'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, MapPin, ChevronLeft, ChevronRight, Loader2,
  Tent, Users, CalendarDays, CheckCircle2, FolderOpen
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import api from '@/lib/api';

function CategoryPageContent() {
  const params = useParams();
  const categorySlug = params?.slug as string;

  const [clubs, setClubs] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Set SEO metadata dynamically on the client side
  useEffect(() => {
    const title = categoryName
      ? `${categoryName} Kennel Clubs | JuzDog`
      : `${categorySlug?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Category'} Kennel Clubs | JuzDog`;
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      `Browse and connect with registered kennel clubs in the ${categoryName || 'selected'} category. View club logos, secretaries, members, events, and location details.`
    );
  }, [categoryName, categorySlug]);

  useEffect(() => {
    if (!categorySlug) return;
    async function load() {
      setLoading(true);
      try {
        // First get categories to find this category's id
        const catRes = await api.get('/public/club-categories');
        const categories: any[] = catRes?.data || catRes?.items || [];
        const matched = categories.find(
          (c: any) => c.slug === categorySlug || c.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === categorySlug
        );

        if (matched) {
          setCategoryName(matched.name || categorySlug);
          const res = await api.get(
            `/public/clubs?page=${page}&limit=12&status=ACTIVE&categoryId=${matched.id}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''
            }`
          );
          setClubs(res?.data || []);
          setTotalPages(res?.totalPages || 1);
          setTotalCount(res?.total || 0);
        } else {
          // No matching category — show friendly empty state
          setCategoryName(categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()));
          setClubs([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error('Failed to load category clubs:', err);
        setClubs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categorySlug, page, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <PageContainer>
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden border-b border-border bg-black">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-brand-orange/20 blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-brand-orange transition-colors mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Clubs
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-xs font-bold uppercase tracking-widest border border-brand-orange/20 mb-6">
              <FolderOpen className="w-3.5 h-3.5" /> Category
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white capitalize">
              {categoryName || categorySlug.replace(/-/g, ' ')}
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Browse all registered kennel clubs in the <span className="text-brand-orange font-semibold capitalize">{categoryName}</span> category.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-5 border-b border-border bg-card/50 backdrop-blur-md sticky top-[var(--nav-height,84px)] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search clubs in this category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-orange outline-none text-foreground"
            />
          </div>
        </div>
      </section>

      {/* Listing */}
      <section className="py-12 bg-background min-h-[500px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              Results{' '}
              <span className="text-muted-foreground font-normal text-sm ml-2">
                ({totalCount} clubs found)
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-card rounded-2xl border border-border h-[380px]" />
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {club.kciApproved && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> KCI Approved
                        </div>
                      </div>
                    )}

                    <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-xl bg-card border-4 border-card shadow-lg overflow-hidden flex items-center justify-center z-10">
                      {club.logoUrl ? (
                        <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="bg-brand-orange text-white font-bold text-xl flex items-center justify-center w-full h-full">
                          {club.name?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-10 flex-1 flex flex-col">
                    <h3 className="text-xl font-extrabold text-foreground mb-1 line-clamp-1 group-hover:text-brand-orange transition-colors">
                      {club.name}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-brand-orange" />
                      <span className="line-clamp-1">{club.city ? `${club.city}, ` : ''}{club.state || 'India'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-5 flex-1">
                      {club.description || 'A registered kennel club organizing dog shows and events.'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-accent/50 rounded-xl p-3 flex flex-col items-center border border-border/50">
                        <div className="flex items-center gap-1.5 text-brand-orange mb-1">
                          <Users className="w-4 h-4" />
                          <span className="font-bold text-lg leading-none">{club.memberCount || 0}</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Members</span>
                      </div>
                      <div className="bg-accent/50 rounded-xl p-3 flex flex-col items-center border border-border/50">
                        <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                          <CalendarDays className="w-4 h-4" />
                          <span className="font-bold text-lg leading-none">{club.eventCount || 0}</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Events</span>
                      </div>
                    </div>

                    <Link
                      href={`/clubs/${club.slug || club.id}`}
                      className="block w-full py-2.5 bg-accent text-foreground text-center font-semibold rounded-xl group-hover:bg-brand-orange group-hover:text-white transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-3xl border-2 border-dashed border-border">
              <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-6 border border-border">
                <FolderOpen className="w-10 h-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No Clubs Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                {debouncedSearch
                  ? `No clubs match "${debouncedSearch}" in this category.`
                  : 'No clubs are currently registered in this category.'}
              </p>
              <Link
                href="/clubs"
                className="bg-brand-orange text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors"
              >
                Browse All Clubs
              </Link>
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
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${page === i + 1
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

export default function CategoryClientPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
        </div>
      }
    >
      <CategoryPageContent />
    </Suspense>
  );
}
