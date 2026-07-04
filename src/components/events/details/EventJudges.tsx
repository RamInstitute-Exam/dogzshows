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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {judges.map((judge: any, i: number) => (
          <motion.div 
            key={judge?.id ?? i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="group p-6 bg-card rounded-[20px] border border-border hover:border-border/50 transition-all duration-300 text-center hover:shadow-lg"
          >
            {/* Avatar */}
            <div
              className="w-44 h-44 mx-auto rounded-[20px] overflow-hidden mb-5 border-4 border-border shadow-md group-hover:scale-105 transition-transform duration-300 bg-muted"
            >
              <JudgeAvatar judge={judge} />
            </div>

            {/* Name */}
            <h4 className="font-extrabold text-foreground text-lg mb-2 leading-tight">
              {judge?.name ?? 'Unknown Judge'}
            </h4>

            {/* Country */}
            <div className="flex items-center justify-center gap-3 mb-4 text-sm font-semibold text-muted-foreground flex-wrap">
              {judge?.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  {judge.country}
                </span>
              )}
            </div>

            {/* Groups badge */}
            {judge?.groups && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 font-bold text-xs rounded-lg bg-muted text-foreground border border-border"
              >
                <Trophy className="w-3.5 h-3.5 text-muted-foreground" /> {judge.groups}
              </div>
            )}

            {/* Chief Judge badge */}
            {judge?.isChiefJudge && (
              <div className="mt-3 inline-block px-3 py-1 bg-foreground text-background font-bold text-xs rounded-full">
                Chief Judge
              </div>
            )}
            
            {/* Guest Judge badge */}
            {judge?.isCustom && (
              <div className="mt-3 inline-block px-3 py-1 bg-accent text-foreground font-bold text-xs rounded-full border border-border">
                Guest Judge
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

