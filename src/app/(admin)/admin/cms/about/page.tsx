'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, X, Save, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api, { getImageUrl } from '@/lib/api';

export default function AboutSectionAdminPage() {
  const [settings, setSettings] = useState<any>({
    sectionLabel: '',
    heading: '',
    description: '',
    primaryBtnText: '',
    primaryBtnLink: '',
    secondaryBtnText: '',
    secondaryBtnLink: '',
    status: 'ACTIVE'
  });
  const [features, setFeatures] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/homepage-about-section/settings');
      if (res.data) {
        setSettings({
          sectionLabel: res.data.sectionLabel || '',
          heading: res.data.heading || '',
          description: res.data.description || '',
          primaryBtnText: res.data.primaryBtnText || '',
          primaryBtnLink: res.data.primaryBtnLink || '',
          secondaryBtnText: res.data.secondaryBtnText || '',
          secondaryBtnLink: res.data.secondaryBtnLink || '',
          status: res.data.status || 'ACTIVE'
        });
        setFeatures(res.data.features || []);
        setImages(res.data.images?.map((img: any) => img.imageUrl) || ['', '', '', '']);
      }
    } catch (error) {
      toast.error('Failed to load About settings data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const payload = {
        ...settings,
        features: features.map((f, i) => ({ ...f, displayOrder: i })),
        images: images.map((url, i) => ({ imageUrl: url, displayOrder: i }))
      };
      const res = await api.put('/homepage-about-section/settings', payload);
      if (res.success) {
        toast.success('About section settings successfully updated!');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Image Upload Handling
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(index);
      const formData = new FormData();
      formData.append('file', files[0]);

      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.url) {
        const newImages = [...images];
        newImages[index] = res.url;
        setImages(newImages);
        toast.success('Image uploaded successfully.');
      } else {
        toast.error('Upload failed: Url missing');
      }
    } catch (error) {
      toast.error('Upload failed.');
    } finally {
      setIsUploading(null);
    }
  };

  const handleDeleteImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = '';
    setImages(newImages);
  };

  // Features List Handlers
  const handleAddFeature = () => {
    const newFeature = {
      title: 'New Feature Name',
      description: 'Feature description details go here.',
      icon: 'Camera',
      displayOrder: features.length
    };
    setFeatures([...features, newFeature]);
  };

  const handleUpdateFeature = (index: number, field: string, value: any) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setFeatures(updatedFeatures);
  };

  const handleDeleteFeature = (index: number) => {
    const updatedFeatures = features.filter((_, idx) => idx !== index);
    setFeatures(updatedFeatures);
  };

  const handleMoveFeature = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === features.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedFeatures = [...features];
    const temp = updatedFeatures[index];
    updatedFeatures[index] = updatedFeatures[targetIndex];
    updatedFeatures[targetIndex] = temp;

    setFeatures(updatedFeatures);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-foreground font-semibold">Loading CMS content...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-foreground">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">About Us CMS</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Redesign and manage the "About JuzDog" branding section and dynamic services grid.
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-brand-orange hover:bg-orange-600 font-bold px-6 py-5 rounded-xl transition-all shadow-lg flex items-center gap-2">
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving Changes...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Form Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* General settings */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-border/50">
              <Sparkles className="w-5 h-5 text-brand-orange" />
              <h2 className="text-xl font-bold">Copywriting & General Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-muted-foreground">Section Label</label>
                <Input 
                  value={settings.sectionLabel} 
                  onChange={(e) => setSettings({ ...settings, sectionLabel: e.target.value })} 
                  placeholder="✨ Professional Coverage" 
                  className="rounded-xl border-border/80 bg-background"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-muted-foreground">Main Heading</label>
                <Input 
                  value={settings.heading} 
                  onChange={(e) => setSettings({ ...settings, heading: e.target.value })} 
                  placeholder="Capture Every Champion Moment." 
                  className="rounded-xl border-border/80 bg-background"
                />
                <p className="text-xs text-muted-foreground italic">Use the word "Champion Moment." to automatically apply the brand gradient color on the Home Page.</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-muted-foreground">Description Copy</label>
                <textarea 
                  value={settings.description} 
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })} 
                  placeholder="Tell your brand story and services summary..." 
                  className="w-full min-h-[120px] rounded-xl border border-border/80 bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Primary CTA Button Text</label>
                <Input 
                  value={settings.primaryBtnText} 
                  onChange={(e) => setSettings({ ...settings, primaryBtnText: e.target.value })} 
                  placeholder="Explore Media Gallery" 
                  className="rounded-xl border-border/80 bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Primary CTA Link</label>
                <Input 
                  value={settings.primaryBtnLink} 
                  onChange={(e) => setSettings({ ...settings, primaryBtnLink: e.target.value })} 
                  placeholder="/gallery" 
                  className="rounded-xl border-border/80 bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Secondary CTA Button Text</label>
                <Input 
                  value={settings.secondaryBtnText} 
                  onChange={(e) => setSettings({ ...settings, secondaryBtnText: e.target.value })} 
                  placeholder="View Upcoming Shows" 
                  className="rounded-xl border-border/80 bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Secondary CTA Link</label>
                <Input 
                  value={settings.secondaryBtnLink} 
                  onChange={(e) => setSettings({ ...settings, secondaryBtnLink: e.target.value })} 
                  placeholder="/events" 
                  className="rounded-xl border-border/80 bg-background"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-muted-foreground">Section Status</label>
                <select 
                  value={settings.status}
                  onChange={(e) => setSettings({ ...settings, status: e.target.value })}
                  className="w-full rounded-xl border border-border/80 bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                >
                  <option value="ACTIVE">Active (Shown on Home Page)</option>
                  <option value="INACTIVE">Inactive (Hidden from Home Page)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features Management */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-orange" />
                <h2 className="text-xl font-bold">Feature Cards Management</h2>
              </div>
              <Button onClick={handleAddFeature} variant="outline" className="border-brand-orange/50 hover:bg-brand-orange/10 text-brand-orange font-bold rounded-xl flex items-center gap-1.5 text-xs">
                <Plus className="w-4 h-4" /> Add Feature
              </Button>
            </div>

            <div className="space-y-4">
              {features.map((feature, idx) => (
                <div key={idx} className="border border-border/60 bg-background/50 rounded-xl p-4 space-y-3 relative group">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs font-bold text-brand-orange bg-brand-orange/15 px-2 py-0.5 rounded-md">
                      Feature #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleMoveFeature(idx, 'up')} 
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleMoveFeature(idx, 'down')} 
                        disabled={idx === features.length - 1}
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteFeature(idx)} 
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Title</label>
                      <Input 
                        value={feature.title} 
                        onChange={(e) => handleUpdateFeature(idx, 'title', e.target.value)} 
                        className="rounded-lg text-sm bg-background border-border/80"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Icon Code</label>
                      <select 
                        value={feature.icon} 
                        onChange={(e) => handleUpdateFeature(idx, 'icon', e.target.value)}
                        className="w-full rounded-lg border border-border/80 bg-background text-foreground px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                      >
                        <option value="Camera">📸 Camera (Photography)</option>
                        <option value="Video">🎥 Video (Videography)</option>
                        <option value="Trophy">🏆 Trophy (Championship)</option>
                        <option value="Radio">📡 Radio (Live Broadcast)</option>
                        <option value="ImageIcon">🐕 ImageIcon (Canine Photoshoot)</option>
                        <option value="Building2">🏛 Building2 (Kennel Club Partner)</option>
                      </select>
                    </div>
                    <div className="space-y-1 md:col-span-3">
                      <label className="text-xs font-semibold text-muted-foreground">Description</label>
                      <textarea 
                        value={feature.description} 
                        onChange={(e) => handleUpdateFeature(idx, 'description', e.target.value)}
                        className="w-full min-h-[60px] rounded-lg border border-border/80 bg-background text-foreground px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {features.length === 0 && (
                <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                  No features added yet. Click "Add Feature" to create one.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Visual Grid (Masonry Images) */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-border/50">
              <ImageIcon className="w-5 h-5 text-brand-orange" />
              <h2 className="text-xl font-bold">Visual Grid Images</h2>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Provide exactly four high-resolution images for the layout masonry grid. If left empty, a placeholder Logo is automatically used.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="border border-border/80 rounded-2xl bg-background overflow-hidden relative flex flex-col justify-between group aspect-[3/4]">
                  {imgUrl ? (
                    <div className="w-full h-full relative">
                      <img 
                        src={getImageUrl(imgUrl)} 
                        alt={`Grid Image ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                        <button 
                          onClick={() => handleDeleteImage(idx)}
                          className="bg-destructive/80 text-white p-2 rounded-xl hover:bg-destructive transition-colors shadow"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-border/80 rounded-2xl m-2">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/50 mb-2" />
                      <span className="text-[10px] text-muted-foreground font-semibold text-center mb-4">Empty Slot {idx + 1}</span>
                      <label className="cursor-pointer bg-accent hover:bg-accent/80 text-foreground text-xs px-3 py-1.5 rounded-lg border border-border font-bold shadow-sm transition-all text-center">
                        <Upload className="w-3.5 h-3.5 inline mr-1" /> 
                        {isUploading === idx ? '...' : 'Upload'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleUploadImage(e, idx)} 
                          className="hidden" 
                          disabled={isUploading !== null}
                        />
                      </label>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-20 shadow">
                    Slot {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
