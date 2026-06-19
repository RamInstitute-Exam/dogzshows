'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import Masonry from 'react-masonry-css';
import api, { getImageUrl } from '@/lib/api';

export default function OutdoorAlbumClient() {
  const { id } = useParams();
  const router = useRouter();
  
  const [album, setAlbum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await api.get(`/public/homepage-outdoor-photos/${id}`);
        setAlbum(res.data);
      } catch (error) {
        console.error('Failed to load album:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchAlbum();
  }, [id]);

  // Handle keyboard navigation for Lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null) return;
    if (e.key === 'Escape') setLightboxIndex(null);
    if (e.key === 'ArrowRight') setLightboxIndex(prev => prev !== null && prev < album.images.length - 1 ? prev + 1 : prev);
    if (e.key === 'ArrowLeft') setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev);
  }, [lightboxIndex, album]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!album) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
        <h1 className="text-3xl font-bold text-foreground mb-4">Album Not Found</h1>
        <button onClick={() => router.back()} className="text-brand-orange font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  const masonryBreakpoints = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-[400px] w-full bg-black">
        <div className="absolute inset-0">
          <img src={getImageUrl(album.coverImage)} alt={album.albumName} className="w-full h-full object-cover opacity-50" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 max-w-[1400px] mx-auto z-10">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white font-medium mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Homepage
          </button>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">{album.albumName}</h1>
          <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium">
            {album.clubName && <span>⭐ {album.clubName}</span>}
            {album.location && <span>📍 {album.location}</span>}
            {album.eventDate && <span>📅 {new Date(album.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
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
          {album.images?.map((img: any, index: number) => (
            <div 
              key={img.id} 
              className="mb-4 cursor-pointer overflow-hidden rounded-xl bg-muted relative group"
              onClick={() => setLightboxIndex(index)}
              onContextMenu={(e) => e.preventDefault()} // Disable right click download
            >
              <img 
                src={getImageUrl(img.imageUrl)} 
                alt="Gallery item" 
                className="w-full block transform transition-transform duration-500 group-hover:scale-105" 
                style={{ pointerEvents: 'none' }} // Disable native drag/download
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            </div>
          ))}
        </Masonry>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-sm flex flex-col">
          <div className="flex justify-between items-center p-6 text-white/70 absolute top-0 w-full z-10">
            <div className="font-medium">{lightboxIndex + 1} / {album.images?.length}</div>
            <button onClick={() => setLightboxIndex(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-8 h-8 text-white" />
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative w-full h-full p-4 md:p-12">
            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev! > 0 ? prev! - 1 : prev); }}
              className={`absolute left-4 md:left-8 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-all ${lightboxIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
              disabled={lightboxIndex === 0}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <img 
              src={getImageUrl(album.images[lightboxIndex].imageUrl)} 
              alt="Lightbox view" 
              className="max-w-full max-h-full object-contain drop-shadow-2xl select-none"
              onContextMenu={(e) => e.preventDefault()}
              style={{ pointerEvents: 'none' }}
            />

            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev! < album.images.length - 1 ? prev! + 1 : prev); }}
              className={`absolute right-4 md:right-8 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-all ${lightboxIndex === album.images.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
              disabled={lightboxIndex === album.images.length - 1}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
