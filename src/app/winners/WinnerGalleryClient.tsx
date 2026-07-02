'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import WinnerPosterGrid from '@/components/winners/WinnerPosterGrid';

import api from '@/lib/api';

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
  
  const [winners, setWinners] = useState<any[]>(allWinners || []);
  const [hofWinners, setHofWinners] = useState<any[]>(hallOfFameWinners || []);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setActiveCategory(cat.toUpperCase());
    }
  }, [searchParams]);

  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategory]);

  useEffect(() => {
    // If we already have initial props data, don't fetch dynamically
    if ((allWinners && allWinners.length > 0) || (hallOfFameWinners && hallOfFameWinners.length > 0)) {
      setWinners(allWinners);
      setHofWinners(hallOfFameWinners);
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const [allRes, hofRes] = await Promise.all([
          api.get('/public/winners/public?limit=1000').catch(() => ({ success: false, data: [] })),
          api.get('/public/winners/public/hall-of-fame?limit=1000').catch(() => ({ success: false, data: [] }))
        ]);
        
        if (allRes?.success && Array.isArray(allRes.data)) {
          setWinners(allRes.data);
        }
        if (hofRes?.success && Array.isArray(hofRes.data)) {
          setHofWinners(hofRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch winners client-side:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [allWinners, hallOfFameWinners]);

  // Combine and deduplicate all winners
  const allCombined = [...winners, ...hofWinners];
  const uniqueWinnersMap = new Map();
  allCombined.forEach(w => {
    if (!uniqueWinnersMap.has(w.id)) {
      uniqueWinnersMap.set(w.id, w);
    }
  });
  const allUniqueWinners = Array.from(uniqueWinnersMap.values());

  // Filter logic
  let filteredWinners = allUniqueWinners.filter(w => {
        if (activeCategory === 'ALL') return true;

        // Ensure we check against possible fields case-insensitively
        const categoryMatch = w.awardCategory?.toUpperCase() === activeCategory || 
                              w.category?.name?.toUpperCase() === activeCategory || 
                              w.awardTitle?.toUpperCase() === activeCategory;
        
        // If "HALL OF FAME" is selected, also check if it came from the hallOfFameWinners list specifically
        if (activeCategory === 'HALL OF FAME') {
          return categoryMatch || hofWinners.some(hof => hof.id === w.id);
        }

        return categoryMatch;
      });

  // DO NOT sort client-side. The backend returns winners ordered by:
  // 1. event.displayOrder ASC  (groups 5th Show before 6th Show)
  // 2. winner.displayOrder ASC (orders winners within each event)

  return (
    <div className="space-y-8">
      {/* PREMIUM STICKY FILTER BAR */}
      <div className="sticky top-[60px] md:top-[80px] z-40 w-full bg-background/95 backdrop-blur-md py-4 md:py-6 border-b border-border/40 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 md:gap-3 snap-x snap-mandatory md:snap-none md:flex-wrap md:justify-center w-full max-w-[100vw] scroll-smooth">
          {FILTER_CHIPS.map(chip => (
            <button 
              key={chip}
              onClick={(e) => {
                setActiveCategory(chip);
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }}
              className={`w-auto flex-none inline-flex items-center justify-center h-[40px] md:h-[48px] px-5 md:px-6 rounded-full text-[13px] md:text-[14px] font-bold transition-all duration-300 ease-out whitespace-nowrap shrink-0 snap-center border ${
                activeCategory === chip 
                  ? 'bg-amber-500 text-black border-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.25)]'
                  : 'bg-[#121212] md:bg-card text-gray-400 border-border/30 hover:border-border/80 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <span className="max-w-[200px] truncate">{chip}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-16">
        {loading ? (
          <div className="h-96 w-full animate-pulse bg-muted rounded-2xl flex items-center justify-center">
            <span className="text-muted-foreground font-medium">Loading winners...</span>
          </div>
        ) : filteredWinners.length > 0 ? (
          <>
            <WinnerPosterGrid winners={filteredWinners.slice(0, visibleCount)} />
            {visibleCount < filteredWinners.length && (
              <div className="flex justify-center pt-8 pb-12">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl shadow-lg transition-colors"
                >
                  Load More Winners
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-muted-foreground">No winners found for this category.</h3>
          </div>
        )}
      </div>
    </div>
  );
}

