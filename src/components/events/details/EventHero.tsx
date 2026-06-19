'use client';

import { Calendar, MapPin, Share2, Download, Timer, Trophy, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function EventHero({ event }: { event: any }) {
  const formattedDate = event?.date
    ?? (event?.startDate
      ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'TBA');

  const venue = event?.venue ?? event?.location ?? event?.city ?? 'TBA';
  const closingDate = event?.closingDate ?? event?.registrationWindowEnd ?? '-';
  const entryFee = event?.entryFee != null ? `₹${event.entryFee}` : '-';

  return (
    <div className="relative w-full min-h-[320px] md:min-h-[620px] overflow-hidden flex items-center">
      
      {/* ── Background Image (always present) ── */}
      <div className="absolute inset-0 z-0">
        <img
          src={event?.bannerUrl ?? '/images/hero_banner.png'}
          alt={event?.name ?? 'Event Banner'}
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* 
          Adaptive overlay:
          Light mode → white gradient left→right so dark text is readable
          Dark  mode → dark gradient left→right so white text is readable
        */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, var(--hero-overlay-start) 0%, var(--hero-overlay-mid) 40%, var(--hero-overlay-end) 100%)',
          }}
        />
      </div>

      {/* ── CSS variables injected per theme ── */}
      <style>{`
        :root {
          --hero-overlay-start: rgba(255,255,255,0.95);
          --hero-overlay-mid:   rgba(255,255,255,0.75);
          --hero-overlay-end:   rgba(255,255,255,0.30);
          --hero-title:         #111827;
          --hero-desc:          #374151;
          --hero-meta:          #4B5563;
          --hero-label:         #6B7280;
          --hero-border:        rgba(0,0,0,0.10);
          --hero-card-bg:       rgba(255,255,255,0.90);
          --hero-card-border:   rgba(0,0,0,0.08);
          --hero-card-text:     #111827;
          --hero-card-muted:    #4B5563;
          --hero-badge-border:  rgba(0,0,0,0.12);
          --hero-btn-sec-text:  #111827;
          --hero-btn-sec-border:rgba(0,0,0,0.25);
          --hero-btn-sec-hover: rgba(0,0,0,0.07);
        }
        .dark {
          --hero-overlay-start: rgba(0,0,0,0.85);
          --hero-overlay-mid:   rgba(0,0,0,0.60);
          --hero-overlay-end:   rgba(0,0,0,0.25);
          --hero-title:         #FFFFFF;
          --hero-desc:          rgba(255,255,255,0.85);
          --hero-meta:          rgba(255,255,255,0.75);
          --hero-label:         rgba(255,255,255,0.55);
          --hero-border:        rgba(255,255,255,0.12);
          --hero-card-bg:       rgba(18,18,18,0.80);
          --hero-card-border:   rgba(255,255,255,0.12);
          --hero-card-text:     #FFFFFF;
          --hero-card-muted:    rgba(255,255,255,0.65);
          --hero-badge-border:  rgba(255,255,255,0.20);
          --hero-btn-sec-text:  #FFFFFF;
          --hero-btn-sec-border:rgba(255,255,255,0.30);
          --hero-btn-sec-hover: rgba(255,255,255,0.10);
        }
      `}</style>

      {/* ── Content ── */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 py-8 md:py-28">

        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 max-w-2xl"
        >
          {/* Badges */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {/* Status badge — always orange bg, white text → visible on any bg */}
            <span className="px-4 py-1.5 bg-foreground text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-md">
              {event?.status ?? 'Open'}
            </span>
            {/* Type badge — adaptive border + text */}
            <span
              className="px-4 py-1.5 backdrop-blur-sm font-bold text-xs uppercase tracking-widest rounded-full"
              style={{
                border: '1px solid var(--hero-badge-border)',
                color: 'var(--hero-meta)',
                background: 'var(--hero-card-bg)',
              }}
            >
              {event?.type ?? 'Show'}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-3xl md:text-4xl lg:text-[52px] font-extrabold tracking-tight mb-4 leading-tight"
            style={{
              color: 'var(--hero-title)',
              textShadow: '0 2px 10px rgba(0,0,0,0.15)',
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {event?.name ?? 'Event Details'}
          </h1>

          {/* Description */}
          <p
            className="text-lg font-medium mb-8 leading-relaxed max-w-xl"
            style={{ color: 'var(--hero-desc)' }}
          >
            Register your dogs in India's most prestigious{event?.type ? ` ${event.type}` : ''} championship,
            hosted by{' '}
            <strong style={{ color: 'var(--hero-title)' }}>
              {event?.club?.name ?? 'KCI Official'}
            </strong>.
          </p>

          {/* Date & Venue */}
          <div className="flex flex-wrap gap-6 font-medium mb-8">
            {/* Date */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--hero-border)', border: '1px solid var(--hero-badge-border)' }}
              >
                <Calendar className="w-5 h-5" style={{ color: 'var(--hero-meta)' }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--hero-label)' }}>
                  Date
                </p>
                <p className="font-bold" style={{ color: 'var(--hero-meta)' }}>{formattedDate}</p>
              </div>
            </div>
            {/* Venue */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--hero-border)', border: '1px solid var(--hero-badge-border)' }}
              >
                <MapPin className="w-5 h-5" style={{ color: 'var(--hero-meta)' }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--hero-label)' }}>
                  Venue
                </p>
                <p className="font-bold" style={{ color: 'var(--hero-meta)' }}>{venue}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Temporarily hidden */}
          {false && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Primary CTA: theme-aware – dark bg + white text in dark mode, dark bg + white text in light mode */}
              <button
                className="w-full sm:w-auto h-[52px] px-8 font-bold text-base rounded-[14px] transition-all duration-300 hover:scale-[1.02] hover:opacity-90"
                style={{
                  background: 'var(--hero-card-text)',
                  color: 'var(--hero-overlay-start)',
                  boxShadow: '0 0 28px rgba(0,0,0,0.25)',
                }}
              >
                Register Now
              </button>
              {/* Secondary: adaptive */}
              <button
                className="w-full sm:w-auto h-[52px] px-6 font-bold text-base rounded-[14px] flex items-center justify-center gap-2 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
                style={{
                  color: 'var(--hero-btn-sec-text)',
                  border: '1.5px solid var(--hero-btn-sec-border)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hero-btn-sec-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Download className="w-4 h-4" /> Schedule
              </button>
              <button
                className="w-full sm:w-auto h-[52px] px-6 font-bold text-base rounded-[14px] flex items-center justify-center gap-2 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
                style={{
                  color: 'var(--hero-btn-sec-text)',
                  border: '1.5px solid var(--hero-btn-sec-border)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hero-btn-sec-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          )}
        </motion.div>

        {/* Right: Snapshot Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:block w-[360px] rounded-[28px] p-8 shadow-2xl relative overflow-hidden shrink-0"
          style={{
            background: 'var(--hero-card-bg)',
            border: '1px solid var(--hero-card-border)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Decorative icon */}
          <div className="absolute -right-8 -top-8 opacity-[0.06]">
            <Trophy className="w-44 h-44" style={{ color: 'var(--hero-card-text)' }} />
          </div>

          <h3 className="font-extrabold text-xl mb-6" style={{ color: 'var(--hero-card-text)' }}>
            Event Snapshot
          </h3>

          <div className="space-y-5 relative z-10">
            {/* Row helper */}
            {([
              { icon: Timer,  label: 'Registration Ends', value: closingDate,                   size: 'text-sm' },
              { icon: Users,  label: 'Slots Left',        value: event?.availableSlots ?? '-',  size: 'text-sm' },
              { icon: Award,  label: 'Prize Pool',        value: event?.prizePool ?? '-',       size: 'text-lg text-foreground' },
              { icon: Trophy, label: 'Entry Fee',         value: entryFee,                       size: 'text-2xl font-extrabold' },
            ] as const).map(({ icon: Icon, label, value, size }, idx, arr) => (
              <div
                key={label}
                className={`flex justify-between items-center ${idx < arr.length - 1 ? 'pb-4' : ''}`}
                style={idx < arr.length - 1 ? { borderBottom: '1px solid var(--hero-card-border)' } : {}}
              >
                <div className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--hero-card-muted)' }}>
                  <Icon className="w-4 h-4 text-foreground shrink-0" /> {label}
                </div>
                <span className={`font-bold ${size}`} style={{ color: size.includes('#FFFFFF') ? '#FFFFFF' : 'var(--hero-card-text)' }}>
                  {value as string}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
