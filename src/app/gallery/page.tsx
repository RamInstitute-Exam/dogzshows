'use client';

import { useGallery } from '@/hooks/useCMS';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Share2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import { getImageUrl } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import Link from 'next/link';

export default function GalleryPage() {
  const { data, isLoading } = useGallery();
  const photos = data?.success && Array.isArray(data.data) ? data.data : [];
  const loading = isLoading;

  const getRandomHeight = (i: number) => {
    const heights = ['h-64', 'h-80', 'h-96'];
    return heights[i % heights.length];
  };

  return (
    <PageContainer>
      <BreadcrumbBanner
        slug="/gallery"
        fallbackTitle="Photo Gallery"
        fallbackSubtitle="Relive the finest moments from our dog shows."
        fallbackBreadcrumb="Gallery"
      />
      
      {/* Filters and Search */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-card p-6 rounded-[1.5rem] border border-border">
          
          <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto">
            {['All', 'Winners', 'Events', 'Action', 'Portraits'].map((cat, i) => (
              <button 
                key={cat}
                className={`px-6 py-2.5 rounded-full text-sm font-[700] whitespace-nowrap transition-colors border border-border ${
                  i === 0 ? 'bg-primary text-primary-foreground border-0' : 'bg-background text-muted-foreground hover:bg-card hover:text-foreground'
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
              className="w-full pl-12 pr-4 py-3 bg-background text-foreground rounded-full border border-border focus:ring-2 focus:ring-primary outline-none transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Masonry-like Grid Layout */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-12">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
             <div className="w-12 h-12 border-4 border-border border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {photos.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10 w-full inline-block">No photos available yet.</div>
            ) : photos.map((photo: any, i: number) => {
              const heightClass = getRandomHeight(i);
              return (
              <motion.div 
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`break-inside-avoid mb-6 inline-block w-full`}
              >
                <Link 
                  href={`/gallery/photos/details?slug=${photo.slug || photo.id}`}
                  className={`relative flex flex-col rounded-[2rem] overflow-hidden group cursor-pointer border border-border hover:border-primary/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease ${heightClass} w-full bg-black`}
                >
                  <Image 
                    src={getImageUrl(photo.url)} 
                    alt={photo.title || 'Gallery Image'}
                    fill={false}
                    width={800}
                    height={1200}
                    quality={100}
                    sizes="100vw"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "center"
                    }}
                    className="gallery-image transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="small-label text-primary text-[10px] mb-2 block">{photo.folder || 'General'}</span>
                    <h3 className="text-foreground text-xl font-[800] mb-4">{photo.title || 'Untitled'}</h3>
                    
                    <div className="flex gap-2">
                      <Button size="icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(getImageUrl(photo.url)); alert('Link copied!'); }} className="w-10 h-10 rounded-full bg-card/20 hover:bg-card text-foreground hover:text-foreground backdrop-blur z-10">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
          )})}
        </div>
      )}
      </div>
    </PageContainer>
  );
}
