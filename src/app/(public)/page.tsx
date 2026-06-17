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

export const revalidate = 60; // 1-minute revalidation for ISR caching

export default async function Home() {
  // Parallel data fetching on the server
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
    getHeroSlides(),
    getFeaturedShows(),
    getFeaturedPhotos(),
    getFeaturedVideos(),
    getFeaturedJudges(),
    getFCIGroups(),
    getStats(),
    getTestimonials(),
    getSponsors(),
  ]);

  return (
    <PageContainer>

      {/* 1. Hero Banner Slider */}
      {bannersRes?.data?.length > 0 && <HeroSlider banners={bannersRes.data} />}

      {/* 2. Featured Dog Shows */}
      <FeaturedShowsSlider shows={showsRes.data} />

      {/* 3. Featured Photography + 4. Featured Videography */}
      <FeaturedMediaGallery 
        photos={photosRes.data} 
        videos={videosRes.data} 
      />

      {/* 5. Featured Judges */}
      <FeaturedJudgesSlider judges={judgesRes.data} />

      {/* 6. Featured KCI Clubs / FCI Breed Groups */}
      <FCIGroupGrid groups={groupsRes.data} />

      {/* 7. Statistics Counter */}
      <StatsCounter statsData={statsRes.data} />

      {/* 8. Testimonials */}
      <Testimonials testimonialsData={testimonialsRes.data} />

      {/* 9. Sponsors */}
      <Sponsors sponsorsData={sponsorsRes.data} />

      {/* 10. FAQ */}
      <FAQ />

    </PageContainer>
  );
}
