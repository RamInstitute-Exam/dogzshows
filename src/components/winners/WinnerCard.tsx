'use client';

import React from 'react';
import { getImageUrl } from '@/lib/api';

interface WinnerCardProps {
  winner: any;
  compact?: boolean;
}

export default function WinnerCard({ winner, compact = false }: WinnerCardProps) {
  if (!winner) return null;

  const dogName = winner.dogName || '';
  const imageUrl = [winner.featuredImage, winner.winnerImage, winner.imageUrl].find(
    (img) => img && typeof img === 'string' && img.trim() !== '' && img.trim() !== 'null' && img.trim() !== 'undefined'
  );
  const eventTitle = winner.eventName || winner.event?.name || winner.awardTitle || 'Championship Show';
  const awardTitle = winner.winningTitle || winner.awardCategory || 'Winner';
  
  // Get Year safely
  let year = '';
  if (winner.showDate) {
    try {
      year = String(new Date(winner.showDate).getFullYear());
    } catch (e) {}
  }
  if (!year && (winner.showYear || winner.year)) {
    year = String(winner.showYear || winner.year);
  }

  return (
    <div className="w-full h-full rounded-[16px] sm:rounded-[26px] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1 select-none border border-black/5">
      {/* 1. Header (Event Title) */}
      <div className="px-3 py-2.5 sm:px-[18px] sm:py-[18px] flex items-center justify-center shrink-0 min-h-[48px] sm:min-h-[64px] border-b border-black/5">
        <h3 className="text-xs sm:text-base md:text-[20px] font-[700] text-black leading-tight text-center line-clamp-2 max-w-full">
          {eventTitle}
        </h3>
      </div>

      {/* 2. Image Section */}
      <div className="w-full aspect-[4/3] relative bg-gray-50 overflow-hidden shrink-0">
        {imageUrl ? (
          <img 
            src={getImageUrl(imageUrl)} 
            alt={dogName || 'Winner'} 
            loading="lazy"
            className="w-full h-full object-cover block"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
            <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
        )}
      </div>

      {/* 3. Content Section */}
      <div className="p-3 sm:p-5 flex flex-col justify-start gap-1 sm:gap-1.5 flex-1 text-center items-center min-h-[120px] sm:min-h-[180px]">
        {/* Award Title */}
        <span className="winning-title block w-full mb-1 sm:mb-2">
          {awardTitle}
        </span>

        {/* Dog Name */}
        {dogName && (
          <h4 className="text-[10px] sm:text-[15px] font-[700] text-black uppercase tracking-[0.2px] leading-tight w-full break-words">
            DOG NAME : {dogName}
          </h4>
        )}

        {/* Owner Name */}
        {winner.ownerName && (
          <p className="text-[9px] sm:text-[13px] font-[500] text-gray-500 uppercase tracking-[0.1px] leading-tight w-full break-words">
            OWNER : {winner.ownerName}
          </p>
        )}

        {/* Breeder Name */}
        {winner.breederName && (
          <p className="text-[9px] sm:text-[13px] font-[500] text-gray-500 uppercase tracking-[0.1px] leading-tight w-full break-words">
            BREEDER : {winner.breederName}
          </p>
        )}
      </div>
    </div>
  );
}
