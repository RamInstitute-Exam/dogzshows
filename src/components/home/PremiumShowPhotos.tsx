'use client';

import Image from 'next/image';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ImageIcon } from 'lucide-react';
import api, { getImageUrl } from '@/lib/api';

export default function PremiumShowPhotos() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await api.get('/public/homepage-show-albums?limit=8');
        setAlbums(res.data || []);
      } catch (error) {
        console.error('Failed to load show albums:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  if (isLoading) {
    return <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto"></div></div>;
  }

  if (albums.length === 0) return null;

  return (
    <section className="py-20 bg-background overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="text-muted-foreground font-bold text-sm tracking-[0.2em] uppercase block mb-3">Premium Show Photos</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight uppercase">Until Sunday Coimbatore Show Photos</h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-xl">Explore exclusive moments captured from the latest championship dog shows across India.</p>
          </div>
          <Link href="/gallery/photos" className="group flex items-center gap-2 text-foreground font-bold hover:text-foreground transition-colors uppercase">
            VIEW ALL <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Link key={album.id} href={`/gallery/shows/${album.id}`} className="group relative rounded-3xl overflow-hidden flex flex-col justify-between w-full lg:w-[380px] lg:max-h-[560px] md:w-[320px] md:max-h-[480px] w-full min-h-[420px] max-h-[560px] h-auto mx-auto border border-border/50 bg-black">
              
              {/* Background Image */}
              <div className="relative w-full flex-grow flex items-center justify-center bg-black overflow-hidden transition-transform duration-500 group-hover:scale-[1.08]">
                <Image 
                  src={getImageUrl(album.coverImage)} 
                  alt={album.title}
                  fill={false}
                  width={800}
                  height={1200}
                  quality={100}
                  unoptimized
                  sizes="100vw"
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    objectPosition: "center"
                  }}
                  className="gallery-image"
                />
              </div>

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 w-full p-6 text-white transform transition-transform duration-500 group-hover:-translate-y-2 uppercase">
                <h3 className="text-2xl font-bold mb-2 leading-tight drop-shadow-md uppercase">{album.title?.toUpperCase()}</h3>
                <div className="flex items-center gap-4 text-sm font-medium text-white/80">
                  <span>{album.showDate ? new Date(album.showDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'RECENT'}</span>
                  <div className="flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    <span>{album._count?.images || 0} PHOTOS</span>
                  </div>
                </div>
              </div>
              
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
