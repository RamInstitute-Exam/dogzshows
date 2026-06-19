'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AdminButton } from '@/components/ui/admin-button';
import { Plus, Edit, Trash2, GripVertical, Image as ImageIcon, ExternalLink, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import ImageUploader from '@/components/shared/ImageUploader';
import api from '@/services/api';
import Spinner from '@/components/common/loader/Spinner';

interface HomepageBanner {
  id: string;
  title: string;
  imageUrl: string;
  redirectUrl?: string;
  openNewTab: boolean;
  displayOrder: number;
  status: string;
  startDate?: string;
  endDate?: string;
  bannerMode?: string;
}

export default function HomepageBannersAdmin() {
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Partial<HomepageBanner> | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get(`/homepage-banners`);
      const data = res;
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error) {
      console.error('Error fetching homepage banners:', error);
      toast.error('Failed to load homepage banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBanner?.title || !currentBanner?.imageUrl) {
      toast.error('Title and Banner Image are required');
      return;
    }

    try {
      const isEdit = !!currentBanner.id;
      const url = isEdit
        ? `${config.apiUrl}/homepage-banners/${currentBanner.id}`
        : `${config.apiUrl}/homepage-banners`;

      const payload = {
        ...currentBanner,
        startDate: currentBanner.startDate || null,
        endDate: currentBanner.endDate || null,
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
      if (data?.success) {
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
      const res = await api.delete(`/homepage-banners/${id}`);
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

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newBanners = [...banners];
    const temp = newBanners[index - 1].displayOrder;
    newBanners[index - 1].displayOrder = newBanners[index].displayOrder;
    newBanners[index].displayOrder = temp;

    // Swap in array for immediate UI update
    const item = newBanners[index];
    newBanners.splice(index, 1);
    newBanners.splice(index - 1, 0, item);
    setBanners(newBanners);

    // Save to DB
    await saveOrder(newBanners);
  };

  const moveDown = async (index: number) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    const temp = newBanners[index + 1].displayOrder;
    newBanners[index + 1].displayOrder = newBanners[index].displayOrder;
    newBanners[index].displayOrder = temp;

    // Swap in array for immediate UI update
    const item = newBanners[index];
    newBanners.splice(index, 1);
    newBanners.splice(index + 1, 0, item);
    setBanners(newBanners);

    // Save to DB
    await saveOrder(newBanners);
  };

  const saveOrder = async (orderedBanners: HomepageBanner[]) => {
    try {
      await Promise.all(
        orderedBanners.map(b =>
          fetch(`${config.apiUrl}/homepage-banners/${b.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ displayOrder: b.displayOrder })
          })
        )
      );
    } catch (error) {
      console.error('Failed to save order');
    }
  };

  return (
    <div className=" space-y-4 bg-background  text-muted-foreground">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-foreground" />
            Homepage Banners
          </h1>
          <p className="text-muted-foreground">Manage full-screen hero sliders for the main homepage.</p>
        </div>
        <AdminButton
          variant="primary"
          size="md"
          onClick={() => {
            setCurrentBanner({
              status: 'ACTIVE',
              openNewTab: false,
              displayOrder: banners.length,
              bannerMode: 'cover'
            });
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Banner
        </AdminButton>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-card border-b border-border">
            <tr>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase w-16">Order</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Banner</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Title</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Schedule</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center"><Spinner size="sm" /></td></tr>
            ) : banners.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No banners found</td></tr>
            ) : (
              banners.map((banner, index) => (
                <tr key={banner.id} className="hover:bg-input transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-center">
                      <button onClick={() => moveUp(index)} disabled={index === 0} className="text-gray-500 hover:text-foreground disabled:opacity-30">▲</button>
                      <span className="text-xs">{banner.displayOrder}</span>
                      <button onClick={() => moveDown(index)} disabled={index === banners.length - 1} className="text-gray-500 hover:text-foreground disabled:opacity-30">▼</button>
                    </div>
                  </td>
                  <td className="p-4">
                    <img src={banner.imageUrl} alt={banner.title} className="w-32 h-16 object-cover rounded-md border border-border" />
                  </td>
                  <td className="p-4 font-bold text-foreground">
                    {banner.title}
                    {banner.redirectUrl && (
                      <a href={banner.redirectUrl} target="_blank" rel="noreferrer" className="block text-xs text-[#38BDF8] mt-1 flex items-center gap-1 font-normal hover:underline">
                        <ExternalLink className="w-3 h-3" /> {banner.redirectUrl}
                      </a>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${banner.status === 'ACTIVE' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                      {banner.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {banner.startDate && <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Start: {new Date(banner.startDate).toLocaleDateString()}</div>}
                    {banner.endDate && <div className="flex items-center gap-1 mt-1"><Calendar className="w-3 h-3 text-red-400" /> End: {new Date(banner.endDate).toLocaleDateString()}</div>}
                    {!banner.startDate && !banner.endDate && <span className="text-gray-500 italic">Always show</span>}
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
            className="bg-card rounded-2xl w-full  border border-border p-6 shadow-2xl my-8"
          >
            <h2 className="text-xl font-bold text-foreground mb-6">{currentBanner?.id ? 'Edit Banner' : 'Add New Banner'}</h2>

            <form onSubmit={handleSave} className="space-y-5">

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Banner Title (Internal) *</label>
                <input
                  type="text"
                  value={currentBanner?.title || ''}
                  onChange={e => setCurrentBanner({ ...currentBanner, title: e.target.value })}
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground"
                  placeholder="e.g. Summer Championship Promo"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <ImageUploader
                    currentImage={currentBanner?.imageUrl}
                    onUploadSuccess={(url) => setCurrentBanner({ ...currentBanner, imageUrl: url })}
                    onRemove={() => setCurrentBanner({ ...currentBanner, imageUrl: '' })}
                    folder="cms-banners"
                    label="Banner Image (1920x1080 or 2400x1350) *"
                    aspectRatio={1920 / 1080}
                    helpText="Max 10 MB. This single image will adapt responsively to Desktop, Tablet, and Mobile views."
                    highResolution={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">Redirect URL</label>
                  <input
                    type="text"
                    value={currentBanner?.redirectUrl || ''}
                    onChange={e => setCurrentBanner({ ...currentBanner, redirectUrl: e.target.value })}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground"
                    placeholder="https://example.com/promo"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="openNewTab"
                    checked={currentBanner?.openNewTab ?? false}
                    onChange={e => setCurrentBanner({ ...currentBanner, openNewTab: e.target.checked })}
                    className="w-4 h-4 accent-foreground"
                  />
                  <label htmlFor="openNewTab" className="text-sm font-bold text-muted-foreground">Open link in new tab</label>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">Start Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={currentBanner?.startDate ? new Date(currentBanner.startDate).toISOString().slice(0, 16) : ''}
                    onChange={e => setCurrentBanner({ ...currentBanner, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground color-scheme-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">End Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={currentBanner?.endDate ? new Date(currentBanner.endDate).toISOString().slice(0, 16) : ''}
                    onChange={e => setCurrentBanner({ ...currentBanner, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground color-scheme-dark"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-sm font-bold text-muted-foreground">Banner Mode *</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="modeCover"
                      name="bannerMode"
                      checked={(currentBanner?.bannerMode || 'cover') === 'cover'}
                      onChange={() => setCurrentBanner({ ...currentBanner, bannerMode: 'cover' })}
                      className="accent-foreground"
                    />
                    <label htmlFor="modeCover" className="text-sm font-bold text-muted-foreground">Cover (fills container, may crop)</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="modeContain"
                      name="bannerMode"
                      checked={currentBanner?.bannerMode === 'contain'}
                      onChange={() => setCurrentBanner({ ...currentBanner, bannerMode: 'contain' })}
                      className="accent-foreground"
                    />
                    <label htmlFor="modeContain" className="text-sm font-bold text-muted-foreground">Contain (fits container, no cropping)</label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="statusActive"
                    name="status"
                    checked={currentBanner?.status === 'ACTIVE'}
                    onChange={() => setCurrentBanner({ ...currentBanner, status: 'ACTIVE' })}
                    className="accent-foreground"
                  />
                  <label htmlFor="statusActive" className="text-sm font-bold text-muted-foreground">Active</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="statusInactive"
                    name="status"
                    checked={currentBanner?.status === 'INACTIVE'}
                    onChange={() => setCurrentBanner({ ...currentBanner, status: 'INACTIVE' })}
                    className="accent-foreground"
                  />
                  <label htmlFor="statusInactive" className="text-sm font-bold text-muted-foreground">Inactive</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <AdminButton type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </AdminButton>
                <AdminButton type="submit" variant="primary">
                  Save Banner
                </AdminButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
