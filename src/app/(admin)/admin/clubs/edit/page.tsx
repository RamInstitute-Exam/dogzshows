'use client';

import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Loader2, ImagePlus, Globe, Shield, User, MapPin, AlignLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import ImageUploader from '@/components/shared/ImageUploader';
import { Suspense } from 'react';

function EditClubFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clubId = searchParams.get('id') as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    president: '',
    secretary: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    description: '',
    website: '',
    facebook: '',
    instagram: '',
    isActive: true,
    isFeatured: false,
    logoUrl: ''
  });

  useEffect(() => {
    async function loadClubDetails() {
      try {
        const res = await api.get(`/clubs/${clubId}`);
        if (res.success && res.data) {
          const cd = res.data;
          setFormData({
            name: cd.name || '',
            registrationNumber: cd.registrationNumber || '',
            president: cd.president || '',
            secretary: cd.secretary || '',
            email: cd.email || '',
            phone: cd.phone || '',
            address: cd.address || '',
            city: cd.city || '',
            state: cd.state || '',
            country: cd.country || 'India',
            description: cd.description || '',
            website: cd.website || '',
            facebook: cd.facebook || '',
            instagram: cd.instagram || '',
            isActive: cd.isActive === true,
            isFeatured: cd.isFeatured === true,
            logoUrl: cd.logoUrl || ''
          });
        } else {
          toast.error('Failed to load club details');
          router.push('/admin/clubs');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load club details');
        router.push('/admin/clubs');
      } finally {
        setFetching(false);
      }
    }

    if (clubId) {
      loadClubDetails();
    }
  }, [clubId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let finalValue: any = value;
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Club Name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await api.put(`/clubs/${clubId}`, formData);
      if (res.success) {
        toast.success('Club profile updated successfully');
        router.push('/admin/clubs');
      } else {
        toast.error(res.message || 'Failed to update club');
      }
    } catch (error: any) {
      console.error('Update save error:', error);
      toast.error(error.message || 'An error occurred during save');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center  bg-card text-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card px-6 py-4 rounded-2xl border border-border shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/admin/clubs">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Edit Club Details</h1>
            <p className="text-muted-foreground text-sm mt-1">Modify credentials and registry details for {formData.name}.</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-foreground font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/10">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Club Logo Uploader */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl flex flex-col items-center justify-center xl:col-span-1">
            <ImageUploader
              currentImage={formData.logoUrl}
              onUploadSuccess={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))}
              onRemove={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
              folder="clubs"
              label=""
              aspectRatio={1}
              helpText="Square image. Max 10 MB."
              dropzoneClassName="w-[160px] md:w-[180px] lg:w-[220px] aspect-square rounded-[12px] border-2 border-dashed border-blue-500/50 hover:border-blue-500 bg-card/50 hover:bg-card shadow-md p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center mx-auto"
              previewClassName="w-[160px] md:w-[180px] lg:w-[220px] aspect-square rounded-[12px] border-2 border-blue-500 shadow-md overflow-hidden relative group bg-card mx-auto"
              imageClassName="w-full h-full object-cover"
            />
            <h3 className="font-bold text-foreground mt-4 text-lg">Club Crest / Logo</h3>
            <p className="text-xs text-muted-foreground text-center mt-1">This will be the visual identity of the club.</p>
          </div>

          {/* Block 1: Identity & Contact */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl xl:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-4">
              <User className="w-5 h-5 text-blue-500" /> Club Identity & Primary Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Club Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Registration Number</label>
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">President Name</label>
                <input type="text" name="president" value={formData.president} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Secretary Name</label>
                <input type="text" name="secretary" value={formData.secretary} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Contact Email (Read-only)</label>
                <input disabled type="email" name="email" value={formData.email} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-muted-foreground focus:border-blue-500 outline-none transition-all text-sm opacity-70 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div className="md:col-span-2 2xl:col-span-1">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Website URL</label>
                <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
            </div>
          </div>
        </div>

            {/* Block 2: Location Details */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-4">
                <MapPin className="w-5 h-5 text-blue-500" /> Location Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                <div className="md:col-span-2 2xl:col-span-3">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Street Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Country</label>
                  <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
                </div>
              </div>
            </div>

            {/* Block 3: Social & Description */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-4">
                <AlignLeft className="w-5 h-5 text-blue-500" /> Club Background & Social Media
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Facebook Page URL</label>
                    <input type="url" name="facebook" value={formData.facebook} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Instagram Handle URL</label>
                    <input type="url" name="instagram" value={formData.instagram} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description / History</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={6} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm leading-relaxed" />
                </div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-4">
              <h3 className="font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" /> Platform Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-3 bg-accent/20 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Approved / Active</span>
                    <span className="text-[10px] text-muted-foreground">Allows creating show events.</span>
                  </div>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleCheckboxChange('isActive', e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-accent/20 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Featured Club</span>
                    <span className="text-[10px] text-muted-foreground">Promote on homepage slider.</span>
                  </div>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => handleCheckboxChange('isFeatured', e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Action Notice */}
            <div className="p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-xs text-blue-500 space-y-2 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5"><Info className="w-4 h-4" /> Sync notice</p>
              <p>Changes saved here will be synchronized immediately to the database and update on the public website clubs listings.</p>
            </div>
          </form>
    </div>
  );
}

export default function EditClubForm() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center  bg-card text-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    }>
      <EditClubFormContent />
    </Suspense>
  );
}
