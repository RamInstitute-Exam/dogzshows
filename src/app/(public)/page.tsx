'use client';

import React, { useEffect, useState } from 'react';
import HeroSlider from '@/components/home/HeroSlider';
import FeaturedShowsSlider from '@/components/home/FeaturedShowsSlider';
import FeaturedMediaGallery from '@/components/home/FeaturedMediaGallery';
import FeaturedJudgesSlider from '@/components/home/FeaturedJudgesSlider';
import FCIGroupGrid from '@/components/home/FCIGroupGrid';
import StatsCounter from '@/components/home/StatsCounter';
import Testimonials from '@/components/home/Testimonials';
import Sponsors from '@/components/home/Sponsors';
import FAQ from '@/components/home/FAQ';
import PageContainer from '@/components/layout/PageContainer';

import {
  getHeroSlides,
  getFeaturedShows,
  getFeaturedPhotos,
  getFeaturedVideos,
  getFeaturedJudges,
  getFCIGroups,
  getStats,
  getTestimonials,
  getSponsors,
} from '@/lib/server-api';

export default function Home() {
  const [banners, setBanners] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          bannersRes,
          showsRes,
          photosRes,
          videosRes,
          judgesRes,
          groupsRes,
          statsRes,
          testimonialsRes,
          sponsorsRes,
        ] = await Promise.all([
          getHeroSlides().catch(() => ({ success: false, data: [] })),
          getFeaturedShows().catch(() => ({ success: false, data: [] })),
          getFeaturedPhotos().catch(() => ({ success: false, data: [] })),
          getFeaturedVideos().catch(() => ({ success: false, data: [] })),
          getFeaturedJudges().catch(() => ({ success: false, data: [] })),
          getFCIGroups().catch(() => ({ success: false, data: [] })),
          getStats().catch(() => ({ success: false, data: [] })),
          getTestimonials().catch(() => ({ success: false, data: [] })),
          getSponsors().catch(() => ({ success: false, data: [] })),
        ]);

        setBanners(bannersRes?.data || []);
        setShows(showsRes?.data || []);
        setPhotos(photosRes?.data || []);
        setVideos(videosRes?.data || []);
        setJudges(judgesRes?.data || []);
        setGroups(groupsRes?.data || []);
        setStats(statsRes?.data || []);
        setTestimonials(testimonialsRes?.data || []);
        setSponsors(sponsorsRes?.data || []);
      } catch (error) {
        console.error("Error loading homepage data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <PageContainer>

      {/* 1. Hero Banner Slider */}
      {banners.length > 0 && <HeroSlider banners={banners} />}

      {/* 2. Featured Dog Shows */}
      <FeaturedShowsSlider shows={shows} />

      {/* 3. Featured Photography + 4. Featured Videography */}
      <FeaturedMediaGallery 
        photos={photos} 
        videos={videos} 
      />

      {/* 5. Featured Judges */}
      <FeaturedJudgesSlider judges={judges} />

      {/* 6. Featured KCI Clubs / FCI Breed Groups */}
      <FCIGroupGrid groups={groups} />

      {/* 7. Statistics Counter */}
      <StatsCounter statsData={stats} />

      {/* 8. Testimonials */}
      <Testimonials testimonialsData={testimonials} />

      {/* 9. Sponsors */}
      <Sponsors sponsorsData={sponsors} />

      {/* 10. FAQ */}
      <FAQ />

    </PageContainer>
  );
}
