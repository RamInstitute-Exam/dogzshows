'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, ImagePlus, Info, UploadCloud, Loader2 } from 'lucide-react';
import { AdminButton } from '@/components/ui/admin-button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import api, { getImageUrl } from '@/lib/api';
import OptimizedImage from '@/components/shared/OptimizedImage';
import ImageUploader from '@/components/shared/ImageUploader';

export default function EditWinnerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [enableCropping, setEnableCropping] = useState(true);
  const [uploadingWinnerImg, setUploadingWinnerImg] = useState(false);
  const [uploadingGalleryImg, setUploadingGalleryImg] = useState(false);
  
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    categoryId: '',
    eventId: '',
    clubId: '',
    awardTitle: '',
    winningTitle: '',
    dogName: '',
    breed: '',
    ownerName: '',
    breederName: '',
    handlerName: '',
    judgeName: '',
    location: '',
    winnerImage: '',
    imageUrl: '', // fallback duplicate
    galleryImages: [] as string[],
    description: '',
    showDate: '',
    year: new Date().getFullYear(),
    showYear: new Date().getFullYear(), // fallback duplicate
    showOnHomepage: false,
    isFeatured: false,
    displayOrder: 0,
    status: 'PUBLISHED',
  });

  useEffect(() => {
    fetchOptions();
    if (id) {
      fetchWinner();
    } else {
      setInitialLoading(false);
      toast.error('Winner ID not found');
      router.push('/admin/winners');
    }
  }, [id]);

  const fetchOptions = async () => {
    try {
      const [cRes, eRes, catRes] = await Promise.all([
        api.get('/public/clubs?limit=1000'),
        api.get('/public/events?limit=1000'),
        api.get('/public/winner-categories?limit=1000')
      ]);
      if (cRes?.success) setClubs(cRes.data || cRes.items || []);
      if (eRes?.success) setEvents(eRes.data || eRes.events || []);
      if (catRes?.success) setCategories(catRes.data || catRes.items || []);
    } catch (error) {
      console.error('Failed to fetch options', error);
    }
  };

  const fetchWinner = async () => {
    try {
      const res = await api.get(`/winners/${id}`);
      if (res?.success && res.data) {
        const d = res.data;
        let gallery = [];
        try {
          gallery = typeof d.galleryImages === 'string' 
            ? JSON.parse(d.galleryImages) 
            : (Array.isArray(d.galleryImages) ? d.galleryImages : []);
        } catch (e) {
          gallery = [];
        }
        
        setFormData({
          categoryId: d.categoryId || '',
          eventId: d.eventId || '',
          clubId: d.clubId || '',
          awardTitle: d.awardTitle || '',
          winningTitle: d.winningTitle || '',
          dogName: d.dogName || '',
          breed: d.breed || d.breedName || '',
          ownerName: d.ownerName || '',
          breederName: d.breederName || '',
          handlerName: d.handlerName || '',
          judgeName: d.judgeName || '',
          location: d.location || '',
          winnerImage: d.winnerImage || d.imageUrl || '',
          imageUrl: d.imageUrl || d.winnerImage || '',
          galleryImages: gallery,
          description: d.description || '',
          showDate: d.showDate ? new Date(d.showDate).toISOString().split('T')[0] : '',
          year: d.year || d.showYear || new Date().getFullYear(),
          showYear: d.showYear || d.year || new Date().getFullYear(),
          showOnHomepage: d.showOnHomepage || false,
          isFeatured: d.isFeatured || false,
          displayOrder: d.displayOrder || 0,
          status: d.status || 'PUBLISHED',
        });
      } else {
        toast.error('Failed to load winner details');
      }
    } catch (error) {
      toast.error('Failed to load winner');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
        const nextData = { ...prev, [name]: type === 'number' ? Number(value) : value };
        if (name === 'winnerImage') {
          nextData.imageUrl = value; // keep fallback in sync
        }
        if (name === 'year') {
          nextData.showYear = Number(value); // keep fallback in sync
        }
        return nextData;
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!isGallery) {
      const file = files[0];
      const form = new FormData();
      form.append('file', file);
      setUploadingWinnerImg(true);
      try {
        const res = await api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (res.success) {
          setFormData(prev => ({ 
            ...prev, 
            winnerImage: res.url,
            imageUrl: res.url // keep in sync
          }));
          toast.success('Winner Image uploaded successfully');
        } else {
          toast.error('Upload failed');
        }
      } catch (err: any) {
        toast.error('Upload failed');
      } finally {
        setUploadingWinnerImg(false);
      }
    } else {
      const form = new FormData();
      form.append('file', files[0]);
      setUploadingGalleryImg(true);
      try {
        const res = await api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (res.success) {
          setFormData(prev => ({ 
            ...prev, 
            galleryImages: [...prev.galleryImages, res.url] 
          }));
          toast.success('Gallery Image added successfully');
        } else {
          toast.error('Upload failed');
        }
      } catch (err: any) {
        toast.error('Upload failed');
      } finally {
        setUploadingGalleryImg(false);
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Winner Category is required');
      return;
    }
    if (!formData.eventId) {
      toast.error('Event is required');
      return;
    }
    if (!formData.clubId) {
      toast.error('Club is required');
      return;
    }
    if (!formData.awardTitle) {
      toast.error('Award Title is required');
      return;
    }
    if (!formData.winningTitle) {
      toast.error('Winning Title is required');
      return;
    }
    if (!formData.dogName) {
      toast.error('Dog Name is required');
      return;
    }
    if (!formData.year) {
      toast.error('Year is required');
      return;
    }
    if (!formData.winnerImage) {
      toast.error('Winner Image is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        breedName: formData.breed, // duplicate for backend compatibility
        awardCategory: categories.find(c => c.id === formData.categoryId)?.name || '', // sync string category name
        showDate: formData.showDate ? new Date(formData.showDate).toISOString() : undefined,
        year: Number(formData.year),
        showYear: Number(formData.year),
        galleryImages: JSON.stringify(formData.galleryImages)
      };

      const res = await api.put(`/winners/${id}`, payload);
      if (res.success) {
        toast.success('Winner updated successfully!');
        router.push('/admin/winners');
      } else {
        toast.error(res.message || 'Failed to update winner');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'An error occurred during submission');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Top Sticky Bar */}
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl sticky top-4 z-50">
        <div className="flex items-center gap-4">
          <Link href="/admin/winners">
            <button className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl p-2 transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Edit Winner</h1>
            <p className="text-muted-foreground text-sm mt-1">Modify details for the selected champion.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select name="status" value={formData.status} onChange={handleInputChange} className="px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none">
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
          <AdminButton onClick={handleSubmit} loading={loading} variant="primary" leftIcon={loading ? undefined : <Save className="w-4 h-4" />}>
            Save Changes
          </AdminButton>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Nav */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {[
            { id: 'basic', label: 'Winner Details', icon: Info },
            { id: 'media', label: 'Images & Gallery', icon: ImagePlus }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-foreground text-background shadow-lg' 
                    : 'text-muted-foreground hover:bg-card hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Right Form Area */}
        <div className="flex-1 bg-card p-6 rounded-2xl border border-border shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {activeTab === 'basic' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h2 className="text-xl font-bold text-foreground border-b border-border pb-4 font-mono">Winner Details Form</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Winner Category *</label>
                    <select required name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none">
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Gallery Category *</label>
                    <select required name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none">
                      <option value="">Select Gallery Category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Award Title *</label>
                    <input required type="text" name="awardTitle" value={formData.awardTitle} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="e.g. 5TH ALL BREEDS CHAMPIONSHIP SHOW" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Winning Title *</label>
                    <input required type="text" name="winningTitle" value={formData.winningTitle} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="e.g. BEST IN SHOW" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Event / Show *</label>
                    <select required name="eventId" value={formData.eventId} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none">
                      <option value="">Select Event...</option>
                      {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Club Name *</label>
                    <select required name="clubId" value={formData.clubId} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none">
                      <option value="">Select Club...</option>
                      {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Dog Name *</label>
                    <input required type="text" name="dogName" value={formData.dogName} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="e.g. LUZZY OF HIMALAYAS" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Breed</label>
                    <input type="text" name="breed" value={formData.breed} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="e.g. German Shepherd" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Owner Name</label>
                    <input type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="e.g. HEENA" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Breeder Name</label>
                    <input type="text" name="breederName" value={formData.breederName} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="e.g. MR.ACHUTHANANTHAN" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Handler Name</label>
                    <input type="text" name="handlerName" value={formData.handlerName} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="e.g. John Doe" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Judge Name</label>
                    <input type="text" name="judgeName" value={formData.judgeName} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="e.g. Mr. Smith" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="e.g. Chennai" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Show Date</label>
                    <input type="date" name="showDate" value={formData.showDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Year *</label>
                    <input required type="number" name="year" value={formData.year} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Award Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none resize-none" placeholder="Add custom comments or description..." />
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-border flex-wrap">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="showOnHomepage" name="showOnHomepage" checked={formData.showOnHomepage} onChange={handleInputChange} className="w-5 h-5 rounded border-border" />
                    <label htmlFor="showOnHomepage" className="font-bold text-foreground text-sm cursor-pointer">Show On Homepage (Featured Slider)</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="w-5 h-5 rounded border-border" />
                    <label htmlFor="isFeatured" className="font-bold text-foreground text-sm cursor-pointer">Featured Winner</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="block text-sm font-bold text-muted-foreground">Display Order</label>
                    <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleInputChange} className="w-20 px-2 py-1 bg-background border border-border rounded-lg text-foreground outline-none" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'media' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h2 className="text-xl font-bold text-foreground border-b border-border pb-4 font-mono">Winner Media</h2>
                
                {/* Winner Image */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <label className="block text-sm font-bold text-foreground">Winner Image *</label>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Recommended: 1400x1800 (Portrait) or original ratio. Max 50MB.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-muted-foreground cursor-pointer" htmlFor="toggle-crop-edit">
                        Enable Cropping
                      </label>
                      <input 
                        type="checkbox" 
                        id="toggle-crop-edit"
                        checked={enableCropping}
                        onChange={(e) => setEnableCropping(e.target.checked)}
                        className="w-4 h-4 rounded border-border"
                      />
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-border rounded-2xl p-6 bg-background hover:bg-accent/5 transition-colors">
                    <ImageUploader 
                      currentImage={formData.winnerImage ? getImageUrl(formData.winnerImage) : undefined}
                      onUploadSuccess={(url) => setFormData(prev => ({ ...prev, winnerImage: url, imageUrl: url }))}
                      onRemove={() => setFormData(prev => ({ ...prev, winnerImage: '', imageUrl: '' }))}
                      folder="winners"
                      label=""
                      aspectRatio={3/4}
                      maxSizeMB={50}
                      enableCropping={enableCropping}
                      helpText="PNG, JPG, WEBP. Max: 50MB. Recommended ratio: 3:4 (Portrait)"
                      dropzoneClassName="border-none bg-transparent hover:bg-transparent shadow-none"
                    />
                  </div>
                </div>

                {/* Gallery Images */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-muted-foreground">Gallery Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.galleryImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-border group bg-background">
                        <OptimizedImage src={getImageUrl(img)} alt="Gallery preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          Delete
                        </button>
                      </div>
                    ))}
                    
                    {uploadingGalleryImg ? (
                      <div className="aspect-video rounded-xl border border-dashed flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    ) : (
                      <label className="aspect-video rounded-xl border border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-accent/10 transition">
                        <ImagePlus className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground font-semibold">Add to Gallery</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

              </motion.div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
