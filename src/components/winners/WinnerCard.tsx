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
  const getValid = (str: any) => typeof str === 'string' && str.trim().length > 0 ? str.trim() : null;
  const eventTitle = winner.awardTitle || winner.eventName || winner.event?.name || 'Championship Show';
  const awardTitle = getValid(winner.winningTitle) || getValid(winner.awardCategory) || getValid(winner.awardTitle);

  // Detect if this is a "Best Handler" type award
  const isHandlerAward = [awardTitle, winner.winningTitle, winner.awardCategory, winner.awardTitle]
    .some((t) => typeof t === 'string' && t.toLowerCase().includes('handler'));

  // Resolve handler display: use handlerName first, fall back to ownerName for handler awards
  const handlerDisplay = getValid(winner.handlerName) || (isHandlerAward ? getValid(winner.ownerName) : null);

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
    <div className="w-full h-full rounded-[16px] sm:rounded-[26px] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.12)] flex flex-col transition-transform duration-300 hover:-translate-y-1 select-none border border-black/5" style={{ overflow: 'visible' }}>
      {/* 1. Header (Event Title on top) */}
      {eventTitle && (
        <div className="px-2 py-2 sm:px-4 sm:py-3 flex items-center justify-center shrink-0 min-h-[48px] md:min-h-[64px] border-b border-black/5">
          <h3 className="jd-card-header-title text-[14px] md:text-[16px] font-bold text-black text-center uppercase tracking-wider max-w-full" style={{ fontFamily: 'var(--font-heading)' }}>
            {eventTitle}
          </h3>
        </div>
      )}

      {/* 2. Image Section */}
      <div
        className="w-full aspect-[4/3] relative bg-transparent rounded-none overflow-hidden shrink-0 block"
      >
        {imageUrl ? (
          <img
            src={getImageUrl(imageUrl)}
            alt={dogName || 'Winner'}
            loading="lazy"
            className="w-full h-full block transition-transform duration-300 object-cover"
            style={{ width: '100%', height: '100%', objectPosition: 'center center', backgroundColor: '#fcfcfc' }}
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
      <div className="flex flex-col justify-start items-center text-center px-[10px] md:px-[16px] py-[8px] sm:py-[12px] md:py-[18px] w-full flex-1 bg-white gap-1.5 md:gap-2" style={{ overflow: 'visible' }}>
        {/* Winning Title */}
        {awardTitle && (
          <h3 className="winning-title jd-card-winning-title text-[13px] md:text-[15px] font-bold text-black uppercase text-center w-full whitespace-normal break-words">
            {awardTitle}
          </h3>
        )}

        {/* Dog Name */}
        <h4 className="jd-card-dog-name text-[11px] md:text-[13px] font-[600] text-black uppercase text-center w-full whitespace-normal break-words" style={{ lineHeight: '1.3', fontFamily: 'var(--font-heading)' }}>
          DOG NAME : {dogName || '-'}
        </h4>

        {/* Handler Name — shown prominently for handler awards */}
        {handlerDisplay && (
          <p className="text-[10px] md:text-[12px] font-[500] text-gray-500 uppercase text-center w-full whitespace-normal break-words" style={{ lineHeight: '1.25' }}>
            HANDLER : {handlerDisplay}
          </p>
        )}

        {/* Owner Name — hide for handler awards if we already showed the handler fallback above */}
        {winner.ownerName?.trim() && !(isHandlerAward && !winner.handlerName?.trim()) && (
          <p className="text-[10px] md:text-[12px] font-[500] text-gray-500 uppercase text-center w-full whitespace-normal break-words" style={{ lineHeight: '1.25' }}>
            OWNER : {winner.ownerName.trim()}
          </p>
        )}

        {/* Breeder Name */}
        {winner.breederName?.trim() && (
          <p className="text-[10px] md:text-[12px] font-[500] text-gray-500 uppercase text-center w-full whitespace-normal break-words" style={{ lineHeight: '1.25' }}>
            BREEDER : {winner.breederName.trim()}
          </p>
        )}
      </div>
    </div>
  );
}
