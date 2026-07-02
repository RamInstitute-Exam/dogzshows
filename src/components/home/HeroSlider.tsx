'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Image as ImageIcon, X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, Keyboard, Parallax } from 'swiper/modules';
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
      className={`relative w-full h-full hero-slide bg-[#0a0a0a] ${onClick ? 'cursor-zoom-in' : ''}`}
      data-swiper-parallax="-30"
      onClick={onClick}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <Image src="/Untitled-1.png" unoptimized alt="Loading" width={100} height={100} className="w-[100px] h-auto animate-pulse opacity-30" priority />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className="hero-image-render cinematic-zoom"
        priority={true}
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
          objectFit: "contain",
          objectPosition: "center center",
          display: "block"
        }}
      />
    </div>
  );
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
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
          modules={[Autoplay, Navigation, Pagination, Keyboard, Parallax]}
          parallax={true}
          loop={true}
          speed={1200}
          grabCursor={true}
          observer={true}
          observeParents={true}
          watchOverflow={true}
          autoplay={{
            delay: 4000,
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
                onClick={!slide.redirectUrl ? () => setZoomedImage(getImageUrl(slide.imageUrl)) : undefined}
              />
            );

            return (
              <SwiperSlide key={slide.id || index} className="hero-slide-wrapper">
                <div className="hero-slide-inner">
                  {slide.redirectUrl ? (
                    <a
                      href={slide.redirectUrl}
                      target={slide.openNewTab ? "_blank" : "_self"}
                      rel={slide.openNewTab ? "noopener noreferrer" : ""}
                      className="block w-full h-full"
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

      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out touch-pan-x touch-pan-y"
            onClick={() => setZoomedImage(null)}
          >
            <button
              className="absolute top-4 right-4 z-50 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-md transition-colors"
              onClick={() => setZoomedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-full flex items-center justify-center overflow-auto pointer-events-none">
              <img
                src={zoomedImage}
                alt="Zoomed"
                className="max-w-full max-h-[90vh] object-contain pointer-events-auto"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .hero-section {
          padding-top: 24px;
          padding-bottom: 24px;
          margin-top: 20px;
        }

        .hero-carousel-container {
          position: relative !important;
          width: 100%;
          max-width: 1900px;
          height: 700px;
          margin: 0 auto !important;
          background: transparent;
          overflow: hidden !important;
          padding: 0 !important;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-swiper {
          width: 100%;
          height: 100%;
          padding: 0 !important;
          margin: 0 !important;
        }

        .hero-slide-wrapper {
          width: 82% !important;
          height: 700px !important;
          flex-shrink: 0;
          position: relative;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-slide-inner {
          width: 100%;
          height: 100%;
          transition: transform 1.2s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.2s ease-out, filter 1.2s ease-out !important;
          transform: scale(0.98) !important;
          opacity: 0.4 !important;
          filter: blur(4px) !important;
          border-radius: 32px;
          overflow: hidden;
          background: #0a0a0a;
        }

        .hero-slide-wrapper.swiper-slide-active .hero-slide-inner {
          transform: scale(1) translateZ(0) !important;
          opacity: 1 !important;
          filter: none !important;
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.6);
          z-index: 10;
        }

        .hero-slide-wrapper:hover .hero-slide-inner {
          opacity: 0.85 !important;
        }

        .hero-slide-wrapper.swiper-slide-active:hover .hero-slide-inner {
          opacity: 1 !important;
          filter: none !important;
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .hero-slide img.hero-image-render {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: top center !important;
          image-rendering: auto;
          backface-visibility: hidden;
          transform: translateZ(0);
        }

        /* Cinematic Zoom Animation (Ken Burns) */
        .cinematic-zoom {
          transform: scale(1);
          transition: transform 10s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .hero-slide-wrapper.swiper-slide-active .cinematic-zoom {
          transform: scale(1.02);
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
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.3s ease;
          pointer-events: auto;
          cursor: pointer;
        }

        .hero-nav-btn:hover {
          transform: translateY(-50%) scale(1.08);
          background: rgba(0,0,0,0.75);
        }

        .hero-nav-btn:active {
          transform: translateY(-50%) scale(0.96);
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
            height: 500px !important;
          }
          .hero-slide-wrapper {
            width: 90% !important;
            height: 500px !important;
          }
          .hero-nav-btn {
            width: 56px !important;
            height: 56px !important;
          }
          .hero-nav-btn-prev { left: 20px; }
          .hero-nav-btn-next { right: 20px; }
        }

        @media (max-width: 767px) {
          .hero-carousel-container {
            height: 280px !important;
          }
          .hero-swiper {
            padding: 0 !important;
            height: 280px !important;
          }
          .hero-slide-wrapper {
            width: 100% !important;
            height: 280px !important;
          }
          .hero-slide-inner {
            border-radius: 0;
            transform: scale(1) !important;
            opacity: 1 !important;
            filter: blur(0px) !important;
          }
          .hero-nav-btn {
            width: 48px !important;
            height: 48px !important;
          }
          .hero-nav-btn-prev { left: 16px; }
          .hero-nav-btn-next { right: 16px; }
          
          .cinematic-zoom {
            transform: scale(1) !important;
            transition: none !important;
          }
          .hero-slide-wrapper.swiper-slide-active .cinematic-zoom {
            transform: scale(1) !important;
          }
        }
      `}</style>
    </section>
  );
}
