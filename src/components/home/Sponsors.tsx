'use client';

import { motion } from 'framer-motion';
import PublicContainer from '@/components/layout/PublicContainer';


interface SponsorsProps {
  sponsorsData: any[];
}

export default function Sponsors({ sponsorsData }: SponsorsProps) {
  const sponsors = sponsorsData && sponsorsData.length > 0 ? sponsorsData : [];
  if (sponsors.length === 0) return null;
  const duplicatedSponsors = [...sponsors, ...sponsors, ...sponsors];

  return (
    <section className="w-full overflow-hidden pb-8 md:pb-12 lg:pb-16 bg-background border-y border-border pt-0">
      <PublicContainer className="mb-8 text-center">
        <p className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest">Proudly Supported By</p>
      </PublicContainer>

      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee flex items-center whitespace-nowrap group-hover:pause">
          {duplicatedSponsors.map((sponsor, i) => (
            <div key={i} className="mx-12 flex items-center justify-center">
              {sponsor.logoUrl ? (
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  className="h-10 object-contain grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
                />
              ) : (
                <span className="text-2xl font-extrabold text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
                  {sponsor.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .group-hover\\:pause:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </section>
  );
}
