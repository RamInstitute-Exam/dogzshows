'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import WinnerPosterGrid from '@/components/winners/WinnerPosterGrid';

interface WinnerGalleryClientProps {
  allWinners: any[];
  hallOfFameWinners: any[];
}

const FILTER_CHIPS = [
  'ALL',
  'BEST IN SHOW',
  'RESERVE BEST IN SHOW',
  'BEST PUPPY',
  'BEST JUNIOR',
  'BEST OF BREED',
  'BEST OF GROUP',
  'CHAMPION WINNER',
  'SPECIAL AWARD',
  'HALL OF FAME'
];

export default function WinnerGalleryClient({ allWinners, hallOfFameWinners }: WinnerGalleryClientProps) {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(
    (searchParams.get('category') || 'ALL').toUpperCase()
  );

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setActiveCategory(cat.toUpperCase());
    }
  }, [searchParams]);

  // Combine and deduplicate all winners
  const allCombined = [...allWinners, ...hallOfFameWinners];
  const uniqueWinnersMap = new Map();
  allCombined.forEach(w => {
    if (!uniqueWinnersMap.has(w.id)) {
      uniqueWinnersMap.set(w.id, w);
    }
  });
  const allUniqueWinners = Array.from(uniqueWinnersMap.values());

  // Filter logic
  let filteredWinners = activeCategory === 'ALL' 
    ? allUniqueWinners 
    : allUniqueWinners.filter(w => {
        // Ensure we check against possible fields case-insensitively
        const categoryMatch = w.awardCategory?.toUpperCase() === activeCategory || 
                              w.category?.name?.toUpperCase() === activeCategory || 
                              w.awardTitle?.toUpperCase() === activeCategory;
        
        // If "HALL OF FAME" is selected, also check if it came from the hallOfFameWinners list specifically
        if (activeCategory === 'HALL OF FAME') {
          return categoryMatch || hallOfFameWinners.some(hof => hof.id === w.id);
        }

        return categoryMatch;
      });

  // Sort by createdAt DESC
  filteredWinners = filteredWinners.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return (
    <div className="space-y-8">
      {/* FILTER CHIPS */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {FILTER_CHIPS.map(chip => (
          <button 
            key={chip}
            onClick={() => setActiveCategory(chip)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              activeCategory === chip 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105'
                : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground border border-border/50'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="space-y-16">
        {filteredWinners.length > 0 ? (
          <WinnerPosterGrid winners={filteredWinners} />
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-muted-foreground">No winners found for this category.</h3>
          </div>
        )}
      </div>
    </div>
  );
}

