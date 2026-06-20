'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Award, Eye, Edit, Trash2, ShieldAlert, Sparkles, X, GripVertical, Search, Filter, Download, Plus, RefreshCw, Save, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function JudgeManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('statusFilter') || '';

  const updateQueryParams = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    router.push(`/admin/judges?${params.toString()}`, { scroll: false });
  };

  const setPage = (p: number) => updateQueryParams({ page: p });
  const setLimit = (l: number) => updateQueryParams({ limit: l, page: 1 });
  const setSearch = (s: string) => updateQueryParams({ search: s, page: 1 });
  const setStatusFilter = (s: string) => updateQueryParams({ statusFilter: s, page: 1 });

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Unsaved manual display_order entries
  const [unsavedOrders, setUnsavedOrders] = useState<Record<string, string>>({});

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Modal State for Viewing Judge Details
  const [selectedJudge, setSelectedJudge] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchJudges = async () => {
    setLoading(true);
    try {
      let url = `/judges?page=${page}&search=${search}&limit=${limit}&_t=${Date.now()}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      const res = await api.get(url);
      if (res.success) {
        const fetchedItems = res.items || res.data || [];
        const fetchedTotal = res.pagination?.total ?? res.total ?? fetchedItems.length;
        const calcPages = Math.ceil(fetchedTotal / limit) || 1;
        const fetchedTotalPages = res.pagination?.totalPages ?? res.totalPages ?? calcPages;

        if (page > fetchedTotalPages && fetchedTotalPages > 0) {
          setPage(fetchedTotalPages);
          return;
        }

        setData(fetchedItems);
        setTotalPages(fetchedTotalPages);
        setTotalCount(fetchedTotal);
        
        // Reset manual edits on reload
        setUnsavedOrders({});
        
        setSelectedIds(prev => {
          const newSet = new Set<string>();
          const fetchedIds = new Set(fetchedItems.map((j: any) => j.id));
          prev.forEach(id => {
            if (fetchedIds.has(id)) newSet.add(id);
          });
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to fetch judges', error);
      toast.error('Failed to load judges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJudges();
  }, [page, limit, search, statusFilter]);

  const handleDelete = async (judge: any) => {
    if (confirm(`Are you sure you want to permanently delete judge "${judge.name}"? This cannot be undone.`)) {
      try {
        setData(prev => prev.filter(j => j.id !== judge.id));
        setTotalCount(prev => Math.max(0, prev - 1));
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(judge.id);
          return newSet;
        });
        
        const res = await api.delete(`/judges/${judge.id}`);
        if (res.success) {
          toast.success('Judge deleted permanently');
        } else {
          toast.error(res.message || 'Failed to delete judge');
        }
      } catch (error: any) {
        console.error('Delete error', error);
        toast.error(error?.response?.data?.message || 'Failed to delete judge');
      } finally {
        fetchJudges();
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === data.length && data.length > 0) {
      const newSelected = new Set(selectedIds);
      data.forEach(j => newSelected.delete(j.id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      data.forEach(j => newSelected.add(j.id));
      setSelectedIds(newSelected);
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleteModalOpen(false);
    if (selectedIds.size === 0) return;

    try {
      const idsToDelete = Array.from(selectedIds);
      setData(prev => prev.filter(j => !idsToDelete.includes(j.id)));
      setTotalCount(prev => Math.max(0, prev - idsToDelete.length));
      setSelectedIds(new Set());

      const res = await api.post('/judges/bulk-delete', { ids: idsToDelete });
      if (res.success) {
        toast.success(`Successfully deleted ${idsToDelete.length} judges permanently.`);
      } else {
        toast.error(res.message || 'Failed to delete selected judges');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to perform bulk delete');
    } finally {
      await fetchJudges();
    }
  };

  const handleToggleStatus = async (judge: any, newStatus: string) => {
    try {
      const res = await api.put(`/judges/${judge.id}`, { status: newStatus });
      if (res.success) {
        toast.success(`Judge status updated to ${newStatus}`);
        fetchJudges();
        if (selectedJudge?.id === judge.id) {
          setSelectedJudge({ ...selectedJudge, status: newStatus });
        }
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update error', error);
      toast.error('Failed to update judge status');
    }
  };

  const handleExport = () => {
    try {
      const dataToExport = selectedIds.size > 0 
        ? data.filter(j => selectedIds.has(j.id)) 
        : data;

      if (dataToExport.length === 0) {
        toast.error('No data to export');
        return;
      }
      const headers = ['ID', 'Name', 'Email', 'Mobile', 'City', 'State', 'Country', 'Experience', 'Specialization', 'Display Order', 'Status', 'Featured', 'Created At'];
      const rows = dataToExport.map(j => [
        j.id,
        j.name,
        j.email || '',
        j.mobile || j.phone || '',
        j.city || '',
        j.state || '',
        j.country || '',
        j.experience || '0',
        j.specialization || '',
        j.display_order || '',
        j.status || 'ACTIVE',
        j.isFeatured ? 'YES' : 'NO',
        new Date(j.createdAt).toLocaleString()
      ]);

      const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `juzdog_judges_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${dataToExport.length} judges successfully`);
    } catch (e) {
      console.error('Export error', e);
      toast.error('Failed to export CSV');
    }
  };

  // HTML5 Drag and Drop Row sorting
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const listCopy = [...data];
    const draggedItem = listCopy[draggedIdx];
    listCopy.splice(draggedIdx, 1);
    listCopy.splice(index, 0, draggedItem);

    // Optimistically update frontend state
    setData(listCopy);
    setDraggedIdx(null);

    // Generate consecutive sequence array of IDs to auto-save reordered state
    const ids = listCopy.map(j => j.id);

    // Call API to save reordered state
    try {
      const res = await api.post('/judges/reorder', { ids });
      if (res.success) {
        toast.success('Sequence updated and auto-saved successfully!');
        // Refetch to align sequence values properly from backend
        fetchJudges();
      } else {
        toast.error(res.message || 'Failed to auto-save sequence');
        fetchJudges();
      }
    } catch (err: any) {
      console.error('Reorder error', err);
      toast.error(err?.message || 'Failed to auto-save sequence');
      fetchJudges();
    }
  };

  // Inline Manual input change
  const handleOrderInputChange = (id: string, value: string) => {
    setUnsavedOrders(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Save manual bulk display orders
  const handleSaveBulkOrders = async () => {
    // Compile updates list
    const updates = Object.keys(unsavedOrders).map(id => {
      const val = unsavedOrders[id];
      return {
        id,
        display_order: val === '' ? 0 : Number(val)
      };
    }).filter(u => u.display_order > 0);

    if (updates.length === 0) {
      toast.info('No changes to save.');
      return;
    }

    // Uniqueness validation in payload
    const finalOrders = data.map(j => {
      const editVal = unsavedOrders[j.id];
      if (editVal !== undefined) {
        return editVal === '' ? null : Number(editVal);
      }
      return j.display_order;
    }).filter(o => o !== null) as number[];

    const uniqueOrders = new Set(finalOrders);
    if (finalOrders.length !== uniqueOrders.size) {
      toast.error('Duplicate display orders are not allowed! Please ensure all sequence numbers are unique.');
      return;
    }

    try {
      const res = await api.post('/judges/reorder', { updates });
      if (res.success) {
        toast.success('Bulk display orders saved successfully!');
        setUnsavedOrders({});
        fetchJudges();
      } else {
        toast.error(res.message || 'Failed to bulk update orders');
      }
    } catch (err: any) {
      console.error('Bulk save error:', err);
      toast.error(err.message || 'Failed to bulk save display orders');
    }
  };

  const hasUnsavedChanges = Object.keys(unsavedOrders).length > 0;

  // Render Page Numbers
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    if (page <= 3) {
      end = Math.min(totalPages, 5);
    }
    if (page >= totalPages - 2) {
      start = Math.max(1, totalPages - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalCount);

  return (
    <div className="w-full space-y-4">
      {/* Selection Toolbar */}
      {selectedIds.size > 0 && data.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">
              {selectedIds.size}
            </div>
            <span className="font-semibold text-blue-500">Judges Selected</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())} className="border-border hover:bg-accent text-foreground h-9">
              Clear Selection
            </Button>
            <Button variant="default" size="sm" onClick={() => handleExport()} className="bg-foreground text-background hover:bg-foreground/90 h-9">
              Export Selected
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteModalOpen(true)} className="h-9 gap-2">
              <Trash2 className="w-4 h-4" /> Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Main Card Panel */}
      <div className="bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header Block */}
        <div className="p-5 border-b border-border bg-accent/10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-500" /> Judge Registry
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              FCI and KCI dog show judges database. Enforces strict Display Order sequence.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-auto sm:min-w-[300px] flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search Judges..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 h-10 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="PENDING">PENDING</option>
            </select>

            {/* Action Buttons */}
            {hasUnsavedChanges && (
              <Button 
                onClick={handleSaveBulkOrders} 
                className="bg-green-600 hover:bg-green-700 text-white font-bold h-10 px-4 gap-2 flex items-center justify-center animate-pulse"
              >
                <Save className="w-4 h-4" /> Save Sequence
              </Button>
            )}

            <Button variant="outline" onClick={handleExport} className="h-10 border-border text-foreground hover:bg-accent whitespace-nowrap">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            
            <Button variant="outline" onClick={fetchJudges} className="w-12 h-10 border-border text-foreground hover:bg-accent flex items-center justify-center p-0">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            <Link href="/admin/judges/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-[180px] h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" /> Add Judge
              </Button>
            </Link>
          </div>
        </div>

        {/* Custom Drag & Drop Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-card border-b border-border">
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[40px]">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-border bg-background checked:bg-blue-600 cursor-pointer disabled:opacity-50"
                    checked={data.length > 0 && data.every(j => selectedIds.has(j.id))}
                    onChange={handleSelectAll}
                    disabled={data.length === 0}
                  />
                </th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[60px]">Drag</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Photo</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Mobile Number</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Location</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[150px]">Display Order</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right min-w-[180px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                      <span className="font-semibold text-sm">Loading judges Registry...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <Award className="w-12 h-12 text-muted-foreground mb-4" strokeWidth={1} />
                      <h3 className="text-lg font-bold text-foreground mb-2">No Judges Found</h3>
                      <p className="text-sm text-muted-foreground mb-6 text-center">
                        No judge records match your search criteria. Register a new judge or upload a batch sequence file to begin.
                      </p>
                      <Link href="/admin/judges/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                          <Plus className="w-4 h-4 mr-2" /> Add Judge
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((j, index) => {
                  const isChecked = selectedIds.has(j.id);
                  const isEdited = unsavedOrders[j.id] !== undefined;
                  const displayVal = isEdited ? unsavedOrders[j.id] : (j.display_order ?? '');

                  return (
                    <tr
                      key={j.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`hover:bg-accent/40 transition-colors ${isChecked ? 'bg-blue-500/5' : ''} ${draggedIdx === index ? 'opacity-40 bg-accent' : ''}`}
                    >
                      {/* Checkbox Column */}
                      <td className="py-4 px-6">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-border bg-background checked:bg-blue-600 cursor-pointer"
                          checked={isChecked}
                          onChange={() => handleSelect(j.id)}
                        />
                      </td>

                      {/* Drag Handle Column */}
                      <td className="py-4 px-6 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                        <GripVertical className="w-5 h-5 shrink-0" />
                      </td>

                      {/* Avatar Column */}
                      <td className="py-4 px-6">
                        <div className="relative group/avatar w-12 h-12 rounded-full overflow-hidden border border-border bg-accent flex items-center justify-center shadow-inner">
                          {j.photoUrl ? (
                            <img src={j.photoUrl} alt={j.name} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-300" />
                          ) : (
                            <span className="text-muted-foreground text-lg font-extrabold">{j.name?.[0]?.toUpperCase() || 'J'}</span>
                          )}
                        </div>
                      </td>

                      {/* Name & Credentials Column */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-foreground group-hover:text-blue-500 transition-colors flex items-center gap-1.5 uppercase">
                            {j.name}
                            {j.isFeatured && (
                              <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 rounded text-[9px] font-extrabold tracking-wider flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> FEATURED
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground normal-case">
                            {j.email?.trim() ? j.email : <span className="text-gray-500">No email</span>}
                          </span>
                        </div>
                      </td>

                      {/* Mobile Column */}
                      <td className="py-4 px-6 text-foreground font-semibold">{j.mobile || j.phone || '—'}</td>

                      {/* Location Column */}
                      <td className="py-4 px-6 text-muted-foreground text-sm uppercase">
                        {(j.city && j.state) ? `${j.city}, ${j.state}` : j.country || '—'}
                      </td>

                      {/* Display Order Column (Inline Input) */}
                      <td className="py-4 px-6">
                        <div className="relative flex items-center max-w-[100px]">
                          <input
                            type="number"
                            min="1"
                            value={displayVal}
                            onChange={(e) => handleOrderInputChange(j.id, e.target.value)}
                            className={`w-full px-2 py-1.5 text-center text-sm font-extrabold bg-background border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                              isEdited 
                                ? 'border-amber-500 ring-1 ring-amber-500/50 bg-amber-500/5 text-amber-600 dark:text-amber-400' 
                                : 'border-border focus:border-blue-500 focus:ring-blue-500 text-foreground'
                            }`}
                          />
                          {isEdited && (
                            <span className="absolute -top-2.5 -right-2.5 px-1 py-0.5 bg-amber-500 text-white rounded text-[8px] font-black uppercase tracking-wider shadow">
                              edit
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            title="View Details" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setSelectedJudge(j); setIsViewModalOpen(true); }} 
                            className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 h-8 px-2 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            title="Edit Profile" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => router.push(`/admin/judges/edit?id=${j.id}`)} 
                            className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 h-8 px-2 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            title="Delete Judge" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(j)} 
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 px-2 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {j.status === 'ACTIVE' ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleToggleStatus(j, 'SUSPENDED')} 
                              className="text-foreground hover:bg-foreground/10 hover:text-foreground border-border/20 h-8 px-2 rounded-lg text-xs"
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleToggleStatus(j, 'ACTIVE')} 
                              className="text-green-500 hover:bg-green-500/10 hover:text-green-400 border-green-500/20 h-8 px-2 rounded-lg text-xs"
                            >
                              Activate
                            </Button>
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

        {/* Footer Pagination Controls */}
        {!loading && totalCount > 0 && (
          <div className="px-6 py-4 bg-accent/5 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground font-semibold">
              Showing <span className="text-foreground font-extrabold">{startRecord}</span> to{' '}
              <span className="text-foreground font-extrabold">{endRecord}</span> of{' '}
              <span className="text-foreground font-extrabold">{totalCount}</span> entries
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Entries Limit Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-bold uppercase">Show</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="h-8 px-2 bg-background border border-border rounded text-xs text-foreground font-bold outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page Navigation Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="h-8 border-border text-foreground hover:bg-accent disabled:opacity-50"
                >
                  Prev
                </Button>

                {getPageNumbers().map(p => (
                  <Button
                    key={p}
                    variant={page === p ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 p-0 font-bold ${page === p ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-border text-foreground hover:bg-accent'}`}
                  >
                    {p}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-8 border-border text-foreground hover:bg-accent disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {isViewModalOpen && selectedJudge && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-border bg-accent/30">
              <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" /> Judge Profile Details
              </h2>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-input rounded-full transition-colors text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-yellow-500 bg-accent shrink-0 flex items-center justify-center">
                  {selectedJudge.photoUrl ? (
                    <img src={selectedJudge.photoUrl} alt={selectedJudge.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-extrabold text-muted-foreground">{selectedJudge.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-foreground uppercase">{selectedJudge.name}</h3>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedJudge.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {selectedJudge.status}
                    </span>
                    {selectedJudge.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500">
                        Featured Judge
                      </span>
                    )}
                    {selectedJudge.display_order && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500">
                        Display Order: #{selectedJudge.display_order}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground uppercase">{selectedJudge.specialization || 'All Breed FCI Judge'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border-t border-border pt-6">
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Email Address</span>
                  <span className="text-sm font-semibold text-foreground">
                    {selectedJudge.email?.trim() ? selectedJudge.email : <span className="text-gray-500">No email</span>}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Mobile Number</span>
                  <span className="text-sm font-semibold text-foreground">{selectedJudge.mobile || selectedJudge.phone || '—'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Gender</span>
                  <span className="text-sm font-semibold text-foreground capitalize">{selectedJudge.gender || '—'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Experience</span>
                  <span className="text-sm font-semibold text-foreground">{selectedJudge.experience || 0} Years</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase font-bold text-muted-foreground uppercase">Location</span>
                  <span className="text-sm font-semibold text-foreground uppercase">
                    {selectedJudge.address ? `${selectedJudge.address}, ` : ''}
                    {selectedJudge.city || ''}, {selectedJudge.state || ''}, {selectedJudge.country || ''}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Certifications</span>
                  <span className="text-sm font-semibold text-foreground uppercase">{selectedJudge.certifications || '—'}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <span className="block text-xs font-bold text-muted-foreground uppercase mb-1">Biography</span>
                <p className="text-sm text-muted-foreground bg-accent/20 p-4 rounded-2xl whitespace-pre-wrap leading-relaxed uppercase">
                  {selectedJudge.bio || 'No biography details provided.'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t border-border bg-accent/30">
              <div className="flex gap-2">
                {selectedJudge.status === 'ACTIVE' ? (
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(selectedJudge, 'SUSPENDED')} className="text-foreground border-border/20">
                    Suspend Account
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(selectedJudge, 'ACTIVE')} className="text-green-500 border-green-500/20">
                    Activate Account
                  </Button>
                )}
              </div>
              <Button onClick={() => setIsViewModalOpen(false)} className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-6">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 text-center animate-in fade-in-50 zoom-in-95">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">Permanent Deletion</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to permanently delete the <strong>{selectedIds.size} selected judges</strong>? This action cannot be undone and will remove all associated user data.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setIsBulkDeleteModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBulkDelete} className="flex-1 font-bold">
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
