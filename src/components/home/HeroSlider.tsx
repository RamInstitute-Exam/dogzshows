'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { getImageUrl } from '@/lib/api';
import api from '@/lib/api';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface HomepageBanner {
  id: string;
  title: string;
  desktopImage: string;
  mobileImage?: string;
  redirectUrl?: string;
  targetBlank: boolean;
}

export default function HeroSlider() {
  const [slides, setSlides] = useState<HomepageBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const result = await api.get('/homepage-banners');
        
        if (result.success && result.data?.length > 0) {
          setSlides(result.data);
        } else {
          setSlides([{
            id: 'fallback',
            title: 'Welcome to JuzDog',
            desktopImage: '/images/hero_banner.png',
            targetBlank: false
          }]);
        }
      } catch (error) {
        console.error('Failed to fetch homepage banners:', error);
        setSlides([{
          id: 'fallback',
          title: 'Welcome to JuzDog',
          desktopImage: '/images/hero_banner.png',
          targetBlank: false
        }]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBanners();
  }, []);

  const sliderHeightClass = "h-[220px] sm:h-[250px] md:h-[420px] lg:h-[550px] xl:h-[650px]";

  if (isLoading) {
    return (
      <div className={`w-full ${sliderHeightClass} bg-card animate-pulse`}></div>
    );
  }

  return (
    <section className={`relative w-full ${sliderHeightClass} bg-background overflow-hidden group`}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{
          prevEl: '.swiper-button-prev-custom',
          nextEl: '.swiper-button-next-custom',
        }}
        pagination={{
          clickable: true,
          el: '.swiper-pagination-custom',
          renderBullet: function (index, className) {
            return `<span class="${className} w-10 h-[6px] rounded-full bg-white/30 transition-all duration-300"></span>`;
          },
        }}
        loop={slides.length > 1}
        className="w-full h-full"
      >
        {slides.map((slide) => {
          return (
            <SwiperSlide key={slide.id}>
              {({ isActive }) => (
                <div className="w-full h-full relative">
                  {slide.redirectUrl ? (
                    <Link 
                      href={slide.redirectUrl} 
                      target={slide.targetBlank ? '_blank' : '_self'}
                      className="absolute inset-0 cursor-pointer block"
                    >
                      <motion.div
                        initial={{ scale: 1.0 }}
                        animate={{ scale: isActive ? 1.05 : 1.0 }}
                        transition={{ duration: 5, ease: 'linear' }}
                        className="w-full h-full"
                      >
                        {/* Desktop Image */}
                        <div className="hidden md:block w-full h-full relative">
                          <Image
                            src={getImageUrl(slide.desktopImage)}
                            alt={slide.title || 'Hero Banner'}
                            fill
                            priority={isActive}
                            className="object-cover object-center"
                          />
                        </div>
                        {/* Mobile Image */}
                        <div className="block md:hidden w-full h-full relative">
                          <Image
                            src={getImageUrl(slide.mobileImage || slide.desktopImage)}
                            alt={slide.title || 'Hero Banner'}
                            fill
                            priority={isActive}
                            className="object-cover object-center"
                          />
                        </div>
                      </motion.div>
                    </Link>
                  ) : (
                    <motion.div
                      initial={{ scale: 1.0 }}
                      animate={{ scale: isActive ? 1.05 : 1.0 }}
                      transition={{ duration: 5, ease: 'linear' }}
                      className="w-full h-full"
                    >
                      {/* Desktop Image */}
                      <div className="hidden md:block w-full h-full relative">
                        <Image
                          src={getImageUrl(slide.desktopImage)}
                          alt={slide.title || 'Hero Banner'}
                          fill
                          priority={isActive}
                          className="object-cover object-center"
                        />
                      </div>
                      {/* Mobile Image */}
                      <div className="block md:hidden w-full h-full relative">
                        <Image
                          src={getImageUrl(slide.mobileImage || slide.desktopImage)}
                          alt={slide.title || 'Hero Banner'}
                          fill
                          priority={isActive}
                          className="object-cover object-center"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom Navigation */}
      {slides.length > 1 && (
        <>
          <button className="swiper-button-prev-custom hidden md:flex absolute left-6 lg:left-10 top-1/2 -translate-y-1/2 w-14 h-14 lg:w-[60px] lg:h-[60px] rounded-full bg-black/40 backdrop-blur-md items-center justify-center text-white hover:text-brand-orange hover:bg-black/60 transition-all duration-300 z-20 shadow-lg border border-white/10 opacity-0 group-hover:opacity-100">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button className="swiper-button-next-custom hidden md:flex absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 w-14 h-14 lg:w-[60px] lg:h-[60px] rounded-full bg-black/40 backdrop-blur-md items-center justify-center text-white hover:text-brand-orange hover:bg-black/60 transition-all duration-300 z-20 shadow-lg border border-white/10 opacity-0 group-hover:opacity-100">
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Custom Pagination Container */}
      {slides.length > 1 && (
        <div className="swiper-pagination-custom absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20 justify-center [&>.swiper-pagination-bullet-active]:bg-brand-orange [&>.swiper-pagination-bullet-active]:w-14"></div>
      )}
    </section>
  );
}
