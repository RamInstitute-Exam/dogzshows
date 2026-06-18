'use client';

import { CompetitionService } from '@/services/competition.service';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Search, CheckCircle2, XCircle, MoreVertical, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function CompetitionsDashboard() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [scoringMatch, setScoringMatch] = useState<any>(null);
  const [scoreForm, setScoreForm] = useState({ score: '', notes: '', isWinner: false, awardTitle: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await CompetitionService.getMatches();
      if (data.success) {
        setMatches(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmit = async () => {
    if (!scoringMatch) return;
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/competitions/matches/score`);
      const data = res;
      if (data.success) {
        toast.success('Match scored successfully!');
        setScoringMatch(null);
        fetchMatches(); // refresh
      } else {
        toast.error(data.error || 'Failed to score match');
      }
    } catch (error) {
      toast.error('Failed to submit score');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredMatches = matches.filter(m => 
    m.dog?.name?.toLowerCase().includes(search.toLowerCase()) || 
    m.round?.event?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full">
        <div className="w-full space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Trophy className="w-8 h-8 text-brand-orange" /> Competition Rings
              </h1>
              <p className="text-muted-foreground mt-1">Manage active matches, input scores, and declare winners.</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search dog or event..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-brand-orange transition-all shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map(match => (
                <div key={match.id} className="bg-card rounded-2xl border border-border shadow-lg p-6 flex flex-col hover:border-[rgba(255,255,255,0.1)] transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      match.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                      match.status === 'IN_PROGRESS' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                      match.status === 'ADVANCED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                      'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {match.status}
                    </span>
                    <p className="text-xs font-bold text-muted-foreground">Round {match.round?.roundNumber}</p>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground line-clamp-1">{match.dog?.name || 'Unknown Dog'}</h3>
                  <p className="text-sm text-brand-orange font-semibold mb-4 line-clamp-1">{match.round?.event?.name}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-auto border-t border-border pt-4 mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Breed</p>
                      <p className="font-semibold text-foreground truncate">{match.dog?.breed?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Score</p>
                      <p className="font-semibold text-foreground">{match.score !== null ? match.score : '-'}</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      setScoringMatch(match);
                      setScoreForm({ score: match.score || '', notes: match.notes || '', isWinner: match.status === 'ADVANCED', awardTitle: '' });
                    }} 
                    className="w-full bg-accent hover:bg-brand-orange hover:text-white text-foreground transition-colors font-bold"
                  >
                    <Play className="w-4 h-4 mr-2" /> Score Match
                  </Button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Scoring Modal */}
        <AnimatePresence>
          {scoringMatch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 md:"
              >
                <h2 className="text-2xl font-bold text-foreground mb-1">Score Match</h2>
                <p className="text-muted-foreground mb-6">Evaluating <strong className="text-foreground">{scoringMatch.dog?.name}</strong></p>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Score (0-100)</label>
                    <input 
                      type="number" 
                      value={scoreForm.score} 
                      onChange={e => setScoreForm({...scoreForm, score: e.target.value})}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:border-brand-orange outline-none font-bold text-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Judge Notes</label>
                    <textarea 
                      value={scoreForm.notes} 
                      onChange={e => setScoreForm({...scoreForm, notes: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:border-brand-orange outline-none resize-none"
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={scoreForm.isWinner} 
                        onChange={e => setScoreForm({...scoreForm, isWinner: e.target.checked})}
                        className="w-5 h-5 rounded bg-input border-border text-brand-orange focus:ring-brand-orange"
                      />
                      <span className="font-bold text-foreground">Declare as Winner / Advance</span>
                    </label>
                  </div>

                  {scoreForm.isWinner && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                      <label className="block text-sm font-bold text-brand-orange mb-2">Award Title (Optional)</label>
                      <select 
                        value={scoreForm.awardTitle} 
                        onChange={e => setScoreForm({...scoreForm, awardTitle: e.target.value})}
                        className="w-full px-4 py-3 bg-brand-orange/10 border border-brand-orange/30 rounded-xl text-foreground focus:border-brand-orange outline-none"
                      >
                        <option value="">Select an Award...</option>
                        <option value="Best in Show">Best in Show</option>
                        <option value="Best of Breed">Best of Breed</option>
                        <option value="Reserve Best in Show">Reserve Best in Show</option>
                        <option value="Champion">Champion Certificate</option>
                      </select>
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <Button variant="ghost" onClick={() => setScoringMatch(null)} className="hover:bg-accent text-foreground">Cancel</Button>
                  <Button onClick={handleScoreSubmit} disabled={submitLoading} className="bg-brand-orange hover:bg-orange-600 text-white font-bold px-6">
                    {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Score'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

    </div>
  );
}
