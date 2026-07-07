'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, UploadCloud, Shield, CheckCircle, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminButton } from '@/components/ui/admin-button';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function EditUserForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = (searchParams.get('id') || params?.id) as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '', // Leave blank unless changing
    roleId: '',
    isActive: true,
    address1: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (id) {
      fetchRoles().then(() => fetchUser());
    }
  }, [id]);

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

  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/users/${id}`);
      const data = res;
      if (data.success && data.data) {
        const u = data.data;
        setFormData({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          phone: u.phone || '',
          password: '',
          roleId: u.roles && u.roles.length > 0 ? u.roles[0].roleId : '',
          isActive: u.isActive ?? true,
          address1: u.address1 || '',
          city: u.city || '',
          state: u.state || '',
          pincode: u.pincode || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
    } finally {
      setLoading(false);
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
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password; // Don't send empty password

      const res = await api.put(`/users/${id}`, payload);
      
      const data = res;
      if (data.success) {
        router.push('/admin/users');
      } else {
        alert(data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1  flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
          <div className="flex items-center gap-4">
            <Link href="/admin/users">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-blue-500" /> Edit User Profile
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Modify account details and role access.</p>
            </div>
          </div>
          <AdminButton onClick={handleSubmit} loading={saving} variant="primary" leftIcon={saving ? undefined : <Save className="w-4 h-4" />}>
            Save Changes
          </AdminButton>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
              <Shield className="w-5 h-5 text-blue-500" /> Account Security & Role
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Address *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Password (Leave blank to keep current)</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Assign Role</label>
                <select name="roleId" value={formData.roleId} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none appearance-none text-sm font-semibold">
                  <option value="">Standard User (No Admin Role)</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg bg-card w-full hover:bg-accent/50 transition-colors">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 rounded bg-accent border-none text-blue-500 focus:ring-blue-500" />
                  <span className="text-foreground font-bold text-sm">Account is Active</span>
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
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">First Name *</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none text-sm" />
              </div>
            </div>

            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-8 mb-4 border-b border-border pb-2">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
              <div className="md:col-span-2 2xl:col-span-3">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Street Address</label>
                <input type="text" name="address1" value={formData.address1} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-blue-500 outline-none text-sm" />
              </div>
              </div>
            </div>
          </form>

    </div>
  );
}
