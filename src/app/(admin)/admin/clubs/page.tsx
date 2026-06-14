'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus, RefreshCw, Edit, Trash2, MoreVertical, Building2, Globe, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Link from 'next/link';
import { config } from '@/lib/config';

export default function ClubsDirectory() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiUrl}/clubs?page=${page}&limit=10&search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setClubs(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch clubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [page, search]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(clubs.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete selected clubs?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('${config.apiUrl}/clubs/bulk-delete', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      setSelectedIds([]);
      fetchClubs();
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
                <Building2 className="w-8 h-8 text-purple-500" /> Kennel Clubs
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Manage partner clubs, associations, and event organizers.</p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search club name..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder-[#7C8798] focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
              <Button variant="outline" onClick={fetchClubs} className="border-border text-foreground hover:bg-accent">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Link href="/admin/clubs/create">
                <Button className="bg-purple-600 hover:bg-purple-700 text-foreground font-bold">
                  <Plus className="w-4 h-4 mr-2" /> Register Club
                </Button>
              </Link>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
              <p className="text-purple-400 font-bold">{selectedIds.length} clubs selected</p>
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
                      <input type="checkbox" onChange={handleSelectAll} checked={clubs.length > 0 && selectedIds.length === clubs.length} className="rounded bg-accent border-border text-purple-500 focus:ring-purple-500" />
                    </th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Club Identity</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Leadership</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Metrics</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading clubs...</p>
                      </td>
                    </tr>
                  ) : clubs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <Building2 className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No clubs registered yet.</p>
                      </td>
                    </tr>
                  ) : (
                    clubs.map((club, i) => (
                      <motion.tr 
                        key={club.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(club.id)}
                            onChange={() => handleSelectOne(club.id)}
                            className="rounded bg-accent border-border text-purple-500 focus:ring-purple-500" 
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center font-bold text-foreground overflow-hidden">
                              {club.logoUrl ? <img src={club.logoUrl} className="w-full h-full object-cover" /> : club.name.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-foreground group-hover:text-purple-400 transition-colors">{club.name}</p>
                              {club.isActive ? (
                                <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Active</span>
                              ) : (
                                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Inactive</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-xs text-muted-foreground mb-1"><span className="text-muted-foreground">President:</span> {club.president || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground"><span className="text-muted-foreground">Secretary:</span> {club.secretary || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Mail className="w-3 h-3" /> {club.email || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Phone className="w-3 h-3" /> {club.phone || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Globe className="w-3 h-3" /> {club.website ? <a href={club.website} target="_blank" className="hover:text-purple-400">{club.website}</a> : 'N/A'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
                            {club._count?.events || 0} Events Hosted
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/clubs/edit/${club.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4" />
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
