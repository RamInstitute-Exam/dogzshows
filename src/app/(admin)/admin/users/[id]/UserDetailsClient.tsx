'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Shield, User as UserIcon, Calendar, CheckCircle, XCircle, Mail, Phone, MapPin, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function UserDetailsView() {
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/users/${id}`);
      const data = res;
      if (data.success && data.data) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1  flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className=" text-center">
        <h2 className="text-2xl font-bold text-foreground">User not found</h2>
        <Link href="/admin/users">
          <Button className="mt-4 bg-blue-600 text-white">Back to Users</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full space-y-4">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
          <div className="flex items-center gap-4">
            <Link href="/admin/users">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-2xl font-bold text-foreground overflow-hidden border-2 border-border">
                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : (user.firstName?.charAt(0) || 'U')}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                  {user.title ? `${user.title} ` : ''}{user.firstName} {user.lastName}
                  {user.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider border border-red-500/20">
                      <XCircle className="w-3 h-3" /> Suspended
                    </span>
                  )}
                </h1>
                <p className="text-muted-foreground text-sm mt-1 flex items-center gap-4">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {user.phone || 'No phone'}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/admin/users/edit/${user.id}`}>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                Edit User
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 ga">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-1 space-y-4">
            
            <div className="bg-card p-6 rounded-2xl border border-border shadow-md space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
                <Shield className="w-4 h-4 text-brand-orange" /> Role & Access
              </h3>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Primary Role</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.roles && user.roles.length > 0 ? user.roles.map((r: any) => (
                    <span key={r.roleId} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
                      <Shield className="w-3.5 h-3.5" /> {r.role.name}
                    </span>
                  )) : (
                    <span className="text-sm font-medium text-foreground">Standard User</span>
                  )}
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Account Created</p>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border shadow-md space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
                <MapPin className="w-4 h-4 text-blue-500" /> Address & Location
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-bold">Street</p>
                  <p className="text-sm font-medium">{user.address1 || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">City</p>
                    <p className="text-sm font-medium">{user.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">State</p>
                    <p className="text-sm font-medium">{user.state || '-'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold">Pincode</p>
                  <p className="text-sm font-medium">{user.pincode || '-'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Activity / Stats */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-md">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Dogs Owned</p>
                <p className="text-3xl font-extrabold text-foreground">{user.dogsOwned?.length || 0}</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-md">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Registrations</p>
                <p className="text-3xl font-extrabold text-foreground">{user.eventRegistrations?.length || 0}</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-md">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Total Payments</p>
                <p className="text-3xl font-extrabold text-foreground">{user.payments?.length || 0}</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" /> Recent Activity Logs
                </h3>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Activity className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground font-semibold">No recent activity found.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
