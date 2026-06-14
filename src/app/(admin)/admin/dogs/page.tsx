'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus, RefreshCw, Edit, Trash2, MoreVertical, ShieldCheck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Link from 'next/link';
import { config } from '@/lib/config';

export default function DogsDirectory() {
  const [dogs, setDogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchDogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiUrl}/dogs?page=${page}&limit=10&search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDogs(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch dogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDogs();
  }, [page, search]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(dogs.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete selected dogs?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('${config.apiUrl}/dogs/bulk-delete', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      setSelectedIds([]);
      fetchDogs();
    } catch (error) {
      console.error('Failed to bulk delete');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8 bg-background">
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-brand-orange" /> Dogs Registry
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Total {totalCount} dogs registered on the platform.</p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search name, KCI, MIC..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder-[#7C8798] focus:outline-none focus:border-brand-orange transition-all"
                />
              </div>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                <Filter className="w-4 h-4 mr-2" /> Filters
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button variant="outline" onClick={fetchDogs} className="border-border text-foreground hover:bg-accent">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Link href="/admin/dogs/create">
                <Button className="bg-brand-orange hover:bg-orange-600 text-foreground font-bold">
                  <Plus className="w-4 h-4 mr-2" /> Add Dog
                </Button>
              </Link>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-brand-orange/10 border border-brand-orange/20 p-4 rounded-xl">
              <p className="text-brand-orange font-bold">{selectedIds.length} dogs selected</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-brand-orange/30 text-brand-orange hover:bg-brand-orange/20">Export Selected</Button>
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
                      <input type="checkbox" onChange={handleSelectAll} checked={dogs.length > 0 && selectedIds.length === dogs.length} className="rounded bg-accent border-border text-brand-orange focus:ring-brand-orange" />
                    </th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Dog Details</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Identifiers</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Owner</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Metrics</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-brand-orange mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading dogs...</p>
                      </td>
                    </tr>
                  ) : dogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <ShieldCheck className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No dogs found.</p>
                      </td>
                    </tr>
                  ) : (
                    dogs.map((dog, i) => (
                      <motion.tr 
                        key={dog.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(dog.id)}
                            onChange={() => handleSelectOne(dog.id)}
                            className="rounded bg-accent border-border text-brand-orange focus:ring-brand-orange" 
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-accent overflow-hidden">
                              {dog.photos?.length > 0 ? (
                                <img src={dog.photos[0].url} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">NO IMG</div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-foreground group-hover:text-brand-orange transition-colors flex items-center gap-2">
                                {dog.name} {dog.isChampion && <ShieldCheck className="w-3 h-3 text-yellow-500" />}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{dog.breed?.name || 'Unknown Breed'}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">{dog.gender} • {dog.color}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-xs font-mono text-muted-foreground mb-1"><span className="text-muted-foreground">KCI:</span> {dog.kciNumber || 'N/A'}</p>
                          <p className="text-xs font-mono text-muted-foreground"><span className="text-muted-foreground">MIC:</span> {dog.microchipNumber || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-6">
                          {dog.owner ? (
                            <>
                              <p className="text-sm font-bold text-foreground">{dog.owner.name}</p>
                              <p className="text-xs text-muted-foreground">{dog.owner.phone || dog.owner.email}</p>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
                              {dog._count?.eventRegistrations || 0} Events
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 w-fit">
                              {dog._count?.winnerTags || 0} Awards
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {dog.kciCertificate ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/dogs/edit/${dog.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
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
      </main>
    </div>
  );
}
