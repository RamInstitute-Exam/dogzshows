'use client';

import React, { useState } from 'react';
import { Save, ArrowLeft, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function CreateEventResult() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventId: '',
    winnerId: '',
    award: '',
    judgeId: '',
    position: '',
    certificate: '',
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
      const res = await api.post('/event-results', formData);
      if (res.success) {
        toast.success('Created successfully!');
        router.push('/admin/winners/event-results');
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
          <Link href="/admin/winners/event-results">
            <button className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl p-2 transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Add Event Results</h1>
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
              <label className="block text-sm font-bold text-muted-foreground mb-2">Event ID *</label>
              <input type="text" name="eventId" value={formData.eventId} onChange={handleInputChange} required className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Winner ID *</label>
              <input type="text" name="winnerId" value={formData.winnerId} onChange={handleInputChange} required className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Award </label>
              <input type="text" name="award" value={formData.award} onChange={handleInputChange}  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Judge ID </label>
              <input type="text" name="judgeId" value={formData.judgeId} onChange={handleInputChange}  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Position </label>
              <input type="text" name="position" value={formData.position} onChange={handleInputChange}  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Certificate Image</label>
              {formData.certificate ? (
                <div className="flex flex-col gap-2">
                  <img src={formData.certificate} className="h-32 object-contain rounded border border-border bg-muted/50" />
                  <button type="button" onClick={() => setFormData(prev => ({...prev, certificate: ''}))} className="text-red-500 text-sm font-bold text-left">Remove Image</button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UploadCloud className="w-6 h-6" />
                    <span className="text-sm font-bold">Upload Certificate Image</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'certificate')} />
                </label>
              )}
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