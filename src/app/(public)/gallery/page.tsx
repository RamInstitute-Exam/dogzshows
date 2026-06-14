'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import { getImageUrl } from '@/lib/api';
import { config } from '@/lib/config';

export default function GalleryPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '${config.apiUrl}';
        const res = await fetch(`${apiUrl}/gallery/public`);
        if (res.ok) {
          const result = await res.json();
          setPhotos(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const getRandomHeight = (i: number) => {
    const heights = ['h-64', 'h-80', 'h-96'];
    return heights[i % heights.length];
  };

  return (
    <div className="min-h-fit bg-background">
      
      <BreadcrumbBanner
        slug="gallery"
        fallbackTitle="Media Gallery"
        fallbackSubtitle="Explore high-quality captures of our champions, events, and community moments."
        fallbackImage="/images/gallery_banner.png"
      />

      {/* Filters and Search */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0B1220] p-6 rounded-[1.5rem] border border-border">
          
          <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto">
            {['All', 'Winners', 'Events', 'Action', 'Portraits'].map((cat, i) => (
              <button 
                key={cat}
                className={`px-6 py-2.5 rounded-full text-sm font-[700] whitespace-nowrap transition-colors border border-border ${
                  i === 0 ? 'bg-[#F59E0B] text-foreground border-0' : 'bg-background text-muted-foreground hover:bg-[#0B1220] hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-12 pr-4 py-3 bg-background text-foreground rounded-full border border-border focus:ring-2 focus:ring-[#F59E0B] outline-none transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Masonry-like Grid Layout */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-12">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
             <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {photos.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10 w-full inline-block">No photos available yet.</div>
            ) : photos.map((photo, i) => {
              const heightClass = getRandomHeight(i);
              return (
              <motion.div 
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`relative break-inside-avoid rounded-[2rem] overflow-hidden group cursor-pointer ${heightClass} mb-6 inline-block w-full`}
              >
                <img 
                  src={getImageUrl(photo.url)} 
                  alt={photo.title || 'Gallery Image'}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/90 via-[#0B1220]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="small-label text-[#F59E0B] text-[10px] mb-2 block">{photo.folder || 'General'}</span>
                <h3 className="text-foreground text-xl font-[800] mb-4">{photo.title || 'Untitled'}</h3>
                
                <div className="flex gap-2">
                  <Button size="icon" onClick={(e) => { e.stopPropagation(); window.open(getImageUrl(photo.url), '_blank'); }} className="w-10 h-10 rounded-full bg-card/20 hover:bg-card text-foreground hover:text-foreground backdrop-blur z-10">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="icon" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(getImageUrl(photo.url)); alert('Link copied!'); }} className="w-10 h-10 rounded-full bg-card/20 hover:bg-card text-foreground hover:text-foreground backdrop-blur z-10">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )})}
        </div>
      )}
      </div>
    </div>
  );
}
