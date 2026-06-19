'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, Camera, Eye, User, ZoomIn } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import ImageLightbox from '@/components/shared/ImageLightbox';

interface PhotosClientProps {
  initialPhotos?: any[];
}

export default function PhotosClient({ initialPhotos }: PhotosClientProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);

  const categories = ['All', ...Array.from(new Set((initialPhotos || []).map((p: any) => p.category?.name).filter(Boolean)))];

  const filtered = (initialPhotos || []).filter((p: any) => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.photographer?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'All' || p.category?.name === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <PageContainer>
      {/* Filters */}
      <PublicContainer className="py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card border border-border rounded-[1.5rem] p-5">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat as string}
                onClick={() => setActiveFilter(cat as string)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  activeFilter === cat
                    ? 'bg-foreground text-white border-border shadow-md cursor-pointer'
                    : 'bg-background text-muted-foreground border-border hover:border-border hover:text-foreground cursor-pointer'
                }`}
              >
                {cat as string}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search photos, photographers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-full text-sm text-foreground outline-none focus:border-border transition-colors"
            />
          </div>
        </div>
      </PublicContainer>

      {/* Grid */}
      <PublicContainer className="pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground bg-card rounded-[2rem] border border-border border-dashed">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold">No Outdoor Photos Available</p>
            <p className="text-sm text-muted-foreground mt-2">Please check back later or modify your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filtered.map((photo: any, index: number) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: (index % 12) * 0.04 }}
              >
                <div
                  onClick={() => {
                    setLightboxImages(filtered);
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                  className="group bg-card border border-border rounded-[1.5rem] overflow-hidden hover:border-border/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease flex flex-col justify-between block w-full lg:w-[380px] lg:max-h-[560px] md:w-[320px] md:max-h-[480px] w-full min-h-[420px] max-h-[560px] h-auto mx-auto cursor-pointer"
                >
                  <div className="relative w-full flex-grow flex items-center justify-center bg-black overflow-hidden">
                    <Image
                      src={photo.s3Url || photo.imageUrl || photo.cdnUrl}
                      alt={photo.altText || photo.title}
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
                      className="gallery-image transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                        <ZoomIn className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    {photo.category?.name && (
                      <span className="absolute top-4 left-4 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {photo.category.name}
                      </span>
                    )}
                    {photo.featured && (
                      <span className="absolute top-4 right-4 bg-foreground text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-5 w-full flex flex-col justify-between space-y-4">
                    <h3 className="font-bold text-foreground group-hover:text-foreground transition-colors line-clamp-1 text-base leading-snug">
                      {photo.title}
                    </h3>
                    <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground font-semibold">
                      {photo.photographer && (
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{photo.photographer}</span>
                      )}
                      <span className="flex items-center gap-1 ml-auto"><Eye className="w-3.5 h-3.5" />{photo.views || 0}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </PublicContainer>

      {/* Lightbox Popup */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </PageContainer>
  );
}
