'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Loader2, ArrowLeft, Dog } from 'lucide-react';
import { EventService } from '@/services/event.service';
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
  const id = searchParams.get('id') || searchParams.get('slug');
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await EventService.getEvent(id);
        if (response.success && response.data) {
          // Merge dynamic event details with fallback details from mock data to preserve rich styling fields
          const mergedEvent = {
            ...MOCK_EVENT_DETAIL,
            ...response.data,
            timeline: response.data.timeline || MOCK_EVENT_DETAIL.timeline,
            ageClasses: response.data.ageClasses || MOCK_EVENT_DETAIL.ageClasses,
            judges: response.data.judges && response.data.judges.length > 0 ? response.data.judges : [],
            secretaries: response.data.secretaries && response.data.secretaries.length > 0 ? response.data.secretaries : [],
            faqs: response.data.faqs || MOCK_EVENT_DETAIL.faqs,
          };
          setEvent(mergedEvent);
        } else {
          // Fallback if not found in backend DB (helpful for mock data test preview)
          const matchedMock = MOCK_EVENTS.find(e => e.slug === id || String(e.id) === id);
          if (matchedMock) {
            setEvent({ ...MOCK_EVENT_DETAIL, ...matchedMock });
          }
        }
      } catch (error) {
        console.error('Failed to fetch event details', error);
        const matchedMock = MOCK_EVENTS.find(e => e.slug === id || String(e.id) === id);
        if (matchedMock) {
          setEvent({ ...MOCK_EVENT_DETAIL, ...matchedMock });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const [showEntries, setShowEntries] = useState<any[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  useEffect(() => {
    if (!event?.id) return;
    const fetchShowEntries = async () => {
      setLoadingEntries(true);
      try {
        const res = await api.get(`/public/entries?dogShowId=${event.id}`);
        if (res.success) {
          setShowEntries(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load show entries:', err);
      } finally {
        setLoadingEntries(false);
      }
    };
    fetchShowEntries();
  }, [event?.id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col justify-center items-center min-h-[70vh]">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
          <p className="text-muted-foreground text-xs font-semibold">Loading event details...</p>
        </div>
      </PageContainer>
    );
  }

  if (!event) {
    return (
      <PageContainer>
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Event Details Not Found</h1>
          <p className="text-muted-foreground mb-8">The event you are looking for is not active or could not be loaded.</p>
          <Link href="/events" className="inline-flex items-center text-[#F59E0B] font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events Calendar
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Link href="/" className="hover:text-brand-orange transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/events" className="hover:text-brand-orange transition-colors">Events</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{event.name}</span>
        </div>
      </div>

      {/* Section 1: Hero Banner */}
      <EventHero event={event} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section 2: Quick Statistics */}
        <QuickStats event={event} />

        {/* 70/30 Split Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-8">
          {/* Left Column (70%) */}
          <div className="flex-1 w-full lg:w-[70%]">
            <AboutEvent event={event} />
            <EventTimeline timeline={event.timeline} />
            <BreedCategories />
            <AgeClasses classes={event.ageClasses} />
            <EventJudges judges={event.judges} />
            <OrganizingCommittee secretaries={event.secretaries} />
            <EventVenue event={event} />

            {/* Show Registered Entries Section */}
            <div className="bg-card rounded-[24px] p-8 border border-border shadow-sm mb-8 text-foreground">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                <Dog className="w-6 h-6 text-brand-orange" /> Registered Dog Entries ({showEntries.length})
              </h3>
              {loadingEntries ? (
                <div className="text-center py-6 text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-orange" /> Loading registered dogs...
                </div>
              ) : showEntries.length === 0 ? (
                <p className="text-muted-foreground font-medium italic">No verified dog entries registered for this show yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {showEntries.map((ent: any) => (
                    <div key={ent.id} className="p-4 bg-accent/15 border border-border rounded-2xl flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-accent shrink-0 border border-border">
                        <img src={ent.dogPhoto || '/images/hero_banner.png'} alt={ent.dogName} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-foreground truncate">{ent.dogName}</p>
                        <p className="text-xs text-muted-foreground truncate">{ent.breed} • {ent.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <EventGallery />
            <EventSponsors />
            <EventFAQs faqs={event.faqs} />
            <RelatedEvents events={MOCK_EVENTS} />
          </div>

          {/* Right Column Sticky Sidebar (30%) */}
          <div className="w-full lg:w-[30%] relative">
            <EventSidebar event={event} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
