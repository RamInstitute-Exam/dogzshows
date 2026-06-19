'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, Plus, Edit2, Trash2, GripVertical, 
  UploadCloud, Check, X, Calendar, Search, RefreshCw, Loader2, ArrowUp, ArrowDown 
} from 'lucide-react';
import { toast } from 'sonner';
import api, { getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { AdminButton } from '@/components/ui/admin-button';
import Spinner from '@/components/common/loader/Spinner';

interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  desktopImage: string;
  mobileImage?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  displayOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  seoAltText?: string | null;
  status?: string | null;
  createdAt: string;
}

export default function BannerManagement() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Partial<HeroBanner> | null>(null);
  
  // Image uploading state
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/banners', { search, page, limit: 20 });
      if (res.success) {
        setBanners(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || res.data.length);
      }
    } catch (error: any) {
      console.error('Failed to fetch banners:', error);
      toast.error(error.response?.data?.message || 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [page, search]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    if (type === 'desktop') setUploadingDesktop(true);
    else setUploadingMobile(true);

    try {
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        setCurrentBanner(prev => ({
          ...prev,
          [type === 'desktop' ? 'desktopImage' : 'mobileImage']: res.url
        }));
        toast.success(`${type === 'desktop' ? 'Desktop' : 'Mobile'} image uploaded successfully`);
      } else {
        toast.error('Upload failed');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      if (type === 'desktop') setUploadingDesktop(false);
      else setUploadingMobile(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBanner?.title || !currentBanner?.desktopImage) {
      toast.error('Title and Desktop Image are required');
      return;
    }

    try {
      const isEdit = !!currentBanner.id;
      const url = isEdit ? `/admin/banners/${currentBanner.id}` : '/admin/banners';
      
      const payload = {
        ...currentBanner,
        startDate: currentBanner.startDate ? new Date(currentBanner.startDate).toISOString() : null,
        endDate: currentBanner.endDate ? new Date(currentBanner.endDate).toISOString() : null,
      };

      const res = isEdit ? await api.put(url, payload) : await api.post(url, payload);
      
      if (res.success) {
        toast.success(`Banner ${isEdit ? 'updated' : 'created'} successfully`);
        setIsModalOpen(false);
        fetchBanners();
      } else {
        toast.error(res.message || 'Failed to save banner');
      }
    } catch (error: any) {
      console.error('Error saving banner:', error);
      toast.error(error.response?.data?.message || 'An error occurred while saving');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero banner? This action cannot be undone.')) return;
    try {
      const res = await api.delete(`/admin/banners/${id}`);
      if (res.success) {
        toast.success('Banner deleted successfully');
        fetchBanners();
      } else {
        toast.error(res.message || 'Failed to delete');
      }
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      toast.error(error.response?.data?.message || 'Failed to delete banner');
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Create ghost image workaround if necessary, or just keep it default
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Swap local banners for immediate UI feedback
    const updatedBanners = [...banners];
    const draggedItem = updatedBanners[draggedIndex];
    
    // Remove dragged item from previous position and insert at new position
    updatedBanners.splice(draggedIndex, 1);
    updatedBanners.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setBanners(updatedBanners);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;
    setDraggedIndex(null);

    // Prepare display order payloads (1-indexed based on position in array)
    const updatedOrders = banners.map((banner, index) => ({
      id: banner.id,
      displayOrder: index + 1
    }));

    try {
      // Re-save in database
      const res = await api.post('/admin/banners/reorder', { orders: updatedOrders });
      if (res.success) {
        toast.success('Banners reordered successfully');
        fetchBanners(); // refresh to get consistent display orders
      } else {
        toast.error('Failed to save order');
      }
    } catch (error: any) {
      console.error('Failed to reorder banners:', error);
      toast.error('Failed to save display order');
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= banners.length) return;

    const updatedBanners = [...banners];
    const temp = updatedBanners[index];
    updatedBanners[index] = updatedBanners[nextIndex];
    updatedBanners[nextIndex] = temp;

    setBanners(updatedBanners);

    const updatedOrders = updatedBanners.map((banner, idx) => ({
      id: banner.id,
      displayOrder: idx + 1
    }));

    try {
      const res = await api.post('/admin/banners/reorder', { orders: updatedOrders });
      if (res.success) {
        toast.success('Banners reordered');
        fetchBanners();
      }
    } catch (error) {
      toast.error('Failed to save order');
    }
  };

  const openCreate = () => {
    setCurrentBanner({
      title: '',
      subtitle: '',
      desktopImage: '',
      mobileImage: '',
      buttonText: '',
      buttonLink: '',
      isActive: true,
      startDate: null,
      endDate: null,
      seoAltText: '',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const openEdit = (banner: HeroBanner) => {
    // Format dates to string format suitable for input fields (YYYY-MM-DDTHH:MM)
    const formatDateTimeLocal = (dateStr: string | null | undefined) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const tzOffset = d.getTimezoneOffset() * 60000; // in milliseconds
      const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
      return localISOTime;
    };

    setCurrentBanner({
      ...banner,
      startDate: banner.startDate ? formatDateTimeLocal(banner.startDate) : null,
      endDate: banner.endDate ? formatDateTimeLocal(banner.endDate) : null,
    });
    setIsModalOpen(true);
  };

  return (
    <div className=" space-y-4 md:space-y-4 bg-background  text-muted-foreground">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-3">
            <ImageIcon className="w-7 h-7 md:w-8 h-8 text-foreground" />
            Hero Banner Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage the homepage center-focused 3D carousel banners, scheduling, and ordering.
          </p>
        </div>
        <AdminButton 
          variant="primary"
          size="md"
          onClick={openCreate}
          leftIcon={<Plus className="w-5 h-5" />}
          className="w-full sm:w-auto"
        >
          Add New Banner
        </AdminButton>
      </div>

      {/* Search Bar & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/45 border border-border p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search banners by title..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border focus:border-border text-foreground rounded-xl outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-6 text-sm text-muted-foreground">
          <span>Total Banners: <strong className="text-foreground">{totalCount}</strong></span>
          <button 
            onClick={fetchBanners}
            className="flex items-center gap-2 hover:text-foreground transition-colors text-xs font-semibold py-2 px-3 border border-border rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card rounded-2xl border border-border overflow-x-auto shadow-sm">
        <table className="w-full text-left min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase w-12 text-center">Drag</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase w-16 text-center">Order</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Previews</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Title & Details</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Scheduling</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-muted-foreground uppercase text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && banners.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-muted-foreground">
                  <Spinner className="py-12" />
                </td>
              </tr>
            ) : banners.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-muted-foreground italic">
                  No banners configured. The homepage will display the default fallback banners.
                </td>
              </tr>
            ) : (
              banners.map((banner, index) => {
                const isDragging = draggedIndex === index;
                const isScheduled = !!banner.startDate || !!banner.endDate;
                
                // Determine if scheduled banner is active right now
                const now = new Date();
                const start = banner.startDate ? new Date(banner.startDate) : null;
                const end = banner.endDate ? new Date(banner.endDate) : null;
                const isCurrent = banner.isActive && 
                  (!start || start <= now) && 
                  (!end || end >= now);

                return (
                  <tr 
                    key={banner.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`hover:bg-muted/15 transition-all duration-150 ${isDragging ? 'opacity-30 bg-muted/40' : ''}`}
                  >
                    {/* Drag Handle */}
                    <td className="p-4 text-center align-middle cursor-grab active:cursor-grabbing">
                      <div className="flex justify-center text-muted-foreground/60 hover:text-foreground transition-colors">
                        <GripVertical className="w-5 h-5" />
                      </div>
                    </td>

                    {/* Order Controls */}
                    <td className="p-4 text-center align-middle font-bold text-foreground">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="flex flex-col">
                          <button 
                            disabled={index === 0} 
                            onClick={() => moveItem(index, 'up')}
                            className="p-1 text-muted-foreground/40 hover:text-foreground disabled:opacity-20 disabled:hover:text-muted-foreground/40"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm">{banner.displayOrder}</span>
                          <button 
                            disabled={index === banners.length - 1} 
                            onClick={() => moveItem(index, 'down')}
                            className="p-1 text-muted-foreground/40 hover:text-foreground disabled:opacity-20 disabled:hover:text-muted-foreground/40"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Image Previews */}
                    <td className="p-4 align-middle">
                      <div className="flex gap-3">
                        <div className="relative">
                          <img 
                            src={getImageUrl(banner.desktopImage)} 
                            alt="Desktop" 
                            className="w-24 h-12 object-cover rounded-lg border border-border/80 shadow-sm"
                          />
                          <span className="absolute bottom-0.5 right-1 bg-black/60 text-[8px] font-bold text-white px-1 py-0.25 rounded">D</span>
                        </div>
                        {banner.mobileImage && (
                          <div className="relative">
                            <img 
                              src={getImageUrl(banner.mobileImage)} 
                              alt="Mobile" 
                              className="w-8 h-12 object-cover rounded-lg border border-border/80 shadow-sm"
                            />
                            <span className="absolute bottom-0.5 right-1 bg-black/60 text-[8px] font-bold text-white px-1 py-0.25 rounded">M</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Text Details */}
                    <td className="p-4 align-middle">
                      <div className="max-w-xs md:max-w-md">
                        <h4 className="font-extrabold text-foreground text-sm md:text-base leading-snug line-clamp-1">{banner.title}</h4>
                        {banner.subtitle && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{banner.subtitle}</p>}
                        {banner.seoAltText && <p className="text-[10px] text-muted-foreground/60 italic mt-0.5">Alt: {banner.seoAltText}</p>}
                        
                        {banner.buttonText && banner.buttonLink && (
                          <div className="flex gap-2 items-center mt-2">
                            <span className="text-[10px] bg-muted border border-border text-foreground px-2 py-0.5 rounded-full font-bold">
                              CTA: {banner.buttonText}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                              {banner.buttonLink}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Scheduling Dates */}
                    <td className="p-4 align-middle text-xs text-muted-foreground">
                      {isScheduled ? (
                        <div className="space-y-1">
                          {banner.startDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground/80" />
                              <span>Start: {new Date(banner.startDate).toLocaleString()}</span>
                            </div>
                          )}
                          {banner.endDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-red-400" />
                              <span>End: {new Date(banner.endDate).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 italic">Always Active</span>
                      )}
                    </td>

                    {/* Display Status */}
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            banner.status === 'ACTIVE' 
                              ? 'bg-green-500/15 text-green-400' 
                              : banner.status === 'DRAFT'
                              ? 'bg-yellow-500/15 text-yellow-400'
                              : 'bg-gray-500/15 text-gray-400'
                          }`}>
                            {banner.status || 'ACTIVE'}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            banner.isActive 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {banner.isActive ? 'On' : 'Off'}
                          </span>
                        </div>
                        {banner.isActive && isScheduled && (
                          <span className={`text-[10px] ${isCurrent ? 'text-green-500 font-medium' : 'text-yellow-500 italic'}`}>
                            {isCurrent ? '● Published' : '○ Scheduled'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEdit(banner)}
                          className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(banner.id)}
                          className="hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Popup */}
      <AnimatePresence>
        {isModalOpen && currentBanner && (
          <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Panel */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card w-full  rounded-2xl border border-border shadow-2xl p-6 md: relative max-h-[90vh] overflow-y-auto z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">
                  {currentBanner.id ? 'Edit Hero Banner' : 'Create Hero Banner'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Banner title / subtitle */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Banner Title *</label>
                    <input 
                      type="text"
                      required
                      value={currentBanner.title || ''}
                      onChange={e => setCurrentBanner(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-border transition-all"
                      placeholder="e.g. Premium Siberian Husky"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Subtitle (Optional)</label>
                    <input 
                      type="text"
                      value={currentBanner.subtitle || ''}
                      onChange={e => setCurrentBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-border transition-all"
                      placeholder="e.g. Explore the Arctic champion dog bloodlines."
                    />
                  </div>
                </div>

                {/* Upload Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Desktop image upload */}
                  <div className="space-y-2">
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground">Desktop Banner Image (1200x500) *</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-4 hover:bg-muted/10 transition-colors relative min-h-[140px]">
                      {uploadingDesktop ? (
                        <Spinner size="md" className="py-4" />
                      ) : currentBanner.desktopImage ? (
                        <div className="w-full flex flex-col items-center gap-3">
                          <img 
                            src={getImageUrl(currentBanner.desktopImage)} 
                            alt="Uploaded Desktop" 
                            className="h-20 w-auto object-cover rounded-lg border border-border"
                          />
                          <div className="flex gap-2">
                            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{currentBanner.desktopImage}</span>
                            <button 
                              type="button" 
                              onClick={() => setCurrentBanner(prev => ({ ...prev, desktopImage: '' }))}
                              className="text-red-500 hover:underline text-[10px] font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                          <UploadCloud className="w-10 h-10 text-muted-foreground/60 mb-2" />
                          <span className="text-xs font-semibold text-foreground hover:underline">Click to upload Desktop Image</span>
                          <span className="text-[10px] text-muted-foreground mt-1">PNG, JPG or WEBP (Max 10MB)</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={e => handleImageUpload(e, 'desktop')}
                            className="hidden" 
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Mobile image upload */}
                  <div className="space-y-2">
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground">Mobile Banner Image (800x600) (Optional)</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-4 hover:bg-muted/10 transition-colors relative min-h-[140px]">
                      {uploadingMobile ? (
                        <Spinner size="md" className="py-4" />
                      ) : currentBanner.mobileImage ? (
                        <div className="w-full flex flex-col items-center gap-3">
                          <img 
                            src={getImageUrl(currentBanner.mobileImage)} 
                            alt="Uploaded Mobile" 
                            className="h-20 w-auto object-cover rounded-lg border border-border"
                          />
                          <div className="flex gap-2">
                            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{currentBanner.mobileImage}</span>
                            <button 
                              type="button" 
                              onClick={() => setCurrentBanner(prev => ({ ...prev, mobileImage: '' }))}
                              className="text-red-500 hover:underline text-[10px] font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                          <UploadCloud className="w-10 h-10 text-muted-foreground/60 mb-2" />
                          <span className="text-xs font-semibold text-foreground hover:underline">Click to upload Mobile Image</span>
                          <span className="text-[10px] text-muted-foreground mt-1">PNG, JPG or WEBP (Max 10MB)</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={e => handleImageUpload(e, 'mobile')}
                            className="hidden" 
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Call to Action details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Button Text (Optional)</label>
                    <input 
                      type="text"
                      value={currentBanner.buttonText || ''}
                      onChange={e => setCurrentBanner(prev => ({ ...prev, buttonText: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-border transition-all"
                      placeholder="e.g. Register Now"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Button URL (Link) (Optional)</label>
                    <input 
                      type="text"
                      value={currentBanner.buttonLink || ''}
                      onChange={e => setCurrentBanner(prev => ({ ...prev, buttonLink: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-border transition-all"
                      placeholder="e.g. /events/championship-2026"
                    />
                  </div>
                </div>

                {/* SEO Alt Text & Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">SEO Alt Text (Optional)</label>
                    <input 
                      type="text"
                      value={currentBanner.seoAltText || ''}
                      onChange={e => setCurrentBanner(prev => ({ ...prev, seoAltText: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-border transition-all"
                      placeholder="e.g. Champion Doberman Pinscher displaying stack pose"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Status *</label>
                    <select
                      value={currentBanner.status || 'ACTIVE'}
                      onChange={e => setCurrentBanner(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-border transition-all"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                {/* Scheduling dates */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Scheduling Start Date (Optional)</label>
                    <input 
                      type="datetime-local"
                      value={currentBanner.startDate || ''}
                      onChange={e => setCurrentBanner(prev => ({ ...prev, startDate: e.target.value || null }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-border transition-all color-scheme-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-muted-foreground mb-1.5">Scheduling End Date (Optional)</label>
                    <input 
                      type="datetime-local"
                      value={currentBanner.endDate || ''}
                      onChange={e => setCurrentBanner(prev => ({ ...prev, endDate: e.target.value || null }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-border transition-all color-scheme-dark"
                    />
                  </div>
                </div>

                {/* Active switch */}
                <div className="flex items-center gap-4 bg-muted/20 border border-border/80 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="isActive"
                      checked={currentBanner.isActive ?? true}
                      onChange={e => setCurrentBanner(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-5 h-5 rounded border-border text-foreground accent-foreground focus:ring-foreground cursor-pointer"
                    />
                    <div>
                      <label htmlFor="isActive" className="text-sm font-bold text-foreground cursor-pointer">Active</label>
                      <p className="text-xs text-muted-foreground">If checked, this banner will be visible on the homepage (within scheduled dates).</p>
                    </div>
                  </div>
                </div>

                {/* Form buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <AdminButton 
                    type="button" 
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </AdminButton>
                  <AdminButton 
                    type="submit" 
                    variant="primary"
                  >
                    Save Banner
                  </AdminButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
