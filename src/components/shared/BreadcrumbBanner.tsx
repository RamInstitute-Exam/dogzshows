'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { config } from '@/lib/config';
import { getImageUrl } from '@/lib/api';
import { usePageBanner } from '@/hooks/useCMS';
import { SafeImage } from '@/components/shared/SafeImage';

interface PageBannerData {
  title: string;
  subtitle?: string;
  bannerImage: string;
  breadcrumbTitle?: string;
}

interface BreadcrumbBannerProps {
  slug: string;
  fallbackTitle: string;
  fallbackSubtitle?: string;
  fallbackImage?: string;
  fallbackBreadcrumb?: string;
  initialBannerData?: any;
}

export default function BreadcrumbBanner({
  slug,
  fallbackTitle,
  fallbackSubtitle,
  fallbackImage = '/images/hero_banner.png',
  fallbackBreadcrumb,
  initialBannerData,
}: BreadcrumbBannerProps) {
  const { data: queryData } = usePageBanner(slug, initialBannerData);

  const data: PageBannerData = queryData?.success && queryData.data
    ? {
        title: queryData.data.title || fallbackTitle,
        subtitle: queryData.data.subtitle || fallbackSubtitle,
        bannerImage: queryData.data.bannerImage || fallbackImage,
        breadcrumbTitle:
          queryData.data.breadcrumbTitle ||
          queryData.data.title ||
          fallbackBreadcrumb ||
          fallbackTitle,
      }
    : {
        title: fallbackTitle,
        subtitle: fallbackSubtitle,
        bannerImage: fallbackImage,
        breadcrumbTitle: fallbackBreadcrumb || fallbackTitle,
      };

  return (
    <section className="relative w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[460px] xl:h-[520px] flex items-center overflow-hidden bg-background">
      {/* Background Image with Zoom Animation */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 w-full h-full"
      >
        <SafeImage
          src={getImageUrl(data.bannerImage)}
          fallbackSrc="/images/events_banner.png"
          alt={data.title}
          fill
          priority
          className="object-cover object-center"
        />
      </motion.div>

      {/* Premium Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.28) 40%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0.08) 100%)',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 xl:px-12 py-6 sm:py-15 md:py-20 flex flex-col justify-center h-full">
        <motion.div
          className="max-w-[600px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-4 sm:mb-6 font-mulish text-[13px] xl:text-[15px] drop-shadow-md">
            <Link href="/" className="text-zinc-300 hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/30" />
            <span className="text-primary font-medium">{data.breadcrumbTitle}</span>
          </nav>

          {/* Title */}
          <h1 className="text-[30px] md:text-[40px] lg:text-[52px] xl:text-[60px] font-[800] text-white leading-[1.1] mb-2 sm:mb-4 tracking-tight drop-shadow-md">
            {data.title}
          </h1>

          {/* Description */}
          {data.subtitle && (
            <p className="text-[16px] xl:text-[22px] text-zinc-100 leading-[1.8] drop-shadow-md">
              {data.subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
