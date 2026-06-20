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
          <section key={section.id} className="premium-section-spacing overflow-hidden relative">
            <div className="premium-container relative z-10">
              
              {/* Header */}
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  {section.title || section.name}
                </h2>
              </div>

              {/* Slider Container with padding for outside arrows */}
              <div className="premium-carousel-wrapper group/sliding-section">
                
                {/* Custom Navigation Arrows */}
                <button 
                  className={`nav-prev-${section.id} premium-slider-nav premium-slider-prev`}
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={22} />
                </button>
                
                <button 
                  className={`nav-next-${section.id} premium-slider-nav premium-slider-next`}
                  aria-label="Next slide"
                >
                  <ChevronRight size={22} />
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
                  className="premium-carousel-track"
                >
                  {section.images.map((img: any, idx: number) => (
                    <SwiperSlide key={img.id || idx}>
                      <div 
                        onClick={() => {
                          setLightboxImages(section.images);
                          setLightboxIndex(idx);
                          setLightboxOpen(true);
                        }}
                        className="group photo-card cursor-pointer relative"
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
                          className="photo-card-img transition-transform duration-700 ease-out group-hover:scale-[1.05]"
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
                overflow: hidden;
                border-radius: 20px;
                background: #fff;
                box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                transition: 0.3s ease;
                width: 100%;
                height: 520px;
                display: block;
              }

              .photo-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 20px 40px rgba(0,0,0,0.15);
              }

              .photo-card-img {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                object-position: center !important;
                border-radius: 20px !important;
                display: block !important;
                background: transparent !important;
              }

              @media (max-width: 1440px) {
                .photo-card {
                  height: 480px !important;
                }
              }

              @media (max-width: 1024px) {
                .photo-card {
                  height: 420px !important;
                }
              }

              @media (max-width: 768px) {
                .photo-card {
                  height: 360px !important;
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
