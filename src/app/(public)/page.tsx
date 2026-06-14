'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dog } from 'lucide-react';
import HeroSlider from '@/components/home/HeroSlider';
import StatsCounter from '@/components/home/StatsCounter';
import UpcomingEventsCarousel from '@/components/home/UpcomingEventsCarousel';
import PhotographyPromo from '@/components/home/PhotographyPromo';
import FeaturedJudgesSlider from '@/components/home/FeaturedJudgesSlider';
import FCIGroupGrid from '@/components/home/FCIGroupGrid';
import RegistrationTimeline from '@/components/home/RegistrationTimeline';
import WinnersHallSlider from '@/components/home/WinnersHallSlider';
import BreedExplorer from '@/components/home/BreedExplorer';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';
import Sponsors from '@/components/home/Sponsors';

function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-card flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <Dog className="w-16 h-16 text-brand-orange" />
        <span className="font-extrabold text-muted-foregroundxl text-foreground tracking-tight">Juz<span className="text-brand-orange">Dog</span></span>
      </motion.div>
      <div className="w-64 h-1 bg-accent rounded-full overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-full h-full bg-brand-orange"
        />
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <SplashScreen />}
      </AnimatePresence>

      {!loading && (
        <main className="min-h-fit bg-background font-sans selection:bg-brand-orange selection:text-foreground">
          
          {/* Section 1: Hero Banner Slider */}
          <HeroSlider />
          
          {/* Section 2: Live Statistics Counter */}
          <StatsCounter />
          
          {/* Section 3: Upcoming Events */}
          <UpcomingEventsCarousel />
          
          {/* Section 4: Photography & Videography */}
          <PhotographyPromo />
          
          {/* Section 5: Featured Judges */}
          <FeaturedJudgesSlider />
          
          {/* Section 6: FCI Groups */}
          <FCIGroupGrid />
          
          {/* Section 7: Breed Explorer */}
          <BreedExplorer />
          
          {/* Section 9: Registration Timeline */}
          <RegistrationTimeline />
          
          {/* Section 11: Winners Hall */}
          <WinnersHallSlider />
          
          {/* Section 13: Testimonials */}
          <Testimonials />
          
          {/* Section 14: Sponsors */}
          <Sponsors />
          

          {/* Section 17: FAQ */}
          <FAQ />
          
        </main>
      )}
    </>
  );
}
