'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, SearchX, AlertTriangle } from 'lucide-react';
import { formatTitle } from '@/lib/utils';
import PageContainer from '@/components/layout/PageContainer';
import api from '@/lib/api';

// Components
import EventHero from '@/components/events/details/EventHero';
import EventJudges from '@/components/events/details/EventJudges';
import OrganizingCommittee from '@/components/events/details/OrganizingCommittee';
import JudgingPanel from '@/components/events/details/JudgingPanel';

export default function EventDetailClient() {
  const searchParams = useSearchParams();
  const slug = (searchParams.get('slug') || searchParams.get('id') || '').trim();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);
      setNotFound(false);
      setError(null);

      try {
        const response = await api.get(`/public/shows/${encodeURIComponent(slug)}`);

        if (response?.success && response?.data) {
          setEvent(response.data);
        } else {
          setNotFound(true);
        }
      } catch (err: any) {
        console.error('[EventDetail] Failed to fetch event:', err?.message || err);
        setError(err?.message || 'Failed to load event data.');
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  // ── Loading State ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
          <div className="w-full h-[450px] bg-card rounded-[24px] mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card h-[120px] rounded-[20px]" />
            ))}
          </div>
          <div className="flex flex-col lg:flex-row gap-8 mt-8">
            <div className="flex-1 space-y-6">
              <div className="bg-card h-[300px] rounded-[24px]" />
              <div className="bg-card h-[200px] rounded-[24px]" />
            </div>
            <div className="w-full lg:w-[30%] space-y-6">
              <div className="bg-card h-[350px] rounded-[24px]" />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────────
  if (error && notFound) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Failed to Load Event</h1>
          <p className="text-muted-foreground font-medium max-w-md mb-8 text-lg">
            {error}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 bg-foreground hover:bg-foreground text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  // ── Not Found State ─────────────────────────────────────────────────────────
  if (notFound || !event) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
          <div className="w-24 h-24 rounded-full bg-foreground/10 flex items-center justify-center mb-6 border border-border/20">
            <SearchX className="w-12 h-12 text-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Event Not Found</h1>
          <p className="text-muted-foreground font-medium max-w-md mb-8 text-lg">
            This event may have been removed, renamed, or does not exist.
            {slug && (
              <span className="block mt-2 text-sm font-mono text-muted-foreground/60 break-all">
                Slug: {slug}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 bg-foreground hover:bg-foreground text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-card hover:bg-accent border border-border text-foreground font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Back Home
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  // ── Event Found ─────────────────────────────────────────────────────────────
  return (
    <PageContainer>
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-0 md:pt-6 md:pb-2 breadcrumb-container">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <Link href="/events" className="hover:text-primary transition-colors">Events</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{formatTitle(event?.name) || 'Event Details'}</span>
        </div>
      </div>

      {/* Section 1: Hero Banner */}
      <EventHero event={event} />

      {/* Section 2: Judges & Organizing Committee */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-12">
          {event?.secretaries && event.secretaries.length > 0 && (
            <OrganizingCommittee secretaries={event.secretaries} />
          )}

          {event?.judgingPanel && event.judgingPanel.length > 0 && (
            <EventJudges judges={event.judgingPanel} />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
