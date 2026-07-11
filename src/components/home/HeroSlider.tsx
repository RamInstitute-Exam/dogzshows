'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, Variants } from 'framer-motion';
import { getImageUrl } from '@/lib/api';
import Link from 'next/link';

export interface HeroBannerData {
  id: string;
  title: string;
  imageUrl: string;
  redirectUrl?: string | null;
  openNewTab?: boolean;
  displayOrder: number;
  status: string;
  bannerMode?: string;
}

interface HeroSliderProps {
  banners: HeroBannerData[];
}

// Helper function to render a premium dark shimmer SVG placeholder
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#111" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#111" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#111" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

// ── Single slide ──────────────────────────────────────────────────────────────
function BannerSlide({
  banner,
  isActive,
  isPriority,
  direction,
  onNext,
  onPrev,
}: {
  banner: HeroBannerData;
  isActive: boolean;
  isPriority: boolean;
  direction: number;
  onNext: () => void;
  onPrev: () => void;
}) {
  const imgSrc = getImageUrl(banner.imageUrl);
  const href = banner.redirectUrl?.trim();

  // Smart Image Rendering state
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Parallax bindings: Background moves 30%, Card moves 10%
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], [0, 300]);
  const imageY = useTransform(scrollY, [0, 1000], [0, 100]);

  const handleImageLoad = (e: any) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setAspectRatio(naturalWidth / naturalHeight);
      setIsPortrait(naturalWidth < naturalHeight);
    }
  };

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth) {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
      setIsPortrait(img.naturalWidth < img.naturalHeight);
    }
  }, [banner.imageUrl]);

  // Exit and Enter variants for cinematic OTT transitions
  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { duration: 0.5, ease: 'easeInOut' },
        opacity: { duration: 0.4 },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      transition: {
        x: { duration: 0.5, ease: 'easeInOut' },
        opacity: { duration: 0.4 },
      },
    }),
  };

  return (
    <motion.div
      className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-black"
      variants={slideVariants}
      custom={direction}
      initial="enter"
      animate="center"
      exit="exit"
    >
      {/* Layer 1: Blurred cinematic background */}
      <motion.div
        className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none"
        style={{ y: bgY }}
      >
        <Image
          src={imgSrc}
          alt=""
          fill
          priority={isPriority}
          quality={30}
          sizes="100vw"
          className="object-cover scale-[1.3] filter blur-[40px] brightness-[45%] opacity-80"
        />
      </motion.div>

      {/* Layer 2: Dark cinematic gradient overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.75) 100%)'
        }}
      />

      {/* Layer 3: Actual clear image centered above */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-8 md:p-12 overflow-hidden w-full h-full">
        {/* Subtle floating animation */}
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ y: imageY }}
          className="flex items-center justify-center w-full h-full relative"
        >
          {/* Card element - sizes dynamically via aspect ratio & CSS rules */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
            className={`jd-banner-card ${isPortrait ? 'portrait' : 'landscape'}`}
            style={{
              ['--aspect-ratio' as any]: aspectRatio ? `${aspectRatio}` : '1.6'
            }}
          >
            {href ? (
              <Link
                href={href}
                target={banner.openNewTab ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="absolute inset-0 block w-full h-full overflow-hidden rounded-[inherit]"
              >
                {/* Ken Burns zooming container */}
                <motion.div
                  className="w-full h-full relative"
                  animate={{
                    scale: [1, 1.05],
                  }}
                  transition={{
                    duration: 8,
                    ease: 'linear',
                  }}
                >
                  <Image
                    ref={imgRef}
                    src={imgSrc}
                    alt={banner.title || 'JuzDog Championship Banner'}
                    fill
                    priority={isPriority}
                    quality={100}
                    onLoad={handleImageLoad}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 85vw"
                    className="object-contain object-center"
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                  />
                </motion.div>
              </Link>
            ) : (
              <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[inherit]">
                {/* Ken Burns zooming container */}
                <motion.div
                  className="w-full h-full relative"
                  animate={{
                    scale: [1, 1.05],
                  }}
                  transition={{
                    duration: 8,
                    ease: 'linear',
                  }}
                >
                  <Image
                    ref={imgRef}
                    src={imgSrc}
                    alt={banner.title || 'JuzDog Championship Banner'}
                    fill
                    priority={isPriority}
                    quality={100}
                    onLoad={handleImageLoad}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 85vw"
                    className="object-contain object-center"
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                  />
                </motion.div>
              </div>
            )}

            {/* Navigation Arrows positioned INSIDE the tightly wrapped card for mobile only */}
            <div className="md:hidden absolute top-1/2 -translate-y-1/2 left-0 w-full z-30 pointer-events-none flex justify-between px-2">
              <button
                className="pointer-events-auto jd-hero-arrow"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPrev(); }}
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" color="#ffffff" />
              </button>
              <button
                className="pointer-events-auto jd-hero-arrow"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onNext(); }}
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" color="#ffffff" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main slider ───────────────────────────────────────────────────────────────
export default function HeroSlider({ banners }: HeroSliderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const validBanners = banners?.filter(b => b?.imageUrl?.trim()) || [];
  const total = validBanners.length;

  useEffect(() => { setIsMounted(true); }, []);

  const goTo = useCallback((idx: number, dir = 1) => {
    setDirection(dir);
    setCurrent(((idx % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  useEffect(() => {
    if (total <= 1 || paused) return;
    timerRef.current = setTimeout(next, 6000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, next, total]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [next, prev]);

  if (!validBanners.length || !isMounted) {
    return <div className="jd-hero-skeleton" />;
  }

  return (
    <>
      <style>{`
        /* Immersive layout container dimensions */
        .jd-hero {
          position:   relative;
          width:      calc(100vw - 24px);
          overflow:   hidden;
          background: #000;
          height:     55vh;
          margin: 12px auto 0 auto;
          border-radius: 20px;
        }
        
        @media (min-width: 768px) {
          .jd-hero {
            height: 70vh;
            aspect-ratio: auto;
            width: 100%;
            margin: 0;
            border-radius: 0;
          }
        }
        
        @media (min-width: 1024px) {
          .jd-hero {
            height: 90vh;
            aspect-ratio: auto;
            width: 100%;
            margin: 0;
            border-radius: 0;
          }
        }

        /* Aspect ratio adaptive clear image card */
        .jd-banner-card {
          --aspect-ratio: 1.6; /* default fallback */
          position: relative;
          border-radius: 20px;
          background: transparent;
          width: 100%;
          height: 100%;
        }

        @media (min-width: 768px) {
          .jd-banner-card {
            border-radius: 28px;
            --max-w: 86vw;
            --max-h: 75vh;
            width: min(var(--max-w), var(--max-h) * var(--aspect-ratio));
            height: min(var(--max-h), var(--max-w) / var(--aspect-ratio));
            margin: 0 auto;
          }
        }

        @media (min-width: 1024px) {
          .jd-banner-card {
            border-radius: 28px;
            --max-w: 96vw;
            --max-h: 88vh;
            width: min(var(--max-w), var(--max-h) * var(--aspect-ratio));
            height: min(var(--max-h), var(--max-w) / var(--aspect-ratio));
            margin: 0 auto;
          }
        }

        /* Remove padding around clear card on mobile */
        .jd-hero div.z-20 {
          padding: 0 !important;
        }

        @media (min-width: 768px) {
          .jd-hero div.z-20 {
            padding: 16px !important;
          }
        }

        @media (min-width: 1024px) {
          .jd-hero div.z-20 {
            padding: 48px !important;
          }
        }

        /* Glass call to action button */
        .premium-glass-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 28px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          text-decoration: none;
        }

        .premium-glass-button:hover {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 24px rgba(255, 255, 255, 0.3);
          transform: translateY(-2px) scale(1.04);
        }

        .premium-glass-button:active {
          transform: translateY(0) scale(1);
        }

        /* circular glass arrows with 20px blur */
        .jd-hero-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        @media (max-width: 768px) {
          .jd-hero-arrow {
            width: 44px;
            height: 44px;
          }
        }

        .jd-hero-arrow:hover {
          background: rgba(255, 255, 255, 0.4);
          border-color: rgba(255, 255, 255, 0.6);
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .jd-hero-dots-container {
            display: none !important;
          }
        }

        /* Netflix Style dots */
        .jd-hero-dots-container {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
          display: flex;
          gap: 10px;
        }

        .jd-hero-dot {
          height: 8px;
          border-radius: 999px;
          background: #ffffff;
          border: none;
          cursor: pointer;
          padding: 0;
          margin: 0;
          transition: width 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease;
        }

        .jd-hero-skeleton {
          height: 60vh;
          background: #000;
        }
        @media (min-width: 768px) { .jd-hero-skeleton { height: 70vh; } }
        @media (min-width: 1024px) { .jd-hero-skeleton { height: 90vh; } }
      `}</style>

      <section
        className="jd-hero"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          touchStartX.current = e.targetTouches[0].clientX;
        }}
        onTouchMove={(e) => {
          touchEndX.current = e.targetTouches[0].clientX;
        }}
        onTouchEnd={() => {
          const diff = touchStartX.current - touchEndX.current;
          if (Math.abs(diff) > 50) {
            if (diff > 0) {
              next();
            } else {
              prev();
            }
          }
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <BannerSlide
            key={current}
            banner={validBanners[current]}
            isActive={true}
            isPriority={true}
            direction={direction}
            onNext={next}
            onPrev={prev}
          />
        </AnimatePresence>

        {/* Global Navigation Arrows for Desktop */}
        {total > 1 && (
          <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 right-4 z-40 justify-between pointer-events-none">
            <button
              className="pointer-events-auto jd-hero-arrow"
              onClick={prev}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-8 h-8 text-white drop-shadow-md" color="#ffffff" />
            </button>
            <button
              className="pointer-events-auto jd-hero-arrow"
              onClick={next}
              aria-label="Next slide"
            >
              <ChevronRight className="w-8 h-8 text-white drop-shadow-md" color="#ffffff" />
            </button>
          </div>
        )}

        {/* Netflix style dot pagination */}
        {total > 1 && (
          <div className="jd-hero-dots-container">
            {validBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="jd-hero-dot"
                style={{
                  width: idx === current ? 34 : 10,
                  opacity: idx === current ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        )}

        {/* Cinematic bottom gradient removed to prevent darkening details */}
      </section>
    </>
  );
}
