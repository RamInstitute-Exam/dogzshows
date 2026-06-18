'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus, RefreshCw, Trophy, Trash2, Edit, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function WinnersListing() {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/winners?page=${page}&limit=10&search=${search}`);
      const data = res;
      if (data.success) {
        setWinners(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch winners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, [page, search]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(winners.map(w => w.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete selected winner records?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.post(`/winners/bulk-delete`, JSON.stringify({ ids: selectedIds }));
      setSelectedIds([]);
      fetchWinners();
    } catch (error) {
      console.error('Failed to bulk delete');
    }
  };

  return (
    <div className="w-full space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Trophy className="w-8 h-8 text-brand-orange" /> Champions & Winners
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Manage global show winners and Champion points.</p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <Button variant="outline" onClick={fetchWinners} className="border-border text-foreground hover:bg-accent">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button className="bg-brand-orange hover:bg-orange-600 text-foreground font-bold" onClick={() => alert('Winner records are generated automatically via the Competition Engine or Scoring App.')}>
                <Plus className="w-4 h-4 mr-2" /> Manual Award
              </Button>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-brand-orange/10 border border-brand-orange/20 p-4 rounded-xl">
              <p className="text-brand-orange font-bold">{selectedIds.length} records selected</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 text-foreground border-0">Delete Selected</Button>
              </div>
            </motion.div>
          )}

          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th className="py-4 px-6 w-12">
                      <input type="checkbox" onChange={handleSelectAll} checked={winners.length > 0 && selectedIds.length === winners.length} className="rounded bg-accent border-border text-brand-orange focus:ring-brand-orange" />
                    </th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Dog Profile</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Award Title</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Event Details</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Scoring Judge</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-brand-orange  mb-4" />
                        <p className="text-muted-foreground">Loading winners...</p>
                      </td>
                    </tr>
                  ) : winners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <Trophy className="w-12 h-12 text-[#1E293B]  mb-4" />
                        <p className="text-muted-foreground font-medium">No winners found. Generate them from the judging portal.</p>
                      </td>
                    </tr>
                  ) : (
                    winners.map((w, i) => {
                      const dog = w.match?.dog;
                      const event = w.match?.round?.event;
                      const judge = w.match?.round?.judgeAssignment?.judge;

                      return (
                      <motion.tr 
                        key={w.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(w.id)}
                            onChange={() => handleSelectOne(w.id)}
                            className="rounded bg-accent border-border text-brand-orange focus:ring-brand-orange" 
                          />
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-foreground group-hover:text-brand-orange transition-colors">{dog?.name || 'Unknown Dog'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{dog?.breed?.name || 'Unknown Breed'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold uppercase tracking-wider">
                            <Award className="w-3 h-3" /> {w.awardTitle}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-bold text-foreground">{event?.name || 'Unknown Event'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{w.match?.round?.name || 'Final Round'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-foreground">{judge?.name || 'System Generated'}</p>
                          {w.score !== null && <p className="text-xs text-brand-orange font-bold mt-0.5">Score: {w.score}</p>}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1  transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    )})
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {!loading && totalPages > 0 && (
              <div className="p-4 border-t border-border flex items-center justify-between bg-card">
                <p className="text-sm text-muted-foreground">Showing Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 border-border text-foreground hover:bg-accent">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 border-border text-foreground hover:bg-accent">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      
  );
}
