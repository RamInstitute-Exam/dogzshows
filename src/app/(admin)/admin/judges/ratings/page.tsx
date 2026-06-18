'use client';

import { CompetitionService } from '@/services/competition.service';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Star, CheckCircle, XCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function CompetitionRatings() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await CompetitionService.getMatches();
      if (data.success) {
        setMatches(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const handleScore = async (matchId: string, isWinner: boolean, awardTitle?: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/competitions/matches/score`);
      
      if (res.ok) {
        fetchMatches(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to score match');
    }
  };

  const filteredMatches = matches.filter(m => 
    (m.dog?.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (m.round?.event?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Star className="w-8 h-8 text-brand-orange" /> Competition Ratings
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Score participants, manage brackets, and assign Winner Tags.</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search dog or event..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-[#7C8798] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-all shadow-lg"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Competition Match</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Participant Dog</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider text-right">Judging Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-orange  mb-4" />
                        <p className="text-muted-foreground">Loading match data...</p>
                      </td>
                    </tr>
                  ) : filteredMatches.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <Star className="w-12 h-12 text-[#1E293B]  mb-4" />
                        <p className="text-muted-foreground font-medium">No active competition matches found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMatches.map((match, i) => (
                      <motion.tr 
                        key={match.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-1">
                            {match.round?.event?.name}
                          </p>
                          <p className="font-bold text-foreground text-lg">{match.round?.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">Level {match.round?.level}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-foreground">{match.dog?.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{match.dog?.breed?.name}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{match.dog?.kciNumber}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${match.status === 'ADVANCED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : match.status === 'ELIMINATED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-accent text-muted-foreground border-[rgba(255,255,255,0.05]'}`}>
                            {match.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {match.status === 'PARTICIPATING' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleScore(match.id, false)}
                                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Eliminate
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleScore(match.id, true, 'Best in Show')}
                                className="bg-brand-orange hover:bg-orange-600 text-foreground font-bold"
                              >
                                <Award className="w-4 h-4 mr-1" /> Winner
                              </Button>
                            </div>
                          ) : match.winners?.length > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded border border-yellow-500/20">
                              <Award className="w-3 h-3" /> {match.winners[0].awardTitle}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Scored</span>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      
  );
}
