'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import { getImageUrl } from '@/lib/api';

interface WinnerCertificateCardProps {
  winner: any;
}

export default function WinnerCertificateCard({ winner }: WinnerCertificateCardProps) {
  const dogName = winner.dogName || '';
  const imageUrl = winner.winnerImage || winner.imageUrl;
  
  // Format Date safely
  let formattedDate = '';
  if (winner.showDate) {
    try {
      const d = new Date(winner.showDate);
      formattedDate = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch(e) {}
  } else if (winner.year) {
    formattedDate = String(winner.year);
  }

  return (
    <div className="bg-[#FFFFFF] rounded-[20px] sm:rounded-[28px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:shadow-[0_18px_45px_rgba(0,0,0,0.18)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.15)] sm:hover:shadow-[0_28px_60px_rgba(0,0,0,0.22)] overflow-hidden flex flex-col mx-auto w-full max-w-[330px] sm:max-w-[420px] md:max-w-[460px] xl:max-w-[520px] h-full transition-transform duration-300 hover:-translate-y-[4px] sm:hover:-translate-y-[6px]">
      
      {/* TOP HEADER */}
      <div className="bg-white h-[50px] sm:h-[60px] flex items-center justify-center px-3 sm:px-4 shrink-0">
        <h3 className="text-[13px] sm:text-[16px] font-[700] uppercase text-black leading-tight text-center line-clamp-2">
          {winner.awardTitle || 'CHAMPIONSHIP SHOW'}
        </h3>
      </div>

      {/* IMAGE SECTION */}
      <div className="w-full h-[250px] sm:h-[330px] relative bg-white overflow-hidden shrink-0">
        {imageUrl ? (
          <img 
            src={getImageUrl(imageUrl)} 
            alt={dogName || 'Champion'} 
            className="w-full h-full object-contain object-center block" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
          </div>
        )}
      </div>

      {/* BOTTOM DETAILS */}
      <div className="bg-[#FFFFFF] py-[12px] sm:py-[16px] px-[16px] sm:px-[20px] flex flex-col items-center flex-1 justify-start overflow-hidden">
        <h4 className="text-[16px] sm:text-[22px] font-[800] uppercase text-black mb-2 sm:mb-3 leading-tight whitespace-pre-line tracking-wide text-center">
          {winner.winningTitle || winner.awardCategory || 'WINNER'}
          {winner.placement && (
            <>
              <br />
              <span className="text-[13px] sm:text-[16px] font-[700]">{winner.placement}</span>
            </>
          )}
        </h4>

        <div className="flex flex-col space-y-1 w-full px-2 sm:px-4 text-center items-center overflow-hidden">
          {dogName && (
            <p className="text-[11px] sm:text-[14px] font-[700] text-black uppercase tracking-[0.2px] line-clamp-1 w-full break-words">
              DOG NAME : {dogName}
            </p>
          )}
          
          {winner.ownerName && (
            <p className="text-[10px] sm:text-[13px] font-[600] text-black uppercase tracking-[0.2px] line-clamp-1 w-full break-words">
              OWNER NAME : {winner.ownerName}
            </p>
          )}
          
          {winner.breederName && (
            <p className="text-[10px] sm:text-[13px] font-[600] text-black uppercase tracking-[0.2px] line-clamp-1 w-full break-words">
              BREEDER NAME : {winner.breederName}
            </p>
          )}
        </div>

        {/* YEAR SECTION */}
        {formattedDate && (
          <div className="mt-[8px] sm:mt-[10px] flex flex-col items-center justify-center w-full px-2 sm:px-4 text-center gap-0.5 shrink-0">
            <span className="text-[10px] sm:text-[12px] font-[500] text-black uppercase tracking-[0.2px]">YEAR : {formattedDate}</span>
          </div>
        )}
      </div>

    </div>
  );
}


