'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, Keyboard } from 'swiper/modules';
import { getImageUrl } from '@/lib/api';
import Spinner from '@/components/common/loader/Spinner';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import OptimizedImage from '@/components/shared/OptimizedImage';

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

function SlideImage({ src, alt, onFail, isFirst, onClick, onLoadSuccess }: { src: string; alt: string; onFail: () => void, isFirst?: boolean, onClick?: () => void, onLoadSuccess?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Safety fallback: if the image takes too long or onLoad fails to trigger from browser cache
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (error) return null; // Don't render broken images, let parent slide handle empty space

  return (
    <div
      className={`relative w-full h-full hero-slide bg-[#0a0a0a] overflow-hidden ${onClick ? 'cursor-zoom-in' : ''}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden pointer-events-none">
        <Image
          src={src}
          alt="blur background"
          fill
          className="object-cover blur-[50px] opacity-60 scale-[1.2]"
          quality={30}
          priority={isFirst}
        />
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <Image src="/Untitled-1.png" unoptimized alt="Loading" width={100} height={100} className="w-[100px] h-auto animate-pulse opacity-30" priority />
        </div>
      )}
      
      {/* ── CINEMATIC OVERLAYS ── */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 z-20 pointer-events-none luxury-light-sweep" />
      <div className="hero-slide-image-container relative z-10 w-full h-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="hero-image-render"
          priority={isFirst}
          quality={100}
          sizes="100vw"
          onLoad={(e) => {
            setLoading(false);
            if (onLoadSuccess) onLoadSuccess();
          }}
          onError={() => {
            setError(true);
            setLoading(false);
            onFail();
          }}
          style={{
            display: "block"
          }}
        />
      </div>
    </div>
  );
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter out banners with missing URLs before they even reach the slider
  const validBanners = banners?.filter(b => b && b.imageUrl && b.imageUrl.trim() !== '') || [];

  if (!validBanners || validBanners.length === 0) {
    return (
      <section className="premium-section-spacing">
        <div className="hero-carousel-container premium-container premium-carousel-wrapper flex items-center justify-center bg-muted/10 border border-border">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-xl font-bold text-muted-foreground">No homepage banners available.</h2>
          </div>
        </div>
      </section>
    );
  }

  if (!isMounted) {
    return (
      <section className="premium-section-spacing">
        <div className="hero-carousel-container premium-container premium-carousel-wrapper flex items-center justify-center">
          <OptimizedImage src="/Untitled-1.png" alt="Loading" className="w-[120px] h-auto animate-pulse" fetchPriority="high" style={{ width: '120px', height: 'auto' }} />
        </div>
      </section>
    );
  }

  const showNav = validBanners.length > 1;

  return (
    <section className="hero-section w-full relative">
      <div className={`hero-carousel-container transition-opacity duration-700 ${isInitialized ? 'opacity-100' : 'opacity-0'}`}>
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onInit={() => setTimeout(() => setIsInitialized(true), 50)}
          modules={[Autoplay, Navigation, Pagination, Keyboard]}
          loop={true}
          speed={1200}
          observer={true}
          observeParents={true}
          watchOverflow={true}
          watchSlidesProgress={true}
          autoHeight={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          keyboard={{ enabled: true }}
          navigation={false}
          pagination={showNav ? {
            clickable: true,
            el: '.hero-dots',
            bulletClass: 'hero-dot',
            bulletActiveClass: 'hero-dot-active',
          } : false}
          slidesPerView={'auto'}
          centeredSlides={true}
          spaceBetween={24}
          breakpoints={{
            768: { spaceBetween: 32 },
            1024: { spaceBetween: 40 },
          }}
          className="hero-swiper premium-carousel-track"
        >
          {validBanners.map((slide, index) => {
            const hasRedirect = !!(slide.redirectUrl && slide.redirectUrl.trim());
            const innerContent = (
              <SlideImage
                src={getImageUrl(slide.imageUrl)}
                alt={slide.title || 'JuzDog Championship'}
                isFirst={index === 0}
                onFail={() => {
                  if (swiperRef.current) {
                    swiperRef.current.slideNext();
                  }
                }}
                onLoadSuccess={() => {
                  // Removed dynamic height update to preserve center alignment
                }}
                onClick={undefined}
              />
            );

            return (
              <SwiperSlide key={slide.id || index} className="hero-slide-wrapper">
                <div className="hero-slide-inner">
                  {hasRedirect ? (
                    <a
                      href={slide.redirectUrl!}
                      target={slide.openNewTab ? "_blank" : "_self"}
                      rel={slide.openNewTab ? "noopener noreferrer" : ""}
                      className="block w-full h-full cursor-pointer"
                    >
                      {innerContent}
                    </a>
                  ) : (
                    innerContent
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {showNav && (
          <>
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="hero-nav-btn hero-nav-btn-prev"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 xl:w-[28px] xl:h-[28px]" />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="hero-nav-btn hero-nav-btn-next"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7 xl:w-[28px] xl:h-[28px]" />
            </button>

            {/* Pagination Dots */}
            <div className="hero-dots mt-4 md:mt-0" />
          </>
        )}
      </div>

      <style jsx global>{`
        .hero-section {
          padding-top: 0;
          padding-bottom: 24px;
          margin-top: 0;
        }

        @keyframes floatBanner {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
          100% { transform: translateY(0px); }
        }

        .hero-carousel-container {
          position: relative !important;
          width: 100%;
          max-width: 1900px;
          height: 650px;
          margin: 0 auto !important;
          background: transparent;
          overflow: visible !important;
          padding: 0 !important;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: floatBanner 8s ease-in-out infinite;
        }

        .hero-swiper {
          width: 100%;
          height: 100%;
          padding: 0 !important;
          margin: 0 !important;
          overflow: visible !important;
        }

        .hero-slide-wrapper {
          width: 75% !important;
          height: 650px !important;
          flex-shrink: 0;
          position: relative;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-swiper :global(.swiper-wrapper) {
          transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1) !important;
        }

        .hero-slide-inner {
          width: 100%;
          height: 100%;
          transition: transform 1.2s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.2s cubic-bezier(0.19, 1, 0.22, 1), clip-path 1.2s cubic-bezier(0.19, 1, 0.22, 1) !important;
          transform: scale(1.05) translate3d(-10%, 0, 0) !important;
          opacity: 0.9 !important;
          border-radius: 32px;
          overflow: hidden;
          background: transparent;
          will-change: transform, opacity, clip-path;
        }

        .hero-slide-wrapper.swiper-slide-active .hero-slide-inner {
          transform: scale(1) translate3d(0, 0, 0) !important;
          opacity: 1 !important;
          clip-path: inset(0 0 0 0 round 32px);
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.5);
          z-index: 10;
        }

        .hero-slide-wrapper.swiper-slide-next .hero-slide-inner {
          transform: scale(1.08) translate3d(100%, 0, 0) !important;
          clip-path: inset(0 0 0 100% round 32px);
          opacity: 1 !important;
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 32px;
        }

        .hero-slide-image-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transition: transform 1.2s cubic-bezier(0.19, 1, 0.22, 1);
          transform: scale(1);
          will-change: transform;
          border-radius: 32px;
          overflow: hidden;
        }

        /* Ken Burns Effect */
        @keyframes kenBurns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.06) translate(-2px, -2px); }
        }

        /* Animated Light Sweep */
        @keyframes lightSweep {
          0% { transform: translateX(-150%) skewX(-15deg); opacity: 0; }
          10% { opacity: 0.15; }
          20% { transform: translateX(200%) skewX(-15deg); opacity: 0; }
          100% { transform: translateX(200%) skewX(-15deg); opacity: 0; }
        }

        .luxury-light-sweep {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 150px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: lightSweep 10s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .hero-slide-wrapper.swiper-slide-active .hero-slide-image-container {
          animation: kenBurns 6s linear forwards;
        }

        .hero-slide img.hero-image-render {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center center !important;
          image-rendering: auto;
          backface-visibility: hidden;
          transform: translateZ(0);
          border-radius: 32px !important;
        }

        /* Arrows styling */
        .hero-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 72px !important;
          height: 72px !important;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          pointer-events: auto;
          cursor: pointer;
        }

        .hero-nav-btn:hover {
          transform: translateY(-50%) scale(1.08);
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow: 0 15px 40px rgba(0,0,0,0.25);
        }
        
        .hero-nav-btn svg {
          transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .hero-nav-btn-prev:hover svg {
          transform: rotate(-10deg) translateX(-2px);
        }
        .hero-nav-btn-next:hover svg {
          transform: rotate(10deg) translateX(2px);
        }

        .hero-nav-btn:active {
          transform: translateY(-50%) scale(0.98);
        }

        .hero-nav-btn-prev {
          left: 40px;
        }

        .hero-nav-btn-next {
          right: 40px;
        }

        .hero-carousel-container .hero-dots {
          position: absolute !important;
          bottom: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          z-index: 15 !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        .hero-dot {
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hero-dot-active {
          background: #FFFFFF;
          width: 24px;
          border-radius: 999px;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .hero-carousel-container {
            height: auto !important;
          }
          .hero-slide-wrapper {
            width: 100% !important;
            height: auto !important;
          }
          .hero-slide-inner {
            border-radius: 0;
            transform: scale(1) !important;
            opacity: 1 !important;
            filter: blur(0px) !important;
            height: auto !important;
          }
          .hero-slide-image-container {
            transform: translate3d(0, 0, 0) scale(1) !important;
            transition: none !important;
            position: relative;
            height: auto !important;
          }
          .hero-slide {
            position: relative;
            height: auto;
          }
          .hero-slide-wrapper.swiper-slide-active .hero-slide-image-container {
            transform: translate3d(0, 0, 0) scale(1) !important;
          }
          .hero-slide-wrapper.swiper-slide-active ~ .hero-slide-wrapper .hero-slide-image-container {
            transform: translate3d(0, 0, 0) scale(1) !important;
          }
          .hero-slide img.hero-image-render {
            position: relative !important;
            height: auto !important;
            width: 100% !important;
            object-fit: contain !important;
            object-position: center center !important;
          }
          .hero-nav-btn {
            width: 56px !important;
            height: 56px !important;
          }
          .hero-nav-btn-prev { left: 16px; }
          .hero-nav-btn-next { right: 16px; }
        }

        @media (max-width: 767px) {
          .hero-carousel-container {
            height: auto !important;
          }
          .hero-swiper {
            padding: 0 !important;
            height: auto !important;
          }
          .hero-slide-wrapper {
            width: 100% !important;
            height: auto !important;
          }
          .hero-slide-inner {
            border-radius: 0;
            transform: scale(1) !important;
            opacity: 1 !important;
            filter: blur(0px) !important;
            transition: opacity 1.3s cubic-bezier(0.22, 1, 0.36, 1) !important;
            height: auto !important;
          }
          .hero-slide-image-container {
            transform: translate3d(0, 0, 0) scale(1) !important;
            transition: none !important;
            position: relative;
            height: auto !important;
          }
          .hero-slide {
            position: relative;
            height: auto;
          }
          .hero-slide-wrapper.swiper-slide-active .hero-slide-image-container {
            transform: translate3d(0, 0, 0) scale(1) !important;
          }
          .hero-slide-wrapper.swiper-slide-active ~ .hero-slide-wrapper .hero-slide-image-container {
            transform: translate3d(0, 0, 0) scale(1) !important;
          }
          .hero-slide img.hero-image-render {
            position: relative !important;
            height: auto !important;
            width: 100% !important;
            object-fit: contain !important;
            object-position: center top !important;
          }
          .hero-nav-btn {
            width: 48px !important;
            height: 48px !important;
          }
          .hero-nav-btn-prev { left: 12px; }
          .hero-nav-btn-next { right: 12px; }
        }
      `}</style>
    </section>
  );
}
