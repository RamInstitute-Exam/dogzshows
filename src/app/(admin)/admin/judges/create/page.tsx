'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, ImagePlus, Globe, Award, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';

export default function RegisterJudgeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', country: '', experience: '', bio: '', credentials: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('${config.apiUrl}/judges', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        router.push('/admin/judges');
      } else {
        alert(data.error || 'Failed to register judge');
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
              <Link href="/admin/judges">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Register FCI Judge</h1>
                <p className="text-muted-foreground text-sm mt-1">Add a certified judge to the global registry.</p>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-[#020817] font-bold">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Judge Profile
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 space-y-6">
                <div className="bg-card p-8 rounded-2xl border border-border shadow-xl">
                  <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                    <Shield className="w-5 h-5 text-yellow-500" /> Identity & Origin
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Judge Full Name *</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-yellow-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Country of Residence</label>
                      <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-yellow-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Years of Experience</label>
                      <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-yellow-500 outline-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-card p-8 rounded-2xl border border-border shadow-xl">
                  <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                    <Award className="w-5 h-5 text-yellow-500" /> Biography & Credentials
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Professional Credentials</label>
                      <input type="text" name="credentials" value={formData.credentials} onChange={handleInputChange} placeholder="E.g. FCI All Breed Judge" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-yellow-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Detailed Biography</label>
                      <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={6} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-yellow-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 space-y-6">
                <div className="bg-card p-8 rounded-2xl border border-border shadow-xl text-center">
                  <ImagePlus className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Judge Portrait</h3>
                  <p className="text-muted-foreground mb-6 text-sm">Upload a professional high-resolution photo.</p>
                  <Button variant="outline" className="w-full border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10">Browse Photo</Button>
                </div>

                <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
                  <h3 className="font-bold text-foreground mb-4">Assigned FCI Groups</h3>
                  <p className="text-xs text-muted-foreground mb-4">You can assign this judge to specific FCI Groups or Breeds from the Judge Details dashboard after creating the profile.</p>
                  <Button disabled variant="outline" className="w-full border-[#1E293B] text-muted-foreground">Manage Groups (Save First)</Button>
                </div>
              </div>

            </div>

          </form>

        </div>
      </main>
    </div>
  );
}
