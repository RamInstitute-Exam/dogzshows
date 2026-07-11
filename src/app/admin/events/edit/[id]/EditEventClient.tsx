'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ArrowLeft, Loader2, ImagePlus, CalendarDays, Settings, Info, MapPin, Trash2, Star, Plus, ChevronUp, ChevronDown, Move, Check, CreditCard, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminButton } from '@/components/ui/admin-button';
import Link from 'next/link';
import { toast } from 'sonner';
import api from '@/lib/api';
import OptimizedImage from '@/components/shared/OptimizedImage';
import ImageUploader from '@/components/shared/ImageUploader';
export default function EditEventClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [clubs, setClubs] = useState<any[]>([]);
  const [availableJudges, setAvailableJudges] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [searchJudgeQuery, setSearchJudgeQuery] = useState('');
  
  const [clubSearchQuery, setClubSearchQuery] = useState('');
  const [isClubDropdownOpen, setIsClubDropdownOpen] = useState(false);
  const clubDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clubDropdownRef.current && !clubDropdownRef.current.contains(event.target as Node)) {
        setIsClubDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const [gateways, setGateways] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState({
    paymentRequired: true,
    gatewayId: '',
    allowOffline: false,
    registrationFee: 1500,
    gst: 18,
    lateFee: 0,
    convenienceFee: 50,
    refundPolicy: 'Refunds allowed up to 7 days before the show starts.'
  });

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  useEffect(() => {
    if (activeTab === 'registered_dogs' && id) {
      fetchRegistrations();
    }
  }, [activeTab, id]);

  const fetchRegistrations = async () => {
    setLoadingRegistrations(true);
    try {
      const res = await api.get(`/registrations?eventId=${id}&limit=100`);
      if (res.success) {
        setRegistrations(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  // State for judges assigned:
  const [selectedJudges, setSelectedJudges] = useState<any[]>([]); // Array of { judgeId, name, isChiefJudge, displayOrder, remarks }

  // State for secretaries:
  const [secretaries, setSecretaries] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setFetchLoading(true);
    try {
      const [clubsRes, judgesRes, eventRes, gatewaysRes] = await Promise.all([
        api.get('/public/clubs?limit=1000'),
        api.get('/public/judges?limit=1000'),
        api.get(`/shows/${id}`),
        api.get('/payment-gateways')
      ]);
      
      if (clubsRes?.success) {
        setClubs(clubsRes.data || []);
      }

      if (judgesRes?.success) {
        setAvailableJudges(judgesRes.data || []);
      }

      if (gatewaysRes?.success) {
        setGateways(gatewaysRes.data || []);
      }
      
      if (eventRes?.success && eventRes.data) {
        const ev = eventRes.data;
        
        const formatDateInput = (isoStr: string | null | undefined) => {
          if (!isoStr) return '';
          return new Date(isoStr).toISOString().split('T')[0];
        };

        const formatDateTimeLocalInput = (isoStr: string | null | undefined) => {
          if (!isoStr) return '';
          const d = new Date(isoStr);
          const tzOffset = d.getTimezoneOffset() * 60000;
          const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
          return localISOTime;
        };

        const splitAddress = (addressStr: string | null) => {
          if (!addressStr) return { address: '', addressLine2: '' };
          const parts = addressStr.split('\n');
          return {
            address: parts[0] || '',
            addressLine2: parts.slice(1).join('\n') || ''
          };
        };

        setFormData({
          name: ev.name || '',
          slug: ev.slug || '',
          type: ev.type || 'CHAMPIONSHIP',
          clubId: ev.clubId || '',
          venue: ev.venue || '',
          address: ev.address || '',
          city: ev.city || '',
          state: ev.state || '',
          country: ev.country || 'India',
          latitude: ev.latitude !== null ? String(ev.latitude) : '',
          longitude: ev.longitude !== null ? String(ev.longitude) : '',
          startDate: formatDateInput(ev.startDate),
          endDate: formatDateInput(ev.endDate),
          startTime: ev.startTime || '09:00',
          endTime: ev.endTime || '18:00',
          registrationWindowStart: formatDateTimeLocalInput(ev.registrationWindowStart),
          registrationWindowEnd: formatDateTimeLocalInput(ev.registrationWindowEnd),
          capacity: ev.capacity || 100,
          entryFee: ev.entryFee || 1500,
          rules: ev.rules || '',
          description: ev.description || '',
          bannerUrl: ev.bannerUrl || '',
          status: ev.status || 'DRAFT',
          isFeatured: ev.isFeatured || false
        });

        if (ev.paymentSettings) {
          setPaymentSettings({
            paymentRequired: ev.paymentSettings.paymentRequired,
            gatewayId: ev.paymentSettings.gatewayId || '',
            allowOffline: ev.paymentSettings.allowOffline,
            registrationFee: ev.paymentSettings.registrationFee || 0,
            gst: ev.paymentSettings.gst || 0,
            lateFee: ev.paymentSettings.lateFee || 0,
            convenienceFee: ev.paymentSettings.convenienceFee || 0,
            refundPolicy: ev.paymentSettings.refundPolicy || ''
          });
        }

        // Map Judges
        if (ev.judges && ev.judges.length > 0) {
          setSelectedJudges(
            ev.judges.map((j: any) => ({
              judgeId: j.judgeId,
              name: j.name,
              isChiefJudge: !!j.isChiefJudge,
              displayOrder: j.displayOrder || 1,
              remarks: j.remarks || ''
            }))
          );
        } else {
          setSelectedJudges([]);
        }

        // Map Secretaries
        if (ev.secretaries && ev.secretaries.length > 0) {
          setSelectedSecretariesState(ev.secretaries, splitAddress);
        } else {
          setSecretaries([
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
        }
      } else {
        toast.error('Event details not found');
        router.push('/admin/events');
      }
    } catch (error) {
      console.error('Failed to fetch edit data:', error);
      toast.error('Failed to load show details');
    } finally {
      setFetchLoading(false);
    }
  };

  const setSelectedSecretariesState = (secretariesList: any[], splitAddressFn: any) => {
    setSecretaries(
      secretariesList.map((s: any) => {
        const addrInfo = splitAddressFn(s.address);
        return {
          name: s.name || '',
          designation: s.designation || 'Secretary',
          mobile: s.mobile || '',
          alternateMobile: s.alternateMobile || '',
          phone: s.phone || '',
          email: s.email || '',
          alternateEmail: s.alternateEmail || '',
          address: addrInfo.address,
          addressLine2: addrInfo.addressLine2,
          city: s.city || '',
          state: s.state || '',
          pincode: s.pincode || '',
          country: s.country || 'India',
          website: s.website || ''
        };
      })
    );
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
        // Auto-generate slug from name continuously since it's hidden
        if (name === 'name') {
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
        secretaries: formattedSecretaries,
        paymentSettings: {
          paymentRequired: paymentSettings.paymentRequired,
          gatewayId: paymentSettings.gatewayId || null,
          allowOffline: paymentSettings.allowOffline,
          registrationFee: Number(paymentSettings.registrationFee) || 0,
          gst: Number(paymentSettings.gst) || 0,
          lateFee: Number(paymentSettings.lateFee) || 0,
          convenienceFee: Number(paymentSettings.convenienceFee) || 0,
          refundPolicy: paymentSettings.refundPolicy || null
        }
      };

      const res = await api.put(`/shows/${id}`, payload);
      if (res.success) {
        toast.success('Dog show updated successfully!');
        router.push('/admin/events');
      } else {
        toast.error(res.message || 'Failed to update event');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'An error occurred during update');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'General Details', icon: Info },
    { id: 'schedule', label: 'Scheduling', icon: CalendarDays },
    { id: 'venue', label: 'Venue & Location', icon: MapPin },
    { id: 'settings', label: 'Rules & Judges', icon: Settings },
    { id: 'payment', label: 'Payment Configuration', icon: CreditCard },
    { id: 'registered_dogs', label: 'Registered Dogs', icon: Users },
    { id: 'media', label: 'Banners & Media', icon: ImagePlus }
  ];

  if (fetchLoading) {
    return (
      <div className="w-full flex justify-center items-center py-24">
        <Loader2 className="w-12 h-12 animate-spin text-foreground" />
      </div>
    );
  }

  // Filtering judges
  const filteredJudges = availableJudges.filter(judge =>
    judge.name.toLowerCase().includes(searchJudgeQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 md:px-6 py-6 space-y-6">
          
          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl sticky top-4 z-50">
            <div className="flex items-center gap-4">
              <Link href="/admin/events">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Edit Show Event</h1>
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
                Save Changes
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Event Title *</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" placeholder="E.g., 50th All India Championship Dog Show" />
                      </div>
                      
                      {/* Slug URL is hidden but auto-generated from title */}
                      <input type="hidden" name="slug" value={formData.slug} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div ref={clubDropdownRef} className="relative">
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Host Club / Organization *</label>
                        <div 
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground flex justify-between items-center cursor-pointer focus-within:border-border"
                          onClick={() => setIsClubDropdownOpen(!isClubDropdownOpen)}
                        >
                          <span className={formData.clubId ? 'text-foreground' : 'text-muted-foreground'}>
                            {formData.clubId ? clubs.find(c => c.id === formData.clubId)?.name : 'Select Club...'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isClubDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                        
                        <AnimatePresence>
                          {isClubDropdownOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden"
                            >
                              <div className="p-2 border-b border-border">
                                <input 
                                  type="text" 
                                  placeholder="Search clubs..." 
                                  className="w-full px-3 py-2 bg-accent/50 border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                                  value={clubSearchQuery}
                                  onChange={(e) => setClubSearchQuery(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div className="max-h-60 overflow-y-auto p-1">
                                {clubs.filter(c => c.name.toLowerCase().includes(clubSearchQuery.toLowerCase())).length === 0 ? (
                                  <div className="px-4 py-3 text-sm text-muted-foreground text-center">No clubs found.</div>
                                ) : (
                                  clubs.filter(c => c.name.toLowerCase().includes(clubSearchQuery.toLowerCase())).map(c => (
                                    <div 
                                      key={c.id} 
                                      className={`px-4 py-2.5 text-sm cursor-pointer rounded-md mb-1 flex items-center justify-between transition-colors ${formData.clubId === c.id ? 'bg-primary/20 text-primary font-bold' : 'text-foreground hover:bg-accent hover:text-foreground'}`}
                                      onClick={() => {
                                        setFormData(prev => ({ ...prev, clubId: c.id }));
                                        setIsClubDropdownOpen(false);
                                        setClubSearchQuery('');
                                      }}
                                    >
                                      {c.name}
                                      {formData.clubId === c.id && <Check className="w-4 h-4" />}
                                    </div>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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

                {/* PAYMENT CONFIGURATION TAB */}
                {activeTab === 'payment' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Payment Configuration</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Payment Required</label>
                        <select 
                          value={paymentSettings.paymentRequired ? 'true' : 'false'} 
                          onChange={e => setPaymentSettings({ ...paymentSettings, paymentRequired: e.target.value === 'true' })}
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none appearance-none"
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Payment Gateway</label>
                        <select 
                          value={paymentSettings.gatewayId} 
                          onChange={e => setPaymentSettings({ ...paymentSettings, gatewayId: e.target.value })}
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none appearance-none"
                        >
                          <option value="">Default Active Gateway</option>
                          {gateways.map(g => (
                            <option key={g.id} value={g.id}>{g.gatewayName} ({g.provider})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Allow Offline Payment</label>
                        <select 
                          value={paymentSettings.allowOffline ? 'true' : 'false'} 
                          onChange={e => setPaymentSettings({ ...paymentSettings, allowOffline: e.target.value === 'true' })}
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none appearance-none"
                        >
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Registration Fee (INR)</label>
                        <input 
                          type="number" 
                          value={paymentSettings.registrationFee} 
                          onChange={e => setPaymentSettings({ ...paymentSettings, registrationFee: Number(e.target.value) })}
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">GST %</label>
                        <input 
                          type="number" 
                          value={paymentSettings.gst} 
                          onChange={e => setPaymentSettings({ ...paymentSettings, gst: Number(e.target.value) })}
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" 
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Late Fee (INR)</label>
                        <input 
                          type="number" 
                          value={paymentSettings.lateFee} 
                          onChange={e => setPaymentSettings({ ...paymentSettings, lateFee: Number(e.target.value) })}
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" 
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Convenience Fee (INR)</label>
                        <input 
                          type="number" 
                          value={paymentSettings.convenienceFee} 
                          onChange={e => setPaymentSettings({ ...paymentSettings, convenienceFee: Number(e.target.value) })}
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-2">Refund Policy / Description</label>
                      <textarea 
                        value={paymentSettings.refundPolicy} 
                        onChange={e => setPaymentSettings({ ...paymentSettings, refundPolicy: e.target.value })}
                        rows={3} 
                        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-border outline-none" 
                        placeholder="Define payment and refund policy rules..." 
                      />
                    </div>
                  </motion.div>
                )}

                {/* REGISTERED DOGS TAB */}
                {activeTab === 'registered_dogs' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Registered Dogs</h2>

                    {loadingRegistrations ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : registrations.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-muted/10 text-muted-foreground">
                        No dogs registered for this show yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-border rounded-xl">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-muted/30 border-b border-border text-xs font-bold uppercase text-muted-foreground">
                              <th className="p-4">Reg Number</th>
                              <th className="p-4">Dog Name</th>
                              <th className="p-4">Breed</th>
                              <th className="p-4">Owner Name</th>
                              <th className="p-4">Contact</th>
                              <th className="p-4">Class</th>
                              <th className="p-4">Payment</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm font-semibold divide-y divide-border/40">
                            {registrations.map(reg => (
                              <tr key={reg.id} className="hover:bg-muted/10">
                                <td className="p-4 font-mono font-bold text-primary">{reg.serialNumber || 'Pending'}</td>
                                <td className="p-4 text-foreground">{reg.dog?.name}</td>
                                <td className="p-4">{reg.dog?.breed?.name || 'N/A'}</td>
                                <td className="p-4 text-foreground">{reg.user?.name || 'N/A'}</td>
                                <td className="p-4 text-xs">
                                  <p>{reg.user?.email}</p>
                                  <p className="text-muted-foreground mt-0.5">{reg.user?.mobile}</p>
                                </td>
                                <td className="p-4 text-primary">{reg.category?.name || 'N/A'}</td>
                                <td className="p-4">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    reg.status === 'CONFIRMED' ? 'bg-green-600/10 text-green-500 border border-green-500/25' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/25'
                                  }`}>
                                    {reg.status === 'CONFIRMED' ? 'Paid' : 'Unpaid'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    reg.status === 'CONFIRMED' ? 'bg-green-600 text-white' : 
                                    reg.status === 'CANCELLED' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-foreground'
                                  }`}>
                                    {reg.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                                  {reg.status !== 'CONFIRMED' && (
                                    <Button 
                                      type="button"
                                      onClick={async () => {
                                        if (window.confirm('Approve this registration?')) {
                                          const res = await api.put(`/registrations/${reg.id}`, { status: 'CONFIRMED' });
                                          if (res.success) { toast.success('Approved successfully'); fetchRegistrations(); }
                                        }
                                      }}
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-2.5 py-1 rounded-lg font-bold"
                                    >
                                      Approve
                                    </Button>
                                  )}
                                  {reg.status !== 'CANCELLED' && (
                                    <Button 
                                      type="button"
                                      variant="destructive"
                                      onClick={async () => {
                                        if (window.confirm('Reject/cancel this registration?')) {
                                          const res = await api.put(`/registrations/${reg.id}`, { status: 'CANCELLED' });
                                          if (res.success) { toast.success('Rejected successfully'); fetchRegistrations(); }
                                        }
                                      }}
                                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 py-1 rounded-lg font-bold"
                                    >
                                      Reject
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
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
