'use client';

import React, { useState } from 'react';
import WinnerCard from './WinnerCard';
import WinnerPreviewModal from './WinnerPreviewModal';

interface WinnerPosterGridProps {
  winners: any[];
}

export default function WinnerPosterGrid({ winners }: WinnerPosterGridProps) {
  const [selectedWinner, setSelectedWinner] = useState<any | null>(null);

  if (!winners || winners.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {winners.map((winner, idx) => (
          <WinnerCard 
            key={winner.id || idx} 
            winner={winner} 
            onPreviewClick={() => setSelectedWinner(winner)}
          />
        ))}
      </div>

      <WinnerPreviewModal 
        winner={selectedWinner}
        isOpen={!!selectedWinner}
        onClose={() => setSelectedWinner(null)}
      />
    </>
  );
}
