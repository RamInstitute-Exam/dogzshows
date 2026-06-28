'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, Camera, Eye, User, ZoomIn, Download } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import ImageLightbox from '@/components/shared/ImageLightbox';

interface PhotosClientProps {
  initialPhotos?: any[];
}

function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/v1$/, '');
  return envUrl || '';
}

export default function PhotosClient({ initialPhotos }: PhotosClientProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);

  // Download state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    (initialPhotos || []).forEach((p: any) => {
      if (p.id) map[p.id] = p.downloadCount ?? 0;
    });
    return map;
  });

  const categories = ['All', ...Array.from(new Set((initialPhotos || []).map((p: any) => p.category?.name).filter(Boolean)))];

  const filtered = (initialPhotos || []).filter((p: any) => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.photographer?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'All' || p.category?.name === activeFilter;
    return matchSearch && matchFilter;
  });

  // Download handler (for MediaPhoto — uses album.allowDownload)
  const handleDownload = useCallback(async (e: React.MouseEvent, photo: any) => {
    e.stopPropagation();
    if (downloadingId) return;

    setDownloadingId(photo.id);
    try {
      const apiBase = getApiBase();
      const url = `${apiBase}/api/v1/public/gallery/photos/${photo.id}/download`;
      const response = await fetch(url);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        alert(err.message || 'Download failed.');
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `juztdog-photo-${photo.id.slice(0, 8)}.jpg`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);

      setDownloadCounts((prev) => ({ ...prev, [photo.id]: (prev[photo.id] ?? 0) + 1 }));
    } catch (err) {
      console.error('[download] Error:', err);
      alert('Download failed.');
    } finally {
      setDownloadingId(null);
    }
  }, [downloadingId]);

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
            {filtered.map((photo: any, index: number) => {
              const albumAllowsDownload = photo.album?.allowDownload === true;
              const dlCount = downloadCounts[photo.id] ?? photo.downloadCount ?? 0;

              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: (index % 12) * 0.04 }}
                >
                  <div
                    className="group bg-card border border-border rounded-[1.5rem] overflow-hidden hover:border-border/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease flex flex-col justify-between block w-full max-w-[380px] h-auto mx-auto"
                  >
                    {/* Image area */}
                    <div
                      className="relative w-full flex-grow flex items-center justify-center bg-black overflow-hidden cursor-pointer aspect-auto md:aspect-[4/5]"
                      onClick={() => {
                        setLightboxImages(filtered);
                        setLightboxIndex(index);
                        setLightboxOpen(true);
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <Image
                        src={photo.s3Url || photo.imageUrl || photo.cdnUrl}
                        alt={photo.altText || photo.title}
                        fill={false}
                        width={800}
                        height={1200}
                        quality={100}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        draggable={false}
                        className="w-full h-auto object-contain md:object-cover md:h-full max-h-[70vh] md:max-h-none transition-transform duration-700 ease-in-out group-hover:scale-[1.03] select-none pointer-events-none"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />

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

                    {/* Info bar */}
                    <div className="p-5 w-full flex flex-col justify-between space-y-3">
                      <h3 className="font-bold text-foreground group-hover:text-foreground transition-colors text-base leading-snug">
                        {photo.title}
                      </h3>
                      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground font-semibold">
                        <div className="flex items-center gap-3">
                          {photo.photographer && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />{photo.photographer}
                            </span>
                          )}
                        </div>
                        {/* Download button removed */}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </PublicContainer>

      {/* Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </PageContainer>
  );
}
