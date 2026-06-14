'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { config } from '@/lib/config';
import api from '@/lib/api';

const DEFAULT_SPONSORS = [
  { name: 'Royal Canin', logoUrl: null },
  { name: 'Pedigree', logoUrl: null },
  { name: 'Purina Pro Plan', logoUrl: null },
  { name: 'Eukanuba', logoUrl: null },
  { name: "Hill's Science Diet", logoUrl: null },
  { name: 'Orijen', logoUrl: null },
  { name: 'Acana', logoUrl: null },
  { name: 'Taste of the Wild', logoUrl: null }
];

export default function Sponsors() {
  const [sponsors, setSponsors] = useState<any[]>(DEFAULT_SPONSORS);

  useEffect(() => {
    async function fetchSponsors() {
      try {
        const result = await api.get('/cms/global');
        if (result.success && result.data?.sponsors?.length > 0) {
          setSponsors(result.data.sponsors);
        }
      } catch (error) {
        console.error('Failed to fetch sponsors:', error);
      }
    }
    fetchSponsors();
  }, []);

  const duplicatedSponsors = [...sponsors, ...sponsors, ...sponsors];

  return (
    <section className="py-12 bg-[#071225] border-y border-border overflow-hidden">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mb-8 text-center">
        <p className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest">Proudly Supported By</p>
      </div>

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
                <span className="text-2xl font-extrabold text-muted-foreground transition-colors hover:text-brand-orange cursor-pointer">
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
