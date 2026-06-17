'use client';

import React, { useState, useEffect } from 'react';
import { Award, Eye, Edit, Trash2, ShieldAlert, Sparkles, X } from 'lucide-react';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function JudgeManagement() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State for Viewing Judge Details
  const [selectedJudge, setSelectedJudge] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchJudges = async () => {
    setLoading(true);
    try {
      let url = `/judges?page=${page}&search=${search}&limit=10`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      const res = await api.get(url);
      if (res.success) {
        setData(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || res.data?.length || 0);
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
  }, [page, search, statusFilter]);

  const handleDelete = async (judge: any) => {
    if (confirm(`Are you sure you want to delete judge "${judge.name}"? This will also remove their user account.`)) {
      try {
        const res = await api.delete(`/judges/${judge.id}`);
        if (res.success) {
          toast.success('Judge deleted successfully');
          fetchJudges();
        } else {
          toast.error(res.message || 'Failed to delete judge');
        }
      } catch (error) {
        console.error('Delete error', error);
        toast.error('Failed to delete judge');
      }
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
      if (data.length === 0) {
        toast.error('No data to export');
        return;
      }
      const headers = ['ID', 'Name', 'Email', 'Phone', 'City', 'State', 'Country', 'Experience', 'Specialization', 'Status', 'Featured', 'Created At'];
      const rows = data.map(j => [
        j.id,
        j.name,
        j.email || '',
        j.phone || '',
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
      toast.success('Judges exported successfully');
    } catch (e) {
      console.error('Export error', e);
      toast.error('Failed to export CSV');
    }
  };

  const columns: ColumnDefinition<any>[] = React.useMemo(() => [
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
    { header: 'Phone', accessor: (j) => j.phone || '—' },
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
  ], [data]);

  return (
    <div className="w-full">

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
                  <span className="block text-xs font-bold text-muted-foreground uppercase">Phone Number</span>
                  <span className="text-sm font-semibold text-foreground">{selectedJudge.phone || '—'}</span>
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
              <Button onClick={() => setIsViewModalOpen(false)} className="bg-blue-600 text-foreground hover:bg-blue-700 font-bold px-6">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
