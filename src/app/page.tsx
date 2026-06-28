'use client';

import React, { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import api from '@/lib/api';

const HeroSlider = dynamic(() => import('@/components/home/HeroSlider'), { ssr: false });
const SlidingPhotoSections = dynamic(() => import('@/components/home/SlidingPhotoSections'), { ssr: false });
const UpcomingEventsCarousel = dynamic(() => import('@/components/home/UpcomingEventsCarousel'), { ssr: false });
const FeaturedClubsSlider = dynamic(() => import('@/components/home/FeaturedClubsSlider'), { ssr: false });
const FeaturedJudgesSlider = dynamic(() => import('@/components/home/FeaturedJudgesSlider'), { ssr: false });
const FeaturedWinnersSlider = dynamic(() => import('@/components/home/FeaturedWinnersSlider'), { ssr: false });
const AboutUsSection = dynamic(() => import('@/components/home/AboutUsSection'), { ssr: false });

const SectionSkeleton = ({ height = 'h-64' }: { height?: string }) => (
  <PublicContainer className="py-16 space-y-4">
    <div className="w-48 h-8 bg-accent animate-pulse rounded mb-8" />
    <div className={`w-full ${height} bg-accent/30 animate-pulse rounded-2xl`} />
  </PublicContainer>
);

export default function Home() {
  const [banners, setBanners] = useState<any[]>([]);
  const [slidingSections, setSlidingSections] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [featuredClubs, setFeaturedClubs] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const [
          bannersRes,
          sectionsRes,
          eventsRes,
          featuredClubsRes,
          clubsRes,
          judgesRes,
          aboutRes
        ] = await Promise.all([
          api.get('/public/homepage-banners').catch(() => null),
          api.get('/public/homepage-sliding-sections/public').catch(() => null),
          api.get('/public/events/upcoming?limit=6').catch(() => null),
          api.get('/public/clubs/featured/winners').catch(() => null),
          api.get('/public/clubs?limit=10').catch(() => null),
          api.get('/public/judges?limit=8').catch(() => null),
          api.get('/public/homepage-about-section').catch(() => null)
        ]);

        const getArray = (res: any) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (res.success && Array.isArray(res.data)) return res.data;
          if (res.success && Array.isArray(res.items)) return res.items;
          if (Array.isArray(res.data)) return res.data;
          if (Array.isArray(res.items)) return res.items;
          return [];
        };

        const getObject = (res: any) => {
          if (!res) return null;
          if (res.success && res.data) return res.data;
          if (res.data) return res.data;
          return res;
        };

        setBanners(getArray(bannersRes));
        setSlidingSections(getArray(sectionsRes));
        setEvents(getArray(eventsRes));
        setFeaturedClubs(getArray(featuredClubsRes));
        setClubs(getArray(clubsRes));
        setJudges(getArray(judgesRes));
        setAboutData(getObject(aboutRes));
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHomeData();
  }, []);

  return (
    <PageContainer>
      {/* 1. Hero Banner Slider */}
      <Suspense fallback={<div className="w-full h-[60vh] bg-accent/20 animate-pulse" />}>
        {loading ? (
          <div className="w-full h-[60vh] bg-accent/20 animate-pulse" />
        ) : banners.length > 0 ? (
          <HeroSlider banners={banners} />
        ) : (
          <div className="w-full h-[60vh] flex items-center justify-center bg-accent/10 border border-border">
            <span className="text-muted-foreground font-semibold">No banners available</span>
          </div>
        )}
      </Suspense>

      {/* 2. Latest Winners Slider */}
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        {loading ? (
          <SectionSkeleton height="h-96" />
        ) : (
          <FeaturedWinnersSlider initialClubs={featuredClubs} />
        )}
      </Suspense>

      {/* 3. Premium Personal Photos */}
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        {loading ? (
          <SectionSkeleton height="h-96" />
        ) : (
          <SlidingPhotoSections initialSections={slidingSections} />
        )}
      </Suspense>

      {/* 4. Upcoming Show Calendars */}
      <Suspense fallback={<SectionSkeleton height="h-72" />}>
        {loading ? (
          <SectionSkeleton height="h-72" />
        ) : (
          <UpcomingEventsCarousel initialEvents={events} />
        )}
      </Suspense>

      {/* 5. Featured Kennel Clubs */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        {loading ? (
          <SectionSkeleton height="h-64" />
        ) : (
          <FeaturedClubsSlider initialClubs={clubs} />
        )}
      </Suspense>

      {/* 6. Elite International Judges */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        {loading ? (
          <SectionSkeleton height="h-64" />
        ) : (
          <FeaturedJudgesSlider judges={judges} />
        )}
      </Suspense>

      {/* 7. About Us Section */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        {loading ? (
          <SectionSkeleton height="h-64" />
        ) : (
          <AboutUsSection initialData={aboutData} />
        )}
      </Suspense>
    </PageContainer>
  );
}
