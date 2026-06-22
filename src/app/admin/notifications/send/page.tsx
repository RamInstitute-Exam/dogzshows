'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, RefreshCw, BellRing, Mail, Smartphone, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminButton } from '@/components/ui/admin-button';
import api from '@/services/api';

export default function SendNotification() {
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState('email');

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Broadcast dispatched successfully!');
    }, 1500);
  };

  return (
    <div className="w-full   space-y-4">
          
          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <BellRing className="w-8 h-8 text-indigo-500" /> Broadcast Center
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Dispatch alerts, SMS, or Emails to specific user segments.</p>
            </div>
            <AdminButton onClick={handleSend} loading={loading} variant="primary">
              Send Notification
            </AdminButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 ga">
            
            <div className="md:col-span-1 space-y-4">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
                <h3 className="text-foreground font-bold mb-4 border-b border-border pb-2">Target Segment</h3>
                <div className="space-y-3">
                  {['All Registered Users', 'Active Dog Owners', 'Judges Only', 'Upcoming Event Participants'].map((seg, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="segment" defaultChecked={i===0} className="w-4 h-4 text-indigo-500 bg-accent border-none focus:ring-indigo-500" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{seg}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
                <h3 className="text-foreground font-bold mb-4 border-b border-border pb-2">Delivery Channel</h3>
                <div className="space-y-3">
                  <button onClick={() => setChannel('email')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-bold transition-all ${channel === 'email' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-card border-border text-muted-foreground hover:bg-accent'}`}>
                    <Mail className="w-4 h-4" /> Email Blast
                  </button>
                  <button onClick={() => setChannel('sms')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-bold transition-all ${channel === 'sms' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-card border-border text-muted-foreground hover:bg-accent'}`}>
                    <Smartphone className="w-4 h-4" /> SMS Campaign
                  </button>
                  <button onClick={() => setChannel('push')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-bold transition-all ${channel === 'push' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-card border-border text-muted-foreground hover:bg-accent'}`}>
                    <BellRing className="w-4 h-4" /> Push Notification
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-xl h-full flex flex-col">
                <h2 className="text-xl font-bold text-foreground mb-6">Compose Message</h2>
                <div className="flex-1 flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Subject / Title</label>
                    <input type="text" placeholder="Enter message title..." className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Message Body</label>
                    <textarea placeholder="Type your broadcast message here..." className="w-full flex-1 min-h-[300px] p-4 bg-card border border-border rounded-lg text-foreground focus:border-indigo-500 outline-none resize-none"></textarea>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Supports dynamic tags: {"{{firstName}}"}, {"{{dogName}}"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      
  );
}
