'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, ImagePlus, Dog, FileText, HeartPulse, UserCircle, QrCode, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminButton } from '@/components/ui/admin-button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function AddDogForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [fciGroups, setFciGroups] = useState<{ id: string; name: string; groupNumber: number; }[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [breeds, setBreeds] = useState<{ id: string; name: string; }[]>([]);
  const [breedSearchQuery, setBreedSearchQuery] = useState('');
  const [isBreedDropdownOpen, setIsBreedDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '', kciNumber: '', microchipNumber: '', breedId: '', gender: 'MALE', 
    dob: '', color: '', markings: '', weight: '', height: '',
    isImported: false, countryOfOrigin: '', isChampion: false,
    
    // Bloodline
    sireName: '', damName: '', bloodline: '', breederName: '', kennelName: '',
    
    // Owner
    ownerName: '', ownerEmail: '', ownerPhone: '', ownerCity: '',
    
    // SEO
    slug: '', metaTitle: '', metaDescription: ''
  });

  // Fetch FCI Groups on Mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${config.apiUrl}/fci-groups?all=true`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if(data.success) setFciGroups(data.data || []);
      })
      .catch(() => {});
  }, []);

  // Fetch Breeds dynamically when selectedGroupId changes
  useEffect(() => {
    if (!selectedGroupId) {
      setBreeds([]);
      return;
    }
    const token = localStorage.getItem('token');
    fetch(`${config.apiUrl}/breeds?fciGroupId=${selectedGroupId}&all=true`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if(data.success) setBreeds(data.data || []);
      })
      .catch(() => {});
  }, [selectedGroupId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Format payload to match backend DTO structure
      const payload = {
        name: formData.name,
        kciNumber: formData.kciNumber,
        microchipNumber: formData.microchipNumber,
        breedId: formData.breedId,
        gender: formData.gender,
        dob: formData.dob,
        color: formData.color,
        isImported: formData.isImported,
        countryOfOrigin: formData.countryOfOrigin,
        isChampion: formData.isChampion,
        owner: { name: formData.ownerName, email: formData.ownerEmail, phone: formData.ownerPhone, city: formData.ownerCity },
        breeder: { name: formData.breederName, kennelName: formData.kennelName },
        bloodline: { sire: formData.sireName, dam: formData.damName, line: formData.bloodline }
      };

      const res = await api.post(`/dogs`, payload);
      
      const data = res;
      if (data.success) {
        router.push('/admin/dogs');
      } else {
        alert(data.error || 'Failed to add dog');
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Details', icon: Dog },
    { id: 'bloodline', label: 'Bloodline', icon: FileText },
    { id: 'owner', label: 'Owner Details', icon: UserCircle },
    { id: 'medical', label: 'Medical', icon: HeartPulse },
    { id: 'gallery', label: 'Gallery', icon: ImagePlus },
    { id: 'qr', label: 'QR & SEO', icon: QrCode }
  ];

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6">
          
          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl sticky top-4 z-50">
            <div className="flex items-center gap-4">
              <Link href="/admin/dogs">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Add New Dog Record</h1>
                <p className="text-muted-foreground text-sm mt-1">Complete dog profile, bloodline, medical, and ownership data.</p>
              </div>
            </div>
            <AdminButton onClick={handleSubmit} loading={loading} variant="primary" leftIcon={<Save className="w-4 h-4" />}>
              Save Record
            </AdminButton>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Nav */}
            <div className="w-64 shrink-0 space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-foreground text-foreground shadow-lg' 
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
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {activeTab === 'basic' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Basic Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Dog Name *</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">FCI Group *</label>
                        <select required value={selectedGroupId} onChange={e => {
                          setSelectedGroupId(e.target.value);
                          setFormData(prev => ({ ...prev, breedId: '' }));
                        }} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none">
                          <option value="">Select FCI Group</option>
                          {fciGroups.map(g => (
                            <option key={g.id} value={g.id}>Group {g.groupNumber} - {g.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Breed *</label>
                        <button 
                          type="button"
                          onClick={() => setIsBreedDropdownOpen(!isBreedDropdownOpen)}
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none text-left flex justify-between items-center h-[50px]"
                          disabled={!selectedGroupId}
                        >
                          <span className="truncate">{formData.breedId ? breeds.find(b => b.id === formData.breedId)?.name : (selectedGroupId ? 'Select Breed' : 'Select FCI Group First')}</span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>

                        {isBreedDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto p-2 space-y-2">
                            <input 
                              type="text" 
                              placeholder="Search breed..." 
                              value={breedSearchQuery}
                              onChange={e => setBreedSearchQuery(e.target.value)}
                              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
                              autoFocus
                            />
                            <div className="space-y-1">
                              {breeds.filter(b => b.name.toLowerCase().includes(breedSearchQuery.toLowerCase())).length > 0 ? (
                                breeds.filter(b => b.name.toLowerCase().includes(breedSearchQuery.toLowerCase())).map(b => (
                                  <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, breedId: b.id }));
                                      setIsBreedDropdownOpen(false);
                                      setBreedSearchQuery('');
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-foreground/10 transition-colors ${formData.breedId === b.id ? 'bg-foreground/10 text-foreground font-bold' : 'text-foreground'}`}
                                  >
                                    {b.name}
                                  </button>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground text-center py-2">No breeds found</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">KCI Number</label>
                        <input type="text" name="kciNumber" value={formData.kciNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Microchip Number</label>
                        <input type="text" name="microchipNumber" value={formData.microchipNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none appearance-none">
                          <option value="MALE">Male (Dog)</option>
                          <option value="FEMALE">Female (Bitch)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Date of Birth</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Colour & Markings</label>
                        <input type="text" name="color" value={formData.color} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div className="md:col-span-2 2xl:col-span-3 flex gap-4 items-end mt-4">
                        <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg bg-card w-full">
                          <input type="checkbox" name="isImported" checked={formData.isImported} onChange={handleInputChange} className="w-5 h-5 rounded bg-accent border-none text-foreground focus:ring-foreground" />
                          <span className="text-foreground font-medium">Is Imported?</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-3 border border-yellow-500/20 rounded-lg bg-yellow-500/5 w-full">
                          <input type="checkbox" name="isChampion" checked={formData.isChampion} onChange={handleInputChange} className="w-5 h-5 rounded bg-accent border-none text-yellow-500 focus:ring-yellow-500" />
                          <span className="text-yellow-500 font-bold">Champion</span>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'bloodline' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Bloodline & Pedigree</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Sire (Father) Name</label>
                        <input type="text" name="sireName" value={formData.sireName} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Dam (Mother) Name</label>
                        <input type="text" name="damName" value={formData.damName} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div className="md:col-span-2 2xl:col-span-3">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Bloodline Details</label>
                        <textarea name="bloodline" value={formData.bloodline} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Breeder Name</label>
                        <input type="text" name="breederName" value={formData.breederName} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Kennel Name</label>
                        <input type="text" name="kennelName" value={formData.kennelName} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'owner' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Owner Contact Data</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Owner Full Name</label>
                        <input type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Owner Email</label>
                        <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Owner Phone</label>
                        <input type="text" name="ownerPhone" value={formData.ownerPhone} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">City/Region</label>
                        <input type="text" name="ownerCity" value={formData.ownerCity} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {(activeTab === 'medical' || activeTab === 'gallery' || activeTab === 'qr') && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                    <ImagePlus className="w-16 h-16 text-[#1E293B]  mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Media & Files Upload</h3>
                    <p className="text-muted-foreground mb-6">Drag and drop files to attach certificates, photos, and medical records.</p>
                    <Button variant="outline" className="border-border text-foreground hover:bg-foreground/10">Browse Files</Button>
                  </motion.div>
                )}

              </form>
            </div>
          </div>

        </div>
      
  );
}
