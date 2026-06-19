'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus, RefreshCw, CheckCircle, XCircle, MoreVertical, Ticket, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function RegistrationsListing() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/registrations?page=${page}&limit=10&search=${search}`);
      const data = res;
      if (data.success) {
        setRegistrations(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [page, search]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(registrations.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete selected registrations?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.post(`/registrations/bulk-delete`, JSON.stringify({ ids: selectedIds }));
      setSelectedIds([]);
      fetchRegistrations();
    } catch (error) {
      console.error('Failed to bulk delete');
    }
  };

  const handleUpdateStatus = async (id: string, status: string, paymentStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/registrations/${id}`, JSON.stringify({ status, paymentStatus }));
      fetchRegistrations();
    } catch (error) {
      console.error('Failed to update status');
    }
  };

  return (
    <div className="w-full space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Ticket className="w-8 h-8 text-blue-500" /> Event Registrations
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Manage ticket sales, entries, and QR passes.</p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search Ticket ID..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder-[#7C8798] focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <Button variant="outline" onClick={fetchRegistrations} className="border-border text-foreground hover:bg-accent">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Link href="/admin/events/registrations/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  <Plus className="w-4 h-4 mr-2" /> Manual Entry
                </Button>
              </Link>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
              <p className="text-blue-400 font-bold">{selectedIds.length} tickets selected</p>
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
                      <input type="checkbox" onChange={handleSelectAll} checked={registrations.length > 0 && selectedIds.length === registrations.length} className="rounded bg-accent border-border text-blue-500 focus:ring-blue-500" />
                    </th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Ticket Info</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Dog & Class</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Owner</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Payments</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-500  mb-4" />
                        <p className="text-muted-foreground">Loading entries...</p>
                      </td>
                    </tr>
                  ) : registrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Ticket className="w-12 h-12 text-[#1E293B]  mb-4" />
                        <p className="text-muted-foreground font-medium">No registrations found.</p>
                      </td>
                    </tr>
                  ) : (
                    registrations.map((r, i) => (
                      <motion.tr 
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(r.id)}
                            onChange={() => handleSelectOne(r.id)}
                            className="rounded bg-accent border-border text-blue-500 focus:ring-blue-500" 
                          />
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-mono text-xs text-blue-400 font-bold mb-1">#{r.id.substring(0, 8).toUpperCase()}</p>
                          <p className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors">{r.event?.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-bold text-foreground">{r.dog?.name || 'Unknown Dog'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{r.ageClass?.name || 'Open Class'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-foreground">{r.user?.firstName} {r.user?.lastName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{r.user?.email}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-bold text-foreground">₹{r.feeAmount || 0}</p>
                          {r.paymentStatus === 'COMPLETED' ? (
                            <span className="text-[10px] text-green-500 uppercase tracking-wider font-bold">Paid</span>
                          ) : (
                            <span className="text-[10px] text-red-500 uppercase tracking-wider font-bold">Pending</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent border border-border text-[10px] font-bold uppercase tracking-wider ${r.status === 'APPROVED' ? 'text-green-500' : r.status === 'REJECTED' ? 'text-red-500' : 'text-yellow-500'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1  transition-opacity">
                            {r.status !== 'APPROVED' && (
                              <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(r.id, 'APPROVED', 'COMPLETED')} className="h-8 w-8 text-muted-foreground hover:text-green-500 hover:bg-green-500/10">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {r.status !== 'REJECTED' && (
                              <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(r.id, 'REJECTED', 'FAILED')} className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                              <FileText className="w-4 h-4" />
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
      
  );
}
