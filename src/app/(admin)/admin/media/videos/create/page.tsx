'use client';

import React, { useState, useRef } from 'react';
import { Save, ArrowLeft, Loader2, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function AddVideoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    breed: '',
    location: '',
    tags: '',
    duration: '',
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
      alert('Please select a video file to upload.');
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
      const token = localStorage.getItem('token');
      const payload = new FormData();
      payload.append('file', file);
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          payload.append(key, value.toString());
        }
      });

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        setLoading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          router.push('/admin/media/videos');
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            alert(data.error || 'Failed to upload video');
          } catch {
            alert('Failed to upload video');
          }
        }
      });

      xhr.addEventListener('error', () => {
        setLoading(false);
        alert('Upload failed due to a network error');
      });

      xhr.open('POST', `${config.apiUrl}/media/videos`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(payload);

    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to initialize upload');
      setLoading(false);
    }
  };

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="   space-y-4">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl sticky top-24 z-40">
        <div className="flex items-center gap-4">
          <Link href="/admin/media/videos">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Upload New Video</h1>
            <p className="text-muted-foreground text-sm mt-1">Supports large video files up to 2GB via S3 multipart upload.</p>
          </div>
        </div>
        
        {loading ? (
          <Button onClick={cancelUpload} variant="destructive" className="font-bold">
            Cancel Upload
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} className="bg-brand-orange hover:bg-orange-600 text-foreground font-bold">
            <Save className="w-4 h-4 mr-2" />
            Upload to S3
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-4">
        
        {loading && (
          <div className="w-full bg-muted rounded-full h-4 mb-4 overflow-hidden relative">
            <div 
              className="bg-brand-orange h-4 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <p className="text-xs absolute inset-0 flex items-center justify-center font-bold mix-blend-difference text-white">
              {uploadProgress}%
            </p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl  bg-muted/50 transition-colors hover:bg-muted relative">
          <input 
            type="file" 
            accept="video/*" 
            onChange={handleFileChange} 
            disabled={loading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
          />
          {preview ? (
            <div className="w-full max-w-md aspect-video relative rounded-lg overflow-hidden border border-border shadow-md bg-black flex items-center justify-center">
              <video src={preview} controls className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="text-center">
              <VideoIcon className="w-12 h-12 text-muted-foreground  mb-4" />
              <p className="text-foreground font-medium text-lg">Click or Drag & Drop to upload Video</p>
              <p className="text-muted-foreground text-sm mt-2">Supports MP4, MOV, WEBM (Max 2GB)</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Video Title *</label>
            <input required type="text" name="title" value={formData.title} onChange={handleInputChange} disabled={loading} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-brand-orange disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Slug (Optional)</label>
            <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} disabled={loading} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-brand-orange disabled:opacity-50" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} disabled={loading} rows={3} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-brand-orange disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Breed</label>
            <input type="text" name="breed" value={formData.breed} onChange={handleInputChange} disabled={loading} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-brand-orange disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleInputChange} disabled={loading} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-brand-orange disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Duration (e.g. 12:05)</label>
            <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} disabled={loading} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-brand-orange disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Tags (JSON or comma separated)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} disabled={loading} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-brand-orange disabled:opacity-50" />
          </div>
        </div>

        <div className="border-t border-border pt-6 flex gap-6">
          <label className="flex items-center gap-3 cursor-pointer p-4 border border-border rounded-xl flex-1 bg-muted/20">
            <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} disabled={loading} className="w-5 h-5 rounded disabled:opacity-50" />
            <span className="text-foreground font-medium">Featured Video</span>
          </label>
          <div className="flex-1">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
            <select name="status" value={formData.status} onChange={handleInputChange} disabled={loading} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground outline-none focus:border-brand-orange disabled:opacity-50">
              <option value="ACTIVE">Active (Published)</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}
