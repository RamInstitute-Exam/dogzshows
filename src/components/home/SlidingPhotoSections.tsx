'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Keyboard } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import api, { getImageUrl } from '@/lib/api';

export default function SlidingPhotoSections() {
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/public/homepage-sliding-sections/public');
        setSections(res.data || []);
      } catch (error) {
        console.error('Failed to load sliding sections:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return null;
  }

  if (sections.length === 0) return null;

  return (
    <div className="w-full bg-background border-t border-border/50">
      {sections.map((section) => {
        if (!section.images || section.images.length === 0) return null;

        return (
          <section key={section.id} className="py-20 overflow-hidden relative">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-12 relative z-10">
              
              {/* Header */}
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  {section.title || section.name}
                </h2>
              </div>

              {/* Slider Container with padding for outside arrows */}
              <div className="relative group/sliding-section px-0 md:px-16 lg:px-20">
                
                {/* Custom Navigation Arrows */}
                <button 
                  className={`nav-prev-${section.id} hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl text-gray-800 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-brand-orange hover:border-brand-orange cursor-pointer disabled:opacity-0 disabled:hidden`}
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6 ml-[-2px]" />
                </button>
                
                <button 
                  className={`nav-next-${section.id} hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl text-gray-800 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-brand-orange hover:border-brand-orange cursor-pointer disabled:opacity-0 disabled:hidden`}
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6 mr-[-2px]" />
                </button>

                <Swiper
                  modules={[Autoplay, Navigation, Keyboard]}
                  loop={section.images.length > 1}
                  watchOverflow={true}
                  keyboard={{ enabled: true }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                  }}
                  speed={500}
                  navigation={{
                    prevEl: `.nav-prev-${section.id}`,
                    nextEl: `.nav-next-${section.id}`,
                  }}
                  breakpoints={{
                    0: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 12 },
                    768: { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: 16 },
                    1024: { slidesPerView: 3, slidesPerGroup: 1, spaceBetween: 20 },
                    1280: { slidesPerView: 4, slidesPerGroup: 1, spaceBetween: 24 }
                  }}
                  className="w-full !overflow-hidden"
                >
                  {section.images.map((img: any, idx: number) => (
                    <SwiperSlide key={img.id || idx}>
                      <div className="group relative w-full h-[260px] md:h-[300px] lg:h-[320px] xl:h-[360px] rounded-[24px] overflow-hidden block transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20 border border-border/50 bg-card cursor-pointer">
                        
                        <div className="absolute inset-0">
                          <img 
                            src={getImageUrl(img.imageUrl)} 
                            alt={`${section.title} ${idx + 1}`}
                            loading="lazy"
                            style={{ objectPosition: 'top center' }}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                
              </div>
            </div>

            <style jsx global>{`
              /* Hide locked navigation arrows */
              .nav-prev-${section.id}.swiper-button-lock,
              .nav-next-${section.id}.swiper-button-lock {
                display: none !important;
              }
            `}</style>
          </section>
        );
      })}
    </div>
  );
}
