import React, { Suspense } from 'react';
import PublicContainer from '@/components/layout/PublicContainer';
import PageContainer from '@/components/layout/PageContainer';
import { fetchServerData } from '@/lib/server-api';
import WinnerGalleryClient from './WinnerGalleryClient';

export const revalidate = 300;

async function GalleryWrapper() {
  const [allRes, hofRes] = await Promise.all([
    fetchServerData('/public/winners/public', 300).catch(() => ({ success: false, data: [] })),
    fetchServerData('/public/winners/public/hall-of-fame', 300).catch(() => ({ success: false, data: [] }))
  ]);

  return (
    <WinnerGalleryClient 
      allWinners={allRes?.data || []} 
      hallOfFameWinners={hofRes?.data || []} 
    />
  );
}

export default function WinnersPage() {
  return (
    <PageContainer>
      <div className="bg-gradient-to-b from-black to-background pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <PublicContainer className="relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            Championship <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">Winners</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-medium">
            Explore the elite dogs that have demonstrated ultimate breed perfection and earned top honors.
          </p>
        </PublicContainer>
      </div>

      <PublicContainer className="pb-24">
        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted mt-12 rounded-2xl" />}>
          <GalleryWrapper />
        </Suspense>
      </PublicContainer>
    </PageContainer>
  );
}
