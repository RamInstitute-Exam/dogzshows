'use client';

import React, { useState } from 'react';
import { Save, Settings as SettingsIcon, Database, Shield, Globe, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';

export default function PlatformSettings() {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Settings saved securely');
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8 bg-background">
        <div className="w-full max-w-[1000px] mx-auto space-y-6">
          
          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-emerald-500" /> System Settings
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Configure global application parameters and integrations.</p>
            </div>
            <Button onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-foreground font-bold">
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>

          <div className="space-y-6">
            
            <div className="bg-card p-8 rounded-2xl border border-border shadow-xl">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                <Globe className="w-5 h-5 text-emerald-500" /> General Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Platform Name</label>
                  <input type="text" defaultValue="JuzDog Events Platform" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Support Email</label>
                  <input type="email" defaultValue="support@juzdog.com" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Platform Currency</label>
                  <select className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-emerald-500 outline-none appearance-none">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Timezone</label>
                  <select className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-emerald-500 outline-none appearance-none">
                    <option>Asia/Kolkata</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border shadow-xl">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                <Shield className="w-5 h-5 text-emerald-500" /> Security & Maintenance
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-card border border-border rounded-xl cursor-pointer">
                  <div>
                    <h3 className="text-foreground font-bold">Maintenance Mode</h3>
                    <p className="text-xs text-muted-foreground mt-1">Disables public access. Only admins can log in.</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-accent">
                    <input type="checkbox" className="peer opacity-0 w-0 h-0" />
                    <span className="absolute cursor-pointer top-1 left-1 bg-[#7C8798] w-4 h-4 rounded-full transition-all peer-checked:bg-emerald-500 peer-checked:left-7"></span>
                  </div>
                </label>
                <label className="flex items-center justify-between p-4 bg-card border border-border rounded-xl cursor-pointer">
                  <div>
                    <h3 className="text-foreground font-bold">Require 2FA for Admins</h3>
                    <p className="text-xs text-muted-foreground mt-1">Enforce two-factor authentication for all admin accounts.</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-accent">
                    <input type="checkbox" defaultChecked className="peer opacity-0 w-0 h-0" />
                    <span className="absolute cursor-pointer top-1 left-1 bg-[#7C8798] w-4 h-4 rounded-full transition-all peer-checked:bg-emerald-500 peer-checked:left-7"></span>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border shadow-xl">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                <Database className="w-5 h-5 text-emerald-500" /> Integration Keys
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Razorpay Key ID</label>
                  <input type="password" defaultValue="rzp_test_123456789" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-emerald-500 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">AWS S3 Bucket Name</label>
                  <input type="text" defaultValue="juzdog-media-assets" className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-emerald-500 outline-none font-mono" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
