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
  const eventTitle = winner.awardTitle || winner.eventName || winner.event?.name || 'Championship Show';
  const awardTitle = winner.winningTitle || winner.awardCategory || 'Winner';

  // Get Year safely
  let year = '';
  if (winner.showDate) {
    try {
      year = String(new Date(winner.showDate).getFullYear());
    } catch (e) { }
  }
  if (!year && (winner.showYear || winner.year)) {
    year = String(winner.showYear || winner.year);
  }

  return (
    <div className="w-full h-[520px] md:h-[820px] rounded-[16px] sm:rounded-[26px] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1 select-none border border-black/5">
      {/* 1. Header (Event Title) */}
      <div className="px-2 py-2 sm:px-[18px] sm:py-[18px] flex items-center justify-center shrink-0 h-[60px] md:h-[90px] border-b border-black/5 overflow-hidden">
        <h3 className="text-xs sm:text-base md:text-[20px] font-[700] text-black leading-tight text-center line-clamp-2 max-w-full">
          {eventTitle}
        </h3>
      </div>

      {/* 2. Image Section */}
      <div
        className="w-full h-[240px] sm:h-[280px] md:h-[400px] lg:h-[460px] relative bg-transparent rounded-none overflow-hidden shrink-0 block"
      >
        {imageUrl ? (
          <img
            src={getImageUrl(imageUrl)}
            alt={dogName || 'Winner'}
            loading="lazy"
            className="w-full h-full block transition-transform duration-300"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', transform: 'scale(1.15)' }}
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
      <div className="flex flex-col justify-center items-center text-center px-[12px] md:px-[20px] py-[12px] md:py-[20px] w-full flex-1 bg-white overflow-hidden gap-2 md:gap-4">
        {/* Award Title */}
        <div className="w-full flex items-center justify-center shrink-0">
          <span
            className="text-[13px] md:text-[18px] font-[700] text-black uppercase text-center w-full whitespace-normal break-words line-clamp-2"
            style={{
              lineHeight: '1.25',
              fontFamily: 'var(--font-heading)'
            }}
          >
            {awardTitle}
          </span>
        </div>

        {/* Dog Name */}
        <div className="w-full flex items-start justify-center shrink-0">
          <h4 className="text-[13px] md:text-[18px] font-[700] text-black uppercase text-center w-full whitespace-normal break-words line-clamp-2 md:line-clamp-none" style={{ lineHeight: '1.3' }}>
            DOG NAME : {dogName || '-'}
          </h4>
        </div>

        {/* Owner Name */}
        {winner.ownerName?.trim() && (
          <div className="w-full flex items-start justify-center shrink-0">
            <p className="text-[11px] md:text-[15px] font-[500] text-gray-500 uppercase text-center w-full whitespace-normal break-words line-clamp-1 md:line-clamp-2" style={{ lineHeight: '1.45' }}>
              OWNER : {winner.ownerName.trim()}
            </p>
          </div>
        )}

        {/* Breeder Name */}
        {winner.breederName?.trim() && (
          <div className="w-full flex items-start justify-center shrink-0">
            <p className="text-[11px] md:text-[15px] font-[500] text-gray-500 uppercase text-center w-full whitespace-normal break-words line-clamp-1 md:line-clamp-2" style={{ lineHeight: '1.45' }}>
              BREEDER : {winner.breederName.trim()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
