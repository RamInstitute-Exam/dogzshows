'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Keyboard } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import api, { getImageUrl } from '@/lib/api';
import ImageLightbox from '@/components/shared/ImageLightbox';

export default function SlidingPhotoSections() {
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);

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
                  className={`nav-prev-${section.id} hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl text-gray-800 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-foreground hover:border-border cursor-pointer disabled:opacity-0 disabled:hidden`}
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6 ml-[-2px]" />
                </button>
                
                <button 
                  className={`nav-next-${section.id} hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl text-gray-800 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-foreground hover:border-border cursor-pointer disabled:opacity-0 disabled:hidden`}
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
                      <div 
                        onClick={() => {
                          setLightboxImages(section.images);
                          setLightboxIndex(idx);
                          setLightboxOpen(true);
                        }}
                        className="group photo-card transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20 cursor-pointer"
                      >
                        <Image 
                          src={getImageUrl(img.imageUrl)} 
                          alt={`${section.title} ${idx + 1}`}
                          fill={false}
                          width={800}
                          height={1200}
                          quality={100}
                          unoptimized
                          sizes="100vw"
                          className="photo-card-img group-hover:scale-[1.02]"
                        />
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

              .photo-card {
                width: 100%;
                height: auto;
                background: #000000;
                border-radius: 20px;
                padding: 16px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                border: 1px solid rgba(255, 255, 255, 0.08);
              }

              .photo-card-img {
                width: 100% !important;
                height: auto !important;
                aspect-ratio: 3 / 4 !important;
                object-fit: contain !important;
                object-position: center !important;
                background: #000000 !important;
                border-radius: 12px !important;
                transition: transform 0.7s ease;
              }

              @media (max-width: 768px) {
                .photo-card {
                  width: 100% !important;
                  padding: 12px !important;
                }
                .photo-card-img {
                  aspect-ratio: auto !important;
                  height: auto !important;
                  object-fit: contain !important;
                  object-position: center !important;
                }
              }
            `}</style>
          </section>
        );
      })}

      {/* Reusable Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
