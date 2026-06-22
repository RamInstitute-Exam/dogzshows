'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Video, Trophy, Radio, Image as ImageIcon, Building2, HelpCircle, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';

// Map string identifier to React component
const renderIcon = (iconName: string) => {
  switch (iconName) {
    case 'Camera':
      return <Camera className="w-6 h-6" />;
    case 'Video':
      return <Video className="w-6 h-6" />;
    case 'Trophy':
      return <Trophy className="w-6 h-6" />;
    case 'Radio':
      return <Radio className="w-6 h-6" />;
    case 'ImageIcon':
      return <ImageIcon className="w-6 h-6" />;
    case 'Building2':
      return <Building2 className="w-6 h-6" />;
    default:
      return <HelpCircle className="w-6 h-6" />;
  }
};

const iconStyles: Record<string, { bg: string; text: string }> = {
  Camera: { bg: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-500' },
  Video: { bg: 'from-foreground/10 to-foreground/5', text: 'text-foreground' },
  Trophy: { bg: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-500' },
  Radio: { bg: 'from-red-500/20 to-red-500/5', text: 'text-red-500' },
  ImageIcon: { bg: 'from-indigo-500/20 to-indigo-500/5', text: 'text-indigo-500' },
  Building2: { bg: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-500' },
};

export default function AboutUsSection({ initialData }: { initialData?: any }) {
  const data = initialData;

  if (!data || data.status === 'INACTIVE') {
    return null;
  }

  const renderHeading = (text: string) => {
    if (!text) return null;
    const lineParts = text.split('\n');
    return lineParts.map((line, lIdx) => (
      <span key={lIdx}>
        {line}
        {lIdx < lineParts.length - 1 && <br />}
      </span>
    ));
  };

  const imagesList = data.images || [];

  return (
    <section className="w-full py-24 lg:py-32 bg-gradient-to-b from-[#FAFAFA] to-[#F3F4F6] dark:from-[#050505] dark:to-[#111111] relative overflow-hidden transition-colors duration-500">
      
      {/* Background Decorative Radial Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-foreground/3 dark:bg-foreground/3 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] bg-purple-500/3 dark:bg-purple-500/2 rounded-full blur-[180px]" />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Info & Features */}
          <div className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white border border-zinc-800 text-sm font-bold shadow-sm">
                <span>✨</span> {data.sectionLabel || 'Professional Coverage'}
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black dark:text-white leading-[1.05] tracking-tight">
                {renderHeading(data.heading)}
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                {data.description}
              </p>
            </motion.div>

            {/* Dynamic Features List */}
            <div className="space-y-6">
              {data.features?.map((feature: any, idx: number) => {
                const style = iconStyles[feature.icon] || { bg: 'from-accent', text: 'text-foreground' };
                return (
                  <motion.div
                    key={feature.id || idx}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: 0.1 * idx }}
                    className="flex gap-4 md:gap-6 items-start group p-4 rounded-2xl hover:bg-card/50 hover:shadow-md border border-transparent hover:border-border/30 transition-all duration-300"
                  >
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${style.bg} ${style.text} group-hover:scale-110 transition-transform duration-300 shadow-inner shrink-0`}>
                      {renderIcon(feature.icon)}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-foreground group-hover:text-foreground transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Link 
                href={data.primaryBtnLink || '/gallery'} 
                className="btn-primary-luxury group gap-2 px-8"
              >
                <Camera className="w-5 h-5" />
                {data.primaryBtnText || 'Explore Media Gallery'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href={data.secondaryBtnLink || '/events'} 
                className="btn-primary-luxury group gap-2 px-8"
              >
                <Calendar className="w-5 h-5" />
                {data.secondaryBtnText || 'View Upcoming Shows'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Staggered Masonry visual grid */}
          <div className="relative">
            {/* Soft radial glow backdrop */}
            <div className="absolute inset-0 bg-gradient-radial from-foreground/3 to-transparent blur-[120px] pointer-events-none -m-10" />

            <div className="grid grid-cols-2 gap-4 sm:gap-6 items-center">
              
              {/* Left Masonry Column with subtle float */}
              <motion.div 
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="space-y-4 sm:space-y-6"
              >
                <ImageOrPlaceholder src={imagesList[0]?.imageUrl} index={0} />
                <ImageOrPlaceholder src={imagesList[2]?.imageUrl} index={2} />
              </motion.div>

              {/* Right Masonry Column with opposite float */}
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="space-y-4 sm:space-y-6"
              >
                <ImageOrPlaceholder src={imagesList[1]?.imageUrl} index={1} />
                <ImageOrPlaceholder src={imagesList[3]?.imageUrl} index={3} />
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// Masonry Card Renderer
const ImageOrPlaceholder = ({ src, index }: { src: string | undefined; index: number }) => {
  const fallbackLogo = '/Untitled-1.png';
  const hasImage = !!src;

  // Staggered height styling to form masonry grid
  const heightStyles = [
    'h-60 sm:h-72 lg:h-[280px] xl:h-[320px]',
    'h-72 sm:h-[340px] lg:h-[380px] xl:h-[420px]',
    'h-72 sm:h-[340px] lg:h-[380px] xl:h-[420px]',
    'h-60 sm:h-72 lg:h-[280px] xl:h-[320px]',
  ];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`w-full ${heightStyles[index]} rounded-[24px] overflow-hidden shadow-lg hover:shadow-2xl border border-border/10 dark:border-white/5 relative group bg-card/40 backdrop-blur flex items-center justify-center transition-all duration-300`}
    >
      {hasImage ? (
        <Image
          src={getImageUrl(src)}
          alt={`Branding Section Gallery Item ${index + 1}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full bg-muted/20">
          <img
            src={fallbackLogo}
            alt="JuzDog Placeholder Logo"
            className="w-16 h-auto opacity-30 dark:opacity-20 mb-3 group-hover:scale-110 transition-transform duration-300"
          />
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold opacity-60">
            JuzDog Studio
          </span>
        </div>
      )}
    </motion.div>
  );
};
