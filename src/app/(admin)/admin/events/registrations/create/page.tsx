'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function ManualRegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [dogs, setDogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    eventId: '', dogId: '', userId: '', ageClassId: '', feeAmount: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [evRes, dogRes, userRes] = await Promise.all([
        fetch(`${config.apiUrl}/events/admin`, { headers }).then(r => r.json()),
        fetch(`${config.apiUrl}/dogs`, { headers }).then(r => r.json()),
        fetch(`${config.apiUrl}/users`, { headers }).then(r => r.json())
      ]);
      if (evRes.success) setEvents(evRes.data);
      if (dogRes.success) setDogs(dogRes.data);
      if (userRes.success) setUsers(userRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
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
      const res = await api.get(`/registrations`);
      
      const data = res;
      if (data.success) {
        router.push('/admin/events/registrations');
      } else {
        alert(data.error || 'Failed to create registration');
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-card">
      <AdminSidebar />
      <main className="flex-1 md:ml-64  bg-background">
        <div className="w-full max-w-[800px]  space-y-4">
          
          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div className="flex items-center gap-4">
              <Link href="/admin/events/registrations">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Manual Offline Registration</h1>
                <p className="text-muted-foreground text-sm mt-1">Register a dog manually without online payment.</p>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-foreground font-bold">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Entry
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-4">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <Ticket className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-foreground">Entry Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Select Event *</label>
                <select required name="eventId" value={formData.eventId} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none appearance-none">
                  <option value="">Choose an Event...</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Select Owner *</label>
                <select required name="userId" value={formData.userId} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none appearance-none">
                  <option value="">Choose User...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Select Dog *</label>
                <select required name="dogId" value={formData.dogId} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none appearance-none">
                  <option value="">Choose Dog...</option>
                  {dogs.map(d => <option key={d.id} value={d.id}>{d.name} (KCI: {d.kciNumber})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Entry Fee Collected Offline (INR)</label>
                <input type="number" name="feeAmount" value={formData.feeAmount} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none" />
              </div>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
