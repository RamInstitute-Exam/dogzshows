'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, ArrowLeft, Loader2, Info, UploadCloud, FileText, X, Eye, CheckCircle2, User, Home, Dog as DogIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '@/components/common/loader/Spinner';
import OptimizedImage from '@/components/shared/OptimizedImage';

interface DocumentDropzoneProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}

function DocumentDropzone({ label, value, onChange, required }: DocumentDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'entries');

      const response = await api.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response?.success && response?.url) {
        onChange(response.url);
        toast.success(`${label} uploaded successfully!`);
      } else {
        throw new Error(response?.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
      toast.error(`Failed to upload ${label}`);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-bold text-muted-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {value ? (
        <div className="relative border border-border rounded-2xl overflow-hidden bg-card/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{label} Attachment</p>
              <a href={value} target="_blank" rel="noreferrer" className="text-xs text-blue-500 font-semibold hover:underline truncate block">
                View Uploaded File
              </a>
            </div>
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => onChange('')} 
            className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all
            h-[150px] lg:h-[220px]
            ${isDragActive ? 'border-border bg-foreground/5' : 'border-border bg-card/50 hover:bg-card hover:border-border/50'}
            ${error ? 'border-red-500 bg-red-500/5' : ''}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadFile(file);
            }} 
            accept=".jpg,.jpeg,.png,.pdf" 
            className="hidden" 
          />
          
          {isUploading ? (
            <Spinner size="md" className="py-4" />
          ) : (
            <div className="text-center p-6 space-y-2">
              <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto" />
              <div>
                <p className="text-sm font-bold text-foreground">Drag & Drop File Here</p>
                <p className="text-xs text-muted-foreground mt-0.5">or Click to Upload</p>
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Supports JPG, PNG, PDF
              </p>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
    </div>
  );
}

export default function AddEntryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [formData, setFormData] = useState({
    // Entry Profile Details
    dogName: '',
    registrationNumber: '',
    breed: '',
    gender: 'MALE',
    age: '',
    color: '',
    ownerName: '',
    handler: '',
    category: 'Open Class',
    dogShowId: '',
    judgeName: '',
    entryFee: 1500,
    status: 'PENDING',
    description: '',
    
    // Owner Details
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    phone: '',
    email: '',

    // Dog Details
    fatherName: '',
    motherName: '',
    breeder: '',
    microchip: '',
    dob: '',
    titles: '',

    // Upload Documents (URLs)
    pedigreeUrl: '',
    certificateUrl: '',
    vaccinationUrl: '',
    dogPhoto: '',

    // Remarks
    remarks: ''
  });

  const fetchMetadata = async () => {
    try {
      const [eventsRes, catsRes] = await Promise.all([
        api.get('/public/shows?limit=1000'),
        api.get('/entries/categories')
      ]);
      if (eventsRes?.success) setEvents(eventsRes.data || []);
      if (catsRes?.success) setCategories(catsRes.data || []);
    } catch (error) {
      console.error('Failed to load shows metadata', error);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));

    // Clear validation error when field is typed in
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleDocumentChange = (field: string, url: string) => {
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      [field]: url
    }));
  };

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.dogName.trim()) tempErrors.dogName = 'Dog Name is required';
    if (!formData.breed.trim()) tempErrors.breed = 'Breed is required';
    if (!formData.ownerName.trim()) tempErrors.ownerName = 'Owner Name is required';
    if (!formData.dogShowId) tempErrors.dogShowId = 'Dog Show event is required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async (forcedStatus?: string) => {
    if (!validateForm()) {
      toast.error('Please resolve validation errors before saving.');
      return;
    }

    setLoading(true);
    try {
      const documentsArray = [
        { type: 'Pedigree', url: formData.pedigreeUrl },
        { type: 'Certificate', url: formData.certificateUrl },
        { type: 'Vaccination', url: formData.vaccinationUrl }
      ].filter(doc => doc.url);

      const formattedDescription = `
${formData.description || ''}

--- ADDITIONAL DETAILS ---
[Owner Details]
Address: ${formData.address || ''}
City: ${formData.city || ''}, State: ${formData.state || ''}, Country: ${formData.country || ''}, Pincode: ${formData.pincode || ''}
Phone: ${formData.phone || ''}, Email: ${formData.email || ''}

[Dog Details]
Father Name: ${formData.fatherName || ''}
Mother Name: ${formData.motherName || ''}
Breeder: ${formData.breeder || ''}
Microchip: ${formData.microchip || ''}
Date of Birth: ${formData.dob || ''}
Titles: ${formData.titles || ''}

[Remarks]
${formData.remarks || ''}
`.trim();

      const finalStatus = forcedStatus || formData.status;

      const payload = {
        dogName: formData.dogName,
        registrationNumber: formData.registrationNumber || undefined,
        breed: formData.breed,
        gender: formData.gender,
        age: formData.age || undefined,
        color: formData.color || undefined,
        ownerName: formData.ownerName,
        handler: formData.handler || undefined,
        category: formData.category,
        dogShowId: formData.dogShowId,
        judgeName: formData.judgeName || undefined,
        entryFee: Number(formData.entryFee),
        status: finalStatus,
        description: formattedDescription,
        dogPhoto: formData.dogPhoto || undefined,
        documents: documentsArray
      };

      const res = await api.post('/entries', JSON.stringify(payload));
      if (res.success) {
        toast.success('Show entry created successfully!');
        setIsDirty(false);
        router.push('/admin/entries');
      } else {
        toast.error(res.message || 'Failed to create entry');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during creation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  const handleCancel = () => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        return;
      }
    }
    router.push('/admin/entries');
  };

  const selectedShowName = events.find(ev => ev.id === formData.dogShowId)?.name || 'Not selected';

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-4 md:px-5 lg:px-8 py-6 space-y-6 flex-grow">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl">
          <div className="flex items-center gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Manual Show Entry</h1>
              <p className="text-muted-foreground text-sm mt-1">Register a dog entry directly for a dog show.</p>
            </div>
          </div>
        </div>

        {/* Form Grid wrapping everything */}
        <form id="create-entry-form" onSubmit={handleSubmitForm} className="space-y-6">
          
          {/* Card 1: Entry Profile Details */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" /> Entry Profile Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Dog Name *</label>
                <input 
                  required 
                  autoFocus
                  type="text" 
                  name="dogName" 
                  value={formData.dogName} 
                  onChange={handleInputChange} 
                  className={`w-full h-12 rounded-xl border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all ${errors.dogName ? 'border-red-500' : 'border-border'}`} 
                  placeholder="e.g., Majestic Cooper of Kennel" 
                />
                {errors.dogName && <p className="text-xs text-red-500 font-bold mt-1">{errors.dogName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Registration / KCI Number</label>
                <input 
                  type="text" 
                  name="registrationNumber" 
                  value={formData.registrationNumber} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="e.g. KCI-12345/26" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Breed *</label>
                <input 
                  required 
                  type="text" 
                  name="breed" 
                  value={formData.breed} 
                  onChange={handleInputChange} 
                  className={`w-full h-12 rounded-xl border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all ${errors.breed ? 'border-red-500' : 'border-border'}`} 
                  placeholder="e.g., Golden Retriever" 
                />
                {errors.breed && <p className="text-xs text-red-500 font-bold mt-1">{errors.breed}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Gender *</label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Age / Class DOB</label>
                <input 
                  type="text" 
                  name="age" 
                  value={formData.age} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="e.g., 2 Years" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Color</label>
                <input 
                  type="text" 
                  name="color" 
                  value={formData.color} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="e.g. Golden, Fawn" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Owner Name *</label>
                <input 
                  required 
                  type="text" 
                  name="ownerName" 
                  value={formData.ownerName} 
                  onChange={handleInputChange} 
                  className={`w-full h-12 rounded-xl border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all ${errors.ownerName ? 'border-red-500' : 'border-border'}`} 
                  placeholder="e.g., Ramesh Kumar" 
                />
                {errors.ownerName && <p className="text-xs text-red-500 font-bold mt-1">{errors.ownerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Handler Name</label>
                <input 
                  type="text" 
                  name="handler" 
                  value={formData.handler} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="e.g., Self, or Handler Name" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Category / Entry Class *</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all"
                >
                  <option value="Puppy">Puppy</option>
                  <option value="Junior">Junior</option>
                  <option value="Open Class">Open Class</option>
                  <option value="Champion">Champion</option>
                  <option value="Veteran">Veteran</option>
                  <option value="Imported Breed">Imported Breed</option>
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Dog Show Event *</label>
                <select 
                  required 
                  name="dogShowId" 
                  value={formData.dogShowId} 
                  onChange={handleInputChange} 
                  className={`w-full h-12 rounded-xl border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all ${errors.dogShowId ? 'border-red-500' : 'border-border'}`}
                >
                  <option value="">Select Show...</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
                {errors.dogShowId && <p className="text-xs text-red-500 font-bold mt-1">{errors.dogShowId}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Chief Judge Name</label>
                <input 
                  type="text" 
                  name="judgeName" 
                  value={formData.judgeName} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="e.g., Dr. Agnes Allen" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Entry Fee (INR) *</label>
                <input 
                  required 
                  type="number" 
                  name="entryFee" 
                  value={formData.entryFee} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Description takes full-width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-muted-foreground mb-1">Description / Notes</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  className="w-full min-h-[160px] rounded-xl border border-border p-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="General notes regarding class qualification, certificates, etc." 
                />
              </div>

            </div>
          </div>

          {/* Card 2: Owner Details */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-foreground" /> Owner Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-muted-foreground mb-1">Address</label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  className="w-full min-h-[120px] rounded-xl border border-border p-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="Full address of the owner" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="e.g. Chennai" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">State</label>
                <input 
                  type="text" 
                  name="state" 
                  value={formData.state} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="e.g. Tamil Nadu" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Country</label>
                <input 
                  type="text" 
                  name="country" 
                  value={formData.country} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="India" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Pincode</label>
                <input 
                  type="text" 
                  name="pincode" 
                  value={formData.pincode} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="600001" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Phone</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="e.g., +91 98765 43210" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="owner@domain.com" 
                />
              </div>

            </div>
          </div>

          {/* Card 3: Dog Details */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-4 flex items-center gap-2">
              <DogIcon className="w-5 h-5 text-green-500" /> Dog Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Sire / Father Name</label>
                <input 
                  type="text" 
                  name="fatherName" 
                  value={formData.fatherName} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="Father's registered name" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Dam / Mother Name</label>
                <input 
                  type="text" 
                  name="motherName" 
                  value={formData.motherName} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="Mother's registered name" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Breeder Name</label>
                <input 
                  type="text" 
                  name="breeder" 
                  value={formData.breeder} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="Breeder's registered name" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Microchip Number</label>
                <input 
                  type="text" 
                  name="microchip" 
                  value={formData.microchip} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="15-digit Microchip number" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-muted-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Titles / Certifications</label>
                <input 
                  type="text" 
                  name="titles" 
                  value={formData.titles} 
                  onChange={handleInputChange} 
                  className="w-full h-12 rounded-xl border border-border px-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                  placeholder="e.g. IN CH, GRAND CH" 
                />
              </div>

            </div>
          </div>

          {/* Card 4: Upload Documents */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-foreground" /> Upload Documents
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DocumentDropzone 
                label="Pedigree Certificate" 
                value={formData.pedigreeUrl} 
                onChange={(url) => handleDocumentChange('pedigreeUrl', url)} 
              />
              <DocumentDropzone 
                label="KCI Certificate" 
                value={formData.certificateUrl} 
                onChange={(url) => handleDocumentChange('certificateUrl', url)} 
              />
              <DocumentDropzone 
                label="Vaccination Record" 
                value={formData.vaccinationUrl} 
                onChange={(url) => handleDocumentChange('vaccinationUrl', url)} 
              />
              <DocumentDropzone 
                label="Dog Photo" 
                value={formData.dogPhoto} 
                onChange={(url) => handleDocumentChange('dogPhoto', url)} 
              />
            </div>
          </div>

          {/* Card 5: Remarks */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-500" /> Remarks
            </h2>
            <div className="grid grid-cols-1">
              <textarea 
                name="remarks" 
                value={formData.remarks} 
                onChange={handleInputChange} 
                className="w-full min-h-[160px] rounded-xl border border-border p-4 bg-background text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all" 
                placeholder="Write any additional remarks or comments here..." 
              />
            </div>
          </div>

        </form>

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-0 z-30 w-full bg-card/90 backdrop-blur-md border-t border-border p-4 shadow-xl">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="text-sm font-semibold text-muted-foreground">
            {isDirty ? (
              <span className="text-yellow-500 flex items-center gap-1.5">
                ● You have unsaved changes
              </span>
            ) : (
              <span className="text-green-500 flex items-center gap-1.5">
                ✓ All changes saved
              </span>
            )}
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2.5 justify-end items-stretch sm:items-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="border-border text-foreground hover:bg-accent rounded-xl font-bold h-12 px-5"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsPreviewOpen(true)}
              className="border-border text-foreground hover:bg-accent rounded-xl font-bold h-12 px-5"
            >
              <Eye className="w-4 h-4 mr-1.5" /> Preview
            </Button>
            <Button 
              type="button" 
              onClick={() => handleSave('PENDING')} // Saves with PENDING status as draft
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold h-12 px-5"
            >
              Save Draft
            </Button>
            <Button 
              type="submit" 
              form="create-entry-form"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold h-12 px-7 shadow-md"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit Entry
            </Button>
          </div>

        </div>
      </div>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-card max-w-3xl w-full rounded-[24px] border border-border shadow-2xl overflow-hidden flex flex-col text-foreground"
            >
              <div className="flex justify-between items-center p-6 border-b border-border shrink-0 bg-accent/10">
                <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" /> Preview Show Registration
                </h3>
                <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[65vh] space-y-6">
                
                {formData.dogPhoto && (
                  <div className="w-full h-56 rounded-2xl overflow-hidden border border-border bg-accent relative">
                    <OptimizedImage src={formData.dogPhoto} alt="Dog Photo Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Entry & Dog Info</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="block font-bold text-muted-foreground text-xs uppercase">Dog Name</span>
                      <span className="font-bold text-foreground">{formData.dogName || '—'}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-muted-foreground text-xs uppercase">Registration / KCI Number</span>
                      <span className="font-mono text-foreground font-bold">{formData.registrationNumber || '—'}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-muted-foreground text-xs uppercase">Breed / Gender</span>
                      <span className="font-bold text-foreground">{formData.breed || '—'} ({formData.gender})</span>
                    </div>
                    <div>
                      <span className="block font-bold text-muted-foreground text-xs uppercase">Age / DOB</span>
                      <span className="font-semibold text-foreground">{formData.age || '—'} {formData.dob && `(${formData.dob})`}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-muted-foreground text-xs uppercase">Class Category</span>
                      <span className="font-bold text-foreground">{formData.category}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-muted-foreground text-xs uppercase">Selected Event</span>
                      <span className="font-bold text-foreground">{selectedShowName}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Owner Contact Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block font-bold text-muted-foreground text-xs uppercase">Owner Name</span>
                      <span className="font-bold text-foreground">{formData.ownerName || '—'}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-muted-foreground text-xs uppercase">Phone & Email</span>
                      <span className="font-semibold text-foreground">{formData.phone || '—'} / {formData.email || '—'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block font-bold text-muted-foreground text-xs uppercase">Address</span>
                      <span className="font-medium text-foreground">{formData.address || '—'} {formData.city && `, ${formData.city}`} {formData.state && `, ${formData.state}`} {formData.pincode && ` - ${formData.pincode}`}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Files Uploaded</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <span className="block font-bold text-muted-foreground text-[10px] uppercase">Pedigree</span>
                      {formData.pedigreeUrl ? <a href={formData.pedigreeUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Attached File</a> : <span className="text-muted-foreground font-normal italic">None</span>}
                    </div>
                    <div>
                      <span className="block font-bold text-muted-foreground text-[10px] uppercase">KCI Certificate</span>
                      {formData.certificateUrl ? <a href={formData.certificateUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Attached File</a> : <span className="text-muted-foreground font-normal italic">None</span>}
                    </div>
                    <div>
                      <span className="block font-bold text-muted-foreground text-[10px] uppercase">Vaccination Record</span>
                      {formData.vaccinationUrl ? <a href={formData.vaccinationUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Attached File</a> : <span className="text-muted-foreground font-normal italic">None</span>}
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-border bg-accent/10 flex justify-end gap-2.5 shrink-0">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close Preview</Button>
                <Button 
                  onClick={() => { setIsPreviewOpen(false); handleSave(); }} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6"
                >
                  Submit Registration
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
