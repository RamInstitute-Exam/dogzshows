import { MOCK_EVENT_DETAIL, MOCK_EVENTS } from '@/lib/mock/eventsData';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

// Components
import EventHero from '@/components/events/details/EventHero';
import QuickStats from '@/components/events/details/QuickStats';
import AboutEvent from '@/components/events/details/AboutEvent';
import EventTimeline from '@/components/events/details/EventTimeline';
import BreedCategories from '@/components/events/details/BreedCategories';
import AgeClasses from '@/components/events/details/AgeClasses';
import EventJudges from '@/components/events/details/EventJudges';
import EventVenue from '@/components/events/details/EventVenue';
import EventGallery from '@/components/events/details/EventGallery';
import EventSponsors from '@/components/events/details/EventSponsors';
import EventFAQs from '@/components/events/details/EventFAQs';
import RelatedEvents from '@/components/events/details/RelatedEvents';
import EventSidebar from '@/components/events/details/EventSidebar';

export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
    const res = await fetch(`${apiUrl}/public/events`);
    if (res.ok) {
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        const dbParams = data.data.map((event: any) => ({
          slug: event.slug,
        }));

        // Merge with MOCK_EVENTS to ensure mock pages also resolve correctly
        const mockParams = MOCK_EVENTS.map((event) => ({
          slug: event.slug,
        }));

        const allParams = [...dbParams];
        mockParams.forEach(mp => {
          if (!allParams.some(ap => ap.slug === mp.slug)) {
            allParams.push(mp);
          }
        });
        return allParams;
      }
    }
  } catch (error) {
    console.error('Failed to fetch dynamic events in generateStaticParams:', error);
  }

  // Fallback to mock events if API is offline/unavailable
  return MOCK_EVENTS.map((event) => ({
    slug: event.slug,
  }));
}

export default function EventDetailsPage({ params }: { params: { slug: string } }) {
  // Mock data fetch
  const event = MOCK_EVENT_DETAIL;

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
            <EventVenue event={event} />
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
