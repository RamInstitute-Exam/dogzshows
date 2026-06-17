'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import api from '@/services/api';

export default function GuidelinesCMS() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('rules');

  const [content, setContent] = useState({
    rules: '1. All dogs must be vaccinated.\n2. Aggressive dogs will be disqualified.\n3. Judges decision is final.',
    privacy: 'We respect your privacy. All user data is encrypted and stored securely.',
    terms: 'By using this platform, you agree to abide by the FCI regulations.',
    faq: 'Q: How do I register my dog?\nA: Create an account and add a dog profile.'
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Guidelines updated successfully');
    }, 1000);
  };

  const tabs = [
    { id: 'rules', label: 'Show Rules & Regulations' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms of Service' },
    { id: 'faq', label: 'Frequently Asked Questions' }
  ];

  return (
    <div className="flex bg-card">
      <AdminSidebar />
      <main className="flex-1 md:ml-64  bg-background">
        <div className="w-full   space-y-4">
          
          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <FileText className="w-8 h-8 text-cyan-500" /> Platform Guidelines
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Manage static content, legal texts, and global rules.</p>
            </div>
            <Button onClick={handleSave} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-foreground font-bold">
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Publish Changes
            </Button>
          </div>

          <div className="flex ga">
            <div className="w-64 shrink-0 space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-cyan-500 text-foreground shadow-lg' 
                      : 'text-muted-foreground hover:bg-card hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && <CheckCircle className="w-4 h-4" />}
                </button>
              ))}
            </div>

            <div className="flex-1 bg-card p-6 rounded-2xl border border-border shadow-xl">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-foreground">
                  Editing: {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <span className="text-xs text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20 font-bold uppercase">Markdown Supported</span>
              </div>
              
              <textarea 
                value={(content as any)[activeTab]}
                onChange={(e) => setContent({ ...content, [activeTab]: e.target.value })}
                className="w-full h-[500px] p-6 bg-card border border-border rounded-xl text-muted-foreground focus:outline-none focus:border-cyan-500 font-mono text-sm leading-relaxed"
                placeholder="Enter markdown content here..."
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
