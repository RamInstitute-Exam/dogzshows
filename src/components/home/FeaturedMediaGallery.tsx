'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Eye, User, Camera, Video, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import PublicContainer from '@/components/layout/PublicContainer';

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({
  eyebrow, icon: Icon, title, viewAllHref
}: { eyebrow: string; icon: any; title: string; viewAllHref: string }) => (
  <div className="flex justify-between items-end border-b border-border pb-5">
    <div>
      <span className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        {eyebrow}
      </span>
      <h2 className="text-3xl md:text-4xl font-extrabold font-outfit tracking-tight text-foreground">
        {title}
      </h2>
    </div>
    <Link
      href={viewAllHref}
      className="text-primary hover:opacity-75 font-bold transition-colors flex items-center gap-1.5 group text-sm md:text-base shrink-0 ml-4"
    >
      View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
interface FeaturedMediaGalleryProps {
  photos: any[];
  videos: any[];
}

export default function FeaturedMediaGallery({ photos, videos }: FeaturedMediaGalleryProps) {
  const hasPhotos = photos && photos.length > 0;
  const hasVideos = videos && videos.length > 0;

  if (!hasPhotos && !hasVideos) {
    return null;
  }

  return (
    <section className="w-full overflow-hidden pb-8 md:pb-12 lg:pb-16 pt-0 bg-background text-foreground font-sans">
      <PublicContainer className="space-y-20">

        {/* ══════════════════════════════════════════════
            SECTION 1: FEATURED PHOTOGRAPHY
        ══════════════════════════════════════════════ */}
        {hasPhotos && (
          <div className="space-y-8">
            <SectionHeader
              eyebrow="Gallery Highlights"
              icon={Camera}
              title="📸 Featured Photography"
              viewAllHref="/gallery/show-photos"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {photos.slice(0, 8).map((photo: any, index: number) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link href={`/gallery/show-photos/details?slug=${photo.slug}`}>
                    <div className="group bg-card rounded-[1.75rem] border border-border overflow-hidden hover:border-primary/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease flex flex-col justify-between cursor-pointer w-full lg:w-[380px] lg:max-h-[560px] md:w-[320px] md:max-h-[480px] w-full min-h-[420px] max-h-[560px] h-auto mx-auto">
                      {/* Image */}
                      <div className="relative w-full flex-grow flex items-center justify-center bg-black overflow-hidden">
                        <Image
                          src={photo.cdnUrl}
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
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                            <ArrowRight className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        {/* Category badge */}
                        {photo.category?.name && (
                          <span className="absolute top-4 left-4 bg-black/65 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {photo.category.name}
                          </span>
                        )}
                        {photo.featured && (
                          <span className="absolute top-4 right-4 bg-foreground text-background text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                            ⭐ Featured
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 text-base leading-snug">
                            {photo.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
                            {photo.photographer && (
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-[100px]">{photo.photographer}</span>
                              </span>
                            )}
                            {photo.album?.title && (
                              <span className="truncate max-w-[120px] text-muted-foreground/70">
                                {photo.album.title}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> {photo.views || 0} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 2: FEATURED VIDEOGRAPHY
        ══════════════════════════════════════════════ */}
        {hasVideos && (
          <div className="space-y-8">
            <SectionHeader
              eyebrow="Cinematic Showcase"
              icon={Video}
              title="🎥 Featured Videography"
              viewAllHref="/gallery/show-videos"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {videos.slice(0, 5).map((video: any, index: number) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link href={`/gallery/show-videos/details?slug=${video.slug}`}>
                    <div className="group bg-card rounded-[1.75rem] border border-border overflow-hidden hover:border-primary/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease flex flex-col justify-between cursor-pointer w-full lg:max-w-[380px] lg:max-h-[560px] md:max-w-[320px] md:max-h-[480px] max-md:w-full max-md:min-h-[420px] max-md:max-h-[560px] h-auto">
                      {/* Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-accent">
                            <Video className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}

                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/55 transition-colors duration-300">
                          <div className="w-16 h-16 rounded-full bg-foreground shadow-2xl flex items-center justify-center scale-90 group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-7 h-7 fill-current text-white ml-1" />
                          </div>
                        </div>

                        {/* Duration */}
                        {video.duration && (
                          <span className="absolute bottom-3 right-3 bg-black/85 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {video.duration}
                          </span>
                        )}

                        {/* Category */}
                        {video.category?.name && (
                          <span className="absolute top-4 left-4 bg-black/65 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {video.category.name}
                          </span>
                        )}
                        {video.featured && (
                          <span className="absolute top-4 right-4 bg-foreground text-background text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                            ⭐ Featured
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col gap-3">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-base leading-snug">
                          {video.title}
                        </h3>

                        <div className="flex items-center justify-between border-t border-border pt-3 text-xs font-semibold text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> {video.views || 0} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </PublicContainer>
    </section>
  );
}
