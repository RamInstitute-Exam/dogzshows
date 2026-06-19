'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, Keyboard } from 'swiper/modules';
import { getImageUrl } from '@/lib/api';

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
}

interface HeroSliderProps {
  banners: HeroBannerData[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!banners || banners.length === 0) {
    return (
      <section className="w-full h-[280px] sm:h-[340px] md:h-[460px] lg:h-[600px] xl:h-[680px] flex items-center justify-center bg-accent/10 border-b border-border/50">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-xl font-bold text-muted-foreground">No homepage banners available.</h2>
        </div>
      </section>
    );
  }

  if (!isMounted) {
    return (
      <section className="hero-section">
        <div className="hero-carousel-container w-full h-[280px] sm:h-[340px] md:h-[460px] lg:h-[600px] xl:h-[680px] bg-muted/10 animate-pulse flex items-center justify-center">
        </div>
      </section>
    );
  }

  return (
    <section className="hero-section bg-black">
      <div className={`hero-carousel-container relative transition-opacity duration-700 ${isInitialized ? 'opacity-100' : 'opacity-0'}`}>
        <Swiper
          onInit={() => setTimeout(() => setIsInitialized(true), 50)}
          modules={[Autoplay, Navigation, Pagination, Keyboard]}
          centeredSlides={true}
          loop={banners.length > 1}
          speed={500}
          grabCursor={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          keyboard={{ enabled: true }}
          navigation={{
            prevEl: '.hero-prev',
            nextEl: '.hero-next',
          }}
          pagination={{
            clickable: true,
            el: '.hero-dots',
            bulletClass: 'hero-dot',
            bulletActiveClass: 'hero-dot-active',
          }}
          slidesPerView={1}
          spaceBetween={0}
          className="hero-swiper"
        >
          {banners.map((slide, index) => {
            const innerContent = (
              <div className="hero-slide-wrapper group relative block w-full h-full">
                <Image
                  src={getImageUrl(slide.imageUrl)}
                  alt={slide.title || 'JuzDog Championship'}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  sizes="100vw"
                  className="object-cover object-center w-full h-full hero-image"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                />
              </div>
            );

            return (
              <SwiperSlide key={slide.id || index} className="hero-slide-item">
                {slide.redirectUrl ? (
                  <a 
                    href={slide.redirectUrl} 
                    target={slide.openNewTab ? "_blank" : "_self"} 
                    rel={slide.openNewTab ? "noopener noreferrer" : ""}
                    className="block w-full"
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

        {/* Navigation Arrows */}
        <button aria-label="Previous slide" className="hero-arrow hero-prev">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button aria-label="Next slide" className="hero-arrow hero-next">
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Pagination Dots */}
        <div className="hero-dots" />
      </div>

      <style jsx global>{`
        .hero-section {
          width: 100%;
          background: #FFFFFF;
          overflow: hidden;
          padding-top: 0 !important;
          padding-bottom: 32px !important;
        }
        .dark .hero-section {
          background: #000000;
        }
        @media (min-width: 768px) {
          .hero-section {
            padding-bottom: 48px !important;
          }
        }
        @media (min-width: 1024px) {
          .hero-section {
            padding-bottom: 64px !important;
          }
        }

        .hero-carousel-container {
          position: relative;
          width: 100vw;
          height: 720px;
          overflow: hidden;
          background: #000;
        }

        .hero-swiper {
          width: 100%;
          overflow: visible !important;
        }

        /* Custom Fade/Stack logic overriding Swiper's horizontal translation */
        .hero-swiper .swiper-wrapper {
          transform: none !important;
        }

        .hero-slide-item {
          position: absolute !important;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100%;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.7s ease;
          display: flex;
          justify-content: center;
        }

        .hero-slide-item.swiper-slide-active {
          opacity: 1;
          pointer-events: auto;
          position: absolute !important;
          z-index: 10;
        }

        .hero-slide-item.swiper-slide-prev,
        .hero-slide-item.swiper-slide-next {
          opacity: 1;
          z-index: 5;
        }

        /* Default Wrapper (Incoming/Hidden state) */
        .hero-slide-wrapper {
          position: absolute;
          left: 50%;
          top: 0;
          transform: translateX(-50%) scale(0.96);
          width: 78vw;
          max-width: 1450px;
          height: 720px;
          border-radius: 34px;
          overflow: hidden;
          transition: all 0.7s ease;
          opacity: 0;
        }

        /* CENTER ACTIVE SLIDE */
        .swiper-slide-active .hero-slide-wrapper {
          opacity: 1;
          transform: translateX(-50%) scale(1);
          z-index: 5;
        }

        /* LEFT PREVIEW */
        .swiper-slide-prev .hero-slide-wrapper {
          position: absolute;
          left: -120px;
          top: 40px;
          width: 420px;
          height: 640px;
          border-radius: 28px;
          overflow: hidden;
          opacity: 0.28;
          filter: blur(10px);
          transform: scale(0.95);
          z-index: 1;
          margin: 0;
        }

        /* RIGHT PREVIEW */
        .swiper-slide-next .hero-slide-wrapper {
          position: absolute;
          right: -120px;
          left: auto;
          top: 40px;
          width: 420px;
          height: 640px;
          border-radius: 28px;
          overflow: hidden;
          opacity: 0.28;
          filter: blur(10px);
          transform: scale(0.95);
          z-index: 1;
          margin: 0;
        }

        /* Responsive Heights & Hidden Previews */
        @media (max-width: 1439px) {
          .hero-carousel-container { height: 620px; }
          .hero-slide-wrapper { height: 620px; }
          .swiper-slide-prev .hero-slide-wrapper,
          .swiper-slide-next .hero-slide-wrapper { height: 540px; top: 40px; }
        }

        @media (max-width: 1024px) {
          .hero-carousel-container { height: 500px; }
          .hero-slide-wrapper { height: 500px; }
          .swiper-slide-prev .hero-slide-wrapper,
          .swiper-slide-next .hero-slide-wrapper { height: 420px; top: 40px; }
        }

        @media (max-width: 767px) {
          .hero-carousel-container { height: 340px; }
          .hero-slide-wrapper { 
            width: 100vw;
            max-width: 100vw; 
            height: 340px; 
            border-radius: 0; 
          }
          .swiper-slide-prev .hero-slide-wrapper,
          .swiper-slide-next .hero-slide-wrapper {
            display: none !important;
          }
        }

        .hero-image {
          display: block;
          transition: transform 0.5s ease;
          transform: scale(1);
        }

        .hero-slide-item.swiper-slide-active .hero-image {
          transform: scale(1.03);
        }

        .hero-arrow {
          position: absolute;
          z-index: 20;
          width: 82px;
          height: 82px;
          border-radius: 50%;
          background: rgba(0,0,0,.35);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.15);
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
          transform: translateY(-50%) scale(1.08);
          background: rgba(0,0,0,.55);
        }

        .hero-prev {
          left: 40px;
        }

        .hero-next {
          right: 40px;
        }

        @media (max-width: 767px) {
          .hero-arrow {
            width: 50px;
            height: 50px;
          }
          .hero-prev { left: 16px; }
          .hero-next { right: 16px; }
        }

        .hero-dots {
          position: absolute;
          bottom: 40px;
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
          background: var(--primary);
          width: 32px;
          border-radius: 999px;
        }
      `}</style>
    </section>
  );
}
