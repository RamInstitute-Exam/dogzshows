'use client';

import React, { useState } from 'react';
import { Save, ArrowLeft, Loader2, ImagePlus, X, Globe, Sliders, Eye, Info, FileText, Sparkles, MapPin, Tag } from 'lucide-react';
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

  const inputClassName = "w-full px-4 py-3 bg-muted/10 dark:bg-muted/5 border border-border/80 rounded-xl text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 focus:bg-background/90 disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClassName = "block text-sm font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5";
  const cardClassName = "bg-card p-6 rounded-2xl border border-border shadow-lg space-y-6";

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6">
      <div className="flex justify-between items-center bg-card/80 backdrop-blur-md p-6 rounded-2xl border border-border shadow-xl sticky top-20 z-40">
        <div className="flex items-center gap-4">
          <Link href="/admin/media/photos">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Upload New Photo</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">Direct upload to AWS S3 with metadata indexing.</p>
          </div>
        </div>
        <AdminButton onClick={handleSubmit} loading={loading} variant="primary" leftIcon={<Save className="w-4 h-4" />}>
          Upload to S3
        </AdminButton>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left main content (Upload + Meta) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Upload Zone */}
          <div className={cardClassName}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-red-500" />
                Image File
              </h2>
              <span className="text-xs text-muted-foreground font-medium">JPG, PNG, WEBP</span>
            </div>
            
            <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-border/80 hover:border-red-500/50 rounded-2xl p-6 bg-muted/20 dark:bg-muted/5 transition-all duration-300 min-h-[260px]">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              {preview ? (
                <div className="relative w-full max-w-lg aspect-video rounded-xl overflow-hidden border border-border shadow-lg group-hover:shadow-red-500/5 transition-all duration-300 bg-black/5 flex items-center justify-center">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                    <span className="bg-white/95 text-black dark:bg-black/95 dark:text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md flex items-center gap-2 cursor-pointer">
                      <ImagePlus className="w-4 h-4 text-red-500" />
                      Change Image
                    </span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFile(null);
                        setPreview(null);
                      }}
                      className="bg-red-500 text-white p-2.5 rounded-lg hover:bg-red-600 transition-colors shadow-md z-35 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center pointer-events-none transition-transform duration-300 group-hover:scale-102">
                  <div className="inline-flex p-4 bg-muted/80 dark:bg-muted/20 rounded-2xl mb-4 group-hover:bg-red-500/10 group-hover:text-red-500 transition-all duration-300">
                    <ImagePlus className="w-10 h-10 text-muted-foreground group-hover:text-red-500 transition-colors" />
                  </div>
                  <p className="text-foreground font-semibold text-lg group-hover:text-red-500 transition-colors">Click or Drag & Drop to upload</p>
                  <p className="text-muted-foreground text-sm mt-1">Supports JPG, PNG, WEBP (Max 10MB)</p>
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
                  Title <span className="text-red-500">*</span>
                </label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className={inputClassName} placeholder="e.g. Covai Manchester Kennel Club Winner" />
              </div>
              <div>
                <label className={labelClassName}>
                  Slug (Optional)
                </label>
                <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className={inputClassName} placeholder="auto-generated-if-blank" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>
                  Description
                </label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className={inputClassName} placeholder="Write a description detailing the dog, owner, show details, etc..." />
              </div>
            </div>
          </div>

          {/* Card 3: SEO Settings */}
          <div className={cardClassName}>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5 text-red-500" />
              Search Engine Optimization (SEO)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClassName}>
                  Alt Text
                </label>
                <input type="text" name="altText" value={formData.altText} onChange={handleInputChange} className={inputClassName} placeholder="Image accessibility description" />
              </div>
              <div>
                <label className={labelClassName}>
                  SEO Title
                </label>
                <input type="text" name="seoTitle" value={formData.seoTitle} onChange={handleInputChange} className={inputClassName} placeholder="Meta title for search results" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>
                  SEO Description
                </label>
                <textarea name="seoDescription" value={formData.seoDescription} onChange={handleInputChange} rows={3} className={inputClassName} placeholder="Meta description for search engines" />
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
                  <Info className="w-4 h-4 text-muted-foreground" /> Photographer Name
                </label>
                <input type="text" name="photographer" value={formData.photographer} onChange={handleInputChange} className={inputClassName} placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className={labelClassName}>
                  <Sparkles className="w-4 h-4 text-muted-foreground" /> Breed
                </label>
                <input type="text" name="breed" value={formData.breed} onChange={handleInputChange} className={inputClassName} placeholder="e.g. Golden Retriever" />
              </div>
              <div>
                <label className={labelClassName}>
                  <MapPin className="w-4 h-4 text-muted-foreground" /> Location
                </label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} className={inputClassName} placeholder="e.g. Coimbatore, Tamil Nadu" />
              </div>
              <div>
                <label className={labelClassName}>
                  <Tag className="w-4 h-4 text-muted-foreground" /> Tags (Comma separated)
                </label>
                <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className={inputClassName} placeholder="winner, puppy, champion" />
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
                <select name="status" value={formData.status} onChange={handleInputChange} className={inputClassName}>
                  <option value="ACTIVE">Active (Published)</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer p-4 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} className="mt-1 w-5 h-5 rounded border-border text-red-500 focus:ring-red-500/20 accent-red-500" />
                  <div>
                    <span className="text-foreground font-semibold block text-sm">Featured Photo</span>
                    <span className="text-muted-foreground text-xs block mt-0.5">Feature this photo on homepage lists or special grids.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Helpful Tips Card */}
          <div className="bg-muted/30 p-6 rounded-2xl border border-border/80 space-y-3">
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Upload Checklist</h3>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
              <li>High-resolution image file (up to 10MB).</li>
              <li>Provide descriptive titles for better gallery display.</li>
              <li>Ensure Alt Text matches image contents for web accessibility.</li>
              <li>Featured photos display in premium slideshow panels.</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
