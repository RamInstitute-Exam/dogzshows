'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Calendar, FileText, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import api, { getImageUrl, getThumbnailUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Magazine {
  id: string;
  title: string;
  slug: string;
  edition: string | null;
  month: string | null;
  year: number | null;
  totalPages: number;
  description: string | null;
  coverUrl: string | null;
  createdAt: string;
}

export default function PublicMagazinesPage() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMagazines = async () => {
    setLoading(true);
    try {
      const res = await api.get('/public/magazines', {
        page,
        limit: 12,
      });
      if (res.success) {
        setMagazines(res.items || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (error) {
      console.error('Failed to load magazines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMagazines();
  }, [page]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <BreadcrumbBanner
        slug="/e-magazines"
        fallbackTitle="E-Magazines"
        fallbackSubtitle="Browse and read our premium published dog show magazines in an interactive page-flipping experience."
        fallbackImage="/images/banners/media-banner.webp"
      />

      <PageContainer>
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground font-semibold text-sm">Opening archives...</p>
            </div>
          ) : (
            <>
              {magazines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-card border border-border rounded-[2rem] shadow-xl text-center p-8 space-y-4">
                  <BookOpen className="w-12 h-12 text-muted-foreground/60" />
                  <h3 className="text-xl font-bold text-foreground">No Magazines Available</h3>
                  <p className="text-muted-foreground max-w-md">
                    We haven&apos;t published any E-Magazines yet. Please check back later for our upcoming special editions!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {magazines.map((mag) => (
                    <Link
                      href={`/e-magazines/${mag.slug}`}
                      key={mag.id}
                      className="bg-card rounded-[2rem] border border-border overflow-hidden group hover:border-primary/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full max-w-[340px] mx-auto w-full"
                    >
                      {/* Cover Preview */}
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-white flex items-center justify-center p-4 sm:p-5 border-b border-border">
                        <div className="relative w-full h-full flex items-center justify-center z-10 transition-transform duration-700 group-hover:scale-105 drop-shadow-md">
                          {mag.coverUrl ? (
                            <Image
                              src={getThumbnailUrl(mag.coverUrl)}
                              alt={mag.title}
                              fill
                              sizes="(max-width: 640px) 100vw, 25vw"
                              className="object-contain select-none pointer-events-none"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-accent text-muted-foreground rounded-lg">
                              <BookOpen className="w-16 h-16 opacity-35" />
                            </div>
                          )}
                        </div>
                        <span className="absolute bottom-3 right-3 z-20 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                          <FileText className="w-3.5 h-3.5" />
                          {mag.totalPages} Pages
                        </span>
                      </div>

                      {/* Info Panel */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2 inline-block">
                            {mag.edition || 'Special Edition'}
                          </span>
                          <h3 className="text-lg font-bold font-outfit text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {mag.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {mag.month && `${mag.month} `}
                              {mag.year}
                            </span>
                          </div>
                          {mag.description && (
                            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 pt-2 font-medium">
                              {mag.description}
                            </p>
                          )}
                        </div>

                        {/* Read Button */}
                        <div className="pt-4 border-t border-border">
                          <div className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 group/btn">
                            Read Magazine
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-6 mt-12 text-sm font-semibold text-muted-foreground">
                  <span>
                    Showing page {page} of {totalPages} ({totalCount} total)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-10 border-border text-foreground hover:bg-accent"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="h-10 border-border text-foreground hover:bg-accent"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
