'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Dog, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function BreedMaster() {
  const [breeds, setBreeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchBreeds();
  }, [page, search]);

  const fetchBreeds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/breeds?page=${page}&limit=10&search=${search}`);
      const data = res;
      if (data.success) {
        setBreeds(data.data || []);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch Breeds');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Are you sure you want to delete this breed?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/breeds/${id}`);
      fetchBreeds();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full   space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Dog className="w-8 h-8 text-foreground" /> Breed Master
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Manage recognized dog breeds and their properties. Total: {totalCount}</p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search breed..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-border transition-all"
                />
              </div>
              <Button onClick={fetchBreeds} disabled={loading} className="bg-foreground hover:bg-pink-700 text-white font-bold">
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Refresh
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card border-b border-border">
                  <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Breed Name</th>
                  <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">FCI Group</th>
                  <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Origin</th>
                  <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground">Loading Breeds...</td>
                  </tr>
                ) : breeds.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground">No breeds found.</td>
                  </tr>
                ) : breeds.map((b, i) => (
                  <motion.tr 
                    key={b.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                  >
                    <td className="py-4 px-6 font-bold text-foreground">{b.name}</td>
                    <td className="py-4 px-6 text-muted-foreground text-sm">
                      <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-bold">{b.fciGroup?.name || 'Unassigned'}</span>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground text-sm">{b.origin || 'Unknown'}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1  transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"><Edit className="w-4 h-4" /></Button>
                        <Button onClick={() => handleDelete(b.id)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
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
