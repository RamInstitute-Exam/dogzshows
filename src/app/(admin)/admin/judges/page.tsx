'use client';

import React, { useState, useEffect } from 'react';
import { Award, Eye, Edit, Trash2, ShieldAlert, Sparkles, X } from 'lucide-react';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

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

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Modal State for Viewing Judge Details
  const [selectedJudge, setSelectedJudge] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchJudges = async () => {
    setLoading(true);
    try {
      // Appending timestamp to strictly bypass browser cache
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

        // If the current page is greater than the available pages, navigate back
        if (page > fetchedTotalPages && fetchedTotalPages > 0) {
          setPage(fetchedTotalPages);
          return;
        }

        setData(fetchedItems);
        setTotalPages(fetchedTotalPages);
        setTotalCount(fetchedTotal);
        
        // Clean up selectedIds to only include items that actually exist in the fetched data
        // This prevents "ghost" selections if items were deleted by another process
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
    // We now use a strict hard delete
    if (confirm(`Are you sure you want to permanently delete judge "${judge.name}"? This cannot be undone.`)) {
      try {
        // Optimistic UI update - remove from list and selection immediately
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
        // Re-fetch to sync pagination and state perfectly
        fetchJudges();
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === data.length && data.length > 0) {
      // Unselect all on current page
      const newSelected = new Set(selectedIds);
      data.forEach(j => newSelected.delete(j.id));
      setSelectedIds(newSelected);
    } else {
      // Select all on current page
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
      // Optimistic update
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
      const headers = ['ID', 'Name', 'Email', 'Mobile', 'City', 'State', 'Country', 'Experience', 'Specialization', 'Status', 'Featured', 'Created At'];
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

  const columns: ColumnDefinition<any>[] = React.useMemo(() => [
    {
      header: (
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-border bg-background checked:bg-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          checked={data.length > 0 && data.every(j => selectedIds.has(j.id))}
          onChange={handleSelectAll}
          disabled={data.length === 0}
        />
      ),
      accessor: (j) => (
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-border bg-background checked:bg-blue-600 cursor-pointer"
          checked={selectedIds.has(j.id)}
          onChange={() => handleSelect(j.id)}
        />
      ),
      className: 'w-[40px]'
    },
    { 
      header: 'Photo', 
      accessor: (j) => (
        <div className="relative group/avatar w-12 h-12 rounded-full overflow-hidden border border-border bg-accent flex items-center justify-center shadow-inner">
          {j.photoUrl ? (
            <img src={j.photoUrl} alt={j.name} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-300" />
          ) : (
            <span className="text-muted-foreground text-lg font-extrabold">{j.name?.[0]?.toUpperCase() || 'J'}</span>
          )}
        </div>
      ) 
    },
    { 
      header: 'Name', 
      accessor: (j) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-foreground group-hover:text-blue-500 transition-colors flex items-center gap-1.5">
            {j.name}
            {j.isFeatured && (
              <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 rounded text-[9px] font-extrabold tracking-wider flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> FEATURED
              </span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {j.email?.trim() ? j.email : <span className="text-gray-500">No email</span>}
          </span>
        </div>
      )
    },
    { header: 'Mobile Number', accessor: (j: any) => j.mobile || j.phone || '—' },
    { header: 'Location', accessor: (j) => (j.city && j.state) ? `${j.city}, ${j.state}` : j.country || '—' },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (j) => (
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
              className="text-orange-500 hover:bg-orange-500/10 hover:text-orange-400 border-orange-500/20 h-8 px-2 rounded-lg text-xs"
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
      )
    }
  ], [data, selectedIds]);

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

      <AdminDataTable
        title="Judge Registry"
        description="FCI and national dog show judges management database."
        icon={Award}
        data={data}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        onSearchChange={setSearch}
        onRefresh={fetchJudges}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={setLimit}
        onExport={handleExport}
        createLink="/admin/judges/create"
        createLabel="Add Judge"
        keyExtractor={(item) => item.id}
      />

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
                  <h3 className="text-2xl font-extrabold text-foreground">{selectedJudge.name}</h3>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedJudge.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {selectedJudge.status}
                    </span>
                    {selectedJudge.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500">
                        Featured Judge
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedJudge.specialization || 'All Breed FCI Judge'}</p>
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
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Date of Birth</span>
                  <span className="text-sm font-semibold text-foreground">{selectedJudge.dob || '—'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Location</span>
                  <span className="text-sm font-semibold text-foreground">
                    {selectedJudge.address ? `${selectedJudge.address}, ` : ''}
                    {selectedJudge.city || ''}, {selectedJudge.state || ''}, {selectedJudge.country || ''}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Experience</span>
                  <span className="text-sm font-semibold text-foreground">{selectedJudge.experience || 0} Years</span>
                </div>
                <div className="md:col-span-2">
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Certifications</span>
                  <span className="text-sm font-semibold text-foreground">{selectedJudge.certifications || '—'}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <span className="block text-xs font-bold text-muted-foreground uppercase mb-1">Biography</span>
                <p className="text-sm text-muted-foreground bg-accent/20 p-4 rounded-2xl whitespace-pre-wrap leading-relaxed">
                  {selectedJudge.bio || 'No biography details provided.'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t border-border bg-accent/30">
              <div className="flex gap-2">
                {selectedJudge.status === 'ACTIVE' ? (
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(selectedJudge, 'SUSPENDED')} className="text-orange-500 border-orange-500/20">
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
