'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, UploadCloud, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function CreateUserForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
    isActive: true,
    address1: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/roles`);
      const data = res;
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch roles');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const res = await api.get(`/users`);
      
      const data = res;
      if (data.success) {
        router.push('/admin/users');
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6">
        
        <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div className="flex items-center gap-4">
              <Link href="/admin/users">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Create New User</h1>
                <p className="text-muted-foreground text-sm mt-1">Add a new member or administrator to the platform.</p>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-foreground font-bold">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save User
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                <Shield className="w-5 h-5 text-blue-500" /> Account Security & Role
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Password *</label>
                  <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Assign Role</label>
                  <select name="roleId" value={formData.roleId} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none appearance-none">
                    <option value="">Standard User (No Admin Role)</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg bg-card w-full">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 rounded bg-accent border-none text-blue-500 focus:ring-blue-500" />
                    <span className="text-foreground font-medium">Account is Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                <CheckCircle className="w-5 h-5 text-blue-500" /> Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">First Name *</label>
                  <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none" />
                </div>
              </div>

              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mt-8 mb-4">Address Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                <div className="md:col-span-2 2xl:col-span-3">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Street Address</label>
                  <input type="text" name="address1" value={formData.address1} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                <UploadCloud className="w-5 h-5 text-blue-500" /> Profile Image & Documents
              </h2>
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:bg-[rgba(255,255,255,0.01)] transition-colors cursor-pointer">
                <UploadCloud className="w-12 h-12 text-muted-foreground  mb-4" />
                <p className="text-foreground font-medium mb-1">Drag and drop images here</p>
                <p className="text-xs text-muted-foreground">or click to browse files (Max 5MB)</p>
              </div>
            </div>
          </form>
    </div>
  );
}
