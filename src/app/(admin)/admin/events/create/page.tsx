'use client';

import { ClubService } from '@/services/club.service';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, ImagePlus, CalendarDays, Settings, Info, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';

export default function CreateEventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: '', type: 'CHAMPIONSHIP', clubId: '', venue: '',
    startDate: '', endDate: '', registrationWindowStart: '', registrationWindowEnd: '',
    capacity: 0, entryFee: 0, status: 'DRAFT'
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const data = await ClubService.getClubs();
      if (data.success) {
        setClubs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch clubs');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('${config.apiUrl}/events/admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        router.push('/admin/events');
      } else {
        alert(data.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'General Details', icon: Info },
    { id: 'schedule', label: 'Scheduling', icon: CalendarDays },
    { id: 'venue', label: 'Venue & Location', icon: MapPin },
    { id: 'settings', label: 'Registration Rules', icon: Settings },
    { id: 'media', label: 'Banners & Gallery', icon: ImagePlus }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8 bg-background">
        <div className="w-full max-w-[1200px] mx-auto space-y-8">
          
          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl sticky top-4 z-50">
            <div className="flex items-center gap-4">
              <Link href="/admin/events">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Create New Show Event</h1>
                <p className="text-muted-foreground text-sm mt-1">Configure event rules, ticketing, and scheduling.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <select name="status" value={formData.status} onChange={handleInputChange} className="px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:border-brand-orange outline-none">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active (Published)</option>
                <option value="REGISTRATION_OPEN">Open For Registration</option>
              </select>
              <Button onClick={handleSubmit} disabled={loading} className="bg-brand-orange hover:bg-orange-600 text-foreground font-bold">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Publish Event
              </Button>
            </div>
          </div>

          <div className="flex gap-8">
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
                        ? 'bg-brand-orange text-foreground shadow-lg' 
                        : 'text-muted-foreground hover:bg-card hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" /> {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Right Form Area */}
            <div className="flex-1 bg-card p-8 rounded-2xl border border-border shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {activeTab === 'basic' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">General Details</h2>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Event Title *</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-brand-orange outline-none" placeholder="E.g., 50th All India Championship Dog Show" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Host Club / Organization</label>
                          <select name="clubId" value={formData.clubId} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-brand-orange outline-none appearance-none">
                            <option value="">Select Club...</option>
                            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Event Type</label>
                          <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-brand-orange outline-none appearance-none">
                            <option value="CHAMPIONSHIP">Championship Show</option>
                            <option value="SPECIALTY">Specialty Show</option>
                            <option value="OBEDIENCE">Obedience Trial</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'schedule' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Scheduling & Timelines</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Event Start Date</label>
                        <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-brand-orange outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Event End Date</label>
                        <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-brand-orange outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Registration Opens On</label>
                        <input type="datetime-local" name="registrationWindowStart" value={formData.registrationWindowStart} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-brand-orange outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Registration Closes On</label>
                        <input type="datetime-local" name="registrationWindowEnd" value={formData.registrationWindowEnd} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-brand-orange outline-none" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'venue' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Venue Configuration</h2>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Venue / Stadium Name & Full Address</label>
                      <textarea name="venue" value={formData.venue} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-brand-orange outline-none" />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Ticketing & Rules</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Maximum Dog Capacity</label>
                        <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-brand-orange outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Standard Entry Fee (INR)</label>
                        <input type="number" name="entryFee" value={formData.entryFee} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-brand-orange outline-none" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'media' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                    <ImagePlus className="w-16 h-16 text-[#1E293B] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Banners & Promotions</h3>
                    <p className="text-muted-foreground mb-6">Drag and drop Hero Banners, Mobile Banners, and Promotional Videos.</p>
                    <Button variant="outline" className="border-brand-orange text-brand-orange hover:bg-brand-orange/10">Browse Files</Button>
                  </motion.div>
                )}

              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
