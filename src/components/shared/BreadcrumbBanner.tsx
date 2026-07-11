'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getImageUrl } from '@/lib/api';
import { SafeImage } from '@/components/shared/SafeImage';
import { usePageBanner } from '@/hooks/useCMS';

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
  fallbackImage,
  fallbackBreadcrumb,
  initialBannerData,
}: BreadcrumbBannerProps) {
  const { data: queryData, isLoading } = usePageBanner(slug, initialBannerData);

  const hasLiveBanner = queryData?.success && queryData.data?.bannerImage;
  const liveBannerUrl = hasLiveBanner ? queryData.data.bannerImage : null;

  const data: PageBannerData = {
    title: queryData?.success && queryData.data?.title ? queryData.data.title : fallbackTitle,
    subtitle: queryData?.success && queryData.data?.subtitle ? queryData.data.subtitle : fallbackSubtitle,
    bannerImage: liveBannerUrl || fallbackImage || '',
    breadcrumbTitle:
      queryData?.success && queryData.data?.breadcrumbTitle
        ? queryData.data.breadcrumbTitle
        : queryData?.success && queryData.data?.title
          ? queryData.data.title
          : fallbackBreadcrumb || fallbackTitle,
  };

  const hasBanner = !isLoading && !!data.bannerImage;

  return (
    /*
     * ── OUTER SHELL ────────────────────────────────────────────────────────
     * • NO overflow:hidden — lets the image breathe
     * • Dark background shows behind/around contain-fitted image
     * • Height is purely responsive via CSS clamp so the 1920×600
     *   banner is never cropped on any side.
     */
    <section
      className="relative w-full flex items-center justify-center"
      style={{
        /* Adjusted height clamp to match typical banner aspect ratio (e.g. 1920x600) and avoid black bars on mobile */
        height: 'clamp(100px, 31.25vw, 520px)',
        background: 'linear-gradient(180deg, #060606 0%, #111111 100%)',
      }}
    >
      {/* ── BANNER IMAGE ──────────────────────────────────────────────────
       *  object-fit: cover  → Fills the entire area without any empty spaces
       *  object-position: center center
       */}
      {hasBanner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full"
          style={{ overflow: 'hidden' }}
        >
          <SafeImage
            src={getImageUrl(data.bannerImage)}
            fallbackSrc=""
            alt={data.title}
            fill
            priority
            quality={100}
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center center',
              willChange: 'opacity',
            }}
          />
        </motion.div>
      )}

      {/*
       * ── SUBTLE BOTTOM VIGNETTE ───────────────────────────────────────
       * Very light — just enough to blend edge into page background.
       * Does NOT cover important content.
       */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '60px',
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 100%)',
        }}
      />
    </section>
  );
}
