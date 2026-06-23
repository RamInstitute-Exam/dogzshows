'use client';

import React, { useState, useEffect } from 'react';
import { Tent, Eye, Edit, Trash2, Sparkles, X, Check, Ban, Download, Loader2, AlertTriangle } from 'lucide-react';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function ClubManagement() {
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
    router.push(`/admin/clubs?${params.toString()}`, { scroll: false });
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
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Modal State for Viewing Club Details
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      let url = `/clubs?page=${page}&search=${search}&limit=${limit}&_t=${Date.now()}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      const res = await api.get(url);
      if (res.success) {
        const fetchedItems = Array.isArray(res.data) ? res.data : (res.data?.clubs || []);
        const fetchedTotal = res.total ?? res.pagination?.totalRecords ?? res.totalCount ?? fetchedItems.length;
        const fetchedTotalPages = res.totalPages ?? res.pagination?.totalPages ?? 1;

        if (page > fetchedTotalPages && fetchedTotalPages > 0) {
          setPage(fetchedTotalPages);
          return;
        }

        setData(fetchedItems);
        setTotalPages(fetchedTotalPages);
        setTotalCount(fetchedTotal);
      }
    } catch (error) {
      console.error('Failed to fetch clubs', error);
      toast.error('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [page, limit, search, statusFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelected = new Set(selectedIds);
      data.forEach(item => newSelected.add(item.id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      data.forEach(item => newSelected.delete(item.id));
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
    if (selectedIds.size === 0) return;
    setIsDeletingBulk(true);
    try {
      const res = await api.post('/clubs/bulk-delete', {
        ids: Array.from(selectedIds)
      });
      if (res.success) {
        toast.success(`${res.deletedCount || selectedIds.size} clubs deleted successfully.`);
        setSelectedIds(new Set());
        setIsBulkDeleteModalOpen(false);
        fetchClubs();
      } else {
        toast.error(res.message || 'Failed to delete selected clubs');
      }
    } catch (error) {
      console.error('Bulk delete error', error);
      toast.error('An error occurred during bulk deletion');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleDelete = async (club: any) => {
    if (confirm(`Are you sure you want to delete club "${club.name}"? This will also remove their associated user account.`)) {
      try {
        const res = await api.delete(`/clubs/${club.id}`);
        if (res.success) {
          toast.success('Club deleted successfully');
          fetchClubs();
        } else {
          toast.error(res.message || 'Failed to delete club');
        }
      } catch (error) {
        console.error('Delete error', error);
        toast.error('Failed to delete club');
      }
    }
  };

  const handleToggleStatus = async (club: any, isActive: boolean) => {
    try {
      const res = await api.put(`/clubs/${club.id}`, { isActive });
      if (res.success) {
        toast.success(`Club status updated successfully`);
        fetchClubs();
        if (selectedClub?.id === club.id) {
          setSelectedClub({ ...selectedClub, isActive });
        }
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update error', error);
      toast.error('Failed to update club status');
    }
  };

  const handleExport = () => {
    try {
      const dataToExport = selectedIds.size > 0 
        ? data.filter(c => selectedIds.has(c.id)) 
        : data;

      if (dataToExport.length === 0) {
        toast.error('No data to export');
        return;
      }
      const headers = ['ID', 'Name', 'Registration Number', 'President', 'Email', 'Phone', 'City', 'State', 'Country', 'Website', 'Facebook', 'Instagram', 'Status', 'Featured', 'Created At'];
      const rows = dataToExport.map(c => [
        c.id,
        c.name,
        c.registrationNumber || '',
        c.president || '',
        c.email || '',
        c.phone || '',
        c.city || '',
        c.state || '',
        c.country || '',
        c.website || '',
        c.facebook || '',
        c.instagram || '',
        c.isActive ? 'ACTIVE' : 'INACTIVE',
        c.isFeatured ? 'YES' : 'NO',
        new Date(c.createdAt).toLocaleString()
      ]);

      const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `juzdog_clubs_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${dataToExport.length} clubs exported successfully`);
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
          className="w-4 h-4 rounded border-border bg-background checked:bg-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          checked={data.length > 0 && data.every(c => selectedIds.has(c.id))}
          onChange={handleSelectAll}
          disabled={data.length === 0}
        />
      ),
      accessor: (c) => (
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-border bg-background checked:bg-foreground cursor-pointer"
          checked={selectedIds.has(c.id)}
          onChange={() => handleSelect(c.id)}
        />
      ),
      className: 'w-[40px]'
    },
    { 
      header: 'Logo', 
      accessor: (c) => (
        <div className="relative group/logo w-12 h-12 rounded-xl overflow-hidden border border-border bg-accent flex items-center justify-center shadow-inner">
          {c.logoUrl ? (
            <OptimizedImage src={c.logoUrl} alt={c.name} className="w-full h-full object-cover group-hover/logo:scale-110 transition-transform duration-300" />
          ) : (
            <Tent className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      ) 
    },
    { 
      header: 'Club Name', 
      accessor: (c) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-foreground group-hover:text-foreground transition-colors flex items-center gap-1.5">
            {c.name}
            {c.isFeatured && (
              <span className="px-1.5 py-0.5 bg-foreground/10 text-foreground rounded text-[9px] font-extrabold tracking-wider flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> FEATURED
              </span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">{c.email || 'No email'}</span>
        </div>
      )
    },
    { header: 'Location', accessor: (c) => (c.city && c.state) ? `${c.city}, ${c.state}` : c.country || '-' },
    { 
      header: 'Club Type', 
      accessor: (c) => (
        <span className="px-2.5 py-0.5 bg-accent text-xs rounded-full border border-border font-semibold text-muted-foreground whitespace-nowrap">
          {c.clubType || 'All Breeds'}
        </span>
      ) 
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button 
            title="View Details" 
            variant="ghost" 
            size="sm" 
            onClick={() => { setSelectedClub(c); setIsViewModalOpen(true); }} 
            className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 h-8 px-2 rounded-lg"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            title="Edit Details" 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push(`/admin/clubs/edit?id=${c.id}`)} 
            className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 h-8 px-2 rounded-lg"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            title="Delete Club" 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDelete(c)} 
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 px-2 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          {/* Approve / Reject / Suspend buttons */}
          {c.isActive ? (
            <Button 
              title="Suspend/Reject Club"
              variant="outline" 
              size="sm" 
              onClick={() => handleToggleStatus(c, false)} 
              className="text-foreground hover:bg-foreground/10 hover:text-foreground border-border/20 h-8 px-2 rounded-lg text-xs flex items-center gap-1"
            >
              <Ban className="w-3 h-3" /> Suspend
            </Button>
          ) : (
            <Button 
              title="Approve Club"
              variant="outline" 
              size="sm" 
              onClick={() => handleToggleStatus(c, true)} 
              className="text-green-500 hover:bg-green-500/10 hover:text-green-400 border-green-500/20 h-8 px-2 rounded-lg text-xs flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Approve
            </Button>
          )}
        </div>
      )
    }
  ], [data, selectedIds]);

  return (
    <div className="w-full relative">

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-[#111827] border border-border/30 shadow-2xl shadow-black/20/10 px-6 py-4 rounded-full flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-foreground/20 flex items-center justify-center border border-border/30">
                <span className="text-foreground font-black text-sm">{selectedIds.size}</span>
              </div>
              <span className="text-white font-semibold text-sm">Clubs Selected</span>
            </div>
            
            <div className="h-6 w-px bg-gray-800"></div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedIds(new Set())}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full px-4"
              >
                Clear
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExport}
                className="text-foreground hover:text-foreground hover:bg-foreground/10 rounded-full px-4"
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full px-4 ml-2 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      <AdminDataTable
        title="Club Registry"
        description="Dog registry associated clubs, regional chapters, and specialties."
        icon={Tent}
        data={data}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        onSearchChange={setSearch}
        onRefresh={fetchClubs}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={setLimit}
        onExport={handleExport}
        createLink="/admin/clubs/create"
        createLabel="Add Club"
        emptyStateDescription="Create your first club or import clubs using Bulk Upload."
        keyExtractor={(item) => item.id}
      />

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-foreground">Delete {selectedIds.size} Clubs?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Are you sure you want to permanently delete the selected clubs? This action cannot be undone and will remove all their associated accounts and events.
              </p>
            </div>
            <div className="p-4 bg-accent/30 border-t border-border flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl font-bold border-border"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isDeletingBulk}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white border-0"
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
              >
                {isDeletingBulk ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
                ) : (
                  'Delete Permanently'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {isViewModalOpen && selectedClub && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-border bg-accent/30">
              <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" /> Club Profile Details
              </h2>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-input rounded-full transition-colors text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border bg-accent shrink-0 flex items-center justify-center">
                  {selectedClub.logoUrl ? (
                    <OptimizedImage src={selectedClub.logoUrl} alt={selectedClub.name} className="w-full h-full object-cover" />
                  ) : (
                    <Tent className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-foreground">{selectedClub.name}</h3>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedClub.isActive ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {selectedClub.isActive ? 'APPROVED' : 'PENDING'}
                    </span>
                    {selectedClub.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500">
                        Featured Club
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Reg No: {selectedClub.registrationNumber || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border-t border-border pt-6">
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Club President</span>
                  <span className="text-sm font-semibold text-foreground">{selectedClub.president || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Club Secretary</span>
                  <span className="text-sm font-semibold text-foreground">{selectedClub.secretary || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Club Type</span>
                  <span className="text-sm font-semibold text-foreground">{selectedClub.clubType || 'All Breeds'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Email Address</span>
                  <span className="text-sm font-semibold text-foreground">{selectedClub.email || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Phone Number</span>
                  <span className="text-sm font-semibold text-foreground">{selectedClub.phone || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Website</span>
                  <span className="text-sm font-semibold text-blue-500 hover:underline">
                    {selectedClub.website ? (
                      <a href={selectedClub.website} target="_blank" rel="noopener noreferrer">{selectedClub.website}</a>
                    ) : '-'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Social Channels</span>
                  <span className="text-sm font-semibold text-foreground flex gap-3">
                    {selectedClub.facebook && <a href={selectedClub.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">Facebook</a>}
                    {selectedClub.instagram && <a href={selectedClub.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Instagram</a>}
                    {!selectedClub.facebook && !selectedClub.instagram && '-'}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Location Address</span>
                  <span className="text-sm font-semibold text-foreground">
                    {selectedClub.address ? `${selectedClub.address}, ` : ''}
                    {selectedClub.city || ''}, {selectedClub.state || ''}, {selectedClub.country || ''}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <span className="block text-xs font-bold text-muted-foreground uppercase mb-1">About the Club</span>
                <p className="text-sm text-muted-foreground bg-accent/20 p-4 rounded-2xl whitespace-pre-wrap leading-relaxed">
                  {selectedClub.description || 'No descriptive details available for this club.'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t border-border bg-accent/30">
              <div className="flex gap-2">
                {selectedClub.isActive ? (
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(selectedClub, false)} className="text-foreground border-border/20">
                    Suspend Club
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(selectedClub, true)} className="text-green-500 border-green-500/20">
                    Approve Club
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
    </div>
  );
}
