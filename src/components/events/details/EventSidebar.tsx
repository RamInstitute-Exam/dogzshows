'use client';

import { Button } from '@/components/ui/button';
import { Download, Phone, Mail, MessageCircle, Info } from 'lucide-react';

export default function EventSidebar({ event }: { event: any }) {
  const ageClasses: any[] = Array.isArray(event?.ageClasses) ? event.ageClasses : [];
  const entryFee = event?.entryFee != null ? `₹${event.entryFee}` : 'Contact organizer';
  const availableSlots = event?.availableSlots ?? null;

  const primarySecretary = event?.secretaries?.[0];
  const contactPhone = primarySecretary?.mobile ?? event?.mobile ?? null;
  const contactEmail = primarySecretary?.email ?? event?.email ?? null;
  const whatsappNumber = contactPhone ? contactPhone.replace(/[^0-9]/g, '') : null;

  return (
    <div className="sticky top-[110px] space-y-8">

      {/* ── 1. Register Card ── */}
      <div className="bg-card rounded-[20px] p-7 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-border">
        <h3 className="text-2xl font-extrabold text-foreground mb-1">Register Dog</h3>
        <p className="text-muted-foreground text-sm font-medium mb-5">Secure your spot before slots fill up.</p>

        {/* Entry Fee */}
        <div className="flex justify-between items-center mb-5 pb-5 border-b border-border">
          <span className="text-muted-foreground font-semibold text-sm">Entry Fee</span>
          <span className="text-2xl font-black text-foreground">{entryFee}</span>
        </div>

        {/* Slots Progress */}
        {availableSlots !== null && (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-muted-foreground">Available Slots</span>
              <span className="text-foreground">
                {availableSlots} <span className="text-muted-foreground">/ 500</span>
              </span>
            </div>
            <div className="w-full bg-border/40 rounded-full h-2.5 overflow-hidden">
              <div className="bg-foreground h-full rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
        )}

        <button className="w-full btn-primary-luxury mb-3">
          Register Now
        </button>

        <Button
          variant="outline"
          className="w-full min-h-[46px] text-foreground border-border rounded-xl font-bold hover:bg-accent flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Download Rulebook
        </Button>
      </div>

      {/* ── 2. Age Classes ── */}
      {ageClasses.length > 0 && (
        <div className="bg-card rounded-[20px] p-7 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-border">
          <div className="flex items-center gap-2 mb-5">
            <Info className="w-5 h-5 text-foreground" />
            <h3 className="text-xl font-extrabold text-foreground">Age Classes</h3>
          </div>
          <div className="space-y-3">
            {ageClasses.slice(0, 5).map((cls: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center pb-3 border-b border-border/60 last:border-0 last:pb-0"
              >
                <span className="font-semibold text-foreground text-sm">{cls?.name ?? '-'}</span>
                {/*
                  Age badge — fixed colors that work in BOTH themes:
                  orange text on orange-tinted bg.
                  Use explicit hex values, not theme tokens,
                  to avoid light mode bg + dark mode white text collision.
                */}
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-foreground/10 text-foreground border border-border/20">
                  {cls?.age ?? '-'}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-foreground font-bold text-sm hover:underline text-center py-1">
            View Full Details
          </button>
        </div>
      )}

      {/* ── 3. Need Help ── */}
      <div className="bg-card rounded-[20px] p-7 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-border">
        <h3 className="text-xl font-extrabold text-foreground mb-1">Need Help?</h3>
        <p className="text-muted-foreground text-sm font-medium mb-5">
          Contact the event organizer directly for any queries.
        </p>

        <div className="space-y-3">
          {contactPhone && (
            <a href={`tel:${contactPhone}`} className="block">
              <div className="flex items-center gap-3 w-full min-h-[46px] px-4 bg-accent/50 hover:bg-accent border border-border rounded-xl font-semibold text-sm text-foreground transition-colors cursor-pointer">
                <Phone className="w-4 h-4 text-foreground shrink-0" />
                <span className="truncate">{contactPhone}</span>
              </div>
            </a>
          )}

          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="flex items-center gap-3 w-full min-h-[46px] px-4 bg-accent/50 hover:bg-accent border border-border rounded-xl font-semibold text-sm text-foreground transition-colors cursor-pointer">
                <Mail className="w-4 h-4 text-green-500 shrink-0" />
                <span>WhatsApp Support</span>
              </div>
            </a>
          )}

          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="block">
              <div className="flex items-center gap-3 w-full min-h-[46px] px-4 bg-accent/50 hover:bg-accent border border-border rounded-xl font-semibold text-sm text-foreground transition-colors cursor-pointer">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{contactEmail}</span>
              </div>
            </a>
          )}

          {!contactPhone && !contactEmail && (
            <p className="text-muted-foreground text-sm text-center font-medium italic py-2">
              Contact details not available for this event.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
