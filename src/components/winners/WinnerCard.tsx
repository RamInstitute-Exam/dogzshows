'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { getImageUrl } from '@/lib/api';

interface WinnerCardProps {
  winner: any;
  onPreviewClick: () => void;
}

export default function WinnerCard({ winner, onPreviewClick }: WinnerCardProps) {
  const dogName = winner.dogName || 'Champion Dog';
  const imageUrl = winner.winnerImage || winner.imageUrl;

  return (
    <div 
      onClick={onPreviewClick}
      className="group relative bg-card/60 backdrop-blur rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-[4/5] w-full bg-black/40 flex items-center justify-center">
        {imageUrl ? (
          <OptimizedImage 
            src={getImageUrl(imageUrl)} 
            alt={dogName} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <Trophy className="w-16 h-16 text-muted-foreground/30 animate-pulse" />
        )}
      </div>
    </div>
  );
}
