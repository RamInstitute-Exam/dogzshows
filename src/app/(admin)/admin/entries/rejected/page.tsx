'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, XCircle, Eye, Trash2, X, Loader2, FileText, User, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/services/api';

export default function RejectedEntriesPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/entries?page=${page}&limit=10&status=REJECTED&search=${search}`);
      if (res.success) {
        setEntries(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch rejected entries', error);
      toast.error('Failed to load rejected entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [page, search]);

  const handleApproveAgain = async (id: string) => {
    try {
      const res = await api.put(`/entries/${id}`, JSON.stringify({ status: 'APPROVED' }));
      if (res.success) {
        toast.success('Entry approved again successfully');
        if (isViewModalOpen) setIsViewModalOpen(false);
        fetchEntries();
      }
    } catch (error) {
      toast.error('Failed to approve entry');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('WARNING: Are you sure you want to PERMANENTLY delete this rejected entry? This cannot be undone.')) return;
    try {
      const res = await api.delete(`/entries/${id}?permanent=true`);
      if (res.success) {
        toast.success('Entry permanently deleted');
        if (isViewModalOpen) setIsViewModalOpen(false);
        fetchEntries();
      } else {
        toast.error(res.message || 'Failed to delete entry');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete entry');
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500" /> Rejected Entries
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Review suspended or rejected show entries, along with their rejection reasons. Total: {totalCount}</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto items-center">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search Rejected..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <Button variant="outline" onClick={fetchEntries} className="border-border text-foreground hover:bg-accent">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table Box */}
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-card border-b border-border">
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Entry ID</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Dog details</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Rejection Reason</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Owner</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading rejected records...</p>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <FileText className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No rejected records found.</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => (
                  <motion.tr 
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <p className="font-mono text-xs text-red-500 font-bold">#{entry.id.substring(0, 8).toUpperCase()}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(entry.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-foreground">{entry.dogName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.breed} • {entry.category}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground italic max-w-xs truncate">
                      {entry.description || 'No rejection reason specified.'}
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">
                      {entry.ownerName}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button onClick={() => handleApproveAgain(entry.id)} className="bg-green-600 hover:bg-green-700 text-white font-bold h-8 px-3 text-xs rounded-xl">
                          Approve Again
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handlePermanentDelete(entry.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" title="Delete Permanently">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedEntry(entry); setIsViewModalOpen(true); }} className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent" title="View details">
                          <Eye className="w-4 h-4" />
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

      {/* VIEW MODAL */}
      <AnimatePresence>
        {isViewModalOpen && selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card max-w-2xl w-full rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col text-foreground">
              <div className="flex justify-between items-center p-6 border-b border-border shrink-0 bg-accent/10">
                <h3 className="text-xl font-extrabold text-foreground">Audit Rejected Entry</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                  <span className="block text-xs uppercase font-extrabold text-red-400 mb-1">Rejection / Suspension Reason</span>
                  <p className="text-sm text-foreground font-bold">{selectedEntry.description || 'No reason specified.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Dog Name</span>
                    <span className="text-sm font-bold text-foreground">{selectedEntry.dogName}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Registration Number</span>
                    <span className="text-sm font-mono text-blue-400 font-bold">{selectedEntry.registrationNumber || 'None'}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Breed & Gender</span>
                    <span className="text-sm font-bold text-foreground">{selectedEntry.breed} ({selectedEntry.gender})</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Owner Name</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5"><User className="w-4 h-4 text-blue-500" /> {selectedEntry.ownerName}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Dog Show Event</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5"><CalendarDays className="w-4 h-4 text-brand-orange" /> {selectedEntry.event?.name}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-accent/10 flex justify-between shrink-0">
                <Button variant="destructive" onClick={() => handlePermanentDelete(selectedEntry.id)} className="font-bold">Delete Permanently</Button>
                <div className="flex gap-2">
                  <Button onClick={() => handleApproveAgain(selectedEntry.id)} className="bg-green-600 hover:bg-green-700 text-white font-bold px-5">Approve Again</Button>
                  <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
