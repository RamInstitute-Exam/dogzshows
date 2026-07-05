'use client';

import { useAboutCMS } from '@/hooks/useCMS';
import { motion } from 'framer-motion';
import { Camera, Video, Film, Star } from 'lucide-react';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import PageContainer from '@/components/layout/PageContainer';
import { config } from '@/lib/config';

export default function AboutClient({ initialBannerData }: { initialBannerData?: any }) {
  const { data } = useAboutCMS();
  const aboutData = data?.success ? data.data : null;

  return (
    <PageContainer>
      
      {/* Hero Section */}
      <BreadcrumbBanner
        slug="about"
        fallbackTitle={aboutData?.title || "About JuzDog"}
        fallbackSubtitle={aboutData?.content || "JuzDog provides premium event coverage, professional canine photography, and cinematic videography, capturing the true spirit of dog shows."}
        fallbackImage={aboutData?.image || "/images/about_banner.png"}
        initialBannerData={initialBannerData}
      />

      {/* Values Grid */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: Camera, title: 'Dog Show Event Coverage', desc: 'Comprehensive professional photography and videography services designed to capture every moment of dog show events.' },
            { icon: Star, title: 'Canine Photoshoots', desc: 'Premium studio and outdoor photoshoots tailored to highlight the unique characteristics and beauty of your dogs.' },
            { icon: Film, title: 'Event Highlights & Reels', desc: 'Cinematic stories and engaging highlight reels perfectly crafted for social media and lasting memories.' },
            { icon: Video, title: 'Champion Spotlights', desc: 'Dedicated focus on winners, kennels, and handlers, showcasing their prestige and achievements with high-quality media.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-8 rounded-[2rem] border border-border shadow-sm flex gap-6 premium-hover"
            >
              <div className="bg-foreground/10 p-4 rounded-2xl h-fit text-foreground shrink-0">
                <item.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
