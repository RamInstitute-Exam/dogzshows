'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Medal, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import { getImageUrl } from '@/lib/api';
import { config } from '@/lib/config';

export default function WinnersPage() {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '${config.apiUrl}';
        const res = await fetch(`${apiUrl}/winners/public`);
        if (res.ok) {
          const result = await res.json();
          setWinners(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch winners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, []);

  const getGradient = (i: number) => {
    if (i === 0) return 'from-yellow-400 to-amber-600';
    if (i === 1) return 'from-gray-300 to-gray-500';
    if (i === 2) return 'from-brand-orange to-red-500';
    return 'from-indigo-400 to-indigo-600';
  };

  return (
    <div className="min-h-fit bg-background">
      
      <BreadcrumbBanner
        slug="winners"
        fallbackTitle="Hall of Champions"
        fallbackSubtitle="Celebrating the finest dogs across all our prestigious events and championships."
        fallbackImage="/images/events_banner.png"
      />

      {/* Featured Winners */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-16 -mt-10 relative z-20">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
             <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {winners.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">No winners have been announced yet.</div>
            ) : winners.map((winner, i) => {
              const color = getGradient(i);
              return (
              <motion.div 
                key={winner.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`relative bg-[#0B1220] rounded-[2rem] p-1 pt-16 mt-16 premium-hover shadow-[0_10px_30px_rgba(0,0,0,0.35)]`}
              >
                {/* Floating Avatar */}
                <div className={`absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full p-1 bg-gradient-to-br ${color} shadow-lg`}>
                  <div className="w-full h-full object-cover rounded-full border-4 border-[#020817] bg-card flex items-center justify-center overflow-hidden">
                    {winner.dog?.images && winner.dog.images.length > 0 ? (
                      <img src={getImageUrl(winner.dog.images[0].url)} alt={winner.dog?.name} className="w-full h-full object-cover" />
                    ) : (
                      <Trophy className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 p-2 rounded-full bg-[#0B1220] text-foreground shadow-sm border border-border`}>
                    {i === 0 ? <Trophy className="w-5 h-5 text-[#F59E0B]" /> : <Medal className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </div>

                <div className="p-8 text-center bg-background/50 rounded-[1.8rem] h-full flex flex-col justify-between">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-[700] uppercase tracking-wider mb-4 bg-gradient-to-r ${color} text-foreground`}>
                      {winner.awardTitle || 'Champion'}
                    </span>
                    <h3 className="text-2xl font-[800] text-foreground mb-1">{winner.dog?.name || 'Unknown Dog'}</h3>
                    <p className="text-[#F59E0B] font-[700] text-sm mb-4">{winner.dog?.breed || 'Unknown Breed'}</p>
                    
                    <div className="space-y-2 mb-6 text-sm text-muted-foreground font-[500]">
                      <p>Owner: <span className="text-foreground">{winner.dog?.owner ? `${winner.dog.owner.firstName} ${winner.dog.owner.lastName}` : 'Private'}</span></p>
                      <p>Event: <span className="text-foreground">{winner.event?.name || 'Unknown Event'}</span></p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full rounded-[14px] h-[48px] btn-secondary-luxury font-[700] text-[#CBD5E1]">
                    View Full Profile
                  </Button>
                </div>
              </motion.div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
