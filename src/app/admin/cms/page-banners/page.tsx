'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AdminButton } from '@/components/ui/admin-button';
import { Plus, Edit, Trash2, LayoutTemplate, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import api from '@/services/api';
import Spinner from '@/components/common/loader/Spinner';
import OptimizedImage from '@/components/shared/OptimizedImage';

interface PageBanner {
  id: string;
  pageSlug: string;
  title: string;
  subtitle?: string;
  bannerImage: string;
  breadcrumbTitle?: string;
  isActive: boolean;
  displayOrder: number;
}

export default function PageBannersCMS() {
  const [banners, setBanners] = useState<PageBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Partial<PageBanner> | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get(`/page-banners`);
      const data = res;
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error) {
      console.error('Error fetching page banners:', error);
      toast.error('Failed to load page banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBanner?.title || !currentBanner?.bannerImage || !currentBanner?.pageSlug) {
      toast.error('Page Slug, Title and Banner Image are required');
      return;
    }

    // Normalize slug to always have a leading slash
    const normalizedSlug = currentBanner.pageSlug.startsWith('/')
      ? currentBanner.pageSlug
      : `/${currentBanner.pageSlug}`;
    const bannerPayload = { ...currentBanner, pageSlug: normalizedSlug };

    try {
      const isEdit = !!currentBanner.id;
      const url = isEdit 
        ? `${config.apiUrl}/page-banners/${currentBanner.id}`
        : `${config.apiUrl}/page-banners`;
      
      const payload = {
        ...bannerPayload,
        displayOrder: currentBanner.displayOrder || 0,
      };

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Banner ${isEdit ? 'updated' : 'created'} successfully`);
        setIsModalOpen(false);
        fetchBanners();
      } else {
        // If duplicate slug on create, find and switch to edit mode
        if (!isEdit && data.message?.includes('already exists')) {
          const existingBanner = banners.find(
            b => b.pageSlug === normalizedSlug || b.pageSlug === currentBanner.pageSlug
          );
          if (existingBanner) {
            toast.info(`Banner for "${normalizedSlug}" already exists. Switched to edit mode.`);
            setCurrentBanner(existingBanner);
          } else {
            toast.error(data.message || 'A banner with this slug already exists.');
          }
        } else {
          toast.error(data.message || 'Failed to save banner');
        }
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('An error occurred while saving');
    }
  };


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
      if (res.success || res.url) {
        setCurrentBanner(prev => ({ ...prev, bannerImage: res.url || res.data?.url || '' }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error(res.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      const res = await api.delete(`/page-banners/${id}`);
      const data = res;
      if (data.success) {
        toast.success('Banner deleted');
        fetchBanners();
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  return (
    <div className="w-full space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <LayoutTemplate className="w-8 h-8 text-foreground" />
                Page Banners
              </h1>
              <p className="text-muted-foreground">Manage header banners for internal directory pages.</p>
            </div>
            <Button 
              onClick={() => { 
                setCurrentBanner({ 
                  isActive: true, 
                  displayOrder: banners.length 
                }); 
                setIsModalOpen(true); 
              }}
              className="admin-btn admin-btn-primary admin-btn-md"
            >
              <Plus className="w-4 h-4 mr-2" /> Add New Banner
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-card border-b border-border">
                <tr>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Page Slug</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Image</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Title</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {loading ? (
                  <tr><td colSpan={5} className="p-4 text-center"><Spinner size="sm" /></td></tr>
                ) : banners.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No page banners found</td></tr>
                ) : (
                  banners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-input transition-colors">
                      <td className="p-4 font-mono text-sm text-[#38BDF8]">
                        {banner.pageSlug.startsWith('/') ? banner.pageSlug : `/${banner.pageSlug}`}
                      </td>
                      <td className="p-4">
                        <OptimizedImage src={banner.bannerImage} alt={banner.title} className="w-32 h-16 object-cover rounded-md border border-border" />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-foreground">{banner.title}</div>
                        <div className="text-xs text-muted-foreground">{banner.breadcrumbTitle}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${banner.isActive ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                          {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2 justify-end items-center h-full">
                        <Button variant="ghost" size="icon" onClick={() => { setCurrentBanner(banner); setIsModalOpen(true); }} className="hover:text-foreground mt-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)} className="hover:text-red-500 mt-2">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-2xl w-full max-w-2xl border border-border p-6 shadow-2xl my-8"
              >
                <h2 className="text-xl font-bold text-foreground mb-6">{currentBanner?.id ? 'Edit Page Banner' : 'Add New Page Banner'}</h2>
                
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-1">Page Slug *</label>
                      <input 
                        type="text" 
                        value={currentBanner?.pageSlug || ''} 
                        onChange={e => setCurrentBanner({...currentBanner, pageSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-\/]/g, '')})}
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground font-mono text-sm"
                        placeholder="events"
                        required
                      />
                      <p className="text-xs mt-1 text-muted-foreground">The exact URL path (e.g., 'gallery' or 'events')</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-1">Title *</label>
                      <input 
                        type="text" 
                        value={currentBanner?.title || ''} 
                        onChange={e => setCurrentBanner({...currentBanner, title: e.target.value})}
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground"
                        placeholder="Upcoming Events"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Banner Image *</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 hover:bg-muted/10 transition-colors relative min-h-[120px]">
                      {uploading ? (
                        <Spinner size="md" className="py-4" />
                      ) : currentBanner?.bannerImage ? (
                        <div className="w-full flex flex-col items-center gap-3">
                          <OptimizedImage 
                            src={currentBanner.bannerImage.startsWith('http') || currentBanner.bannerImage.startsWith('/') ? currentBanner.bannerImage : config.apiUrl.replace('/api/v1', '') + currentBanner.bannerImage} 
                            alt="Uploaded Banner" 
                            className="h-24 w-auto object-cover rounded-lg border border-border"
                          />
                          <div className="flex gap-2 items-center">
                            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{currentBanner.bannerImage}</span>
                            <button 
                              type="button" 
                              onClick={() => setCurrentBanner(prev => ({ ...prev, bannerImage: '' }))}
                              className="text-red-500 hover:underline text-[10px] font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                          <UploadCloud className="w-8 h-8 text-muted-foreground/60 mb-2" />
                          <span className="text-xs font-semibold text-foreground hover:underline">Click to upload Image</span>
                          <span className="text-[10px] text-muted-foreground mt-1">PNG, JPG or WEBP</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden" 
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-1">Subtitle</label>
                      <input 
                        type="text" 
                        value={currentBanner?.subtitle || ''} 
                        onChange={e => setCurrentBanner({...currentBanner, subtitle: e.target.value})}
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-1">Breadcrumb Title</label>
                      <input 
                        type="text" 
                        value={currentBanner?.breadcrumbTitle || ''} 
                        onChange={e => setCurrentBanner({...currentBanner, breadcrumbTitle: e.target.value})}
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={currentBanner?.isActive ?? true} 
                      onChange={e => setCurrentBanner({...currentBanner, isActive: e.target.checked})}
                      className="w-4 h-4 accent-foreground"
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-muted-foreground">Active on site</label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-border hover:bg-input">
                      Cancel
                    </Button>
                    <AdminButton type="submit" variant="primary">
                      Save
                    </AdminButton>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      
  );
}
