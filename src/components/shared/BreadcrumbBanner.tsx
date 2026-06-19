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
}

export default function BreadcrumbBanner({
  slug,
  fallbackTitle,
  fallbackSubtitle,
  fallbackImage = '/images/hero_banner.png',
  fallbackBreadcrumb,
}: BreadcrumbBannerProps) {
  const { data: queryData } = usePageBanner(slug);

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
    <section className="relative w-full h-[140px] md:h-[260px] lg:h-[300px] xl:h-[340px] flex items-center overflow-hidden bg-background">
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
          className="object-cover"
        />
      </motion.div>

      {/* Dark Overlay with Glass effect */}
      <div
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,.92), rgba(0,0,0,.72), rgba(0,0,0,.45))',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 xl:px-8 py-6 sm:py-15 md:py-20 flex flex-col justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-4 sm:mb-6 font-mulish text-[13px] xl:text-[15px]">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[rgba(255,255,255,0.25)]" />
            <span className="text-primary font-medium">{data.breadcrumbTitle}</span>
          </nav>

          {/* Title */}
          <h1 className="text-[30px] md:text-[40px] lg:text-[52px] xl:text-[60px] font-[800] text-foreground leading-[1.1] mb-2 sm:mb-4 tracking-tight">
            {data.title}
          </h1>

          {/* Description */}
          {data.subtitle && (
            <p className="text-[16px] xl:text-[22px] text-muted-foreground leading-[1.8] max-w-[700px]">
              {data.subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
