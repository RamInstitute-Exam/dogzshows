'use client';

import React, { useState } from 'react';
import { Save, ArrowLeft, Loader2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminButton } from '@/components/ui/admin-button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function AddPhotoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    breed: '',
    photographer: '',
    location: '',
    tags: '',
    altText: '',
    seoTitle: '',
    seoDescription: '',
    featured: false,
    status: 'ACTIVE',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select an image file to upload.');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const payload = new FormData();
      payload.append('file', file);
      
      // Append all other fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          payload.append(key, value.toString());
        }
      });

      // We upload to our newly created endpoint
      const res = await api.get(`/media/photos`);
      
      const data = res;
      if (res.ok) {
        router.push('/admin/media/photos');
      } else {
        alert(data.error || data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl sticky top-24 z-40">
        <div className="flex items-center gap-4">
          <Link href="/admin/media/photos">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Upload New Photo</h1>
            <p className="text-muted-foreground text-sm mt-1">Direct upload to AWS S3 with metadata indexing.</p>
          </div>
        </div>
        <AdminButton onClick={handleSubmit} loading={loading} variant="primary" leftIcon={<Save className="w-4 h-4" />}>
          Upload to S3
        </AdminButton>
      </div>

      <form onSubmit={handleSubmit} className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-4">
        
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl  bg-muted/50 transition-colors hover:bg-muted relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          />
          {preview ? (
            <div className="w-full max-w-md aspect-video relative rounded-lg overflow-hidden border border-border shadow-md">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="text-center">
              <ImagePlus className="w-12 h-12 text-muted-foreground  mb-4" />
              <p className="text-foreground font-medium text-lg">Click or Drag & Drop to upload</p>
              <p className="text-muted-foreground text-sm mt-2">Supports JPG, PNG, WEBP</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Title *</label>
            <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Slug (Optional)</label>
            <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-border" />
          </div>
          <div className="md:col-span-2 2xl:col-span-3">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Photographer Name</label>
            <input type="text" name="photographer" value={formData.photographer} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Breed</label>
            <input type="text" name="breed" value={formData.breed} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Tags (JSON or comma separated)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-border" />
          </div>
        </div>

        <div className="border-t border-border pt-6 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">SEO Title</label>
            <input type="text" name="seoTitle" value={formData.seoTitle} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Alt Text</label>
            <input type="text" name="altText" value={formData.altText} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-border" />
          </div>
          <div className="md:col-span-2 2xl:col-span-3">
            <label className="block text-sm font-medium text-muted-foreground mb-2">SEO Description</label>
            <textarea name="seoDescription" value={formData.seoDescription} onChange={handleInputChange} rows={2} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-border" />
          </div>
        </div>

        <div className="border-t border-border pt-6 flex gap-6">
          <label className="flex items-center gap-3 cursor-pointer p-4 border border-border rounded-xl flex-1 bg-muted/20">
            <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} className="w-5 h-5 rounded" />
            <span className="text-foreground font-medium">Featured Photo</span>
          </label>
          <div className="flex-1">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-border">
              <option value="ACTIVE">Active (Published)</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}
