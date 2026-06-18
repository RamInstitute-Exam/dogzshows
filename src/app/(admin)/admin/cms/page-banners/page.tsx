'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, LayoutTemplate } from 'lucide-react';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import api from '@/services/api';

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

    try {
      const isEdit = !!currentBanner.id;
      const url = isEdit 
        ? `${config.apiUrl}/page-banners/${currentBanner.id}`
        : `${config.apiUrl}/page-banners`;
      
      const payload = {
        ...currentBanner,
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
        toast.error(data.message || 'Failed to save banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('An error occurred while saving');
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
                <LayoutTemplate className="w-8 h-8 text-brand-orange" />
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
              className="bg-brand-orange hover:bg-orange-600 text-foreground"
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
                  <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
                ) : banners.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No page banners found</td></tr>
                ) : (
                  banners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-input transition-colors">
                      <td className="p-4 font-mono text-sm text-[#38BDF8]">
                        /{banner.pageSlug}
                      </td>
                      <td className="p-4">
                        <img src={banner.bannerImage} alt={banner.title} className="w-32 h-16 object-cover rounded-md border border-border" />
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
                        <Button variant="ghost" size="icon" onClick={() => { setCurrentBanner(banner); setIsModalOpen(true); }} className="hover:text-brand-orange mt-2">
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
                        onChange={e => setCurrentBanner({...currentBanner, pageSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
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
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Banner Image URL *</label>
                    <input 
                      type="text" 
                      value={currentBanner?.bannerImage || ''} 
                      onChange={e => setCurrentBanner({...currentBanner, bannerImage: e.target.value})}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground"
                      placeholder="/images/events_banner.png"
                      required
                    />
                    {currentBanner?.bannerImage && (
                      <img src={currentBanner.bannerImage} alt="Preview" className="mt-2 h-24 w-full object-cover rounded border border-border" />
                    )}
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
                      className="w-4 h-4 accent-brand-orange"
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-muted-foreground">Active on site</label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-border hover:bg-input">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-brand-orange hover:bg-orange-600 text-foreground">
                      Save Banner
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      
  );
}
