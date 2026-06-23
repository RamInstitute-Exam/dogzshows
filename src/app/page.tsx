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
const SlidingPhotoSections = dynamic(() => import('@/components/home/SlidingPhotoSections'));
const UpcomingEventsCarousel = dynamic(() => import('@/components/home/UpcomingEventsCarousel'));
const FeaturedClubsSlider = dynamic(() => import('@/components/home/FeaturedClubsSlider'));
const FeaturedJudgesSlider = dynamic(() => import('@/components/home/FeaturedJudgesSlider'));
const AboutUsSection = dynamic(() => import('@/components/home/AboutUsSection'));

const SectionSkeleton = ({ height = 'h-64' }: { height?: string }) => (
  <PublicContainer className="py-16 space-y-4">
    <div className="w-48 h-8 bg-accent animate-pulse rounded mb-8" />
    <div className={`w-full ${height} bg-accent/30 animate-pulse rounded-2xl`} />
  </PublicContainer>
);

export const revalidate = 300; // ISR revalidation every 5 minutes

async function HeroSectionWrapper() {
  const bannersRes = await getHeroSlides().catch(() => ({ success: false, data: [] }));
  const banners = bannersRes?.data || [];
  if (!banners.length) return null;
  return <HeroSlider banners={banners} />;
}

async function PremiumPhotosWrapper() {
  const slidingSectionsRes = await fetchServerData('/public/homepage-sliding-sections/public', 300).catch(() => ({ success: false, data: [] }));
  const slidingSections = slidingSectionsRes?.data || [];
  return <SlidingPhotoSections initialSections={slidingSections} />;
}

async function EventsWrapper() {
  const eventsRes = await fetchServerData('/public/events/upcoming?limit=6', 300).catch(() => ({ success: false, data: [] }));
  const events = eventsRes?.data || [];
  return <UpcomingEventsCarousel initialEvents={events} />;
}

async function ClubsWrapper() {
  const clubsRes = await fetchServerData('/public/clubs?limit=10', 300).catch(() => ({ success: false, data: [] }));
  const clubs = clubsRes?.data || [];
  return <FeaturedClubsSlider initialClubs={clubs} />;
}

async function JudgesWrapper() {
  const judgesRes = await getFeaturedJudges().catch(() => ({ success: false, data: [] }));
  const judges = judgesRes?.data || [];
  return <FeaturedJudgesSlider judges={judges} />;
}

async function AboutWrapper() {
  const aboutRes = await fetchServerData('/public/homepage-about-section', 300).catch(() => ({ success: false, data: [] }));
  const aboutData = aboutRes?.data || null;
  return <AboutUsSection initialData={aboutData} />;
}

export default function Home() {
  return (
    <PageContainer>
      {/* 1. Hero Banner Slider (Loads ASAP) */}
      <Suspense fallback={<div className="w-full h-[60vh] bg-accent/20 animate-pulse" />}>
        <HeroSectionWrapper />
      </Suspense>

      {/* 3. Premium Personal Photos (Lazy) */}
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <PremiumPhotosWrapper />
      </Suspense>

      {/* 4. Upcoming Show Calendars (Lazy) */}
      <Suspense fallback={<SectionSkeleton height="h-72" />}>
        <EventsWrapper />
      </Suspense>

      {/* 5. Featured Kennel Clubs (Lazy) */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <ClubsWrapper />
      </Suspense>

      {/* 6. Elite International Judges (Lazy) */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <JudgesWrapper />
      </Suspense>

      {/* 7. About JuzDog Media (Lazy) */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <AboutWrapper />
      </Suspense>
    </PageContainer>
  );
}
