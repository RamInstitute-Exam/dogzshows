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

function SlideImage({ src, alt }: { src: string; alt: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fallback to default local banner on error
  const imageSrc = error ? '/images/hero_banner.png' : src;

  return (
    <div className="relative w-full h-full hero-slide bg-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <Spinner size="md" />
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        fill
        priority
        unoptimized
        quality={100}
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        style={{
          objectFit: "contain",
          objectPosition: "center",
          opacity: loading ? 0 : 1, // Prevent flash of loading components
        }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        className="hero-image-render"
      />
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

  if (!banners || banners.length === 0) {
    return (
      <section className="hero-section">
        <div className="hero-carousel-container flex items-center justify-center">
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
      <section className="hero-section">
        <div className="hero-carousel-container bg-muted/10 animate-pulse flex items-center justify-center">
        </div>
      </section>
    );
  }

  const showNav = banners.length > 1;

  return (
    <section className="hero-section">
      <div className={`hero-carousel-container relative transition-opacity duration-700 ${isInitialized ? 'opacity-100' : 'opacity-0'}`}>
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
          navigation={false} // Handle navigation programmatically using refs
          pagination={showNav ? {
            clickable: true,
            el: '.hero-dots',
            bulletClass: 'hero-dot',
            bulletActiveClass: 'hero-dot-active',
          } : false}
          slidesPerView={1}
          spaceBetween={0}
          className="hero-swiper"
        >
          {banners.map((slide, index) => {
            const innerContent = (
              <SlideImage
                src={getImageUrl(slide.imageUrl)}
                alt={slide.title || 'JuzDog Championship'}
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
              className="hero-arrow hero-prev"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              aria-label="Next slide" 
              onClick={() => swiperRef.current?.slideNext()} 
              className="hero-arrow hero-next"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Pagination Dots */}
            <div className="hero-dots" />
          </>
        )}
      </div>

      <style jsx global>{`
        .hero-section {
          width: 100%;
          padding: 0 !important;
          margin-top: 0 !important;
          margin-bottom: 24px !important;
          background: transparent;
        }

        .hero-carousel-container {
          position: relative;
          width: 100%;
          max-width: 1800px;
          margin: 0 auto;
          height: 78vh;
          min-height: 700px;
          max-height: 850px;
          overflow: hidden;
          border-radius: 20px;
          background: #000;
        }

        .hero-swiper {
          width: 100%;
          height: 100%;
        }

        .hero-slide-item-wrapper {
          width: 100%;
          height: 100%;
        }

        .hero-slide {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #000;
        }

        .hero-slide img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
        }

        .hero-arrow {
          position: absolute;
          z-index: 50;
          pointer-events: auto;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          top: 50%;
          transform: translateY(-50%);
        }

        .hero-arrow:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .hero-arrow svg {
          width: 24px !important;
          height: 24px !important;
        }

        .hero-prev {
          left: 24px;
        }

        .hero-next {
          right: 24px;
        }

        .hero-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 15;
          display: flex;
          align-items: center;
          gap: 8px;
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

        /* TABLET (768px - 1199px) */
        @media (min-width: 768px) and (max-width: 1199px) {
          .hero-carousel-container {
            height: 65vh !important;
            min-height: 500px !important;
            border-radius: 20px !important;
          }
        }

        /* MOBILE (<768px) */
        @media (max-width: 767px) {
          .hero-carousel-container {
            height: auto !important;
            aspect-ratio: 4 / 5; /* Provides implicit height to prevent collapse */
            min-height: 400px;
            border-radius: 0px !important;
          }
          .hero-arrow {
            width: 42px !important;
            height: 42px !important;
            background: rgba(255, 255, 255, 0.12) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            backdrop-filter: blur(8px) !important;
            opacity: 0.35 !important;
            transform: translateY(-50%) !important;
          }
          .hero-arrow:hover,
          .hero-arrow:active {
            opacity: 0.9 !important;
            background: rgba(255, 255, 255, 0.22) !important;
            transform: translateY(-50%) scale(1.05) !important;
          }
          .hero-arrow svg {
            width: 18px !important;
            height: 18px !important;
          }
          .hero-prev {
            left: 12px !important;
          }
          .hero-next {
            right: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}
