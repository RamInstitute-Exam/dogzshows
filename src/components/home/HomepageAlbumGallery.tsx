'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Image as ImageIcon, ArrowRight, FolderOpen } from 'lucide-react';
import { getImageUrl } from '@/lib/api';
import PublicContainer from '@/components/layout/PublicContainer';

interface HomepageAlbumGalleryProps {
  albums: any[];
}

export default function HomepageAlbumGallery({ albums }: HomepageAlbumGalleryProps) {
  if (!albums || albums.length === 0) {
    return (
      <section className="premium-section-spacing bg-background text-foreground font-sans overflow-hidden border-t border-border/40">
        <PublicContainer className="py-16 text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground uppercase tracking-tight">
            No Albums Available
          </h2>
          <p className="text-muted-foreground max-w-[500px] mx-auto">
            We are currently preparing new photography albums. Check back soon for the latest updates from our events.
          </p>
        </PublicContainer>
      </section>
    );
  }

  // Display max 12 albums on the homepage
  const displayedAlbums = albums.slice(0, 12);
  const hasMore = albums.length > 12;

  return (
    <section className="premium-section-spacing bg-background text-foreground font-sans overflow-hidden border-t border-border/40">
      <PublicContainer className="space-y-12">
        <div className="flex justify-between items-end border-b border-border pb-5">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4" />
              Premium
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-outfit tracking-tight text-foreground uppercase">
              PREMIUM ALBUMS
            </h2>
          </div>
          {hasMore && (
            <Link
              href="/gallery/all-photos"
              className="text-primary hover:opacity-75 font-bold transition-colors hidden sm:flex items-center gap-1.5 group text-sm md:text-base shrink-0 ml-4 uppercase"
            >
              VIEW ALL ALBUMS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {displayedAlbums.map((album) => (
            <Link
              key={album.id}
              href={`/gallery/album/${album.slug}`}
              className="group flex flex-col bg-card border border-border/50 hover:border-border/30 rounded-[24px] overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-black/20 w-full max-w-[380px] min-h-[420px] h-auto mx-auto"
            >
              {/* Cover Image */}
              <div className="relative w-full flex-grow flex items-center justify-center bg-black overflow-hidden">
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
                  className="gallery-image transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute top-4 right-4 flex flex-col items-end gap-1 select-none pointer-events-none">
                  <div className="bg-black/60 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {album._count?.images || album.images?.length || 0} Photos
                  </div>
                  <div className="bg-black/60 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    Downloads: {(album.images?.reduce((sum: number, img: any) => sum + (img.downloadCount || 0), 0) || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-foreground transition-colors leading-snug line-clamp-2">
                    {album.title}
                  </h3>

                  {album.subtitle && (
                    <div className="text-[14px] font-medium text-primary leading-snug">
                      {album.subtitle}
                    </div>
                  )}

                  {album.shortDescription && (
                    <div className="text-[13px] font-normal text-muted-foreground leading-snug line-clamp-2 mt-2">
                      {album.shortDescription}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-medium">
                    {(album.city || album.state || album.location) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-foreground shrink-0" />
                        <span className="truncate">
                          {[album.city, album.state].filter(Boolean).join(', ') || album.location}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-foreground shrink-0" />
                      <span>
                        {album.albumDate
                          ? new Date(album.albumDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : new Date(album.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full pt-4 border-t border-border/40">
                  <div className="w-full py-3 rounded-xl bg-muted group-hover:bg-foreground group-hover:text-white text-foreground text-center font-bold text-sm transition-all flex items-center justify-center gap-1.5">
                    View Album
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All Button */}
        {hasMore && (
          <div className="sm:hidden flex justify-center pt-6">
            <Link
              href="/gallery/all-photos"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-wider text-sm transition-colors hover:bg-primary/90"
            >
              VIEW ALL ALBUMS <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </PublicContainer>
    </section>
  );
}
