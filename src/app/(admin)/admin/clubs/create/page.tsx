'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';

export default function RegisterClubForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', secretary: '', president: '', email: '', phone: '', website: '', address: '', description: '', history: '', isActive: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const res = await fetch('${config.apiUrl}/clubs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        router.push('/admin/clubs');
      } else {
        alert(data.error || 'Failed to create club');
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8 bg-background">
        <div className="w-full max-w-[1000px] mx-auto space-y-8">
          
          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div className="flex items-center gap-4">
              <Link href="/admin/clubs">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Register New Club</h1>
                <p className="text-muted-foreground text-sm mt-1">Add a new partner organization or kennel club.</p>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-foreground font-bold">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Club
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card p-8 rounded-2xl border border-border shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Club Name *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-purple-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">President Name</label>
                  <input type="text" name="president" value={formData.president} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Secretary Name</label>
                  <input type="text" name="secretary" value={formData.secretary} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-purple-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Contact Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Contact Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-purple-500 outline-none" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Website URL</label>
                  <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-purple-500 outline-none" placeholder="https://" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Headquarters Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-purple-500 outline-none" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Club Description / Bio</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-purple-500 outline-none" />
                </div>

                <div className="md:col-span-2 flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg bg-card w-full">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 rounded bg-accent border-none text-purple-500 focus:ring-purple-500" />
                    <span className="text-foreground font-medium">Club is Active</span>
                  </label>
                </div>

              </div>
            </div>
            
            <div className="bg-card p-8 rounded-2xl border border-border shadow-xl text-center">
              <ImagePlus className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Club Logo</h3>
              <p className="text-muted-foreground mb-6">Drag and drop logo image here</p>
              <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">Browse Logo</Button>
            </div>

          </form>

        </div>
      </main>
    </div>
  );
}
