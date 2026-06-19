'use client';

import { useAboutCMS } from '@/hooks/useCMS';
import { motion } from 'framer-motion';
import { Shield, Globe, Users, Trophy } from 'lucide-react';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import PageContainer from '@/components/layout/PageContainer';
import { config } from '@/lib/config';

export default function AboutPage() {
  const { data } = useAboutCMS();
  const aboutData = data?.success ? data.data : null;

  return (
    <PageContainer>
      
      {/* Hero Section */}
      <BreadcrumbBanner
        slug="about"
        fallbackTitle={aboutData?.title || "About JuzDog"}
        fallbackSubtitle={aboutData?.content || "JuzDog is the premier enterprise platform for dog event management, bringing transparency, efficiency, and prestige to championships worldwide."}
        fallbackImage={aboutData?.image || "/images/hero_banner.png"}
      />

      {/* Values Grid */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: Shield, title: 'KCI Verified Integrity', desc: 'Our advanced OCR technology ensures that every dog registered is verified against official Kennel Club of India certificates.' },
            { icon: Globe, title: 'Global Standards', desc: 'We operate under strict FCI guidelines, ensuring our event brackets, judging criteria, and awards meet international standards.' },
            { icon: Users, title: 'Community Driven', desc: 'We provide a seamless experience for owners, breeders, and judges to connect, compete, and celebrate their passion.' },
            { icon: Trophy, title: 'Prestigious Recognition', desc: 'Our platform permanently records achievements, generating secure digital certificates and public champion profiles.' }
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
