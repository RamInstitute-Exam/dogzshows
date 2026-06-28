'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Trophy, Calendar, Loader2, SearchX } from 'lucide-react';
import api, { getImageUrl } from '@/lib/api';

function LandscapeWinnerCard({ winner }: { winner: any }) {
  const dogName = winner.dogName || '';
  const imageUrl = [winner.featuredImage, winner.winnerImage, winner.imageUrl].find(
    (img) => img && typeof img === 'string' && img.trim() !== '' && img.trim() !== 'null' && img.trim() !== 'undefined'
  );
  const winnerCategory = winner.winningTitle || winner.awardCategory || 'Winner';
  
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-all duration-300 group">
      {/* Landscape Image Section */}
      <div className="w-full aspect-[16/10] relative bg-accent/20 overflow-hidden">
        {imageUrl ? (
          <img 
            src={getImageUrl(imageUrl)} 
            alt={dogName} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/30 text-muted-foreground">
            <Trophy className="w-10 h-10" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block mb-1">
            {winnerCategory}
          </span>
          <h4 className="text-lg font-black text-foreground">
            {winner.awardTitle || 'Championship Award'}
          </h4>
          <p className="text-sm font-bold text-muted-foreground mt-2">
            Dog: <span className="text-foreground">{dogName || 'N/A'}</span>
          </p>
          {winner.ownerName && (
            <p className="text-xs text-muted-foreground mt-1">
              Owner: <span className="text-foreground font-semibold">{winner.ownerName}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClubWinnersClient() {
  const params = useParams();
  const slug = params?.slug as string;

  const [club, setClub] = useState<any>(null);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug || slug === 'placeholder') { setLoading(false); return; }
    async function fetchData() {
      try {
        const clubRes = await api.get(`/public/clubs/slug/${slug}`);
        const clubData = clubRes?.data || clubRes;
        if (!clubData?.id) { setNotFound(true); setLoading(false); return; }
        setClub(clubData);

        const winRes = await api.get(`/public/clubs/${slug}/winners`);
        if (winRes.success && Array.isArray(winRes.data)) {
          setWinners(winRes.data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (loading) return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    </PageContainer>
  );

  if (notFound || !club) return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <SearchX className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold mb-2">Club Not Found</h1>
        <Link href="/clubs" className="text-amber-500 font-bold hover:underline mt-4">&larr; Back to Clubs</Link>
      </div>
    </PageContainer>
  );

  return (
    <PageContainer>
      <div className="bg-gradient-to-b from-background to-accent/10 pb-16">
        {club.bannerUrl ? (
          <div className="relative w-full h-[30vh] md:h-[40vh]">
            <Image src={getImageUrl(club.bannerUrl)} alt={club.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <PublicContainer>
                <div className="text-center text-white space-y-4 max-w-4xl mx-auto">
                  <h1 className="text-4xl md:text-6xl font-black">{club.name}</h1>
                  {club.eventName && <h2 className="text-xl md:text-2xl text-amber-500 font-bold">{club.eventName}</h2>}
                </div>
              </PublicContainer>
            </div>
          </div>
        ) : (
          <div className="bg-accent/20 py-24">
            <PublicContainer>
              <div className="text-center space-y-4 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black">{club.name}</h1>
                {club.eventName && <h2 className="text-xl md:text-2xl text-amber-500 font-bold">{club.eventName}</h2>}
              </div>
            </PublicContainer>
          </div>
        )}

        <PublicContainer className="mt-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/clubs" className="hover:text-foreground">Clubs</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/clubs/${club.slug}`} className="hover:text-foreground">{club.name}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-amber-500 font-medium">Winners</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-amber-500 font-bold tracking-widest uppercase text-sm mb-3">
                <Trophy className="w-5 h-5" /><span>Gallery</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">All Winners</h2>
            </div>
            {club.eventDate && (
              <div className="flex items-center gap-2 text-muted-foreground bg-card px-4 py-2 rounded-full border border-border shadow-sm">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{new Date(club.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            )}
          </div>

          {winners.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-2xl border border-border shadow-sm">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-foreground">No winners found</h3>
              <p className="text-muted-foreground mt-2">Winners for this event will be published soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {winners.map((winner: any) => (
                <LandscapeWinnerCard key={winner.id} winner={winner} />
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link href="/">
              <button className="px-8 py-3 rounded-full border border-amber-500 text-amber-500 font-bold text-sm bg-transparent hover:bg-amber-500 hover:text-black transition-all">
                Back to Homepage
              </button>
            </Link>
          </div>
        </PublicContainer>
      </div>
    </PageContainer>
  );
}
