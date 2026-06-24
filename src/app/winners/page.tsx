'use client';

import { useWinners } from '@/hooks/useCMS';
import { motion } from 'framer-motion';
import { Trophy, Star, Medal, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import { getImageUrl } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function WinnersPage() {
  const { data, isLoading } = useWinners();
  const winners = data?.success && Array.isArray(data.data) ? data.data : [];
  const loading = isLoading;


  const getGradient = (i: number) => {
    if (i === 0) return 'from-yellow-400 to-amber-600';
    if (i === 1) return 'from-gray-300 to-gray-500';
    if (i === 2) return 'from-pink-500 to-red-500';
    return 'from-indigo-400 to-indigo-600';
  };

  return (
    <PageContainer>
      
      <BreadcrumbBanner
        slug="winners"
        fallbackTitle="Hall of Champions"
        fallbackSubtitle="Celebrating the finest dogs across all our prestigious events and championships."
        fallbackImage="/images/winners_banner.png"
      />

      {/* Featured Winners */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-16 -mt-10 relative z-20">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
             <div className="w-12 h-12 border-4 border-border border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {winners.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">No winners have been announced yet.</div>
            ) : winners.map((winner: any, i: number) => {
              const color = getGradient(i);
              
              // Handle both manual entries and complex related entries
              const dogName = winner.dogName || winner.dog?.name || 'Unknown Dog';
              const breedName = winner.breedName || winner.dog?.breed || 'Unknown Breed';
              const ownerName = winner.ownerName || (winner.dog?.owner ? `${winner.dog.owner.firstName} ${winner.dog.owner.lastName}` : 'Private');
              const breederName = winner.breederName;
              const eventName = winner.competition || winner.event?.name || 'Unknown Event';
              const imgUrl = winner.imageUrl || (winner.dog?.images && winner.dog.images.length > 0 ? winner.dog.images[0].url : null);
              
              return (
              <motion.div 
                key={winner.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`relative bg-card rounded-[2rem] p-1 pt-16 mt-16 premium-hover shadow-[0_10px_30px_rgba(0,0,0,0.35)]`}
              >
                {/* Floating Avatar */}
                <div className={`absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full p-1 bg-gradient-to-br ${color} shadow-lg`}>
                  <div className="w-full h-full object-cover rounded-full border-4 border-[#020817] bg-card flex items-center justify-center overflow-hidden">
                    {imgUrl ? (
                      <OptimizedImage src={getImageUrl(imgUrl)} alt={dogName} className="w-full h-full object-cover" />
                    ) : (
                      <Trophy className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 p-2 rounded-full bg-card text-foreground shadow-sm border border-border`}>
                    {i === 0 ? <Trophy className="w-5 h-5 text-primary" /> : <Medal className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </div>

                <div className="p-8 text-center bg-background/50 rounded-[1.8rem] h-full flex flex-col justify-between">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-[700] uppercase tracking-wider mb-4 bg-gradient-to-r ${color} text-foreground`}>
                      {winner.awardTitle || 'Champion'}
                    </span>
                    <h3 className="text-2xl font-[800] text-foreground mb-1">{dogName}</h3>
                    <p className="text-primary font-[700] text-sm mb-4">{breedName}</p>
                    
                    <div className="space-y-2 mb-6 text-sm text-muted-foreground font-[500]">
                      <p>Owner: <span className="text-foreground">{ownerName}</span></p>
                      {breederName && <p>Breeder: <span className="text-foreground">{breederName}</span></p>}
                      <p>Event: <span className="text-foreground">{eventName} {winner.year ? `(${winner.year})` : ''}</span></p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full rounded-[14px] h-[48px] btn-secondary-luxury font-[700] text-muted-foreground">
                    View Full Profile
                  </Button>
                </div>
              </motion.div>
            )})}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
