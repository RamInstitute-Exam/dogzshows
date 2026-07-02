'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
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
    bannerImage: liveBannerUrl || '',
    breadcrumbTitle:
      queryData?.success && queryData.data?.breadcrumbTitle
        ? queryData.data.breadcrumbTitle
        : queryData?.success && queryData.data?.title
        ? queryData.data.title
        : fallbackBreadcrumb || fallbackTitle,
  };

  return (
    <section className="relative w-full h-[160px] sm:h-[200px] md:h-[380px] lg:h-[460px] xl:h-[520px] flex items-center overflow-hidden bg-zinc-950">
      {/* Background Image with Zoom Animation — Only show dynamic live banner once loaded */}
      {!isLoading && data.bannerImage && (
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <SafeImage
            src={getImageUrl(data.bannerImage)}
            fallbackSrc=""
            alt={data.title}
            fill
            priority
            className="object-cover object-center"
          />
        </motion.div>
      )}

      {/* Subtle Premium Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-black/10 to-transparent" />
    </section>
  );
}
