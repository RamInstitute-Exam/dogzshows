'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, UploadCloud, X, Search, RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';
import api, { getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { AdminButton } from '@/components/ui/admin-button';
import Spinner from '@/components/common/loader/Spinner';
import OptimizedImage from '@/components/shared/OptimizedImage';

interface Winner {
  id: string;
  awardTitle: string;
  dogName?: string | null;
  ownerName?: string | null;
  breederName?: string | null;
  breedName?: string | null;
  competition?: string | null;
  year?: number | null;
  imageUrl?: string | null;
  description?: string | null;
  createdAt: string;
}

export default function WinnersManagement() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Partial<Winner> | null>(null);
  
  // Image uploading state
  const [uploading, setUploading] = useState(false);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/winners', { search, page, limit: 50 });
      if (res.success) {
        setWinners(res.data);
        setTotalCount(res.total || res.data.length);
      }
    } catch (error: any) {
      console.error('Failed to fetch winners:', error);
      toast.error(error.response?.data?.message || 'Failed to load winners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, [page, search]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        setCurrentWinner(prev => ({
          ...prev,
          imageUrl: res.url
        }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Upload failed');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWinner?.awardTitle || !currentWinner?.imageUrl) {
      toast.error('Award Title and Image are required');
      return;
    }

    try {
      const isEdit = !!currentWinner.id;
      const url = isEdit ? `/winners/${currentWinner.id}` : '/winners';
      
      const res = isEdit ? await api.put(url, currentWinner) : await api.post(url, currentWinner);
      
      if (res.success) {
        toast.success(`Winner ${isEdit ? 'updated' : 'created'} successfully`);
        setIsModalOpen(false);
        fetchWinners();
      } else {
        toast.error(res.message || 'Failed to save winner');
      }
    } catch (error: any) {
      console.error('Error saving winner:', error);
      toast.error(error.response?.data?.message || 'An error occurred while saving');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this winner? This action cannot be undone.')) return;
    try {
      const res = await api.delete(`/winners/${id}`);
      if (res.success) {
        toast.success('Winner deleted successfully');
        fetchWinners();
      } else {
        toast.error(res.message || 'Failed to delete');
      }
    } catch (error: any) {
      console.error('Error deleting winner:', error);
      toast.error(error.response?.data?.message || 'Failed to delete winner');
    }
  };

  const openCreate = () => {
    setCurrentWinner({
      awardTitle: '',
      dogName: '',
      ownerName: '',
      breederName: '',
      breedName: '',
      competition: '',
      year: new Date().getFullYear(),
      imageUrl: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEdit = (winner: Winner) => {
    setCurrentWinner(winner);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-4 bg-background text-muted-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-3">
            Manual Show Results
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage hall of fame entries and manual show result images.
          </p>
        </div>
        <AdminButton 
          variant="primary"
          size="md"
          onClick={openCreate}
          leftIcon={<Plus className="w-5 h-5" />}
          className="w-full sm:w-auto"
        >
          Add New Winner
        </AdminButton>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/45 border border-border p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search winners..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border focus:border-border text-foreground rounded-xl outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-6 text-sm text-muted-foreground">
          <span>Total: <strong className="text-foreground">{totalCount}</strong></span>
          <button 
            onClick={fetchWinners}
            className="flex items-center gap-2 hover:text-foreground transition-colors text-xs font-semibold py-2 px-3 border border-border rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-x-auto shadow-sm">
        <table className="w-full text-left min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Image</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Details</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Event & Year</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && winners.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-muted-foreground">
                  <Spinner className="py-12" />
                </td>
              </tr>
            ) : winners.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-muted-foreground italic">
                  No manual winners found.
                </td>
              </tr>
            ) : (
              winners.map((winner) => (
                <tr key={winner.id} className="hover:bg-muted/15 transition-all duration-150">
                  <td className="p-4 align-middle">
                    {winner.imageUrl && (
                      <OptimizedImage 
                        src={getImageUrl(winner.imageUrl)} 
                        alt="Winner" 
                        className="w-24 h-16 object-cover rounded-lg border border-border/80 shadow-sm"
                      />
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    <h4 className="font-extrabold text-foreground text-sm leading-snug">{winner.awardTitle}</h4>
                    <p className="text-xs text-primary font-medium mt-0.5">{winner.dogName || 'N/A'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Owner: {winner.ownerName || 'N/A'} | Breeder: {winner.breederName || 'N/A'}
                    </p>
                  </td>
                  <td className="p-4 align-middle text-xs text-muted-foreground">
                    <p>{winner.competition || 'N/A'}</p>
                    <p>{winner.year || ''}</p>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(winner)} className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(winner.id)} className="hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Popup */}
      <AnimatePresence>
        {isModalOpen && currentWinner && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">
                  {currentWinner.id ? 'Edit Show Result' : 'Add Show Result'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-full">
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Award Title *</label>
                    <input 
                      type="text" required
                      value={currentWinner.awardTitle || ''}
                      onChange={e => setCurrentWinner(prev => ({ ...prev, awardTitle: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none"
                      placeholder="e.g. Best in Show"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Dog Name</label>
                    <input 
                      type="text"
                      value={currentWinner.dogName || ''}
                      onChange={e => setCurrentWinner(prev => ({ ...prev, dogName: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Breed Name</label>
                    <input 
                      type="text"
                      value={currentWinner.breedName || ''}
                      onChange={e => setCurrentWinner(prev => ({ ...prev, breedName: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Owner Name</label>
                    <input 
                      type="text"
                      value={currentWinner.ownerName || ''}
                      onChange={e => setCurrentWinner(prev => ({ ...prev, ownerName: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Breeder Name</label>
                    <input 
                      type="text"
                      value={currentWinner.breederName || ''}
                      onChange={e => setCurrentWinner(prev => ({ ...prev, breederName: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Event/Competition</label>
                    <input 
                      type="text"
                      value={currentWinner.competition || ''}
                      onChange={e => setCurrentWinner(prev => ({ ...prev, competition: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Year</label>
                    <input 
                      type="number"
                      value={currentWinner.year || ''}
                      onChange={e => setCurrentWinner(prev => ({ ...prev, year: parseInt(e.target.value) || null }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="block text-xs md:text-sm font-bold text-muted-foreground">Winner Image *</label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-4 hover:bg-muted/10 transition-colors relative min-h-[140px]">
                    {uploading ? (
                      <Spinner size="md" className="py-4" />
                    ) : currentWinner.imageUrl ? (
                      <div className="w-full flex flex-col items-center gap-3">
                        <OptimizedImage 
                          src={getImageUrl(currentWinner.imageUrl)} 
                          alt="Winner Image" 
                          className="h-20 w-auto object-cover rounded-lg border border-border"
                        />
                        <button type="button" onClick={() => setCurrentWinner(prev => ({ ...prev, imageUrl: '' }))} className="text-red-500 hover:underline text-[10px] font-bold">Remove</button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                        <UploadCloud className="w-10 h-10 text-muted-foreground/60 mb-2" />
                        <span className="text-xs font-semibold text-foreground hover:underline">Click to upload Image</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                  <AdminButton type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</AdminButton>
                  <AdminButton type="submit" variant="primary">Save Show Result</AdminButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
