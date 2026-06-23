'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Shield, Key, Smartphone, 
  CheckCircle2, Camera, CreditCard, Link, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function ProfilePage() {
  const { user: authUser, login } = useAuthStore();
  const role = authUser?.roles?.[0] || 'USER';
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address1: ''
  });

  useEffect(() => {
    if (authUser?.id) {
      loadProfile();
    }
  }, [authUser?.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${authUser?.id}`);
      if (res.success) {
        setUserData(res.data);
        setFormData({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          phone: res.data.phone || '',
          address1: res.data.address1 || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await api.put(`/users/${authUser?.id}`, formData);
      if (res.success) {
        toast.success('Profile updated successfully');
        setUserData(res.data);
        // Sync context
        if (authUser) {
           login({ ...authUser, firstName: res.data.firstName, lastName: res.data.lastName }, localStorage.getItem('token') || '');
        }
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        address1: userData.address1 || ''
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account details, connected accounts, and security preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Profile Card & Navigation */}
        <div className="w-full lg:w-80 space-y-6 shrink-0">
          
          {/* Main Profile Card */}
          <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm relative overflow-hidden group">
            {/* Background pattern */}
            <div className="absolute top-0 left-0 w-full h-32 bg-muted/20 -z-10" />
            
            <div className="text-center mt-8">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-foreground text-foreground flex items-center justify-center text-3xl font-bold border-4 border-border shadow-xl overflow-hidden mx-auto">
                  {userData?.avatarUrl ? (
                    <OptimizedImage src={userData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userData?.firstName?.[0] || authUser?.firstName?.[0] || 'G'}</span>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-card text-foreground rounded-full shadow-lg hover:bg-foreground transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-xl font-extrabold text-foreground mt-4">
                {userData?.firstName ? `${userData.firstName} ${userData.lastName}` : (authUser?.firstName ? `${authUser.firstName} ${authUser.lastName}` : 'Guest User')}
              </h2>
              <p className="text-muted-foreground text-sm mb-4">{userData?.email || authUser?.email || 'guest@juzdog.com'}</p>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Active Account
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Platform Role</span>
                <span className="font-bold text-foreground capitalize bg-input px-2 py-0.5 rounded-md">
                  {role.replace('_', ' ').toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Last Login</span>
                <span className="font-bold text-foreground">Today, 10:45 AM</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-card rounded-3xl border border-border p-2 shadow-sm">
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:bg-card'}`}
              >
                <User className="w-5 h-5" /> General Information
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:bg-card'}`}
              >
                <Shield className="w-5 h-5" /> Security & 2FA
              </button>
              <button 
                onClick={() => setActiveTab('billing')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'billing' ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:bg-card'}`}
              >
                <CreditCard className="w-5 h-5" /> Billing & Invoices
              </button>
            </nav>
          </div>

        </div>

        {/* Right Column: Dynamic Content */}
        <div className="flex-1 space-y-6">
          
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Personal Information Form */}
              <div className="bg-card rounded-[2rem] border border-border p-8 shadow-sm">
                <h3 className="text-xl font-extrabold text-foreground mb-6">Personal Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input value={formData.firstName} onChange={e => setFormData(p => ({...p, firstName: e.target.value}))} className="pl-10 rounded-xl bg-card border-border" placeholder="John" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input value={formData.lastName} onChange={e => setFormData(p => ({...p, lastName: e.target.value}))} className="pl-10 rounded-xl bg-card border-border" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input value={userData?.email || authUser?.email || ''} readOnly className="pl-10 rounded-xl bg-input border-transparent text-muted-foreground" />
                    </div>
                    <p className="text-xs text-foreground font-bold mt-1">Verified</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className="pl-10 rounded-xl bg-card border-border" />
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">Residential Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <textarea value={formData.address1} onChange={e => setFormData(p => ({...p, address1: e.target.value}))} rows={3} className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:bg-card focus:border-border outline-none resize-none text-sm transition-all" placeholder="Enter your full address..."></textarea>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <Button onClick={handleDiscard} disabled={saving} variant="outline" className="rounded-xl font-bold">Discard Changes</Button>
                  <Button onClick={handleSaveProfile} disabled={saving} className="rounded-xl bg-foreground hover:bg-foreground text-foreground font-bold px-8 flex items-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Profile
                  </Button>
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="bg-card rounded-[2rem] border border-border p-8 shadow-sm">
                <h3 className="text-xl font-extrabold text-foreground mb-2">Connected Accounts</h3>
                <p className="text-muted-foreground text-sm mb-6">Link your social accounts for faster login and profile syncing.</p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center border border-border">
                        <OptimizedImage src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Google</h4>
                        <p className="text-xs text-muted-foreground">Connected as {userData?.email || authUser?.email || 'guest@gmail.com'}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-xl border-border text-red-600 hover:text-red-700 hover:bg-red-50 font-bold text-xs h-8">Disconnect</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center">
                        <Link className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Facebook</h4>
                        <p className="text-xs text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-xl border-border font-bold text-xs h-8">Connect</Button>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Password Change */}
              <div className="bg-card rounded-[2rem] border border-border p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground">Change Password</h3>
                    <p className="text-sm text-muted-foreground">Ensure your account is using a long, random password.</p>
                  </div>
                </div>

                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">Current Password</label>
                    <Input type="password" placeholder="••••••••" className="rounded-xl bg-card" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">New Password</label>
                    <Input type="password" placeholder="••••••••" className="rounded-xl bg-card" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">Confirm New Password</label>
                    <Input type="password" placeholder="••••••••" className="rounded-xl bg-card" />
                  </div>
                  <Button className="w-full rounded-xl bg-card text-foreground font-bold mt-4">Update Password</Button>
                </div>
              </div>

              {/* 2FA */}
              <div className="bg-card rounded-[2rem] border border-border p-8 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0 mt-1">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                        Two-Factor Authentication (2FA)
                        <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Enabled</span>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-lg leading-relaxed">
                        Add an extra layer of security to your account. Once enabled, you'll be prompted to enter a code from your authenticator app during login.
                      </p>
                      
                      <div className="mt-6 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-bold text-foreground">Google Authenticator</span>
                        <span className="text-xs text-muted-foreground">• Configured 2 months ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold">
                    Disable 2FA
                  </Button>
                </div>
              </div>

            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
