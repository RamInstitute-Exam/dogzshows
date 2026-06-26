'use client';

import React from 'react';
import WinnerCertificateCard from './WinnerCertificateCard';

interface WinnerPosterGridProps {
  winners: any[];
}

export default function WinnerPosterGrid({ winners }: WinnerPosterGridProps) {
  if (!winners || winners.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 max-w-[1600px] mx-auto px-4 place-items-center">
      {winners.map((winner, idx) => (
        <div key={winner.id || idx} className="w-full flex justify-center">
          <WinnerCertificateCard 
            winner={winner} 
          />
        </div>
      ))}
    </div>
  );
}
