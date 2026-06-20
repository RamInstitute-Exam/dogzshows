'use client';

import React, { useEffect, useState } from 'react';
import HeroSlider from '@/components/home/HeroSlider';
import FeaturedClubsSlider from '@/components/home/FeaturedClubsSlider';
import AboutUsSection from '@/components/home/AboutUsSection';
import PremiumOutdoorPhotos from '@/components/home/PremiumOutdoorPhotos';
import SlidingPhotoSections from '@/components/home/SlidingPhotoSections';
import FeaturedMediaGallery from '@/components/home/FeaturedMediaGallery';
import FeaturedJudgesSlider from '@/components/home/FeaturedJudgesSlider';
import FCIGroupGrid from '@/components/home/FCIGroupGrid';
import UpcomingEventsCarousel from '@/components/home/UpcomingEventsCarousel';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';

import {
  getHeroSlides,
  getFeaturedShows,
  getFeaturedPhotos,
  getFeaturedVideos,
  getFeaturedJudges,
  getFCIGroups,
} from '@/lib/server-api';

const SectionSkeleton = ({ height = 'h-64' }) => (
  <PublicContainer className="py-16 space-y-4">
    <div className="w-48 h-8 bg-accent animate-pulse rounded mb-8" />
    <div className={`w-full ${height} bg-accent/30 animate-pulse rounded-2xl`} />
  </PublicContainer>
);

export default function Home() {
  const [banners, setBanners] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  
  const [loadingP1, setLoadingP1] = useState(true);
  const [loadingP2, setLoadingP2] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    async function loadPriorityData() {
      try {
        // Priority 1: Hero Banner
        const [bannersRes] = await Promise.all([
          getHeroSlides().catch(() => ({ success: false, data: [] }))
        ]);
        setBanners(bannersRes?.data || []);
        setLoadingP1(false);

        // Priority 2: Other Data
        const [judgesRes, groupsRes, photosRes, videosRes] = await Promise.all([
          getFeaturedJudges().catch(() => ({ success: false, data: [] })),
          getFCIGroups().catch(() => ({ success: false, data: [] })),
          getFeaturedPhotos().catch(() => ({ success: false, data: [] })),
          getFeaturedVideos().catch(() => ({ success: false, data: [] }))
        ]);
        setJudges(judgesRes?.data || []);
        setGroups(groupsRes?.data || []);
        setPhotos(photosRes?.data || []);
        setVideos(videosRes?.data || []);
        setLoadingP2(false);

      } catch (error) {
        console.error("Error loading homepage data:", error);
        setLoadingP1(false);
        setLoadingP2(false);
      }
    }

    loadPriorityData();
  }, []);

  return (
    <PageContainer>
      {/* 1. Hero Banner Slider */}
      {loadingP1 ? (
        <div className="w-full h-[60vh] bg-accent/20 animate-pulse" />
      ) : (
        banners.length > 0 && <HeroSlider banners={banners} />
      )}
      
      {/* 2. Premium Personal Photos */}
      <SlidingPhotoSections />

      {/* 3. Outdoor Photos - Hidden per user request */}
      {/* <PremiumOutdoorPhotos /> */}

      {/* 4. Upcoming Show Calendars (Card Listing) */}
      <UpcomingEventsCarousel />

      {/* 5. Featured Kennel Clubs (Card Listing) - Hidden per user request */}

      {/* 5. Featured Kennel Clubs (Card Listing) */}
      <FeaturedClubsSlider />

      {/* 6. Elite International Judges (Card Listing) */}
      {loadingP2 ? (
        <SectionSkeleton height="h-64" />
      ) : (
        <FeaturedJudgesSlider judges={judges} />
      )}

      {/* 7. About JuzDog Media (Capture Every Champion Moment) */}
      <AboutUsSection />

      {/* 8. Latest Photography & Videography Showcase - Hidden per user request
      {loadingP2 ? (
        <SectionSkeleton height="h-96" />
      ) : (
        <FeaturedMediaGallery 
          photos={photos} 
          videos={videos} 
        />
      )}
      */}

    </PageContainer>
  );
}
