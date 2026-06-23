'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import Masonry from 'react-masonry-css';
import api, { getImageUrl } from '@/lib/api';
import ImageLightbox from '@/components/shared/ImageLightbox';
import Image from 'next/image';

// Gallery Image Card with Skeleton Loader
function GalleryCard({
  img,
  index,
  setLightboxIndex,
}: {
  img: any;
  index: number;
  setLightboxIndex: (idx: number) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className="mb-4 cursor-pointer overflow-hidden rounded-xl bg-muted relative group shadow-sm hover:shadow-md transition-all duration-300 select-none"
      onClick={() => setLightboxIndex(index)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted-foreground/10 animate-pulse min-h-[250px] w-full rounded-xl z-10" />
      )}
      <Image 
        src={getImageUrl(img.imageUrl)} 
        alt="Gallery item" 
        width={500}
        height={500}
        sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 500px"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-auto block transform transition-transform duration-500 group-hover:scale-105 transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: 'none' }}
        priority={index < 8}
        loading={index < 8 ? undefined : 'lazy'}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
    </div>
  );
}

export default function ShowAlbumClient() {
  const params = useParams();
  let id = params.id as string;
  
  if (id === '_' && typeof window !== 'undefined') {
    const match = window.location.pathname.match(/\/gallery\/shows\/([^\/]+)/);
    if (match && match[1]) {
      id = match[1];
    }
  }

  const router = useRouter();
  
  const [album, setAlbum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Pagination & Infinite Scroll
  const [visibleCount, setVisibleCount] = useState(8);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await api.get(`/public/homepage-show-albums/${id}`);
        setAlbum(res.data);
      } catch (error) {
        console.error('Failed to load album:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchAlbum();
  }, [id]);

  const hasMore = album?.images && album.images.length > visibleCount;

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 8);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-10 h-10 border-4 border-border border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!album) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
        <h1 className="text-3xl font-bold text-foreground mb-4">Album Not Found</h1>
        <button onClick={() => router.back()} className="text-foreground font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  const masonryBreakpoints = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  const displayedImages = album.images?.slice(0, visibleCount) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-[400px] w-full bg-black">
        <div className="absolute inset-0">
          <Image 
            src={getImageUrl(album.coverImage)} 
            alt={album.title} 
            fill
            priority
            style={{ objectFit: 'cover', opacity: 0.5 }}
            unoptimized
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 max-w-[1400px] mx-auto z-10">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white font-medium mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Homepage
          </button>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">{album.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium">
            {album.location && <span>📍 {album.location}</span>}
            {album.showDate && <span>📅 {new Date(album.showDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
            <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4" /> {album.images?.length || 0} Photos</span>
          </div>
          {album.description && <p className="mt-6 text-white/80 max-w-3xl leading-relaxed">{album.description}</p>}
        </div>
      </div>

      {/* Masonry Gallery */}
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8">
        <Masonry
          breakpointCols={masonryBreakpoints}
          className="flex w-auto -ml-4"
          columnClassName="pl-4 bg-clip-padding"
        >
          {displayedImages.map((img: any, index: number) => (
            <GalleryCard 
              key={img.id || index}
              img={img}
              index={index}
              setLightboxIndex={setLightboxIndex}
            />
          ))}
        </Masonry>

        {hasMore && (
          <div ref={observerTarget} className="flex justify-center mt-12 mb-4">
            <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Lightbox */}
      <ImageLightbox 
        images={album.images || []} 
        initialIndex={lightboxIndex !== null ? lightboxIndex : 0} 
        isOpen={lightboxIndex !== null} 
        onClose={() => setLightboxIndex(null)} 
      />
    </div>
  );
}
