'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, Plus, RefreshCw, CheckCircle, XCircle, 
  FileText, Award, Eye, Edit, Trash2, X, ChevronLeft, ChevronRight, 
  MapPin, User, CalendarDays, DollarSign, EyeOff, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import api from '@/services/api';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function AllEntriesPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilter, setShowFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      let url = `/entries?page=${page}&limit=10&search=${search}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (showFilter) url += `&dogShowId=${showFilter}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      
      const res = await api.get(url);
      if (res.success) {
        setEntries(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch entries', error);
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltersData = async () => {
    try {
      const [eventsRes, catsRes] = await Promise.all([
        api.get('/public/shows?limit=1000'),
        api.get('/entries/categories')
      ]);
      if (eventsRes?.success) setEvents(eventsRes.data || []);
      if (catsRes?.success) setCategories(catsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch filters metadata', error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [page, search, statusFilter, showFilter, categoryFilter]);

  useEffect(() => {
    fetchFiltersData();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(entries.map(e => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to soft delete the ${selectedIds.length} selected entries?`)) return;
    try {
      const res = await api.post(`/entries/bulk-delete`, JSON.stringify({ ids: selectedIds }));
      if (res.success) {
        toast.success('Selected entries deleted successfully');
        setSelectedIds([]);
        fetchEntries();
      } else {
        toast.error(res.message || 'Failed to delete entries');
      }
    } catch (error) {
      console.error('Failed bulk delete', error);
      toast.error('An error occurred during deletion');
    }
  };

  const handleBulkApprove = async () => {
    try {
      const res = await api.patch(`/entries/approve`, JSON.stringify({ ids: selectedIds }));
      if (res.success) {
        toast.success('Selected entries approved');
        setSelectedIds([]);
        fetchEntries();
      }
    } catch (error) {
      toast.error('Failed to approve selected entries');
    }
  };

  const handleBulkReject = async () => {
    try {
      const res = await api.patch(`/entries/reject`, JSON.stringify({ ids: selectedIds }));
      if (res.success) {
        toast.success('Selected entries rejected');
        setSelectedIds([]);
        fetchEntries();
      }
    } catch (error) {
      toast.error('Failed to reject selected entries');
    }
  };

  const handleSingleDelete = async (id: string, permanent = false) => {
    const msg = permanent 
      ? 'Are you sure you want to PERMANENTLY delete this entry? This action cannot be undone.' 
      : 'Are you sure you want to soft delete this entry?';
    if (!confirm(msg)) return;

    try {
      const res = await api.delete(`/entries/${id}${permanent ? '?permanent=true' : ''}`);
      if (res.success) {
        toast.success(permanent ? 'Entry permanently deleted' : 'Entry soft deleted');
        if (isViewModalOpen) setIsViewModalOpen(false);
        fetchEntries();
      } else {
        toast.error(res.message || 'Failed to delete entry');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await api.put(`/entries/${id}`, JSON.stringify({ status }));
      if (res.success) {
        toast.success(`Entry status updated to ${status}`);
        fetchEntries();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleOpenEditModal = (entry: any) => {
    setEditFormData({
      dogName: entry.dogName || '',
      registrationNumber: entry.registrationNumber || '',
      breed: entry.breed || '',
      gender: entry.gender || 'MALE',
      age: entry.age || '',
      color: entry.color || '',
      ownerName: entry.ownerName || '',
      handler: entry.handler || '',
      category: entry.category || 'Open Class',
      dogShowId: entry.dogShowId || '',
      judgeName: entry.judgeName || '',
      entryFee: entry.entryFee || 0,
      status: entry.status || 'PENDING',
      description: entry.description || '',
      dogPhoto: entry.dogPhoto || ''
    });
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put(`/entries/${selectedEntry.id}`, JSON.stringify(editFormData));
      if (res.success) {
        toast.success('Entry updated successfully');
        setIsEditModalOpen(false);
        fetchEntries();
      } else {
        toast.error(res.message || 'Failed to update entry');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (entries.length === 0) {
      toast.error('No entries available to export');
      return;
    }
    const headers = ['Entry ID', 'Dog Name', 'Reg Number', 'Breed', 'Gender', 'Age', 'Owner Name', 'Handler', 'Category', 'Dog Show', 'Status', 'Created Date'];
    const rows = entries.map(e => [
      e.id,
      e.dogName,
      e.registrationNumber,
      e.breed,
      e.gender,
      e.age,
      e.ownerName,
      e.handler || '',
      e.category,
      e.event?.name || '',
      e.status,
      new Date(e.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `entries_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" /> All Entries
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Manage and audit dog show entries, registration profiles, and status updates.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search Reg #, Dog, Owner..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <Button variant="outline" onClick={handleExportCSV} className="border-border text-foreground hover:bg-accent">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="outline" onClick={fetchEntries} className="border-border text-foreground hover:bg-accent">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Link href="/admin/entries/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              <Plus className="w-4 h-4 mr-2" /> Add Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-wrap gap-4 items-center">
        <select 
          value={showFilter} 
          onChange={(e) => { setShowFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-background border border-border rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
        >
          <option value="">All Shows</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>

        <select 
          value={categoryFilter} 
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-background border border-border rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
          <option value="Puppy">Puppy</option>
          <option value="Junior">Junior</option>
          <option value="Open Class">Open Class</option>
          <option value="Champion">Champion</option>
        </select>

        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-background border border-border rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl gap-4">
          <p className="text-blue-400 font-bold">{selectedIds.length} entries selected</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700 text-white font-bold border-0">Approve Selected</Button>
            <Button size="sm" onClick={handleBulkReject} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold border-0">Reject Selected</Button>
            <Button size="sm" onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold border-0">Delete Selected</Button>
          </div>
        </motion.div>
      )}

      {/* Table Box */}
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-card border-b border-border">
                <th className="py-4 px-6 w-12">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={entries.length > 0 && selectedIds.length === entries.length} 
                    className="rounded bg-accent border-border text-blue-500 focus:ring-blue-500" 
                  />
                </th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Entry ID</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Dog details</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Owner & Handler</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Show & Class</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Created Date</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading show entries...</p>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <FileText className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No show entries found.</p>
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
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(entry.id)}
                        onChange={() => handleSelectOne(entry.id)}
                        className="rounded bg-accent border-border text-blue-500 focus:ring-blue-500" 
                      />
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-mono text-xs text-blue-400 font-bold">#{entry.id.substring(0, 8).toUpperCase()}</p>
                      {entry.registrationNumber && (
                        <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{entry.registrationNumber}</p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-foreground">{entry.dogName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.breed} • {entry.gender}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-foreground">{entry.ownerName}</p>
                      {entry.handler && (
                        <p className="text-xs text-muted-foreground mt-0.5">Handler: {entry.handler}</p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-foreground font-semibold">{entry.event?.name || 'Unknown Show'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.category}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        entry.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                        entry.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {entry.status !== 'APPROVED' && (
                          <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(entry.id, 'APPROVED')} className="h-8 w-8 text-muted-foreground hover:text-green-500 hover:bg-green-500/10" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {entry.status !== 'REJECTED' && (
                          <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(entry.id, 'REJECTED')} className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedEntry(entry); setIsViewModalOpen(true); }} className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent" title="View details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(entry)} className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleSingleDelete(entry.id, false)} className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" title="Soft Delete">
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

        {/* Pagination Bar */}
        {!loading && totalPages > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-card">
            <p className="text-sm text-muted-foreground">Showing Page {page} of {totalPages} (Total: {totalCount} records)</p>
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
                <h3 className="text-xl font-extrabold text-foreground">Audit Show Entry Details</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                {selectedEntry.dogPhoto && (
                  <div className="w-full h-48 rounded-xl bg-accent overflow-hidden relative border border-border">
                    <OptimizedImage src={selectedEntry.dogPhoto} alt="Dog Photo" className="w-full h-full object-cover" />
                  </div>
                )}
                
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
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Age & Color</span>
                    <span className="text-sm font-semibold text-foreground">{selectedEntry.age || '—'} / {selectedEntry.color || '—'}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Owner Name</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5"><User className="w-4 h-4 text-blue-500" /> {selectedEntry.ownerName}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Handler Name</span>
                    <span className="text-sm font-semibold text-foreground mt-0.5">{selectedEntry.handler || 'Self / Owner'}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Dog Show Event</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5"><CalendarDays className="w-4 h-4 text-foreground" /> {selectedEntry.event?.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Event Category / Class</span>
                    <span className="text-sm font-bold text-foreground mt-0.5">{selectedEntry.category}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 grid grid-cols-3 gap-4">
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Chief Judge</span>
                    <span className="text-sm font-bold text-foreground mt-0.5">{selectedEntry.judgeName || 'TBA'}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Entry Fee</span>
                    <span className="text-sm font-black text-foreground mt-0.5">₹{selectedEntry.entryFee}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Status</span>
                    <span className="text-sm font-bold text-foreground mt-0.5 uppercase">{selectedEntry.status}</span>
                  </div>
                </div>

                {selectedEntry.description && (
                  <div className="border-t border-border pt-4">
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Description / Notes</span>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-accent/20 p-3 rounded-xl leading-relaxed">{selectedEntry.description}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border bg-accent/10 flex justify-between shrink-0">
                <Button variant="destructive" onClick={() => handleSingleDelete(selectedEntry.id, true)} className="font-bold">Permanent Delete</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleOpenEditModal(selectedEntry)} className="font-bold">Edit Info</Button>
                  <Button onClick={() => setIsViewModalOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6">Close</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card max-w-2xl w-full rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col text-foreground">
              <div className="flex justify-between items-center p-6 border-b border-border shrink-0 bg-accent/10">
                <h3 className="text-xl font-extrabold text-foreground">Edit Show Entry</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto max-h-[70vh] p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Dog Name *</label>
                    <input required type="text" value={editFormData.dogName} onChange={e => setEditFormData({...editFormData, dogName: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Registration / KCI Number</label>
                    <input type="text" value={editFormData.registrationNumber} onChange={e => setEditFormData({...editFormData, registrationNumber: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Breed *</label>
                    <input required type="text" value={editFormData.breed} onChange={e => setEditFormData({...editFormData, breed: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Gender</label>
                    <select value={editFormData.gender} onChange={e => setEditFormData({...editFormData, gender: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none">
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Age (Months / Years)</label>
                    <input type="text" value={editFormData.age} onChange={e => setEditFormData({...editFormData, age: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" placeholder="e.g. 18 Months" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Color</label>
                    <input type="text" value={editFormData.color} onChange={e => setEditFormData({...editFormData, color: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Owner Name *</label>
                    <input required type="text" value={editFormData.ownerName} onChange={e => setEditFormData({...editFormData, ownerName: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Handler</label>
                    <input type="text" value={editFormData.handler} onChange={e => setEditFormData({...editFormData, handler: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" placeholder="Leave empty for Self" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Category / Class *</label>
                    <select value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none">
                      <option value="Puppy">Puppy</option>
                      <option value="Junior">Junior</option>
                      <option value="Open Class">Open Class</option>
                      <option value="Champion">Champion</option>
                      <option value="Veteran">Veteran</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Dog Show *</label>
                    <select required value={editFormData.dogShowId} onChange={e => setEditFormData({...editFormData, dogShowId: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none">
                      <option value="">Select Show...</option>
                      {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Chief Judge</label>
                    <input type="text" value={editFormData.judgeName} onChange={e => setEditFormData({...editFormData, judgeName: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Entry Fee (INR)</label>
                    <input type="number" value={editFormData.entryFee} onChange={e => setEditFormData({...editFormData, entryFee: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Status</label>
                  <select value={editFormData.status} onChange={e => setEditFormData({...editFormData, status: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none">
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Dog Photo URL</label>
                  <input type="text" value={editFormData.dogPhoto} onChange={e => setEditFormData({...editFormData, dogPhoto: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" placeholder="https://..." />
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Description / Notes</label>
                  <textarea value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border bg-accent/5">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
