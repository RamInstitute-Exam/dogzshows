'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ArrowLeft, Loader2, ImagePlus, CalendarDays, Settings, Info, MapPin, Trash2, Star, Plus, ChevronUp, ChevronDown, Move, ShieldAlert, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminButton } from '@/components/ui/admin-button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import OptimizedImage from '@/components/shared/OptimizedImage';
import ImageUploader from '@/components/shared/ImageUploader';

export default function CreateEventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]);
  const [availableJudges, setAvailableJudges] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [searchJudgeQuery, setSearchJudgeQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'CHAMPIONSHIP',
    clubId: '',
    venue: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    latitude: '',
    longitude: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    registrationWindowStart: '',
    registrationWindowEnd: '',
    capacity: 100,
    entryFee: 1500,
    rules: '',
    description: '',
    bannerUrl: '',
    status: 'DRAFT',
    isFeatured: false
  });

  // State for judges assigned:
  const [selectedJudges, setSelectedJudges] = useState<any[]>([]); // Array of { judgeId, name, isChiefJudge, displayOrder, remarks }

  // State for secretaries:
  const [secretaries, setSecretaries] = useState<any[]>([
    {
      name: '',
      designation: 'Hony. Secretary',
      mobile: '',
      alternateMobile: '',
      phone: '',
      email: '',
      alternateEmail: '',
      address: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      website: ''
    }
  ]);

  useEffect(() => {
    fetchClubs();
    fetchJudges();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await api.get('/public/clubs?limit=1000');
      if (res.success) {
        setClubs(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch clubs');
    }
  };

  const fetchJudges = async () => {
    try {
      const res = await api.get('/public/judges?limit=1000');
      if (res.success) {
        setAvailableJudges(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch judges');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
        const nextState = {
          ...prev,
          [name]: type === 'number' ? Number(value) : value
        };
        // Auto-generate slug from name if slug was not manually edited yet
        if (name === 'name' && !prev.slug) {
          nextState.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        return nextState;
      });
    }
  };

  // Judges Logic
  const handleToggleJudge = (judge: any) => {
    const exists = selectedJudges.some(j => j.judgeId === judge.id);
    if (exists) {
      setSelectedJudges(prev => 
        prev
          .filter(j => j.judgeId !== judge.id)
          .map((j, idx) => ({ ...j, displayOrder: idx + 1 }))
      );
    } else {
      setSelectedJudges(prev => [
        ...prev,
        {
          judgeId: judge.id,
          name: judge.name,
          isChiefJudge: false, // do not default first to chief judge
          displayOrder: prev.length + 1,
          remarks: ''
        }
      ]);
    }
  };

  const handleSetChiefJudge = (judgeId: string) => {
    setSelectedJudges(prev =>
      prev.map(j => ({
        ...j,
        isChiefJudge: j.judgeId === judgeId
      }))
    );
  };

  const handleRemoveJudge = (judgeId: string) => {
    setSelectedJudges(prev =>
      prev
        .filter(j => j.judgeId !== judgeId)
        .map((j, idx) => ({ ...j, displayOrder: idx + 1 }))
    );
  };

  const handleJudgeRemarksChange = (judgeId: string, remarks: string) => {
    setSelectedJudges(prev =>
      prev.map(j => (j.judgeId === judgeId ? { ...j, remarks } : j))
    );
  };

  // Drag & Drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newList = [...selectedJudges];
    const draggedItem = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, draggedItem);
    
    setSelectedJudges(newList.map((item, idx) => ({ ...item, displayOrder: idx + 1 })));
    setDraggedIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...selectedJudges];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;
    setSelectedJudges(newList.map((j, idx) => ({ ...j, displayOrder: idx + 1 })));
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedJudges.length - 1) return;
    const newList = [...selectedJudges];
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;
    setSelectedJudges(newList.map((j, idx) => ({ ...j, displayOrder: idx + 1 })));
  };

  // Secretaries Logic
  const handleAddSecretary = () => {
    setSecretaries(prev => [
      ...prev,
      {
        name: '',
        designation: 'Secretary',
        mobile: '',
        alternateMobile: '',
        phone: '',
        email: '',
        alternateEmail: '',
        address: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        website: ''
      }
    ]);
  };

  const handleRemoveSecretary = (index: number) => {
    if (secretaries.length === 1) {
      toast.warning('At least one club secretary detail is required.');
      return;
    }
    setSecretaries(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSecretaryChange = async (index: number, field: string, value: any) => {
    setSecretaries(prev =>
      prev.map((s, idx) => (idx === index ? { ...s, [field]: value } : s))
    );

    if (field === 'pincode') {
      const zip = value.replace(/\s+/g, '');
      if (zip.length === 6) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${zip}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setSecretaries(prev =>
              prev.map((s, idx) =>
                idx === index
                  ? {
                      ...s,
                      city: postOffice.District,
                      state: postOffice.State,
                      country: postOffice.Country
                    }
                  : s
              )
            );
            toast.success('Location auto-filled based on ZIP Code');
          }
        } catch (err) {
          console.error('ZIP lookup failed', err);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Event title is required');
      return;
    }
    if (!formData.clubId) {
      toast.error('Host club is required');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Event dates are required');
      return;
    }

    // Judge selection is optional — no required validation

    // Chief Judge is now optional
    // const hasChiefJudge = selectedJudges.some(j => j.isChiefJudge);
    // if (!hasChiefJudge) {
    //   toast.error('Please designate at least one Chief Judge');
    //   return;
    // }

    // Secretary fields are optional — no required validation

    setLoading(true);
    try {
      // Format secretaries to combine address and addressLine2
      const formattedSecretaries = secretaries.map((s, idx) => {
        const fullAddr = [s.address, s.addressLine2].filter(Boolean).join('\n');
        return {
          name: s.name,
          designation: s.designation,
          mobile: s.mobile,
          alternateMobile: s.alternateMobile || null,
          phone: s.phone || null,
          email: s.email,
          alternateEmail: s.alternateEmail || null,
          address: fullAddr || null,
          city: s.city || null,
          state: s.state || null,
          country: s.country || 'India',
          pincode: s.pincode || null,
          website: s.website || null,
          displayOrder: idx + 1
        };
      });

      const payload = {
        ...formData,
        capacity: Number(formData.capacity) || 0,
        entryFee: Number(formData.entryFee) || 0,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        registrationWindowStart: formData.registrationWindowStart ? new Date(formData.registrationWindowStart).toISOString() : null,
        registrationWindowEnd: formData.registrationWindowEnd ? new Date(formData.registrationWindowEnd).toISOString() : null,
        judges: selectedJudges,
        secretaries: formattedSecretaries
      };

      const res = await api.post('/shows', payload);
      if (res.success) {
        toast.success('Dog show published successfully!');
        router.push('/admin/events');
      } else {
        toast.error(res.message || 'Failed to publish event');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'An error occurred during submission');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'General Details', icon: Info },
    { id: 'schedule', label: 'Scheduling', icon: CalendarDays },
    { id: 'venue', label: 'Venue & Location', icon: MapPin },
    { id: 'settings', label: 'Rules & Judges', icon: Settings },
    { id: 'media', label: 'Banners & Media', icon: ImagePlus }
  ];

  // Filtering judges
  const filteredJudges = availableJudges.filter(judge =>
    judge.name.toLowerCase().includes(searchJudgeQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 md:px-6 py-6 space-y-6">
          
          {/* Top Sticky Bar */}
          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl sticky top-4 z-50">
            <div className="flex items-center gap-4">
              <Link href="/admin/events">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Create New Show Event</h1>
                <p className="text-muted-foreground text-sm mt-1">Configure event rules, ticketing, and scheduling.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <select name="status" value={formData.status} onChange={handleInputChange} className="px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none">
                <option value="DRAFT">Draft</option>
                <option value="REGISTRATION_OPEN">Open For Registration</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <AdminButton onClick={handleSubmit} loading={loading} variant="primary" leftIcon={loading ? undefined : <Save className="w-4 h-4" />}>
                Publish Event
              </AdminButton>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Nav */}
            <div className="w-full md:w-64 shrink-0 space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    type="button"
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
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* GENERAL DETAILS TAB */}
                {activeTab === 'basic' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">General Details</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Event Title *</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="E.g., 50th All India Championship Dog Show" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Slug URL (auto-generated)</label>
                        <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="e.g. 50th-all-india-championship" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Host Club / Organization *</label>
                        <select name="clubId" value={formData.clubId} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none appearance-none">
                          <option value="">Select Club...</option>
                          {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Event Type</label>
                        <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none appearance-none">
                          <option value="CHAMPIONSHIP">Championship Show</option>
                          <option value="SPECIALTY">Specialty Show</option>
                          <option value="OBEDIENCE">Obedience Trial</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-2">Show Description</label>
                      <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="Write introductory details, prize details, or general info about the show..." />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="w-5 h-5 rounded border-border text-foreground focus:ring-foreground bg-card" />
                      <label htmlFor="isFeatured" className="font-bold text-foreground text-sm cursor-pointer">Feature this show on the homepage banner</label>
                    </div>
                  </motion.div>
                )}

                {/* SCHEDULING TAB */}
                {activeTab === 'schedule' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Scheduling & Timelines</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Show Start Date *</label>
                        <input required type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Show End Date *</label>
                        <input required type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Daily Start Time</label>
                        <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Daily End Time</label>
                        <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Registration Opens On</label>
                        <input type="datetime-local" name="registrationWindowStart" value={formData.registrationWindowStart} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Registration Last Date (Closing Date)</label>
                        <input type="datetime-local" name="registrationWindowEnd" value={formData.registrationWindowEnd} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* VENUE TAB */}
                {activeTab === 'venue' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Venue & Location</h2>
                    
                    <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-2">Venue / Stadium Name</label>
                      <input type="text" name="venue" value={formData.venue} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="E.g., Nehru Indoor Stadium" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-2">Full Address</label>
                      <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="E.g., Raja Muthaiah Road, Kannappar Thidal, Periyamet" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="E.g., Chennai" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="E.g., Tamil Nadu" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Country</label>
                        <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Latitude (optional)</label>
                        <input type="text" name="latitude" value={formData.latitude} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="e.g. 13.0827" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Longitude (optional)</label>
                        <input type="text" name="longitude" value={formData.longitude} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="e.g. 80.2707" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* RULES & SETTINGS TAB */}
                {activeTab === 'settings' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Rules & Capacity</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <label className="block text-sm font-bold text-muted-foreground mb-2">Maximum Capacity (Dogs)</label>
                          <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-muted-foreground mb-2">Standard Entry Fee (INR)</label>
                          <input type="number" name="entryFee" value={formData.entryFee} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Specific Rules & Guidelines</label>
                        <textarea name="rules" value={formData.rules} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="Write show entry guidelines, refund policy, breed specific details..." />
                      </div>
                    </div>

                    {/* RULES & JUDGES SECTION */}
                    <div className="bg-card p-6 border border-border rounded-2xl shadow-md space-y-4">
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <div>
                          <h3 className="text-lg font-black text-foreground">Rules & Judges *</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Assign dynamic judging panel. Set Chief Judge and display order.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Search & Selector */}
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-muted-foreground">Select Judges</label>
                          <input
                            type="text"
                            placeholder="Search Judge..."
                            value={searchJudgeQuery}
                            onChange={(e) => setSearchJudgeQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-border outline-none text-sm"
                          />
                          <div className="border border-border rounded-lg max-h-[280px] overflow-y-auto divide-y divide-border bg-card">
                            {filteredJudges.length === 0 ? (
                              <p className="p-4 text-sm text-muted-foreground text-center">No judges found.</p>
                            ) : (
                              filteredJudges.map(judge => {
                                const isChecked = selectedJudges.some(j => j.judgeId === judge.id);
                                return (
                                  <div
                                    key={judge.id}
                                    onClick={() => handleToggleJudge(judge)}
                                    className="flex items-center gap-3 p-3 hover:bg-accent/40 cursor-pointer transition-colors text-sm"
                                  >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-foreground border-border text-foreground' : 'border-border'}`}>
                                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {judge.photoUrl && (
                                        <OptimizedImage src={judge.photoUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                                      )}
                                      <span className="font-semibold text-foreground">{judge.name}</span>
                                      {judge.country && <span className="text-xs text-muted-foreground">({judge.country})</span>}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Selected & Ordering */}
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-muted-foreground">Selected Judges Panel ({selectedJudges.length})</label>
                          
                          {selectedJudges.length === 0 ? (
                            <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
                              No judges assigned yet. Check judges from the left panel.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[330px] overflow-y-auto pr-1">
                              {selectedJudges.map((j, idx) => (
                                <div
                                  key={j.judgeId}
                                  draggable
                                  onDragStart={() => handleDragStart(idx)}
                                  onDragOver={(e) => handleDragOver(e, idx)}
                                  onDrop={() => handleDrop(idx)}
                                  className="flex flex-col p-3.5 bg-accent/20 border border-border hover:border-border/40 rounded-xl transition-all cursor-move group relative"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <Move className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                                      <span className="text-xs font-black text-foreground bg-foreground/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0">{idx + 1}</span>
                                      <span className="font-bold text-foreground text-sm truncate max-w-[150px] sm:max-w-none">{j.name}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleSetChiefJudge(j.judgeId)}
                                        className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                                          j.isChiefJudge 
                                            ? 'bg-amber-500 text-white shadow-sm' 
                                            : 'bg-accent text-muted-foreground hover:text-foreground'
                                        }`}
                                      >
                                        <Star className={`w-3.5 h-3.5 ${j.isChiefJudge ? 'fill-white' : ''}`} />
                                        {j.isChiefJudge ? 'Chief' : 'Set Chief'}
                                      </button>
                                      
                                      <div className="flex flex-col items-center shrink-0">
                                        <button type="button" onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                                          <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => handleMoveDown(idx)} disabled={idx === selectedJudges.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                                          <ChevronDown className="w-4 h-4" />
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleRemoveJudge(j.judgeId)}
                                        className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <input
                                    type="text"
                                    placeholder="Remarks (e.g. Ring 1 Coordinator)"
                                    value={j.remarks || ''}
                                    onChange={(e) => handleJudgeRemarksChange(j.judgeId, e.target.value)}
                                    className="w-full mt-2 px-2.5 py-1.5 bg-background border border-border rounded text-xs text-foreground focus:border-border outline-none"
                                  />
                                </div>
                              ))}
                              <p className="text-[10px] text-muted-foreground text-center italic">Drag & drop items or use arrows to reorder panel priority.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CLUB SECRETARY SECTION */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">Club Secretary & Contact Details</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Add Hony. Secretary, Joint Secretaries, and coordinators with complete contact details.</p>
                        </div>
                        <AdminButton
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleAddSecretary}
                          leftIcon={<Plus className="w-4 h-4" />}
                        >
                          Add Another Secretary
                        </AdminButton>
                      </div>

                      <div className="space-y-6">
                        {secretaries.map((sec, idx) => (
                          <div key={idx} className="bg-card border border-border rounded-2xl p-6 shadow-md relative space-y-4">
                            <div className="flex justify-between items-center bg-accent/20 -mx-6 -mt-6 p-4 px-6 rounded-t-2xl border-b border-border">
                              <span className="font-extrabold text-foreground text-sm uppercase tracking-wider">Secretary Card {idx + 1}</span>
                              {secretaries.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSecretary(idx)}
                                  className="text-muted-foreground hover:text-red-500 flex items-center gap-1 text-xs font-bold"
                                >
                                  <Trash2 className="w-4 h-4" /> Remove Card
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Secretary Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Mr. R. Saravanakumar"
                                  value={sec.name}
                                  onChange={(e) => handleSecretaryChange(idx, 'name', e.target.value)}
                                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Designation</label>
                                <select
                                  value={sec.designation}
                                  onChange={(e) => handleSecretaryChange(idx, 'designation', e.target.value)}
                                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                >
                                  <option value="Hony. Secretary">Hony. Secretary</option>
                                  <option value="Joint Secretary">Joint Secretary</option>
                                  <option value="Secretary">Secretary</option>
                                  <option value="Show Secretary">Show Secretary</option>
                                  <option value="Vice President">Vice President</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Mobile Number</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 9585266566"
                                  value={sec.mobile}
                                  onChange={(e) => handleSecretaryChange(idx, 'mobile', e.target.value)}
                                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Alternate Mobile</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 9443212345"
                                  value={sec.alternateMobile}
                                  onChange={(e) => handleSecretaryChange(idx, 'alternateMobile', e.target.value)}
                                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Landline</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 0422-243000"
                                  value={sec.phone}
                                  onChange={(e) => handleSecretaryChange(idx, 'phone', e.target.value)}
                                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Email</label>
                                <input
                                  type="email"
                                  placeholder="e.g. cmkc2021@gmail.com"
                                  value={sec.email}
                                  onChange={(e) => handleSecretaryChange(idx, 'email', e.target.value)}
                                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Alternate Email</label>
                                <input
                                  type="email"
                                  placeholder="e.g. info@club.com"
                                  value={sec.alternateEmail}
                                  onChange={(e) => handleSecretaryChange(idx, 'alternateEmail', e.target.value)}
                                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-muted-foreground mb-1.5">Website</label>
                                <input
                                  type="text"
                                  placeholder="e.g. www.clubsecretary.com"
                                  value={sec.website}
                                  onChange={(e) => handleSecretaryChange(idx, 'website', e.target.value)}
                                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                />
                              </div>
                            </div>

                            <div className="bg-accent/5 p-4 rounded-xl border border-border space-y-3">
                              <span className="block text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Office Address</span>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">Address Line 1</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Aadhi International, 5/7 8th Street"
                                    value={sec.address}
                                    onChange={(e) => handleSecretaryChange(idx, 'address', e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">Address Line 2</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Lakshmi Vinayagar Kovil Street, Ganapathy"
                                    value={sec.addressLine2}
                                    onChange={(e) => handleSecretaryChange(idx, 'addressLine2', e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">City</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Coimbatore"
                                    value={sec.city}
                                    onChange={(e) => handleSecretaryChange(idx, 'city', e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">State</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Tamil Nadu"
                                    value={sec.state}
                                    onChange={(e) => handleSecretaryChange(idx, 'state', e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">Pincode</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 641006"
                                    value={sec.pincode}
                                    onChange={(e) => handleSecretaryChange(idx, 'pincode', e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">Country</label>
                                  <input
                                    type="text"
                                    value={sec.country}
                                    onChange={(e) => handleSecretaryChange(idx, 'country', e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:border-border outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* MEDIA & BANNERS TAB */}
                {activeTab === 'media' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Banners & Media Banners</h2>
                    
                    <ImageUploader
                      currentImage={formData.bannerUrl}
                      onUploadSuccess={(url) => setFormData(prev => ({ 
                        ...prev, 
                        bannerUrl: url
                      }))}
                      onRemove={() => setFormData(prev => ({ 
                        ...prev, 
                        bannerUrl: ''
                      }))}
                      folder="shows"
                    />
                  </motion.div>
                )}

              </form>
            </div>
          </div>

    </div>
  );
}
