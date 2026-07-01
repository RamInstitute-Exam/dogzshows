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

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setActiveCategory(cat.toUpperCase());
    }
  }, [searchParams]);

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
          api.get('/public/winners/public').catch(() => ({ success: false, data: [] })),
          api.get('/public/winners/public/hall-of-fame').catch(() => ({ success: false, data: [] }))
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
  let filteredWinners = activeCategory === 'ALL' 
    ? allUniqueWinners 
    : allUniqueWinners.filter(w => {
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
        {loading ? (
          <div className="h-96 w-full animate-pulse bg-muted rounded-2xl flex items-center justify-center">
            <span className="text-muted-foreground font-medium">Loading winners...</span>
          </div>
        ) : filteredWinners.length > 0 ? (
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

