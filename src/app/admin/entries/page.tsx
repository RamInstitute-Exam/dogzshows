'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, Plus, RefreshCw, CheckCircle, XCircle, 
  FileText, Award, Eye, Edit, Trash2, X, ChevronLeft, ChevronRight, 
  MapPin, User, CalendarDays, DollarSign, EyeOff, Loader2, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import api from '@/services/api';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

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
      // UPDATED TO /registrations API
      let url = `/registrations?page=${page}&limit=10&search=${search}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (showFilter) url += `&eventId=${showFilter}`;
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
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected entries?`)) return;
    try {
      const res = await api.post(`/registrations/bulk-delete`, JSON.stringify({ ids: selectedIds }));
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

  const handleSingleDelete = async (id: string, permanent = false) => {
    const msg = 'Are you sure you want to delete this entry?';
    if (!confirm(msg)) return;

    try {
      const res = await api.delete(`/registrations/${id}`);
      if (res.success) {
        toast.success('Entry deleted');
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
      const res = await api.put(`/registrations/${id}`, JSON.stringify({ status }));
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
      status: entry.status || 'PENDING'
    });
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put(`/registrations/${selectedEntry.id}`, JSON.stringify(editFormData));
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
    const headers = ['Entry ID', 'Dog Name', 'Reg Number', 'Breed', 'Gender', 'Owner Name', 'Show', 'Status', 'Created Date'];
    const rows = entries.map(e => [
      e.id,
      e.dog?.name || '',
      e.serialNumber || '',
      e.dog?.breed?.name || '',
      e.dog?.gender || '',
      e.user?.name || '',
      e.event?.name || '',
      e.status,
      new Date(e.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations_export_${Date.now()}.csv`);
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
            <FileText className="w-8 h-8 text-blue-500" /> Event Registrations
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Manage and audit dog show entries (New System).</p>
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
          
          <Button 
            onClick={() => {
              if (!showFilter) {
                toast.error('Please select a specific Dog Show from the filter dropdown first!');
                return;
              }
              const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api/v1';
              window.open(`${baseUrl}/event-catalog/${showFilter}/pdf`, '_blank');
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold border-0 shadow-md"
            title="Download official catalog for the selected event"
          >
            <BookOpen className="w-4 h-4 mr-2" /> Download Catalog
          </Button>

          <Button variant="outline" onClick={handleExportCSV} className="border-border text-foreground hover:bg-accent">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="outline" onClick={fetchEntries} className="border-border text-foreground hover:bg-accent">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-wrap gap-4 items-center">
        <div className="w-full md:w-[400px]">
          <SearchableSelect 
            options={[
              { id: '', label: 'All Shows' },
              ...events.map(ev => ({ id: ev.id, label: ev.name }))
            ]}
            value={showFilter}
            onChange={(val) => { setShowFilter(String(val)); setPage(1); }}
            placeholder="All Shows"
            searchPlaceholder="Search Shows..."
          />
        </div>

        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-background border border-border rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl gap-4">
          <p className="text-blue-400 font-bold">{selectedIds.length} entries selected</p>
          <div className="flex gap-2">
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
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Registration ID</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Dog details</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Owner</th>
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
                    <p className="text-muted-foreground">Loading registrations...</p>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <FileText className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No registrations found.</p>
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
                      {entry.serialNumber && (
                        <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{entry.serialNumber}</p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-foreground">{entry.dog?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.dog?.breed?.name} • {entry.dog?.gender?.toUpperCase() === 'MALE' ? 'DOG' : entry.dog?.gender?.toUpperCase() === 'FEMALE' ? 'BITCH' : entry.dog?.gender}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-foreground">{entry.user?.name || entry.user?.email || 'Unknown'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-foreground font-semibold">{entry.event?.name || 'Unknown Show'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.category?.name || 'Unassigned'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        entry.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
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
                        {entry.status !== 'CONFIRMED' && (
                          <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(entry.id, 'CONFIRMED')} className="h-8 w-8 text-muted-foreground hover:text-green-500 hover:bg-green-500/10" title="Confirm">
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
                        <Button variant="ghost" size="icon" onClick={() => handleSingleDelete(entry.id, false)} className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" title="Delete">
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
                <h3 className="text-xl font-extrabold text-foreground">Registration Details</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Dog Name</span>
                    <span className="text-sm font-bold text-foreground">{selectedEntry.dog?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Serial Number</span>
                    <span className="text-sm font-mono text-blue-400 font-bold">{selectedEntry.serialNumber || 'None'}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Breed & Gender</span>
                    <span className="text-sm font-bold text-foreground">{selectedEntry.dog?.breed?.name} ({selectedEntry.dog?.gender?.toUpperCase() === 'MALE' ? 'DOG' : selectedEntry.dog?.gender?.toUpperCase() === 'FEMALE' ? 'BITCH' : selectedEntry.dog?.gender})</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">DOB</span>
                    <span className="text-sm font-semibold text-foreground">{selectedEntry.dog?.dob ? new Date(selectedEntry.dog?.dob).toLocaleDateString() : '—'}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Owner Name</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5"><User className="w-4 h-4 text-blue-500" /> {selectedEntry.user?.name || selectedEntry.user?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Dog Show Event</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5"><CalendarDays className="w-4 h-4 text-foreground" /> {selectedEntry.event?.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Class Category</span>
                    <span className="text-sm font-bold text-foreground mt-0.5">{selectedEntry.category?.name || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Status</span>
                    <span className="text-sm font-bold text-foreground mt-0.5 uppercase">{selectedEntry.status}</span>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-border bg-accent/10 flex justify-between shrink-0">
                <Button variant="destructive" onClick={() => handleSingleDelete(selectedEntry.id, true)} className="font-bold">Delete</Button>
                <div className="flex gap-2">
                  <Button onClick={() => setIsViewModalOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6">Close</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
