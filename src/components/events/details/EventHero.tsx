'use client';

import Image from 'next/image';
import { Calendar, MapPin, Timer, Trophy, Users, Award } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import React, { useRef } from 'react';
import { toTitleCase, formatTitle } from '@/lib/utils';
import { getImageUrl } from '@/lib/api';

// ── Priority image resolver ──────────────────────────────────────────────────
function resolveHeroImage(event: any): string {
  const candidates = [
    event?.bannerUrl,
    event?.featuredImage,
    event?.ogImage,
    event?.cardImage,
    event?.mobileBanner,
    event?.club?.bannerUrl,
    event?.club?.logoUrl,
  ];

  for (const raw of candidates) {
    if (raw && typeof raw === 'string' && raw.trim()) {
      return getImageUrl(raw);
    }
  }

  // High-quality default championship background
  return '/images/events_banner.png';
}

export default function EventHero({ event }: { event: any }) {
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax: image moves up slightly as user scrolls down
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  const heroImageSrc = resolveHeroImage(event);

  const formattedDate = event?.date
    ?? (event?.startDate
      ? new Date(event.startDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      : 'TBA');

  const venue = toTitleCase(event?.venue ?? event?.location ?? event?.city) || 'TBA';
  const closingDate = event?.closingDate ?? event?.registrationWindowEnd ?? '-';
  const entryFee = event?.entryFee != null ? `₹${Number(event.entryFee).toLocaleString('en-IN')}` : '-';

  return (
    <div
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(300px, 52vw, 600px)' }}
    >
      {/* ── BACKGROUND IMAGE with Ken Burns + Parallax ── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: imgY }}
      >
        <motion.div
          className="w-full h-full"
          initial={{ scale: 1 }}
          animate={{ scale: 1.06 }}
          transition={{ duration: 12, ease: 'linear', repeat: Infinity, repeatType: 'mirror' }}
        >
          <Image
            src={heroImageSrc}
            alt={event?.name ?? 'Event Banner'}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            style={{ willChange: 'transform' }}
          />
        </motion.div>
      </motion.div>

      {/* ── GRADIENT OVERLAY — bottom-up for text readability ── */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.52) 45%, rgba(0,0,0,0.82) 100%)',
        }}
      />

      {/* ── CONTENT ── */}
      <div className="absolute inset-0 z-20 flex items-end">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12 flex flex-col md:flex-row items-end md:items-end justify-between gap-6 md:gap-8">

          {/* LEFT — Event Info */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 max-w-2xl"
          >
            {/* Badges */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="px-3.5 py-1 bg-white text-black font-bold text-[11px] uppercase tracking-[1.5px] rounded-full shadow-lg">
                {event?.status ?? 'Open'}
              </span>
              {event?.type && (
                <span className="px-3.5 py-1 bg-white/15 text-white backdrop-blur-sm font-semibold text-[11px] uppercase tracking-[1.5px] rounded-full border border-white/25">
                  {event.type}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="font-extrabold tracking-tight text-white mb-3 leading-[1.05]"
              style={{
                fontSize: 'clamp(1.6rem, 4vw, 3.2rem)',
                textShadow: '0 4px 24px rgba(0,0,0,0.6)',
                fontWeight: 800,
              }}
            >
              {formatTitle(event?.name) || 'Event Details'}
            </h1>

            {/* Description */}
            <p
              className="text-base font-medium mb-6 leading-relaxed max-w-lg"
              style={{
                color: 'rgba(255,255,255,0.82)',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              Register your dogs in India's most prestigious
              {event?.type ? ` ${toTitleCase(event.type)}` : ''} championship, hosted by{' '}
              <strong className="text-white font-bold">
                {toTitleCase(event?.club?.name) || 'KCI Official'}
              </strong>.
            </p>

            {/* Date & Venue chips */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
                <Calendar className="w-4 h-4 text-white/70 shrink-0" />
                <span className="text-[13px] font-semibold text-white/90 uppercase tracking-wider">
                  {formattedDate}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
                <MapPin className="w-4 h-4 text-white/70 shrink-0" />
                <span className="text-[13px] font-semibold text-white/90 uppercase tracking-wider">
                  {venue}
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Event Snapshot Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block w-[340px] rounded-[24px] p-7 shadow-2xl relative overflow-hidden shrink-0"
            style={{
              background: 'rgba(10,10,10,0.72)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Subtle decorative glow */}
            <div className="absolute -right-6 -top-6 opacity-[0.07] pointer-events-none">
              <Trophy className="w-36 h-36 text-white" />
            </div>

            <h3 className="font-extrabold text-[15px] uppercase tracking-[2px] text-white mb-5">
              Event Snapshot
            </h3>

            <div className="space-y-4 relative z-10">
              {([
                { icon: Timer, label: 'Registration Ends', value: closingDate, highlight: false },
                { icon: Users, label: 'Slots Left', value: event?.availableSlots ?? '-', highlight: false },
                { icon: Award, label: 'Prize Pool', value: event?.prizePool ?? '-', highlight: false },
                { icon: Trophy, label: 'Entry Fee', value: entryFee, highlight: true },
              ] as { icon: React.ElementType; label: string; value: string; highlight: boolean }[]).map(({ icon: Icon, label, value, highlight }, idx, arr) => (
                <div
                  key={label}
                  className={`flex justify-between items-center ${idx < arr.length - 1 ? 'pb-4' : ''}`}
                  style={idx < arr.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.10)' } : {}}
                >
                  <div className="flex items-center gap-2.5 text-[13px] font-medium text-white/55">
                    <Icon className="w-4 h-4 text-white/40 shrink-0" />
                    {label}
                  </div>
                  <span
                    className={`font-bold ${highlight ? 'text-xl text-white' : 'text-sm text-white/80'}`}
                  >
                    {value as string}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
