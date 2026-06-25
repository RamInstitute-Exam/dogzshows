'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import WinnerPosterGrid from '@/components/winners/WinnerPosterGrid';

interface WinnerGalleryClientProps {
  allWinners: any[];
  hallOfFameWinners: any[];
}

export default function WinnerGalleryClient({ allWinners, hallOfFameWinners }: WinnerGalleryClientProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  // Group Hall of Fame winners by year
  const groupedHallOfFame = hallOfFameWinners.reduce((acc: any, curr: any) => {
    const year = curr.showYear || curr.year || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(curr);
    return acc;
  }, {});

  const years = Object.keys(groupedHallOfFame).sort((a, b) => parseInt(b) - parseInt(a));

  if (activeCategory === 'Hall Of Fame') {
    return (
      <div className="space-y-16">
        <div className="text-center max-w-3xl mx-auto px-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Hall Of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">Fame</span></h2>
          <p className="text-lg text-muted-foreground">Discover the historic legends and top champions from past dog shows.</p>
        </div>

        <div className="space-y-16">
          {years.map((year) => (
            <div key={year} className="space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="text-3xl font-black text-foreground">{year}</h3>
                <div className="h-px flex-1 bg-border"></div>
              </div>
              <WinnerPosterGrid winners={groupedHallOfFame[year]} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter winners based on the active category
  const filteredWinners = activeCategory === 'All' 
    ? allWinners 
    : allWinners.filter(w => w.awardCategory === activeCategory || w.category?.name === activeCategory);

  return (
    <div className="space-y-16">
      <div className="mt-8">
        <WinnerPosterGrid winners={filteredWinners} />
      </div>

      {activeCategory === 'All' && hallOfFameWinners.length > 0 && (
        <div className="pt-24 border-t border-border/50">
          <div className="text-center max-w-3xl mx-auto px-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Hall Of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">Fame</span></h2>
            <p className="text-lg text-muted-foreground">Discover the historic legends and top champions from past dog shows.</p>
          </div>

          <div className="space-y-16">
            {years.map((year) => (
              <div key={year} className="space-y-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-3xl font-black text-foreground">{year}</h3>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                <WinnerPosterGrid winners={groupedHallOfFame[year]} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

