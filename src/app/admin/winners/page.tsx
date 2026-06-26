'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, Search, Filter, Plus, RefreshCw, Loader2, Edit, Trash2, 
  CheckSquare, Square, ChevronDown, ChevronUp, Image as ImageIcon 
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import api from '@/lib/api';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function WinnerManagement() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [clubFilter, setClubFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [awardFilter, setAwardFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionConfirm, setBulkActionConfirm] = useState<{ action: string; label: string } | null>(null);

  const fetchFilters = async () => {
    try {
      const [cRes, eRes] = await Promise.all([
        api.get('/public/clubs?limit=100'),
        api.get('/public/events?limit=100')
      ]);
      if (cRes?.success) setClubs(cRes.data || cRes.items || []);
      if (eRes?.success) setEvents(eRes.data || eRes.events || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        clubId: clubFilter,
        eventId: eventFilter,
        awardCategory: awardFilter,
        year: yearFilter,
        status: statusFilter
      });
      const res = await api.get(`/winners?${queryParams.toString()}`);
      if (res?.success) {
        setData(res.data || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (error) {
      toast.error('Failed to load winners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchWinners();
    setSelectedIds([]);
  }, [page, limit, search, clubFilter, eventFilter, awardFilter, yearFilter, statusFilter]);

  const handleSelectAll = () => {
    if (selectedIds.length === data.length && data.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(d => d.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this winner?')) return;
    try {
      const res = await api.delete(`/winners/${id}`);
      if (res?.success) {
        toast.success('Winner deleted successfully');
        fetchWinners();
      } else {
        toast.error(res?.message || 'Delete failed');
      }
    } catch (err) {
      toast.error('Error deleting winner');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkActionConfirm) return;
    const action = bulkActionConfirm.action;
    const loadingToast = toast.loading(`Executing bulk ${action}...`);
    try {
      let res;
      if (action === 'delete') {
        res = await api.post('/winners/bulk-delete', { ids: selectedIds });
      } else {
        res = await api.post('/winners/bulk-status', { ids: selectedIds, status: action.toUpperCase() });
      }

      if (res?.success) {
        toast.success('Bulk action completed', { id: loadingToast });
        fetchWinners();
        setBulkActionConfirm(null);
        setSelectedIds([]);
      } else {
        toast.error(res?.message || 'Bulk action failed', { id: loadingToast });
      }
    } catch (e) {
      toast.error('Operation failed', { id: loadingToast });
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-card p-5 rounded-2xl border border-border shadow-md flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-500" /> Winner Management
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Manage dog show champions, special awards, and hall of fame entries.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[320px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search dogs, owners, handlers..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 h-11 bg-background border border-border rounded-xl text-sm outline-none"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 h-11 px-4 text-sm font-bold bg-card border rounded-xl hover:bg-accent transition">
            <Filter className="w-4 h-4" /> Filters {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={() => fetchWinners()} className="h-11 w-11 flex items-center justify-center border rounded-xl hover:bg-accent transition">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/admin/winners/create">
            <button className="h-11 px-5 flex items-center justify-center gap-2 text-sm font-bold bg-[#111827] text-white hover:bg-black dark:bg-white dark:text-[#111827] dark:hover:bg-[#F3F4F6] rounded-xl transition-all shadow-md active:scale-95">
              <Plus className="w-4.5 h-4.5" /> Add Winner
            </button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card border border-border p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <select value={clubFilter} onChange={e => setClubFilter(e.target.value)} className="h-10 px-3 bg-background border border-border rounded-xl text-sm">
            <option value="">All Clubs</option>
            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={eventFilter} onChange={e => setEventFilter(e.target.value)} className="h-10 px-3 bg-background border border-border rounded-xl text-sm">
            <option value="">All Events</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select value={awardFilter} onChange={e => setAwardFilter(e.target.value)} className="h-10 px-3 bg-background border border-border rounded-xl text-sm">
            <option value="">All Awards</option>
            <option value="Best In Show (BIS)">Best In Show (BIS)</option>
            <option value="Best In Show Bred In India">Best In Show Bred In India</option>
            <option value="Best Puppy In Show">Best Puppy In Show</option>
          </select>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="h-10 px-3 bg-background border border-border rounded-xl text-sm">
            <option value="">All Years</option>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 bg-background border border-border rounded-xl text-sm">
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
          <span className="px-2.5 py-1 text-xs font-black bg-foreground text-slate-950 rounded-full">{selectedIds.length} Selected</span>
          <div className="flex gap-2">
            <button onClick={() => { setBulkActionConfirm({ action: 'published', label: 'Publish' }); handleBulkAction(); }} className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg">Publish</button>
            <button onClick={() => { setBulkActionConfirm({ action: 'draft', label: 'Draft' }); handleBulkAction(); }} className="px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-lg">Draft</button>
            <button onClick={() => { setBulkActionConfirm({ action: 'delete', label: 'Delete' }); handleBulkAction(); }} className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg">Delete</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm table-fixed min-w-[1200px]">
          <thead className="bg-muted/40 border-b border-border sticky top-0">
            <tr>
              <th className="py-4 px-4 w-12 text-center">
                <button onClick={handleSelectAll} className="text-muted-foreground hover:text-foreground">
                  {selectedIds.length === data.length && data.length > 0 ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </button>
              </th>
              <th className="py-4 px-6 w-20">Poster</th>
              <th className="py-4 px-6 font-bold text-muted-foreground uppercase">Poster Title</th>
              <th className="py-4 px-6 font-bold text-muted-foreground uppercase">Event Show Listing</th>
              <th className="py-4 px-6 text-right font-bold text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="py-24 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="py-24 text-center text-muted-foreground">No winners found.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-accent/40 transition">
                  <td className="py-4 px-4 text-center">
                    <button onClick={() => handleSelectRow(item.id)}>
                      {selectedIds.includes(item.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    {item.imageUrl ? (
                      <OptimizedImage src={item.imageUrl} alt={item.dogName} className="w-12 h-12 object-cover rounded-lg shadow" />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground" /></div>
                    )}
                  </td>
                  <td className="py-4 px-6 truncate">
                    <div className="font-bold text-foreground truncate">{item.dogName}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.showYear}</div>
                  </td>
                  <td className="py-4 px-6 truncate">
                    <div className="font-bold text-foreground truncate">{item.awardCategory || item.awardTitle}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.event?.name}</div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/winners/edit?id=${item.id}`} className="p-2 text-slate-500 hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            Showing Page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-bold border rounded-xl hover:bg-accent disabled:opacity-50 transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-bold border rounded-xl hover:bg-accent disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
