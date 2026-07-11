'use client';

import { MapPin, Trophy, User } from 'lucide-react';
import { motion } from 'framer-motion';

function JudgeAvatar({ judge }: { judge: any }) {
  const name: string = judge?.name ?? 'J';
  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const hasPhoto = judge?.image && judge.image !== '/images/hero_banner.png' && !judge.image.includes('placeholder');

  if (hasPhoto) {
    return (
      <img
        src={judge.image}
        alt={name}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          const parent = (e.target as HTMLImageElement).parentElement;
          if (parent) {
            parent.innerHTML = `<span class="text-xl font-extrabold text-foreground">${initials}</span>`;
            parent.style.display = 'flex';
            parent.style.alignItems = 'center';
            parent.style.justifyContent = 'center';
            parent.className = parent.className + ' bg-muted';
          }
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <span className="text-2xl font-extrabold text-foreground">{initials || '?'}</span>
    </div>
  );
}

export default function EventJudges({ judges }: { judges: any[] }) {
  // Guard: hide section if no judges
  if (!judges || judges.length === 0) return null;

  return (
    <div className="bg-card rounded-[20px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-border mb-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8">
        Esteemed Judges
        <span className="ml-3 text-base font-bold text-muted-foreground">({judges.length})</span>
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {judges.map((judge: any, i: number) => (
          <motion.div 
            key={judge?.id ?? i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="group p-4 sm:p-6 bg-card rounded-[20px] border border-border hover:border-border/50 transition-all duration-300 text-center hover:shadow-lg flex flex-col items-center"
          >
            {/* Avatar */}
            <div
              className="w-20 h-20 sm:w-32 sm:h-32 mx-auto rounded-full sm:rounded-[20px] overflow-hidden mb-3 sm:mb-5 border-2 sm:border-4 border-border shadow-md group-hover:scale-105 transition-transform duration-300 bg-muted"
            >
              <JudgeAvatar judge={judge} />
            </div>

            {/* Name */}
            <h4 className="font-extrabold text-foreground text-[11px] sm:text-lg mb-1 sm:mb-2 leading-snug sm:leading-tight">
              {judge?.name ?? 'Unknown Judge'}
            </h4>

            {/* Country */}
            <div className="flex items-center justify-center gap-1 sm:gap-3 mb-2 sm:mb-4 text-[10px] sm:text-sm font-semibold text-muted-foreground flex-wrap">
              {judge?.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
                  {judge.country}
                </span>
              )}
            </div>

            {/* Groups badge */}
            {judge?.groups && (
              <div
                className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 font-bold text-[9px] sm:text-xs rounded-lg bg-muted text-foreground border border-border mt-auto w-full sm:w-auto break-words text-center"
              >
                <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" /> 
                <span className="break-words whitespace-normal">{judge.groups}</span>
              </div>
            )}
            
          </motion.div>
        ))}
      </div>
    </div>
  );
}

