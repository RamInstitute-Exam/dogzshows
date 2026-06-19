'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ImageIcon, MapPin } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade, Keyboard } from 'swiper/modules';
import { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import api, { getImageUrl } from '@/lib/api';

// Inner component for the slideshow of a specific album
const AlbumInnerSlideshow = ({ album }: { album: any }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  
  // Combine cover image and nested images, removing duplicates
  const allImageUrls = [
    album.coverImage,
    ...(album.images || []).map((img: any) => img.imageUrl)
  ];
  const uniqueImages = Array.from(new Set(allImageUrls));

  if (uniqueImages.length <= 1) {
    return (
      <img 
        src={getImageUrl(uniqueImages[0])} 
        alt={album.albumName}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
    );
  }

  return (
    <div 
      className="w-full h-full"
      onMouseEnter={() => swiperRef.current?.autoplay?.stop()}
      onMouseLeave={() => swiperRef.current?.autoplay?.start()}
    >
      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        nested={true}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: false // Handled manually by onMouseEnter/Leave above
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        className="w-full h-full inner-swiper"
      >
        {uniqueImages.map((src, idx) => (
          <SwiperSlide key={idx} className="w-full h-full relative">
            <img 
              src={getImageUrl(src)} 
              alt={`${album.albumName} - Image ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Global override for inner pagination so it appears at the bottom inside the card */}
      <style jsx global>{`
        .inner-swiper .swiper-pagination {
          bottom: 120px !important; /* Push it up above the text overlay */
          z-index: 20;
        }
        .inner-swiper .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.7);
          opacity: 1;
        }
        .inner-swiper .swiper-pagination-bullet-active {
          background: #fff;
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default function PremiumOutdoorPhotos() {
  const [data, setData] = useState<{ settings: any, albums: any[] }>({ settings: null, albums: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/public/homepage-outdoor-photos?limit=12');
        setData(res.data);
      } catch (error) {
        console.error('Failed to load outdoor photos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { settings, albums } = data;

  if (settings?.status === 'INACTIVE' || albums.length === 0) return null;

  return (
    <section className="py-20 bg-background overflow-hidden relative border-t border-border/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="text-brand-orange font-bold text-sm tracking-[0.2em] uppercase block mb-3">
              {settings?.smallHeading || 'PREMIUM PERSONAL PHOTOS'}
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
              {settings?.title || 'Outdoor Photos'}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-xl leading-relaxed">
              {settings?.subtitle || 'Explore premium outdoor dog photography from kennel clubs, championships, and special events across India.'}
            </p>
          </div>
          <Link href="/gallery/outdoor" className="group flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-full text-foreground font-bold hover:border-brand-orange hover:text-brand-orange shadow-sm transition-all">
            View All <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Outer Carousel */}
        <div className="relative group/outer-slider">
          <Swiper
            modules={[Autoplay, Navigation, Keyboard]}
            loop={albums.length > 4}
            keyboard={{ enabled: true }}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            speed={800}
            spaceBetween={24}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1440: { slidesPerView: 4, spaceBetween: 24 }
            }}
            className="pb-6"
          >
            {albums.map((album) => (
              <SwiperSlide key={album.id}>
                <div className="group relative h-[450px] rounded-[24px] overflow-hidden block transition-all duration-300 hover:shadow-2xl hover:shadow-brand-orange/10 border border-border/50 bg-card">
                  
                  {/* Inner Slideshow or Single Image */}
                  <div className="absolute inset-0 z-0">
                    <AlbumInnerSlideshow album={album} />
                  </div>

                  {/* Glassmorphism Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none z-10 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-6 text-white z-20 transform transition-transform duration-500 group-hover:-translate-y-2 flex flex-col justify-end h-full pointer-events-none">
                    
                    <div className="flex gap-2 mb-3">
                      {album.clubName && (
                        <span className="bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                          {album.clubName}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-extrabold mb-2 leading-tight drop-shadow-md text-white/95 group-hover:text-white transition-colors line-clamp-2">
                      {album.albumName}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-xs font-semibold text-white/80 mb-4">
                      {album.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                          <span>{album.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-brand-orange" />
                        <span>{album._count?.images || 0} Photos</span>
                      </div>
                    </div>

                    <Link 
                      href={`/gallery/outdoor/${album.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-sm font-bold text-white transition-all pointer-events-auto"
                    >
                      View Album
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
