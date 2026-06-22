import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';

import {
  getHeroSlides,
  getFeaturedJudges,
  getPublicAlbumsAPI,
  fetchServerData
} from '@/lib/server-api';

const HeroSlider = dynamic(() => import('@/components/home/HeroSlider'), { ssr: true });
const HomepageAlbumGallery = dynamic(() => import('@/components/home/HomepageAlbumGallery'), { ssr: true });
const SlidingPhotoSections = dynamic(() => import('@/components/home/SlidingPhotoSections'), { ssr: true });
const UpcomingEventsCarousel = dynamic(() => import('@/components/home/UpcomingEventsCarousel'), { ssr: true });
const FeaturedClubsSlider = dynamic(() => import('@/components/home/FeaturedClubsSlider'), { ssr: true });
const FeaturedJudgesSlider = dynamic(() => import('@/components/home/FeaturedJudgesSlider'), { ssr: true });
const AboutUsSection = dynamic(() => import('@/components/home/AboutUsSection'), { ssr: true });

const SectionSkeleton = ({ height = 'h-64' }: { height?: string }) => (
  <PublicContainer className="py-16 space-y-4">
    <div className="w-48 h-8 bg-accent animate-pulse rounded mb-8" />
    <div className={`w-full ${height} bg-accent/30 animate-pulse rounded-2xl`} />
  </PublicContainer>
);

export const revalidate = 300; // ISR revalidation every 5 minutes

export default async function Home() {
  // Parallel Data Fetching on the Server
  const [
    bannersRes,
    judgesRes,
    albumsRes,
    slidingSectionsRes,
    eventsRes,
    clubsRes,
    aboutRes
  ] = await Promise.all([
    getHeroSlides().catch(() => ({ success: false, data: [] })),
    getFeaturedJudges().catch(() => ({ success: false, data: [] })),
    getPublicAlbumsAPI().catch(() => ({ success: false, data: [] })),
    fetchServerData('/public/homepage-sliding-sections/public', 300).catch(() => ({ success: false, data: [] })),
    fetchServerData('/public/events/upcoming?limit=6', 300).catch(() => ({ success: false, data: [] })),
    fetchServerData('/public/clubs?limit=10', 300).catch(() => ({ success: false, data: [] })),
    fetchServerData('/public/homepage-about-section', 300).catch(() => ({ success: false, data: [] })),
  ]);

  const banners = bannersRes?.data || [];
  const judges = judgesRes?.data || [];
  const albums = albumsRes?.data || [];
  const slidingSections = slidingSectionsRes?.data || [];
  const events = eventsRes?.data || [];
  const clubs = clubsRes?.data || [];
  const aboutData = aboutRes?.data || null;

  return (
    <PageContainer>
      {/* 1. Hero Banner Slider */}
      <Suspense fallback={<div className="w-full h-[60vh] bg-accent/20 animate-pulse" />}>
        {banners.length > 0 && <HeroSlider banners={banners} />}
      </Suspense>
      
      {/* 2. Dynamic Album Gallery Section */}
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <HomepageAlbumGallery albums={albums} />
      </Suspense>

      {/* 3. Premium Personal Photos */}
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <SlidingPhotoSections initialSections={slidingSections} />
      </Suspense>

      {/* 4. Upcoming Show Calendars (Card Listing) */}
      <Suspense fallback={<SectionSkeleton height="h-72" />}>
        <UpcomingEventsCarousel initialEvents={events} />
      </Suspense>

      {/* 5. Featured Kennel Clubs (Card Listing) */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <FeaturedClubsSlider initialClubs={clubs} />
      </Suspense>

      {/* 6. Elite International Judges (Card Listing) */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <FeaturedJudgesSlider judges={judges} />
      </Suspense>

      {/* 7. About JuzDog Media */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <AboutUsSection initialData={aboutData} />
      </Suspense>
    </PageContainer>
  );
}
