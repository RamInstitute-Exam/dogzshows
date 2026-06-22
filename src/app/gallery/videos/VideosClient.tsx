'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, Eye, Clock } from 'lucide-react';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';

interface VideosClientProps {
  initialVideos?: any[];
}

export default function VideosClient({ initialVideos }: VideosClientProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set((initialVideos || []).map((v: any) => v.category?.name).filter(Boolean)))];

  const filtered = (initialVideos || []).filter((v: any) => {
    const matchSearch = !search || v.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'All' || v.category?.name === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <PageContainer>
      {/* Filters */}
      <PublicContainer className="py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card border border-border rounded-[1.5rem] p-5">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat as string}
                onClick={() => setActiveFilter(cat as string)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeFilter === cat
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground'
                  }`}
              >
                {cat as string}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-full text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </PublicContainer>

      {/* Grid */}
      <PublicContainer className="pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground bg-card rounded-[2rem] border border-border border-dashed">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold">No video items match your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filtered.map((video: any, index: number) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: (index % 9) * 0.05 }}
              >
                <Link href={`/gallery/show-videos/details?slug=${video.slug}`}>
                  <div className="group bg-card border border-border rounded-[1.5rem] overflow-hidden cursor-pointer hover:border-primary/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease">
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-black">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-accent">
                          <Play className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/55 transition-colors duration-300">
                        <div className="w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center scale-90 group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-6 h-6 fill-current text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                      {/* Duration badge */}
                      {video.duration && (
                        <span className="absolute bottom-3 right-3 bg-black/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {video.duration}
                        </span>
                      )}
                      {/* Category badge */}
                      {video.category?.name && (
                        <span className="absolute top-4 left-4 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                          {video.category.name}
                        </span>
                      )}
                      {video.featured && (
                        <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-base mb-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {video.views || 0} views</span>
                        {video.breed && <span>• {video.breed}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>

            ))}
          </div>
        )}
      </PublicContainer>
    </PageContainer>
  );
}
