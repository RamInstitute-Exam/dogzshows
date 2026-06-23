'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Loader2, ArrowLeft, Dog, SearchX } from 'lucide-react';
import { toTitleCase, formatTitle } from '@/lib/utils';
import { MOCK_EVENT_DETAIL, MOCK_EVENTS } from '@/lib/mock/eventsData';
import PageContainer from '@/components/layout/PageContainer';
import api from '@/lib/api';

// Components
import EventHero from '@/components/events/details/EventHero';
import QuickStats from '@/components/events/details/QuickStats';
import AboutEvent from '@/components/events/details/AboutEvent';
import EventTimeline from '@/components/events/details/EventTimeline';
import BreedCategories from '@/components/events/details/BreedCategories';
import AgeClasses from '@/components/events/details/AgeClasses';
import EventJudges from '@/components/events/details/EventJudges';
import OrganizingCommittee from '@/components/events/details/OrganizingCommittee';
import EventVenue from '@/components/events/details/EventVenue';
import EventGallery from '@/components/events/details/EventGallery';
import EventSponsors from '@/components/events/details/EventSponsors';
import EventFAQs from '@/components/events/details/EventFAQs';
import RelatedEvents from '@/components/events/details/RelatedEvents';
import EventSidebar from '@/components/events/details/EventSidebar';

export default function EventDetailClient() {
  const searchParams = useSearchParams();
  const slug = (searchParams.get('slug') || searchParams.get('id') || '').trim();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      console.log('[EventDetail] No slug provided in URL');
      setLoading(false);
      setNotFound(true);
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);
      setNotFound(false);

      console.log('[EventDetail] Fetching event for slug:', slug);

      try {
        // Use the public shows endpoint — no auth required
        const response = await api.get(`/public/shows/${encodeURIComponent(slug)}`);

        console.log('[EventDetail] API response:', response);

        if (response?.success && response?.data) {
          const apiData = response.data;
          console.log('[EventDetail] Fetched event:', apiData?.name, '| judges:', apiData?.judges?.length, '| secretaries:', apiData?.secretaries?.length);

          // Merge with mock fallback fields to preserve rich styling data
          // while using real data wherever it exists
          const mergedEvent = {
            ...MOCK_EVENT_DETAIL,
            ...apiData,
            // Keep real judges/secretaries; fall back to mock timeline/ageClasses/faqs if missing
            judges: Array.isArray(apiData.judges) && apiData.judges.length > 0
              ? apiData.judges
              : (MOCK_EVENT_DETAIL.judges || []),
            secretaries: Array.isArray(apiData.secretaries) && apiData.secretaries.length > 0
              ? apiData.secretaries
              : (MOCK_EVENT_DETAIL.secretaries || []),
            timeline: Array.isArray(apiData.timeline) && apiData.timeline.length > 0
              ? apiData.timeline
              : (MOCK_EVENT_DETAIL.timeline || []),
            ageClasses: Array.isArray(apiData.ageClasses) && apiData.ageClasses.length > 0
              ? apiData.ageClasses
              : (MOCK_EVENT_DETAIL.ageClasses || []),
            faqs: Array.isArray(apiData.faqs) && apiData.faqs.length > 0
              ? apiData.faqs
              : (MOCK_EVENT_DETAIL.faqs || []),
            rules: Array.isArray(apiData.rules) && apiData.rules.length > 0
              ? apiData.rules
              : (MOCK_EVENT_DETAIL.rules || []),
          };

          console.log('[EventDetail] Merged event ready:', mergedEvent?.name);
          setEvent(mergedEvent);
        } else {
          // Try matching mock data as fallback (dev/preview use)
          console.warn('[EventDetail] API returned no data, trying mock fallback for slug:', slug);
          const matchedMock = MOCK_EVENTS.find(
            (e) => e.slug?.trim() === slug || String(e.id) === slug
          );
          if (matchedMock) {
            setEvent({ ...MOCK_EVENT_DETAIL, ...matchedMock });
          } else {
            setNotFound(true);
          }
        }
      } catch (error: any) {
        console.error('[EventDetail] Failed to fetch event:', error?.message || error);
        // Try mock fallback on any error
        const matchedMock = MOCK_EVENTS.find(
          (e) => e.slug?.trim() === slug || String(e.id) === slug
        );
        if (matchedMock) {
          setEvent({ ...MOCK_EVENT_DETAIL, ...matchedMock });
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  const [showEntries, setShowEntries] = useState<any[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  useEffect(() => {
    if (!event?.id) return;
    const fetchShowEntries = async () => {
      setLoadingEntries(true);
      try {
        const res = await api.get(`/public/entries?dogShowId=${event.id}`);
        if (res?.success) {
          setShowEntries(res.data || []);
        }
      } catch (err) {
        console.error('[EventDetail] Failed to load show entries:', err);
      } finally {
        setLoadingEntries(false);
      }
    };
    fetchShowEntries();
  }, [event?.id]);

  // ── Loading State ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
          {/* Hero skeleton */}
          <div className="w-full h-[450px] bg-card rounded-[24px] mb-8" />
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card h-[120px] rounded-[20px]" />
            ))}
          </div>
          {/* Content skeleton */}
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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-3 md:pt-10 md:pb-6 breadcrumb-container">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <Link href="/events" className="hover:text-primary transition-colors">Events</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{formatTitle(event?.name) || 'Event Details'}</span>
        </div>
      </div>

      {/* Section 1: Hero Banner — ONLY visible section for now */}
      <EventHero event={event} />

      {/* Section 2: Judges & Organizing Committee (extracted from the hidden section below) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-12">
          {event?.judges && event.judges.length > 0 && (
            <EventJudges judges={event.judges} />
          )}

          {event?.secretaries && event.secretaries.length > 0 && (
            <OrganizingCommittee secretaries={event.secretaries} />
          )}
        </div>
      </div>

      {false && (
        <>
          {/*
            ╔══════════════════════════════════════════════════════════════════╗
            ║  TEMPORARILY HIDDEN — Will be redesigned in a future update.   ║
            ║  Do NOT remove this code. Just keep it commented out.          ║
            ╚══════════════════════════════════════════════════════════════════╝
          */}
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <QuickStats event={event} />

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-8">
              <div className="flex-1 w-full lg:w-[70%] min-w-0">
                <AboutEvent event={event} />
                <EventTimeline timeline={event?.timeline ?? []} />
                <BreedCategories />
                <AgeClasses classes={event?.ageClasses ?? []} />

                {/* Judges — hidden even if data exists in DB */}
                <EventJudges judges={event?.judges ?? []} />

                <OrganizingCommittee secretaries={event?.secretaries ?? []} />
                <EventVenue event={event} />

                {/* Registered Entries */}
                <div className="bg-card rounded-[24px] p-8 border border-border shadow-sm mb-8 text-foreground">
                  <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                    <Dog className="w-6 h-6 text-foreground" /> Registered Dog Entries ({showEntries.length})
                  </h3>
                  {loadingEntries ? (
                    <div className="text-center py-6 text-muted-foreground flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-foreground" /> Loading registered dogs...
                    </div>
                  ) : showEntries.length === 0 ? (
                    <p className="text-muted-foreground font-medium italic">No verified dog entries registered for this show yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {showEntries.map((ent: any) => (
                        <div key={ent.id} className="p-4 bg-accent/15 border border-border rounded-2xl flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-accent shrink-0 border border-border">
                            <img
                              src={ent.dogPhoto || '/images/hero_banner.png'}
                              alt={ent.dogName ?? 'Dog'}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-foreground truncate">{ent.dogName ?? '-'}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {[ent.breed, ent.category].filter(Boolean).join(' • ') || '-'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <EventGallery />
                <EventSponsors />
                <EventFAQs faqs={event?.faqs ?? []} />
                <RelatedEvents events={MOCK_EVENTS} />
              </div>

              <div className="w-full lg:w-[30%] relative">
                <EventSidebar event={event} />
              </div>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}
