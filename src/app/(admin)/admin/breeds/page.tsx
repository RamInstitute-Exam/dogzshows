'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Dog, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { config } from '@/lib/config';

export default function BreedMaster() {
  const [breeds, setBreeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBreeds();
  }, []);

  const fetchBreeds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('${config.apiUrl}/breeds?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBreeds(data.data || []);
    } catch (error) {
      console.error('Failed to fetch Breeds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8 bg-background">
        <div className="w-full max-w-[1200px] mx-auto space-y-6">
          
          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Dog className="w-8 h-8 text-orange-500" /> Breed Master
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Manage recognized dog breeds and their properties.</p>
            </div>
            <Button onClick={fetchBreeds} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-foreground font-bold">
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh Data
            </Button>
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
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
