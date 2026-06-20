'use client';

import React, { useState, useRef } from 'react';
import { Save, ArrowLeft, Loader2, Video as VideoIcon, X, Globe, Sliders, Eye, Info, FileText, Sparkles, MapPin, Tag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminButton } from '@/components/ui/admin-button';
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

  const inputClassName = "w-full px-4 py-3 bg-muted/10 dark:bg-muted/5 border border-border/80 rounded-xl text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 focus:bg-background/90 disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClassName = "block text-sm font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5";
  const cardClassName = "bg-card p-6 rounded-2xl border border-border shadow-lg space-y-6";

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6">
      <div className="flex justify-between items-center bg-card/80 backdrop-blur-md p-6 rounded-2xl border border-border shadow-xl sticky top-20 z-40">
        <div className="flex items-center gap-4">
          <Link href="/admin/media/videos">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Upload New Video</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">Supports large video files up to 2GB via S3 multipart upload.</p>
          </div>
        </div>
        
        {loading ? (
          <Button onClick={cancelUpload} variant="destructive" className="font-bold rounded-xl shadow-md transition-all">
            Cancel Upload
          </Button>
        ) : (
          <AdminButton onClick={handleSubmit} loading={loading} variant="primary" leftIcon={<Save className="w-4 h-4" />}>
            Upload to S3
          </AdminButton>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left main content (Upload + Meta) */}
        <div className="lg:col-span-8 space-y-6">
          {loading && (
            <div className="bg-card p-6 rounded-2xl border border-border shadow-lg space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-foreground">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                  Uploading video to AWS S3...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden relative">
                <div 
                  className="bg-red-500 h-3 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">Please do not close this tab or navigate away until the upload is completed.</p>
            </div>
          )}

          {/* Card 1: Upload Zone */}
          <div className={cardClassName}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-red-500" />
                Video File
              </h2>
              <span className="text-xs text-muted-foreground font-medium">MP4, MOV, WEBM</span>
            </div>
            
            <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-border/80 hover:border-red-500/50 rounded-2xl p-6 bg-muted/20 dark:bg-muted/5 transition-all duration-300 min-h-[260px]">
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleFileChange} 
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
              />
              {preview ? (
                <div className="relative w-full max-w-lg aspect-video rounded-xl overflow-hidden border border-border shadow-lg group-hover:shadow-red-500/5 transition-all duration-300 bg-black flex items-center justify-center">
                  <video src={preview} controls className="w-full h-full object-contain" />
                  {!loading && (
                    <div className="absolute top-3 right-3 z-20">
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFile(null);
                          setPreview(null);
                        }}
                        className="bg-red-500 text-white p-2.5 rounded-lg hover:bg-red-600 transition-colors shadow-md cursor-pointer z-30"
                        title="Remove video"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center pointer-events-none transition-transform duration-300 group-hover:scale-102">
                  <div className="inline-flex p-4 bg-muted/80 dark:bg-muted/20 rounded-2xl mb-4 group-hover:bg-red-500/10 group-hover:text-red-500 transition-all duration-300">
                    <VideoIcon className="w-10 h-10 text-muted-foreground group-hover:text-red-500 transition-colors" />
                  </div>
                  <p className="text-foreground font-semibold text-lg group-hover:text-red-500 transition-colors">Click or Drag & Drop to upload Video</p>
                  <p className="text-muted-foreground text-sm mt-1">Supports MP4, MOV, WEBM (Max 2GB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Basic Metadata */}
          <div className={cardClassName}>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClassName}>
                  Video Title <span className="text-red-500">*</span>
                </label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} disabled={loading} className={inputClassName} placeholder="e.g. Madras Canine Club Championship Highlights" />
              </div>
              <div>
                <label className={labelClassName}>
                  Slug (Optional)
                </label>
                <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} disabled={loading} className={inputClassName} placeholder="auto-generated-if-blank" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>
                  Description
                </label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} disabled={loading} rows={4} className={inputClassName} placeholder="Write details about the show classes, entries, or special moments captured in this video..." />
              </div>
            </div>
          </div>
        </div>

        {/* Right side options */}
        <div className="lg:col-span-4 space-y-6">
          {/* Details / Tags */}
          <div className={cardClassName}>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sliders className="w-5 h-5 text-red-500" />
              Details & Classifications
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClassName}>
                  <Clock className="w-4 h-4 text-muted-foreground" /> Duration
                </label>
                <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} disabled={loading} className={inputClassName} placeholder="e.g. 12:05" />
              </div>
              <div>
                <label className={labelClassName}>
                  <Sparkles className="w-4 h-4 text-muted-foreground" /> Breed
                </label>
                <input type="text" name="breed" value={formData.breed} onChange={handleInputChange} disabled={loading} className={inputClassName} placeholder="e.g. Doberman" />
              </div>
              <div>
                <label className={labelClassName}>
                  <MapPin className="w-4 h-4 text-muted-foreground" /> Location
                </label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} disabled={loading} className={inputClassName} placeholder="e.g. Chennai, Tamil Nadu" />
              </div>
              <div>
                <label className={labelClassName}>
                  <Tag className="w-4 h-4 text-muted-foreground" /> Tags (Comma separated)
                </label>
                <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} disabled={loading} className={inputClassName} placeholder="championship, highlights, 2026" />
              </div>
            </div>
          </div>

          {/* Visibility / Status */}
          <div className={cardClassName}>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-red-500" />
              Publishing Options
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClassName}>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} disabled={loading} className={inputClassName}>
                  <option value="ACTIVE">Active (Published)</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer p-4 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} disabled={loading} className="mt-1 w-5 h-5 rounded border-border text-red-500 focus:ring-red-500/20 accent-red-500 disabled:opacity-50" />
                  <div>
                    <span className="text-foreground font-semibold block text-sm">Featured Video</span>
                    <span className="text-muted-foreground text-xs block mt-0.5">Feature this video on homepage lists or special video grids.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Helpful Tips Card */}
          <div className="bg-muted/30 p-6 rounded-2xl border border-border/80 space-y-3">
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Video Guidelines</h3>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
              <li>Supports video formats up to 2GB.</li>
              <li>Wait for progress indicator to finish before leaving page.</li>
              <li>Duration should be formatted as minutes:seconds (e.g. 05:30).</li>
              <li>Featured videos show in top-level highlights lists.</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
