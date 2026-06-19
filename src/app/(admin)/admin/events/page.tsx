'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Search, Filter, Download, Plus, RefreshCw, Loader2, Edit, Trash2, 
  Eye, Copy, MapPin, Trophy, Image as ImageIcon, Check, X, MoreVertical, 
  AlertTriangle, ChevronDown, ChevronUp, Users, Info, FileSpreadsheet, 
  FileText, FileJson, CheckSquare, Square
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';

interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  draftEvents: number;
  registrationOpen: number;
  totalEntries: number;
}

export default function BespokeEventManagement() {
  const router = useRouter();
  
  // Table state
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    draftEvents: 0,
    registrationOpen: 0,
    totalEntries: 0
  });

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('');
  const [judgeFilter, setJudgeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Master records for filter dropdowns
  const [clubs, setClubs] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  // Detail Modal & Action overlays
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<any>(null);
  const [duplicateConfirmEvent, setDuplicateConfirmEvent] = useState<any>(null);
  const [bulkActionConfirm, setBulkActionConfirm] = useState<{ action: string; label: string } | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Fetch lists for filters
  const fetchFilterMasters = async () => {
    try {
      const [clubsRes, judgesRes] = await Promise.all([
        api.get('/public/clubs?limit=1000'),
        api.get('/public/judges?limit=1000')
      ]);
      if (clubsRes?.success) setClubs(clubsRes.data || clubsRes.items || []);
      if (judgesRes?.success) setJudges(judgesRes.data || judgesRes.items || []);
    } catch (err) {
      console.error('Failed to fetch filter dependencies:', err);
    }
  };

  // Main fetch call
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        year: yearFilter,
        month: monthFilter,
        state: stateFilter,
        city: cityFilter,
        clubId: clubFilter,
        judgeId: judgeFilter,
        type: typeFilter,
        status: statusFilter,
        sortBy,
        sortOrder
      });

      const res = await api.get(`/shows?${queryParams.toString()}`);
      if (res?.success) {
        setData(res.data || res.events || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load shows from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterMasters();
  }, []);

  useEffect(() => {
    fetchEvents();
    // Clear selections on query changes to avoid references to missing records
    setSelectedIds([]);
  }, [page, limit, search, yearFilter, monthFilter, stateFilter, cityFilter, clubFilter, judgeFilter, typeFilter, statusFilter, sortBy, sortOrder]);

  const handleRefresh = () => {
    fetchEvents();
    toast.success('Database synchronization complete');
  };

  // Toggle selection
  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(item => item.id));
    }
  };

  // Action methods
  const handleDelete = async (id: string) => {
    try {
      const res = await api.delete(`/shows/${id}`);
      if (res?.success) {
        toast.success('Show deleted successfully');
        fetchEvents();
      } else {
        toast.error(res?.message || 'Delete operation failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting event');
    } finally {
      setDeleteConfirmEvent(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    const loadingToast = toast.loading('Duplicating and shifting show calendar (+1 Year)...');
    try {
      const res = await api.post(`/shows/${id}/duplicate`);
      if (res?.success) {
        toast.success('Event cloned successfully with next-year shifted schedule', { id: loadingToast });
        fetchEvents();
      } else {
        toast.error(res?.message || 'Failed to clone show', { id: loadingToast });
      }
    } catch (err: any) {
      toast.error(err.message || 'Cloning transaction rolled back', { id: loadingToast });
    } finally {
      setDuplicateConfirmEvent(null);
    }
  };

  // Bulk executions
  const handleBulkAction = async () => {
    if (!bulkActionConfirm) return;
    const action = bulkActionConfirm.action;
    const loadingToast = toast.loading(`Executing bulk ${action} action...`);
    
    try {
      let res;
      if (action === 'delete') {
        res = await api.post('/shows/bulk-delete', { ids: selectedIds });
      } else {
        res = await api.post('/shows/bulk-status', { ids: selectedIds, status: action.toUpperCase() });
      }

      if (res?.success) {
        toast.success(`Bulk operation completed successfully`, { id: loadingToast });
        setSelectedIds([]);
        fetchEvents();
      } else {
        toast.error(res?.message || 'Bulk action failed', { id: loadingToast });
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation error', { id: loadingToast });
    } finally {
      setBulkActionConfirm(null);
    }
  };

  // Dynamic exports via universal exporter
  const triggerExport = (format: string) => {
    const filename = `exported_dog_shows_${Date.now()}.${format}`;
    const url = `/bulk-upload/export/events?format=${format}`;
    
    toast.loading(`Preparing ${format.toUpperCase()} export payload...`, { id: 'export' });
    api.get(url, { responseType: 'blob' })
      .then((res: any) => {
        const blob = new Blob([res]);
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Data exported successfully', { id: 'export' });
      })
      .catch((err: any) => {
        console.error(err);
        toast.error('Failed to export dataset', { id: 'export' });
      });
  };

  // Color mappings
  const getStatusBadge = (status: string) => {
    const norm = String(status || '').toUpperCase().trim();
    switch (norm) {
      case 'REGISTRATION_OPEN':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">🟢 Registration Open</span>;
      case 'DRAFT':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">🟡 Draft</span>;
      case 'ONGOING':
      case 'UPCOMING':
      case 'PUBLISHED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">🔵 Upcoming</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">🔴 Completed</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">⚫ Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-accent text-foreground border border-border">{status}</span>;
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">

      {/* 1. TOP QUICK STATISTICS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Events', value: stats.totalEvents, gradient: 'from-blue-600/10 to-blue-500/5', text: 'text-blue-500' },
          { label: 'Upcoming Shows', value: stats.upcomingEvents, gradient: 'from-indigo-600/10 to-indigo-500/5', text: 'text-indigo-500' },
          { label: 'Completed Shows', value: stats.completedEvents, gradient: 'from-rose-600/10 to-rose-500/5', text: 'text-rose-500' },
          { label: 'Draft Shows', value: stats.draftEvents, gradient: 'from-amber-600/10 to-amber-500/5', text: 'text-amber-500' },
          { label: 'Registration Open', value: stats.registrationOpen, gradient: 'from-emerald-600/10 to-emerald-500/5', text: 'text-emerald-500' },
          { label: 'Total Entries', value: stats.totalEntries, gradient: 'from-yellow-600/10 to-yellow-500/5', text: 'text-[#FFB800]' },
        ].map((s, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${s.gradient} border border-border/60 p-5 rounded-2xl flex flex-col justify-center shadow-sm hover:shadow-md transition-all`}>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</span>
            <span className={`text-3xl font-black mt-2 ${s.text}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* 2. HEADER BLOCK */}
      <div className="bg-card p-5 rounded-2xl border border-border shadow-md flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-foreground" /> Event Management
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Configure dog shows, manage assignments, view registration matrices, and update statuses.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          {/* Realtime Search Bar */}
          <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[320px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search shows, clubs, cities, judges..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1
              }}
              className="w-full pl-10 pr-4 h-11 bg-background border border-border focus:border-border rounded-xl text-sm outline-none transition-all placeholder-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 h-11 px-4 text-sm font-bold rounded-xl border transition-all ${
              showFilters 
                ? 'admin-btn-primary border-transparent shadow-md' 
                : 'bg-card border-border text-foreground hover:bg-accent'
            }`}
          >
            <Filter className="w-4 h-4" /> 
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button 
            onClick={handleRefresh} 
            className="flex items-center justify-center h-11 w-11 rounded-xl border border-border bg-card text-foreground hover:bg-accent transition-all"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link href="/admin/events/create" className="flex-grow sm:flex-grow-0">
            <button className="w-full h-11 px-5 flex items-center justify-center gap-2 text-sm font-bold bg-[#111827] text-white hover:bg-black dark:bg-white dark:text-[#111827] dark:hover:bg-[#F3F4F6] rounded-xl transition-all shadow-md active:scale-95">
              <Plus className="w-4.5 h-4.5" />
              Create Event
            </button>
          </Link>
        </div>
      </div>

      {/* 3. COLLAPSIBLE FILTERS PANEL */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 shadow-inner">
              {/* Year */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Year</label>
                <select 
                  value={yearFilter}
                  onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
                  className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-border"
                >
                  <option value="">All Years</option>
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Month</label>
                <select 
                  value={monthFilter}
                  onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
                  className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-border"
                >
                  <option value="">All Months</option>
                  {[
                    { val: 1, label: 'January' }, { val: 2, label: 'February' }, { val: 3, label: 'March' },
                    { val: 4, label: 'April' }, { val: 5, label: 'May' }, { val: 6, label: 'June' },
                    { val: 7, label: 'July' }, { val: 8, label: 'August' }, { val: 9, label: 'September' },
                    { val: 10, label: 'October' }, { val: 11, label: 'November' }, { val: 12, label: 'December' }
                  ].map(m => (
                    <option key={m.val} value={m.val}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">State</label>
                <input 
                  type="text" 
                  placeholder="e.g. Tamil Nadu" 
                  value={stateFilter}
                  onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
                  className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-border"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">City</label>
                <input 
                  type="text" 
                  placeholder="e.g. Coimbatore" 
                  value={cityFilter}
                  onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                  className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-border"
                />
              </div>

              {/* Host Club */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Host Kennel Club</label>
                <select 
                  value={clubFilter}
                  onChange={(e) => { setClubFilter(e.target.value); setPage(1); }}
                  className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-border"
                >
                  <option value="">All Clubs</option>
                  {clubs.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Judge */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Assigned Judge</label>
                <select 
                  value={judgeFilter}
                  onChange={(e) => { setJudgeFilter(e.target.value); setPage(1); }}
                  className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-border"
                >
                  <option value="">All Judges</option>
                  {judges.map(j => (
                    <option key={j.id} value={j.id}>{j.name}</option>
                  ))}
                </select>
              </div>

              {/* Event Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Show Category / Type</label>
                <select 
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-border"
                >
                  <option value="">All Types</option>
                  <option value="Championship Show">Championship Show</option>
                  <option value="Open Show">Open Show</option>
                  <option value="FCI">FCI Show</option>
                  <option value="CACIB">CACIB Show</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Workflow Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-border"
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="REGISTRATION_OPEN">Registration Open</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Reset Filters */}
              <div className="col-span-1 sm:col-span-2 md:col-span-4 flex justify-end gap-2 pt-2 border-t border-border mt-2">
                <button 
                  onClick={() => {
                    setYearFilter('');
                    setMonthFilter('');
                    setStateFilter('');
                    setCityFilter('');
                    setClubFilter('');
                    setJudgeFilter('');
                    setTypeFilter('');
                    setStatusFilter('');
                    setSearch('');
                    setPage(1);
                    toast.info('Advanced filters cleared');
                  }}
                  className="px-4 py-2 text-xs font-bold bg-accent text-foreground hover:bg-accent/80 rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. BULK ACTIONS CONTEXT BAR */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl text-slate-200"
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-black bg-foreground text-slate-950 rounded-full">
                {selectedIds.length} Selected
              </span>
              <p className="text-sm font-semibold text-slate-300">Perform transactional updates across selection.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setBulkActionConfirm({ action: 'publish', label: 'Publish Selected Shows' })}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Publish
              </button>
              <button 
                onClick={() => setBulkActionConfirm({ action: 'draft', label: 'Move Selected to Draft' })}
                className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              >
                Draft
              </button>
              <button 
                onClick={() => setBulkActionConfirm({ action: 'cancelled', label: 'Cancel Selected Shows' })}
                className="px-3 py-1.5 text-xs font-bold bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
              >
                Archive
              </button>
              <button 
                onClick={() => setBulkActionConfirm({ action: 'delete', label: 'Delete Selected Shows Permanently (Soft Delete)' })}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
              >
                Bulk Delete
              </button>
              
              <div className="h-6 w-px bg-slate-800 mx-1"></div>

              {/* Exports */}
              <button 
                onClick={() => triggerExport('xlsx')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Excel
              </button>
              <button 
                onClick={() => triggerExport('csv')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" /> CSV
              </button>
              <button 
                onClick={() => triggerExport('json')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <FileJson className="w-3.5 h-3.5 text-amber-500" /> JSON
              </button>

              <button 
                onClick={() => setSelectedIds([])}
                className="ml-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel Selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. MAIN EVENT TABLE GRID */}
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse text-sm table-fixed min-w-[1200px]">
            <thead>
              <tr className="bg-muted/40 border-b border-border sticky top-0 z-10">
                <th className="py-4 px-4 w-12 text-center">
                  <button 
                    onClick={handleSelectAll}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {selectedIds.length === data.length && data.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-foreground" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-6 w-80 font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortBy('name'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  Event Title & Type {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-4 px-6 w-64 font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortBy('clubName'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  Host Kennel Club {sortBy === 'clubName' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-4 px-6 w-40 font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortBy('startDate'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  Dates {sortBy === 'startDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-4 px-6 w-52 font-bold text-muted-foreground uppercase">Venue & Location</th>
                <th className="py-4 px-6 w-44 font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortBy('status'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  Status {sortBy === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-4 px-6 w-36 font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortBy('capacity'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  Capacity {sortBy === 'capacity' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-4 px-6 w-60 text-right font-bold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-24 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-semibold">Parsing database entries...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-24 text-center">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
                    <h3 className="text-lg font-bold text-foreground mb-1">No Shows Found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">No records exist for the selected filters or search queries. Create an event or upload a template file to start.</p>
                  </td>
                </tr>
              ) : (
                data.map((item, i) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isDropdownActive = activeDropdownId === item.id;
                  
                  return (
                    <tr 
                      key={item.id}
                      className={`hover:bg-accent/40 transition-colors ${isSelected ? 'bg-foreground/5' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={() => handleSelectRow(item.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-foreground" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>

                      {/* Event Title */}
                      <td className="py-4 px-6 truncate font-bold text-foreground">
                        <span className="block truncate hover:text-foreground cursor-pointer" onClick={() => setActiveEvent(item)}>{item.name}</span>
                        <span className="block text-xs font-semibold text-muted-foreground mt-0.5">{item.type}</span>
                      </td>

                      {/* Host Club */}
                      <td className="py-4 px-6 truncate text-muted-foreground font-medium">
                        {item.club?.name || 'Unknown Club'}
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-6 text-xs font-medium text-muted-foreground">
                        <span>{new Date(item.startDate).toLocaleDateString()}</span>
                        <span className="block text-slate-400">to {new Date(item.endDate).toLocaleDateString()}</span>
                      </td>

                      {/* Venue */}
                      <td className="py-4 px-6 truncate text-muted-foreground text-xs">
                        <span className="block truncate" title={item.venue}>{item.venue}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{item.city}, {item.state}</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Capacity */}
                      <td className="py-4 px-6 text-xs font-bold text-muted-foreground">
                        {item.registrationsCount || 0} / {item.capacity || 'Unlimited'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right relative whitespace-nowrap">
                        {/* Desktop actions (shown on larger screens) */}
                        <div className="hidden xl:flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setActiveEvent(item)}
                            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="View Event Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link href={`/admin/events/edit?id=${item.id}`}>
                            <button 
                              className="p-2 text-slate-500 hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                              title="Edit Event"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => setDuplicateConfirmEvent(item)}
                            className="p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Clone Event (+1 Year)"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <Link href="/admin/events/calendar">
                            <button 
                              className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                              title="Calendar View"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link href="/admin/judges">
                            <button 
                              className="p-2 text-violet-500 hover:bg-violet-500/10 rounded-lg transition-colors"
                              title="Judges Database"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link href="/admin/competition/results">
                            <button 
                              className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Competition Results"
                            >
                              <Trophy className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link href={`/admin/entries?eventId=${item.id}`}>
                            <button 
                              className="p-2 text-sky-500 hover:bg-sky-500/10 rounded-lg transition-colors"
                              title="View Registrations / Entries"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => setDeleteConfirmEvent(item)}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Soft Delete Show"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Collapsed actions dropdown (tablet/mobile) */}
                        <div className="xl:hidden flex justify-end">
                          <button 
                            onClick={() => setActiveDropdownId(isDropdownActive ? null : item.id)}
                            className="p-2 hover:bg-accent rounded-lg text-muted-foreground"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {isDropdownActive && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setActiveDropdownId(null)}></div>
                              <div className="absolute right-6 top-12 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl shadow-2xl py-2 w-48 text-left z-30 flex flex-col">
                                <button 
                                  onClick={() => { setActiveEvent(item); setActiveDropdownId(null); }}
                                  className="px-4 py-2 text-xs font-semibold hover:bg-slate-800 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4 text-blue-400" /> View Details
                                </button>
                                <Link href={`/admin/events/edit?id=${item.id}`} className="px-4 py-2 text-xs font-semibold hover:bg-slate-800 flex items-center gap-2">
                                  <Edit className="w-4 h-4 text-slate-400" /> Edit Event
                                </Link>
                                <button 
                                  onClick={() => { setDuplicateConfirmEvent(item); setActiveDropdownId(null); }}
                                  className="px-4 py-2 text-xs font-semibold hover:bg-slate-800 flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4 text-indigo-400" /> Clone Event
                                </button>
                                <Link href="/admin/events/calendar" className="px-4 py-2 text-xs font-semibold hover:bg-slate-800 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-amber-400" /> Calendar View
                                </Link>
                                <Link href="/admin/judges" className="px-4 py-2 text-xs font-semibold hover:bg-slate-800 flex items-center gap-2">
                                  <Users className="w-4 h-4 text-violet-400" /> Judges
                                </Link>
                                <Link href="/admin/competition/results" className="px-4 py-2 text-xs font-semibold hover:bg-slate-800 flex items-center gap-2">
                                  <Trophy className="w-4 h-4 text-emerald-400" /> Results
                                </Link>
                                <Link href={`/admin/entries?eventId=${item.id}`} className="px-4 py-2 text-xs font-semibold hover:bg-slate-800 flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4 text-sky-400" /> Entries
                                </Link>
                                <button 
                                  onClick={() => { setDeleteConfirmEvent(item); setActiveDropdownId(null); }}
                                  className="px-4 py-2 text-xs font-semibold hover:bg-slate-800 text-rose-400 flex items-center gap-2 border-t border-slate-800 mt-1"
                                >
                                  <Trash2 className="w-4 h-4" /> Delete Event
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION MATRIX */}
        {!loading && data.length > 0 && (
          <div className="p-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 bg-card">
            <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-9 rounded-lg border border-border bg-background px-2 py-1 outline-none"
                >
                  {[10, 25, 50, 100].map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>
              <p>
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalCount)} of {totalCount} Events
              </p>
            </div>
            
            <div className="flex gap-1.5 items-center">
              <button 
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="h-9 border border-border text-foreground hover:bg-accent px-3 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => {
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="text-muted-foreground px-1">...</span>}
                        <button
                          onClick={() => setPage(p)}
                          className={`h-9 w-9 text-xs font-black rounded-lg transition-all ${
                            p === page 
                              ? 'admin-btn-primary shadow-md' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button 
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="h-9 border border-border text-foreground hover:bg-accent px-3 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. MODAL/DRAWER: EVENT DETAILS DRAWER */}
      <AnimatePresence>
        {activeEvent && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveEvent(null)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[600px] bg-card border-l border-border z-50 flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Header Banner */}
              <div className="relative h-64 bg-slate-950 flex-shrink-0">
                <img 
                  src={activeEvent.bannerUrl || '/images/hero_banner.png'} 
                  alt={activeEvent.name}
                  className="w-full h-full object-cover opacity-60"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/hero_banner.png'; }}
                />
                <button 
                  onClick={() => setActiveEvent(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-5 left-6 right-6">
                  <span className="mb-2 block">{getStatusBadge(activeEvent.status)}</span>
                  <h2 className="text-2xl font-black text-white leading-tight drop-shadow-md">{activeEvent.name}</h2>
                  <p className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wide flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-foreground" /> {activeEvent.type} Show
                  </p>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-6 flex-grow overflow-y-auto">
                {/* Dates & Location Card */}
                <div className="grid grid-cols-2 gap-4 bg-accent/30 p-4 border border-border rounded-2xl">
                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-muted-foreground">Show Date</span>
                      <span className="text-xs font-bold text-foreground">
                        {new Date(activeEvent.startDate).toLocaleDateString()} to <br/>
                        {new Date(activeEvent.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-muted-foreground">Venue</span>
                      <span className="text-xs font-bold text-foreground leading-tight">{activeEvent.venue}</span>
                      <span className="block text-[11px] text-muted-foreground mt-0.5">{activeEvent.city}, {activeEvent.state}</span>
                    </div>
                  </div>
                </div>

                {/* Main Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Host Kennel Club</h4>
                    <p className="text-sm font-bold text-foreground">{activeEvent.club?.name || 'Unknown Kennel Club'}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 font-mono">Entry Fee</h4>
                    <p className="text-lg font-black text-foreground">₹{activeEvent.entryFee || 'Free'}</p>
                  </div>

                  {activeEvent.description && (
                    <div>
                      <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Show Description</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed bg-accent/20 p-3.5 rounded-xl border border-border/40">
                        {activeEvent.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Judges Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider border-b border-border pb-1">Assigned FCI Judges ({activeEvent.judges?.length || 0})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeEvent.judges && activeEvent.judges.length > 0 ? (
                      activeEvent.judges.map((j: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 border border-border bg-card rounded-xl">
                          <img 
                            src={j.image} 
                            alt={j.name} 
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/avatar-placeholder.png'; }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{j.name}</p>
                            <span className="text-[10px] text-muted-foreground">{j.isChiefJudge ? '⭐ Chief Judge' : 'Judge'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No judges linked to this event</p>
                    )}
                  </div>
                </div>

                {/* Secretaries Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider border-b border-border pb-1">Organizing Committee ({activeEvent.secretaries?.length || 0})</h4>
                  <div className="space-y-2">
                    {activeEvent.secretaries && activeEvent.secretaries.length > 0 ? (
                      activeEvent.secretaries.map((s: any, index: number) => (
                        <div key={index} className="p-3 border border-border/80 bg-accent/10 rounded-xl flex flex-col gap-1">
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-foreground">{s.name}</p>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-foreground/15 text-foreground px-2 py-0.5 rounded">
                              {s.designation || 'Secretary'}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">📞 {s.mobile} | ✉️ {s.email}</p>
                          {s.address && <p className="text-[10px] text-slate-400 mt-1">📍 {s.address}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No secretary details available</p>
                    )}
                  </div>
                </div>

                {/* Rules Section */}
                {activeEvent.rules && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider border-b border-border pb-1">Event Rules & Guidelines</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-card border border-border p-3 rounded-xl">
                      {activeEvent.rules}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-border bg-muted/20 flex gap-3 flex-shrink-0">
                <Link href={`/admin/events/edit?id=${activeEvent.id}`} className="flex-1">
                  <button className="w-full py-2.5 bg-[#111827] text-white hover:bg-black dark:bg-white dark:text-[#111827] dark:hover:bg-[#F3F4F6] text-sm font-bold rounded-xl transition-all">
                    Edit Details
                  </button>
                </Link>
                <button 
                  onClick={() => { setDuplicateConfirmEvent(activeEvent); setActiveEvent(null); }}
                  className="flex-1 py-2.5 bg-card border border-border text-foreground hover:bg-accent text-sm font-bold rounded-xl transition-all"
                >
                  Clone Event
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 7. CONFIRMATION DIALOGUES */}
      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmEvent(null)} className="absolute inset-0 bg-black" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card border border-border p-6 rounded-2xl max-w-md w-full relative z-10 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Are you sure you want to delete this event?</h3>
                <p className="text-xs text-muted-foreground">This performs a soft delete on event record <strong>{deleteConfirmEvent.name}</strong>. All registrations will remain preserved in relational backups.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDeleteConfirmEvent(null)} className="flex-1 py-2 bg-accent text-foreground hover:bg-accent/80 text-xs font-bold rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirmEvent.id)} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors">
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Duplicate Confirmation */}
      <AnimatePresence>
        {duplicateConfirmEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setDuplicateConfirmEvent(null)} className="absolute inset-0 bg-black" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card border border-border p-6 rounded-2xl max-w-md w-full relative z-10 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Copy className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Duplicate Show Event?</h3>
                <p className="text-xs text-muted-foreground">Cloning copies judges, secretary details, rules, venue, fees, and shifts calendar dates <strong>+1 year into the future</strong> (e.g. for annual recurring events).</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDuplicateConfirmEvent(null)} className="flex-1 py-2 bg-accent text-foreground hover:bg-accent/80 text-xs font-bold rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDuplicate(duplicateConfirmEvent.id)} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors">
                  Confirm Duplicate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Action Confirmation */}
      <AnimatePresence>
        {bulkActionConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setBulkActionConfirm(null)} className="absolute inset-0 bg-black" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card border border-border p-6 rounded-2xl max-w-md w-full relative z-10 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Info className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">{bulkActionConfirm.label}?</h3>
                <p className="text-xs text-muted-foreground">This will execute bulk updates across all <strong>{selectedIds.length}</strong> selected events. Are you sure you want to proceed?</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setBulkActionConfirm(null)} className="flex-1 py-2 bg-accent text-foreground hover:bg-accent/80 text-xs font-bold rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={handleBulkAction} className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors">
                  Confirm Execution
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
