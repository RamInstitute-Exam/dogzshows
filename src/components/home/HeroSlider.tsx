'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, Keyboard } from 'swiper/modules';
import { getImageUrl } from '@/lib/api';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export interface HeroBannerData {
  id: string;
  title: string;
  subtitle?: string | null;
  desktopImage: string;
  mobileImage?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  displayOrder: number;
  isActive: boolean;
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
    return null;
  }

  if (!isMounted) {
    return (
      <section className="hero-section">
        <div className="hero-carousel-container w-full h-[280px] sm:h-[340px] md:h-[460px] lg:h-[600px] xl:h-[680px] bg-muted/10 animate-pulse flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin opacity-50" />
        </div>
      </section>
    );
  }

  return (
    <section className="hero-section">
      <div className={`hero-carousel-container transition-opacity duration-500 ${isInitialized ? 'opacity-100' : 'opacity-0'}`}>
        <div className="hero-edge-fade-left" />
        <div className="hero-edge-fade-right" />
        <Swiper
          onInit={() => setTimeout(() => setIsInitialized(true), 50)}
          modules={[Autoplay, Navigation, Pagination, Keyboard]}
          centeredSlides={true}
          loop={true}
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
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 0,
            },
            768: {
              slidesPerView: 1.2,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 1.35,
              spaceBetween: 24,
            },
          }}
          className="hero-swiper"
        >
          {banners.map((slide, index) => (
            <SwiperSlide key={slide.id || index} className="hero-slide-item">
              <div className="hero-slide-wrapper">
                <Image
                  src={getImageUrl(slide.desktopImage)}
                  alt={slide.title || 'Dog Show Championship'}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  sizes="(max-width: 768px) 100vw, 75vw"
                  quality={90}
                  className="hero-image"
                />
              </div>
            </SwiperSlide>
          ))}
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
          width: 100%;
          overflow: hidden;
        }

        .hero-swiper {
          width: 100%;
          overflow: visible !important;
        }

        .hero-slide-item {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.5s ease-in-out;
        }

        .hero-slide-wrapper {
          position: relative;
          width: 100%;
          height: 280px;
          border-radius: 28px;
          overflow: hidden;
          transition: all 0.5s ease;
          
          /* Non-active state (Left/Right Previews) */
          filter: blur(6px) brightness(0.6);
          transform: scale(0.85);
          opacity: 0.85;
          pointer-events: none;
        }

        @media (min-width: 640px) {
          .hero-slide-wrapper {
            height: 340px;
          }
        }
        @media (min-width: 768px) {
          .hero-slide-wrapper {
            height: 460px;
          }
        }
        @media (min-width: 1024px) {
          .hero-slide-wrapper {
            height: 600px;
          }
        }
        @media (min-width: 1280px) {
          .hero-slide-wrapper {
            height: 680px;
          }
        }

        /* Active center slide */
        .hero-slide-item.swiper-slide-active .hero-slide-wrapper {
          filter: none;
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
          border-radius: 32px;
        }

        .hero-image {
          object-fit: cover !important;
          object-position: center !important;
        }

        /* Edge Fade Overlays */
        .hero-edge-fade-left,
        .hero-edge-fade-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 40px;
          z-index: 10;
          pointer-events: none;
        }
        @media (min-width: 768px) {
          .hero-edge-fade-left,
          .hero-edge-fade-right {
            width: 80px;
          }
        }
        @media (min-width: 1024px) {
          .hero-edge-fade-left,
          .hero-edge-fade-right {
            width: 120px;
          }
        }
        @media (max-width: 767px) {
          .hero-edge-fade-left,
          .hero-edge-fade-right {
            display: none;
          }
        }

        .hero-edge-fade-left {
          left: 0;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.85), transparent);
        }
        .dark .hero-edge-fade-left {
          background: linear-gradient(90deg, rgba(0, 0, 0, 0.85), transparent);
        }

        .hero-edge-fade-right {
          right: 0;
          background: linear-gradient(270deg, rgba(255, 255, 255, 0.85), transparent);
        }
        .dark .hero-edge-fade-right {
          background: linear-gradient(270deg, rgba(0, 0, 0, 0.85), transparent);
        }

        .hero-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hero-arrow:hover {
          background: #F4B321;
          border-color: #F4B321;
          color: #000000;
          transform: translateY(-50%) scale(1.08);
        }

        @media (min-width: 1024px) {
          .hero-prev {
            left: calc(12.5% - 35px);
          }
          .hero-next {
            right: calc(12.5% - 35px);
          }
        }

        @media (max-width: 1023px) {
          .hero-arrow {
            width: 50px;
            height: 50px;
          }
          .hero-prev {
            left: 16px;
          }
          .hero-next {
            right: 16px;
          }
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
          background: #F59E0B;
          width: 32px;
          border-radius: 999px;
        }
      `}</style>
    </section>
  );
}
