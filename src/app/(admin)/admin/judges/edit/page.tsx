'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Save, ArrowLeft, Loader2, Award, Shield, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import ImageUploader from '@/components/shared/ImageUploader';

function EditJudgeFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const judgeId = searchParams.get('id') as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mobile: '',
    gender: 'MALE',
    address: '',
    zipCode: '',
    city: '',
    state: '',
    country: 'India',
    experience: '',
    bio: '',
    specialization: '',
    certifications: '',
    photoUrl: '',
    status: 'ACTIVE',
    isFeatured: false
  });

  useEffect(() => {
    async function loadJudgeDetails() {
      try {
        const res = await api.get(`/judges/${judgeId}`);
        if (res.success && res.data) {
          const jd = res.data;
          setFormData({
            name: jd.name || '',
            email: jd.email || '',
            phone: jd.phone || '',
            mobile: jd.mobile || '',
            gender: jd.gender || 'MALE',
            address: jd.address || '',
            zipCode: jd.zipcode || jd.zipCode || '',
            city: jd.city || '',
            state: jd.state || '',
            country: jd.country || 'India',
            experience: jd.experience || '',
            bio: jd.bio || '',
            specialization: jd.specialization || '',
            certifications: jd.certifications || '',
            photoUrl: jd.photoUrl || '',
            status: jd.status || 'ACTIVE',
            isFeatured: jd.isFeatured || false
          });
        }
      } catch (err) {
        toast.error('Failed to load judge details');
      } finally {
        setFetching(false);
      }
    }
    
    if (judgeId) {
      loadJudgeDetails();
    }
  }, [judgeId]);

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

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const zip = e.target.value;
    setFormData(prev => ({ ...prev, zipCode: zip }));
    
    if (zip.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${zip}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State,
            country: postOffice.Country
          }));
          toast.success('Location auto-filled based on ZIP Code');
        }
      } catch (err) {
        console.error('ZIP lookup failed', err);
      }
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        experience: formData.experience ? String(formData.experience) : '0'
      };
      const res = await api.put(`/judges/${judgeId}`, payload);
      if (res.success) {
        toast.success('Judge profile updated successfully');
        router.refresh(); // Tells Next.js to refresh current route and clear router cache
        router.push('/admin/judges');
      } else {
        toast.error(res.message || 'Failed to update judge');
      }
    } catch (error: any) {
      console.error('Update submit error:', error);
      toast.error(error.message || 'An error occurred during submission');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card px-6 py-4 rounded-2xl border border-border shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/admin/judges">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full" type="button">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Edit Judge</h1>
            <p className="text-muted-foreground text-sm mt-1">Update profile information and settings.</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading} type="button" className="bg-blue-600 hover:bg-blue-700 text-foreground font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/10">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="space-y-4">
        {/* Profile Image Section */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xl flex flex-col items-center justify-center">
          <ImageUploader
            currentImage={formData.photoUrl}
            onUploadSuccess={(url) => setFormData(prev => ({ ...prev, photoUrl: url }))}
            onRemove={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
            folder="judges"
            label=""
            aspectRatio={4/5}
            helpText="PNG • JPG • WEBP. Max 10 MB."
            dropzoneClassName="w-[160px] md:w-[180px] lg:w-[220px] aspect-[4/5] rounded-[12px] border-2 border-dashed border-yellow-500/50 hover:border-yellow-500 bg-card/50 hover:bg-card shadow-md p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center mx-auto"
            previewClassName="w-[160px] md:w-[180px] lg:w-[220px] aspect-[4/5] rounded-[12px] border-2 border-yellow-500 shadow-md overflow-hidden relative group bg-card mx-auto"
            imageClassName="w-full h-full object-cover"
          />
          <h3 className="font-bold text-foreground mt-4 text-lg">Judge Profile Portrait</h3>
          <p className="text-xs text-muted-foreground text-center mt-1">This will be the visual identity of the judge profile.</p>
        </div>

        {/* Identity & Credentials */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-4">
            <User className="w-5 h-5 text-blue-500" /> Account & Personal Details
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Full Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="E.g. Dr. John Doe" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Address (Optional)</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="E.g. johndoe@gmail.com" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="E.g. +919876543210" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Mobile Number</label>
              <input type="text" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="E.g. 9876543210" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Biography & Experience */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-4">
            <Award className="w-5 h-5 text-blue-500" /> Biography & Professional Experience
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Specialization</label>
                <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="E.g. Golden Retrievers, Toy Breeds" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Years of Judging Experience</label>
                <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} placeholder="E.g. 12" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Certifications / Licenses</label>
              <input type="text" name="certifications" value={formData.certifications} onChange={handleInputChange} placeholder="E.g. FCI License #492, AKC All Breed Certification" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Biography / Summary</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} placeholder="Describe the judge's professional career..." className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm leading-relaxed" />
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-4">
            <MapPin className="w-5 h-5 text-blue-500" /> Location Information
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">ZIP / Postal Code</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleZipChange} placeholder="E.g. 641001" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
              {formData.city && formData.state && (
                <p className="mt-2 flex items-center text-sm font-medium text-blue-500">
                  <MapPin className="w-4 h-4 mr-1" /> {formData.city}, {formData.state}, {formData.country}
                </p>
              )}
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Street Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="E.g. Apartment, Road, Landmark" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="E.g. Mumbai" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="E.g. Maharashtra" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleInputChange} placeholder="E.g. India" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none transition-all text-sm" />
            </div>
          </div>
        </div>

        {/* Platform Settings */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-4">
          <h3 className="font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" /> Platform Configuration
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none text-sm font-semibold">
                <option value="ACTIVE">Active / Approved</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending Approval</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 bg-accent/20 rounded-xl border border-border">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Featured Judge</span>
                <span className="text-xs text-muted-foreground">Highlight on homepage and pages.</span>
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
      </div>
    </div>
  );
}

export default function EditJudgePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <EditJudgeFormContent />
    </Suspense>
  );
}
