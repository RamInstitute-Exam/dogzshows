'use client';

import React, { useState } from 'react';
import { Save, ArrowLeft, UploadCloud, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api, { getImageUrl } from '@/lib/api';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function CreateWinnerCategory() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    bannerImage: '',
    thumbnailImage: '',
    sortOrder: 0,
    displayOrder: 0,
    icon: '',
    color: '',
    status: 'ACTIVE'
  });

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : (name === 'sortOrder' || name === 'displayOrder') 
          ? Number(value) 
          : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    setUploadingField(fieldName);
    try {
      const res = await api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.success) {
        setFormData(prev => ({ ...prev, [fieldName]: res.url || res.data?.url }));
        toast.success('Uploaded successfully');
      } else {
        toast.error('Upload failed');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category Name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/winner-categories', formData);
      if (res.success) {
        toast.success('Created successfully!');
        router.push('/admin/winners/categories');
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
          <Link href="/admin/winners/categories">
            <button className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl p-2 transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Add Winner Category</h1>
            <p className="text-xs text-muted-foreground">Create a new championship category tier.</p>
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
              <label className="block text-sm font-bold text-muted-foreground mb-2">Category Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none" placeholder="e.g. Best In Show" />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Slug (URL identifier)</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none" placeholder="e.g. best-in-show (auto-generated if empty)" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-muted-foreground mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none resize-none" placeholder="Brief details about the rules or criteria of this category..." />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Sort Order</label>
              <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-foreground outline-none">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Banner Image Uploader */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border">
              <label className="block text-sm font-bold text-muted-foreground mb-2">Banner Image</label>
              {uploadingField === 'bannerImage' ? (
                <div className="h-40 flex items-center justify-center bg-background rounded-lg border border-dashed"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
              ) : formData.bannerImage ? (
                <div className="relative h-40 bg-background rounded-lg border overflow-hidden flex items-center justify-center">
                  <OptimizedImage src={getImageUrl(formData.bannerImage)} alt="Banner Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setFormData(p => ({ ...p, bannerImage: '' }))} className="absolute bottom-2 right-2 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition">Remove</button>
                </div>
              ) : (
                <label className="h-40 flex flex-col items-center justify-center bg-background rounded-lg border border-dashed border-border cursor-pointer hover:bg-accent/10 transition">
                  <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground font-semibold">Click to upload banner</span>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'bannerImage')} className="hidden" />
                </label>
              )}
            </div>

            {/* Thumbnail Image Uploader */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border">
              <label className="block text-sm font-bold text-muted-foreground mb-2">Thumbnail Image</label>
              {uploadingField === 'thumbnailImage' ? (
                <div className="h-40 flex items-center justify-center bg-background rounded-lg border border-dashed"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
              ) : formData.thumbnailImage ? (
                <div className="relative h-40 bg-background rounded-lg border overflow-hidden flex items-center justify-center">
                  <OptimizedImage src={getImageUrl(formData.thumbnailImage)} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setFormData(p => ({ ...p, thumbnailImage: '' }))} className="absolute bottom-2 right-2 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition">Remove</button>
                </div>
              ) : (
                <label className="h-40 flex flex-col items-center justify-center bg-background rounded-lg border border-dashed border-border cursor-pointer hover:bg-accent/10 transition">
                  <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground font-semibold">Click to upload thumbnail</span>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnailImage')} className="hidden" />
                </label>
              )}
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}