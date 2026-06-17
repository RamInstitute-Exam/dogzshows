'use client';

import { motion } from 'framer-motion';
import { Trophy, ChevronRight, Activity, Users } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

export default function CompetitionEngine() {
  const MOCK_BRACKET: any[] = [
    {
      round: 'Quarter Finals',
      matches: [
        { id: 1, dog1: 'Maximus (GR)', dog2: 'Luna (SH)', winner: 'Maximus (GR)', score1: 9.8, score2: 9.2 },
        { id: 2, dog1: 'Apollo (GS)', dog2: 'Bella (PR)', winner: 'Apollo (GS)', score1: 9.5, score2: 8.9 },
        { id: 3, dog1: 'Rocky (BD)', dog2: 'Daisy (DM)', winner: 'Rocky (BD)', score1: 9.1, score2: 8.5 },
        { id: 4, dog1: 'Zeus (DB)', dog2: 'Zoe (PG)', winner: 'Zeus (DB)', score1: 9.7, score2: 9.0 },
      ]
    },
    {
      round: 'Semi Finals',
      matches: [
        { id: 5, dog1: 'Maximus (GR)', dog2: 'Apollo (GS)', winner: 'Maximus (GR)', score1: 9.9, score2: 9.4 },
        { id: 6, dog1: 'Rocky (BD)', dog2: 'Zeus (DB)', winner: null, score1: null, score2: null, live: true },
      ]
    },
    {
      round: 'Best In Show',
      matches: [
        { id: 7, dog1: 'Maximus (GR)', dog2: 'TBD', winner: null, score1: null, score2: null },
      ]
    }
  ];

  return (
    <PageContainer>
      
      {/* Header */}
      <div className="pt-8 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/20 blur-[100px] -z-10" />
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/20 blur-[100px] -z-10" />
        
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-red-400 font-bold text-sm tracking-wider uppercase">Live Engine</span>
              </div>
              <h1 className="text-muted-foregroundxl md:text-muted-foregroundxl font-extrabold mb-2 tracking-tight">Competition Bracket</h1>
              <p className="text-xl text-muted-foreground">National Specialty Show 2026 - Working Group</p>
            </motion.div>
            
            <div className="flex gap-4">
              <div className="bg-card/5 backdrop-blur border border-border px-6 py-3 rounded-2xl text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Live Viewers</p>
                <p className="text-xl font-bold flex items-center justify-center gap-2"><Users className="w-5 h-5 text-brand-orange" /> 1,248</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bracket View */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-12 overflow-x-auto hide-scrollbar">
        <div className="flex min-w-[900px] gap-8">
          {MOCK_BRACKET.map((column: any, colIdx: number) => (
            <div key={column.round} className="flex-1 flex flex-col relative">
              <h3 className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8">{column.round}</h3>
              
              <div className="flex-1 flex flex-col justify-around gap-8">
                {column.matches.map((match: any, matchIdx: number) => (
                  <motion.div 
                    key={match.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (colIdx * 0.2) + (matchIdx * 0.1) }}
                    className={`relative p-1 rounded-2xl ${match.live ? 'bg-gradient-to-r from-brand-orange to-red-500 animate-pulse' : 'bg-card/5'}`}
                  >
                    <div className="bg-accent rounded-xl p-4 flex flex-col gap-3 h-full">
                      {match.live && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Activity className="w-3 h-3" /> LIVE
                        </div>
                      )}
                      
                      <div className={`flex justify-between items-center p-2 rounded-lg ${match.winner === match.dog1 ? 'bg-card/10 font-bold' : 'text-muted-foreground'}`}>
                        <span className="flex items-center gap-2">
                          {match.winner === match.dog1 && <Trophy className="w-4 h-4 text-yellow-500" />} {match.dog1}
                        </span>
                        <span>{match.score1 || '-'}</span>
                      </div>
                      
                      <div className={`flex justify-between items-center p-2 rounded-lg ${match.winner === match.dog2 ? 'bg-card/10 font-bold' : 'text-muted-foreground'}`}>
                        <span className="flex items-center gap-2">
                          {match.winner === match.dog2 && <Trophy className="w-4 h-4 text-yellow-500" />} {match.dog2}
                        </span>
                        <span>{match.score2 || '-'}</span>
                      </div>
                    </div>
                    
                    {/* Bracket Connector Line */}
                    {colIdx < MOCK_BRACKET.length - 1 && (
                      <div className="absolute top-1/2 -right-8 w-8 h-px bg-card/20" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
