'use client';

import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Globe, Mail, Shield, CreditCard, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'gallery', label: 'Media Gallery', icon: Cloud }, // Reusing Cloud icon for gallery
    { id: 'smtp', label: 'SMTP / Email', icon: Mail },
    { id: 'payment', label: 'Razorpay', icon: CreditCard },
    { id: 'storage', label: 'AWS S3', icon: Cloud },
    { id: 'auth', label: 'Authentication', icon: Shield },
  ];

  const [showDemoImages, setShowDemoImages] = useState(true);

  // Load settings
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings/SHOW_DEMO_IMAGES_WHEN_EMPTY');
        if (res.data?.success && res.data?.data) {
          setShowDemoImages(res.data.data.value === 'true');
        }
      } catch (err) {
        console.error('Error loading gallery setting:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (activeTab === 'gallery') {
      try {
        await api.put('/settings/SHOW_DEMO_IMAGES_WHEN_EMPTY', {
          value: showDemoImages.toString(),
          group: 'GENERAL'
        });
        alert('Gallery settings saved successfully');
      } catch (err) {
        console.error('Failed to save gallery settings', err);
        alert('Failed to save settings');
      }
    } else {
      alert('Mock save successful!');
    }
  };

  return (
    <div className="w-full">
      <div className="w-full space-y-4">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-blue-500" /> System Settings
            </h1>
            <p className="text-muted-foreground font-medium mt-1">Configure global application variables, API keys, and integrations.</p>
          </div>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
            <Save className="w-4 h-4 mr-2" /> Save All Changes
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex-shrink-0 bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-4 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
              >
                <tab.icon className="w-5 h-5" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 bg-card border border-border rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6 capitalize">{activeTab.replace('-', ' ')} Configuration</h2>
            
            <div className="space-y-4">
              {activeTab === 'general' && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Site Name</label>
                      <input type="text" className="w-full mt-1 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none" defaultValue="JuzDog" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Support Email</label>
                      <input type="email" className="w-full mt-1 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none" defaultValue="support@juzdog.co" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Maintenance Mode</label>
                      <select className="w-full mt-1 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none">
                        <option>Disabled</option>
                        <option>Enabled</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'gallery' && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-foreground">Show Demo Images When Empty</h3>
                        <p className="text-sm text-muted-foreground">If enabled, categories with 0 uploaded images will fallback to displaying placeholder demo images automatically.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input type="checkbox" className="sr-only peer" checked={showDemoImages} onChange={e => setShowDemoImages(e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'payment' && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Razorpay Key ID</label>
                      <input type="text" className="w-full mt-1 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none" placeholder="rzp_live_..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Razorpay Key Secret</label>
                      <input type="password" className="w-full mt-1 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none" placeholder="********" />
                    </div>
                  </div>
                </>
              )}
              {/* Additional tabs logic would be here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
