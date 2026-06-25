'use client';

import React from 'react';
import WinnerCertificateCard from './WinnerCertificateCard';

interface WinnerPosterGridProps {
  winners: any[];
}

export default function WinnerPosterGrid({ winners }: WinnerPosterGridProps) {
  if (!winners || winners.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10 max-w-[1600px] mx-auto px-4">
      {winners.map((winner, idx) => (
        <WinnerCertificateCard 
          key={winner.id || idx} 
          winner={winner} 
        />
      ))}
    </div>
  );
}
