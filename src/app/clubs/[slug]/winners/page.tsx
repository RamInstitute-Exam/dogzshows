import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchServerDataSingle, fetchServerData } from '@/lib/server-api';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Trophy, Calendar } from 'lucide-react';
import WinnerCertificateCard from '@/components/winners/WinnerCertificateCard';

export const revalidate = 60;

export async function generateStaticParams() {
  const res = await fetchServerData('/public/clubs/public?limit=100');
  const clubs = res?.data || [];
  return clubs.map((c: any) => ({ slug: c.slug || c.id }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const res = await fetchServerDataSingle(`/public/clubs/slug/${params.slug}`);
  const club = res?.data;

  if (!club) {
    return { title: 'Club Winners Not Found' };
  }

  return {
    title: `${club.name} Winners | JuzDog`,
    description: `View all winners from ${club.eventName || club.name}`,
  };
}

export default async function ClubWinnersPage({ params }: { params: { slug: string } }) {
  const res = await fetchServerDataSingle(`/public/clubs/slug/${params.slug}`);
  const club = res?.data;

  if (!club) {
    return (
      <PageContainer>
        <div className="py-24 text-center">
          <h1 className="text-3xl font-bold">Club not found</h1>
        </div>
      </PageContainer>
    );
  }

  const winnersRes = await fetchServerData(`/public/winners/public?clubId=${club.id}&limit=100`);
  const winners = (winnersRes?.data || []).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <PageContainer>
      <div className="bg-gradient-to-b from-background to-accent/10 pb-16">
        {/* Banner Section */}
        {club.bannerUrl ? (
          <div className="relative w-full h-[30vh] md:h-[40vh]">
            <Image src={club.bannerUrl} alt={club.name} fill className="object-cover" />
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

        {/* Content Section */}
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
                <Trophy className="w-5 h-5" />
                <span>Gallery</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                All Winners
              </h2>
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
                <WinnerCertificateCard key={winner.id} winner={winner} />
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
