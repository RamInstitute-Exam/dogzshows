'use client';

import React, { useState } from 'react';
import { Save, ArrowLeft, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function CreateChampionshipWinner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    winnerId: '',
    eventId: '',
    championshipTitle: '',
    year: '',
    rank: '',
    status: 'PUBLISHED'
  });

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.success) {
        setFormData(prev => ({ ...prev, [fieldName]: res.url }));
        toast.success('Uploaded successfully');
      }
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/championship-winners', formData);
      if (res.success) {
        toast.success('Created successfully!');
        router.push('/admin/winners/championship-winners');
      } else {
        toast.error(res.message || 'Failed to create');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-sm sticky top-4 z-50">
        <div className="flex items-center gap-4">
          <Link href="/admin/winners/championship-winners">
            <button className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl p-2 transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Add Championship Winners</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-foreground text-background font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Winner ID *</label>
              <input type="text" name="winnerId" value={formData.winnerId} onChange={handleInputChange} required className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Event ID </label>
              <input type="text" name="eventId" value={formData.eventId} onChange={handleInputChange}  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Championship Title *</label>
              <input type="text" name="championshipTitle" value={formData.championshipTitle} onChange={handleInputChange} required className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Year *</label>
              <input type="number" name="year" value={formData.year} onChange={handleInputChange} required className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Rank </label>
              <input type="number" name="rank" value={formData.rank} onChange={handleInputChange}  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none">
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}