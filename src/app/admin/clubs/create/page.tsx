'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, ImagePlus, Globe, Shield, User, MapPin, AlignLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminButton } from '@/components/ui/admin-button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import ImageUploader from '@/components/shared/ImageUploader';

export default function RegisterClubForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    clubType: 'All Breeds',
    registrationNumber: '',
    president: '',
    secretary: '',
    email: '',
    password: 'ClubWelcome@123',
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
    displayOrder: 999,
    logoUrl: '',
    logoThumbnailUrl: ''
  });

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
      const res = await api.post('/clubs', formData);
      if (res.success) {
        toast.success('Club registered successfully');
        router.push('/admin/clubs');
      } else {
        toast.error(res.message || 'Failed to register club');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'An error occurred during submission');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Register New Club</h1>
            <p className="text-muted-foreground text-sm mt-1">Add a new kennel club or regional chapter and auto-create login credentials.</p>
          </div>
        </div>
        <AdminButton onClick={handleSubmit} loading={loading} variant="primary" leftIcon={loading ? undefined : <Save className="w-4 h-4" />}>
          Save Club
        </AdminButton>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Club Logo Uploader */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl flex flex-col items-center justify-center xl:col-span-1">
            <ImageUploader
              currentImage={formData.logoUrl}
              onUploadSuccess={(url, payload) => setFormData(prev => ({ 
                ...prev, 
                logoUrl: url,
                logoThumbnailUrl: payload?.thumbnailUrl || url 
              }))}
              onRemove={() => setFormData(prev => ({ 
                ...prev, 
                logoUrl: '',
                logoThumbnailUrl: '' 
              }))}
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
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="E.g. Kennel Club of India" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Club Type *</label>
                <select required name="clubType" value={formData.clubType} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm cursor-pointer">
                  <option value="All Breeds">All Breeds</option>
                  <option value="Specialty">Specialty</option>
                  <option value="Kennel">Kennel</option>
                  <option value="State">State</option>
                  <option value="Breed Club">Breed Club</option>
                  <option value="Regional Club">Regional Club</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Registration Number</label>
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} placeholder="E.g. KCI-REG-8472" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Display Order</label>
                <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleInputChange} placeholder="E.g. 1" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">President Name</label>
                <input type="text" name="president" value={formData.president} onChange={handleInputChange} placeholder="E.g. Dr. A. K. Bose" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Secretary Name</label>
                <input type="text" name="secretary" value={formData.secretary} onChange={handleInputChange} placeholder="E.g. Mr. Rajiv Sharma" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Contact Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="E.g. info@kennelclub.org" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">System Login Password</label>
                <input required type="text" name="password" value={formData.password} onChange={handleInputChange} placeholder="E.g. SecurePass123" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">This credentials will be auto-created for the club admin login.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="E.g. +9122847294" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Website URL</label>
                <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://example.com" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
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
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="E.g. 84, Park Avenue Road" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="E.g. Chennai" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="E.g. Tamil Nadu" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Country</label>
                  <input type="text" name="country" value={formData.country} onChange={handleInputChange} placeholder="E.g. India" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
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
                    <input type="url" name="facebook" value={formData.facebook} onChange={handleInputChange} placeholder="https://facebook.com/club" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Instagram Handle URL</label>
                    <input type="url" name="instagram" value={formData.instagram} onChange={handleInputChange} placeholder="https://instagram.com/club" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description / History</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={6} placeholder="Provide details about the club, its mission, events history, associated branches..." className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm leading-relaxed" />
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
              <p className="font-bold flex items-center gap-1.5"><Info className="w-4 h-4" /> Credentials notice</p>
              <p>Clubs registered here will have their system login profiles generated immediately. The president/secretary can log in to post event updates, view registrations, and manage results.</p>
            </div>
          </form>
    </div>
  );
}
