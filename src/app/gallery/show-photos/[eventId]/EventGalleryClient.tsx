'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import WinnerPosterGrid from '@/components/winners/WinnerPosterGrid';

export default function EventGalleryClient() {
  const params = useParams();
  const router = useRouter();
  const eventId = decodeURIComponent(params.eventId as string);

  const [winners, setWinners] = useState<any[]>([]);
  const [eventName, setEventName] = useState('');
  const [clubName, setClubName] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

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

        // Deduplicate
        const uniqueMap = new Map<string, any>();
        allWinners.forEach(w => { if (!uniqueMap.has(w.id)) uniqueMap.set(w.id, w); });
        const all = Array.from(uniqueMap.values());

        // Helper to compute a winner's effective eventId (same logic as listing)
        function slugify(text: string) {
          return text.toString().toLowerCase().trim()
            .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
        }
        const getEventId = (w: any) =>
          w.event?.id || w.eventId || slugify(w.eventName || w.event?.name || 'general');

        const filtered = all.filter(w => getEventId(w) === eventId);

        if (filtered.length > 0) {
          const first = filtered[0];
          setEventName(first.event?.name || first.eventName || first.awardTitle || 'Championship Show');
          setClubName(first.event?.club?.name || first.clubName || '');
        }

        setWinners(filtered);
      } catch (err) {
        console.error('Failed to load winners:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWinners();
  }, [eventId]);

  return (
    <div className="w-full">
      {/* Back + Header */}
      <div className="mb-8">
        <Link
          href="/gallery/show-photos"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm font-semibold transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to All Shows
        </Link>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-6 bg-muted rounded-full w-48" />
            <div className="h-9 bg-muted rounded-full w-80" />
          </div>
        ) : (
          <>
            {clubName && (
              <p className="text-primary text-xs font-bold uppercase tracking-[0.25em] mb-2">
                {clubName}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-1">
              {eventName}
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Camera className="w-4 h-4" />
              {winners.length} Photos
            </p>
          </>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : winners.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl font-semibold">No photos found for this event.</p>
          <Link
            href="/gallery/show-photos"
            className="mt-4 inline-flex items-center gap-2 text-primary hover:underline text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Shows
          </Link>
        </div>
      ) : (
        <>
          <WinnerPosterGrid winners={winners.slice(0, visibleCount)} />
          {visibleCount < winners.length && (
            <div className="flex justify-center pt-10 pb-4">
              <button
                onClick={() => setVisibleCount(prev => prev + 12)}
                className="inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-full font-bold text-[15px] tracking-wider uppercase border-2 border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Load More Photos
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
