'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { getImageUrl } from '@/lib/api';
import api from '@/lib/api';
import { Trophy, Calendar, MapPin, User, Tag, ChevronLeft, Loader2, SearchX } from 'lucide-react';
import Link from 'next/link';

export default function WinnerDetailsClient() {
  const params = useParams();
  const id = params?.id as string;
  const [winner, setWinner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id || id === 'placeholder') {
      setLoading(false);
      return;
    }
    async function fetchWinner() {
      try {
        const res = await api.get(`/public/winners/${id}`);
        if (res?.success && res?.data) {
          setWinner(res.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchWinner();
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[70vh]">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
      </PageContainer>
    );
  }

  if (notFound || !winner) {
    return (
      <PageContainer>
        <PublicContainer className="py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-foreground/10 flex items-center justify-center mb-6 mx-auto">
            <SearchX className="w-10 h-10 text-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Winner Not Found</h1>
          <p className="text-muted-foreground mb-8">The winner you are looking for does not exist or has been removed.</p>
          <Link href="/winners" className="text-amber-500 font-bold hover:underline">&larr; Back to Winners</Link>
        </PublicContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-black to-slate-900 pt-32 pb-16 border-b border-white/10">
        <PublicContainer>
          <Link href="/winners" className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-sm mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to All Winners
          </Link>

          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
            {/* Image */}
            <div className="w-full lg:w-1/2 max-w-2xl">
              <div className="aspect-[4/5] sm:aspect-square relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                {[winner.imageUrl, winner.winnerImage, winner.featuredImage].find(img => img && typeof img === 'string' && img.trim() !== '' && img.trim() !== 'null' && img.trim() !== 'undefined') ? (
                  <OptimizedImage src={getImageUrl([winner.imageUrl, winner.winnerImage, winner.featuredImage].find(img => img && typeof img === 'string' && img.trim() !== '' && img.trim() !== 'null' && img.trim() !== 'undefined')!)} alt={winner.dogName} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Trophy className="w-24 h-24 text-white/10" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-amber-500 text-black text-xs font-black uppercase px-3 py-1.5 rounded-full tracking-wider shadow-lg">
                  {winner.showYear || winner.year}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 text-amber-500 font-bold mb-4 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  <Trophy className="w-4 h-4" />
                  {winner.awardCategory || winner.awardTitle}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-2">{winner.dogName}</h1>
                <p className="text-xl text-slate-300 font-medium">{winner.breedName}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Event</span>
                  <span className="text-white font-semibold">{winner.event?.name || winner.competition}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</span>
                  <span className="text-white font-semibold">{winner.event?.city || winner.event?.state || 'Unknown'}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Owner</span>
                  <span className="text-white font-semibold">{winner.ownerName}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Breeder</span>
                  <span className="text-white font-semibold">{winner.breederName || 'Not specified'}</span>
                </div>
                {winner.handlerName && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Handler</span>
                    <span className="text-white font-semibold">{winner.handlerName}</span>
                  </div>
                )}
                {winner.judge?.name && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1 sm:col-span-2">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Judge</span>
                    <span className="text-white font-semibold">{winner.judge.name}</span>
                  </div>
                )}
              </div>

              {winner.description && (
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-white font-bold mb-3">About the Winner</h3>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{winner.description}</p>
                </div>
              )}

              {(winner.certificateUrl || winner.videoUrl) && (
                <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {winner.certificateUrl && (
                    <a href={getImageUrl(winner.certificateUrl)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-xl py-3 px-4 transition-colors font-bold">
                      View Certificate
                    </a>
                  )}
                  {winner.videoUrl && (
                    <a href={winner.videoUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-3 px-4 transition-colors font-bold">
                      Watch Video
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </PublicContainer>
      </div>
    </PageContainer>
  );
}
