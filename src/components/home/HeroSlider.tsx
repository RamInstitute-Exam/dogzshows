'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Image as ImageIcon, X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, Keyboard } from 'swiper/modules';
import { getImageUrl } from '@/lib/api';
import Spinner from '@/components/common/loader/Spinner';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
      className={`relative w-full h-full hero-slide bg-transparent ${onClick ? 'cursor-zoom-in' : ''}`}
      onClick={onClick}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <img src="/Untitled-1.png" alt="Loading" className="w-[100px] h-auto animate-pulse opacity-50" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className="hero-image-render"
        loading={isFirst ? "eager" : "lazy"}
        onLoad={() => {
          setLoading(false);
          if (onLoadSuccess) onLoadSuccess();
        }}
        onError={() => {
          setError(true);
          setLoading(false);
          onFail();
        }}
        style={{
          width: "100%",
          height: "auto",
          objectFit: "contain",
          objectPosition: "center",
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
          <img src="/Untitled-1.png" alt="Loading" className="w-[120px] h-auto animate-pulse" />
        </div>
      </section>
    );
  }

  const showNav = validBanners.length > 1;

  return (
    <section className="hero-section w-full relative">
      <div className={`hero-carousel-container premium-container premium-carousel-wrapper transition-opacity duration-700 ${isInitialized ? 'opacity-100' : 'opacity-0'}`}>
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onInit={() => setTimeout(() => setIsInitialized(true), 50)}
          modules={[Autoplay, Navigation, Pagination, Keyboard]}
          loop={true}
          speed={500}
          grabCursor={true}
          observer={true}
          observeParents={true}
          watchOverflow={true}
          autoplay={showNav ? {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          } : false}
          keyboard={{ enabled: true }}
          navigation={false}
          pagination={showNav ? {
            clickable: true,
            el: '.hero-dots',
            bulletClass: 'hero-dot',
            bulletActiveClass: 'hero-dot-active',
          } : false}
          slidesPerView={1}
          spaceBetween={0}
          centeredSlides={true}
          autoHeight={true}
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
                  if (swiperRef.current) {
                    setTimeout(() => {
                      swiperRef.current.updateAutoHeight();
                    }, 100);
                  }
                }}
                onClick={!slide.redirectUrl ? () => setZoomedImage(getImageUrl(slide.imageUrl)) : undefined}
              />
            );

            return (
              <SwiperSlide key={slide.id || index} className="hero-slide-item-wrapper">
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
              </SwiperSlide>
            );
          })}
        </Swiper>

        {showNav && (
          <>
            {/* Navigation Arrows */}
            <button 
              aria-label="Previous slide" 
              onClick={() => swiperRef.current?.slidePrev()} 
              className="premium-slider-nav premium-slider-prev"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              aria-label="Next slide" 
              onClick={() => swiperRef.current?.slideNext()} 
              className="premium-slider-nav premium-slider-next"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Pagination Dots */}
            <div className="hero-dots" />
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
          padding-top: 32px;
          padding-bottom: 32px;
        }

        .hero-carousel-container {
          position: relative !important;
          height: auto;
          min-height: auto;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0;
          overflow: visible !important;
          
          /* Desktop (>= 768px): padding left/right for outside arrows, bottom padding for dots */
          padding-left: 60px !important;
          padding-right: 60px !important;
          padding-bottom: 28px !important;
        }

        .hero-swiper {
          width: 100%;
          height: auto;
          padding: 0;
        }

        .hero-slide-item-wrapper {
          height: auto;
          min-height: auto;
          transition: all 0.5s ease-in-out;
          transform: scale(1) !important;
          opacity: 1 !important;
          border-radius: 24px;
          overflow: hidden;
          background: transparent;
        }

        .hero-slide-item-wrapper.swiper-slide-active {
          transform: scale(1) !important;
          opacity: 1 !important;
        }

        .hero-slide {
          position: relative;
          width: 100%;
          height: auto;
          overflow: hidden;
          background: transparent;
        }

        .hero-slide img.hero-image-render {
          width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
          object-position: center;
          display: block;
          margin-bottom: 0;
        }

        /* Desktop premium slider nav positioning (vertically centered on left/right edges outside banner) */
        .hero-carousel-container .premium-slider-nav {
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          bottom: auto !important;
          z-index: 20 !important;
          width: 44px !important;
          height: 44px !important;
          border-radius: 9999px !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          cursor: pointer !important;
          transition: all 0.25s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #000 !important;
          margin-top: 0 !important;
        }

        .dark .hero-carousel-container .premium-slider-nav {
          background: rgba(0, 0, 0, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
        }

        .hero-carousel-container .premium-slider-nav:hover {
          transform: translateY(-50%) scale(1.08) !important;
          background: #ffffff !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25) !important;
        }

        .hero-carousel-container .premium-slider-prev {
          left: 8px !important;
          right: auto !important;
        }

        .hero-carousel-container .premium-slider-next {
          right: 8px !important;
          left: auto !important;
        }

        .hero-carousel-container .hero-dots {
          position: absolute !important;
          bottom: 4px !important;
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

        /* RESPONSIVE BREAKPOINTS */
        @media (max-width: 1600px) {
          .hero-carousel-container { height: auto !important; }
        }
        @media (max-width: 1400px) {
          .hero-carousel-container { height: auto !important; }
        }
        @media (max-width: 1200px) {
          .hero-carousel-container { height: auto !important; }
        }
        @media (max-width: 992px) {
          .hero-carousel-container { height: auto !important; }
        }
        @media (max-width: 1024px) {
          .hero-section { padding-top: 24px; padding-bottom: 24px; }
        }
        @media (max-width: 767px) {
          .hero-section { padding-top: 16px; padding-bottom: 16px; }
          .hero-carousel-container { 
            height: auto !important; 
            min-height: auto !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
            margin-bottom: 0 !important;
            padding-bottom: 60px !important; /* reserve space for dots & arrows */
          }
          .hero-slide-item-wrapper {
            border-radius: 20px !important;
            transform: scale(1) !important;
            opacity: 1 !important;
          }
          .hero-slide-item-wrapper.swiper-slide-active {
            transform: scale(1) !important;
            opacity: 1 !important;
          }

          /* Move navigation arrows below the banner on mobile */
          .hero-carousel-container .premium-slider-nav {
            top: auto !important;
            bottom: 8px !important;
            transform: none !important;
            width: 40px !important;
            height: 40px !important;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15) !important;
            background: #ffffff !important;
          }

          .dark .hero-carousel-container .premium-slider-nav {
            background: rgba(0, 0, 0, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: white !important;
          }

          .hero-carousel-container .premium-slider-nav:hover {
            transform: scale(1.05) !important;
            background: #ffffff !important;
          }

          .hero-carousel-container .premium-slider-prev {
            left: 20px !important;
            right: auto !important;
          }

          .hero-carousel-container .premium-slider-next {
            right: 20px !important;
            left: auto !important;
          }

          /* Center pagination dots between arrows */
          .hero-carousel-container .hero-dots {
            bottom: 24px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: auto !important;
          }
        }
        @media (max-width: 576px) {
          .hero-carousel-container { height: auto !important; min-height: auto !important; }
        }
        @media (max-width: 480px) {
          .hero-section { padding-top: 16px; padding-bottom: 16px; }
          .hero-carousel-container { 
            height: auto !important; 
            min-height: auto !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
            margin-bottom: 0 !important;
            padding-bottom: 60px !important; /* maintain 60px on smaller screens */
            border-radius: 20px !important;
          }
          .hero-slide-item-wrapper {
            height: auto !important;
            min-height: auto !important;
            transform: scale(1) !important;
            opacity: 1 !important;
            border-radius: 20px !important;
            background: transparent;
          }
          .hero-slide-item-wrapper.swiper-slide-active {
            transform: scale(1) !important;
            opacity: 1 !important;
          }
          .hero-swiper { padding: 0 !important; }
        }
        @media (max-width: 360px) {
          .hero-carousel-container { height: auto !important; }
        }
      `}</style>
    </section>
  );
}
