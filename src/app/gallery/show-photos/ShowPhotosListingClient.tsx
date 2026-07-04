'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Calendar, Camera, ArrowRight, Image as ImageIcon } from 'lucide-react';
import api, { getImageUrl } from '@/lib/api';

interface EventGroup {
  eventId: string;
  eventName: string;
  clubName: string;
  coverImage: string | null;
  photoCount: number;
  location: string;
  date: string;
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export default function ShowPhotosListingClient() {
  const [eventGroups, setEventGroups] = useState<EventGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWinners() {
      try {
        const [allRes, hofRes] = await Promise.all([
          api.get('/public/winners/public?limit=1000').catch(() => ({ success: false, data: [] })),
          api.get('/public/winners/public/hall-of-fame?limit=1000').catch(() => ({ success: false, data: [] }))
        ]);

        const allWinners = [
          ...(allRes?.success && Array.isArray(allRes.data) ? allRes.data : []),
          ...(hofRes?.success && Array.isArray(hofRes.data) ? hofRes.data : [])
        ];

        // Deduplicate by id
        const uniqueMap = new Map<string, any>();
        allWinners.forEach(w => { if (!uniqueMap.has(w.id)) uniqueMap.set(w.id, w); });
        const winners = Array.from(uniqueMap.values());

        // Group by event
        const groupMap = new Map<string, EventGroup>();

        winners.forEach((w: any) => {
          const eventId = w.event?.id || w.eventId || slugify(w.eventName || w.event?.name || 'general');
          const eventName = w.event?.name || w.eventName || w.awardTitle || 'Championship Show';
          const clubName = w.club?.name || w.event?.club?.name || w.clubName || '';

          if (!groupMap.has(eventId)) {
            const img = w.featuredImage || w.winnerImage || w.imageUrl || null;
            groupMap.set(eventId, {
              eventId,
              eventName,
              clubName,
              coverImage: img,
              photoCount: 0,
              location: w.event?.location || w.location || '',
              date: w.showDate || w.event?.date || ''
            });
          }

          const group = groupMap.get(eventId)!;
          group.photoCount += 1;
          // Use first winner image as cover if not already set
          if (!group.coverImage) {
            const img = w.featuredImage || w.winnerImage || w.imageUrl || null;
            if (img) group.coverImage = img;
          }
        });

        setEventGroups(Array.from(groupMap.values()));
      } catch (err) {
        console.error('Failed to load winners:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWinners();
  }, []);

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-10">
        <p className="text-primary text-xs font-bold uppercase tracking-[0.25em] mb-3">Media Gallery</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-3">
          Championship Show Photos
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Select an event below to browse all winning dog photos from that show.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-3xl overflow-hidden bg-muted animate-pulse">
              <div className="aspect-[4/3] bg-muted-foreground/10" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-muted-foreground/10 rounded-full w-3/4" />
                <div className="h-3 bg-muted-foreground/10 rounded-full w-1/2" />
                <div className="h-9 bg-muted-foreground/10 rounded-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No events */}
      {!loading && eventGroups.length === 0 && (
        <div className="text-center py-24 text-muted-foreground">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl font-semibold">No show photos available yet.</p>
        </div>
      )}

      {/* Event Cards Grid */}
      {!loading && eventGroups.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {eventGroups.map((group, i) => (
            <motion.div
              key={group.eventId}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link
                href={`/gallery/show-photos/?event=${encodeURIComponent(group.eventId)}`}
                className="group block h-full"
              >
                <div className="h-full rounded-3xl overflow-hidden bg-card border border-border hover:border-primary/40 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  {/* Cover Image */}
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    {group.coverImage ? (
                      <img
                        src={getImageUrl(group.coverImage)}
                        alt={group.eventName}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Photo count badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      <Camera className="w-3.5 h-3.5" />
                      {group.photoCount} Photos
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                  {/* Club Name badge - always show if available */}
                    {group.clubName ? (
                      <p className="text-primary text-[11px] font-bold uppercase tracking-widest truncate">
                        {group.clubName}
                      </p>
                    ) : (
                      <p className="text-muted-foreground/40 text-[11px] font-bold uppercase tracking-widest truncate">
                        Championship Show
                      </p>
                    )}

                    {/* Event Title */}
                    <h3 className="text-foreground font-extrabold text-[15px] leading-snug line-clamp-2">
                      {group.eventName}
                    </h3>

                    {/* Meta */}
                    <div className="flex flex-col gap-1.5 text-muted-foreground text-xs">
                      {group.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{group.location}</span>
                        </span>
                      )}
                      {group.date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                          {new Date(group.date).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-auto pt-3">
                      <span className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                        View Gallery
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
