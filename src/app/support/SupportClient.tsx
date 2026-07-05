'use client';

import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import { Mail, Phone, LifeBuoy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function SupportClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const payload = {
        name: formData.name || 'Anonymous',
        email: formData.email,
        message: `Subject: ${formData.subject}\n\n${formData.message}`
      };

      const result = await api.post('/contact', payload); // Reuse contact endpoint

      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <PageContainer>
      <BreadcrumbBanner
        slug="support"
        fallbackTitle="Support Center"
        fallbackSubtitle="Need help with your account, event registrations, or technical issues? Our support team is here to help."
        fallbackImage="/images/contact_banner.png"
      />
      
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-card border border-border rounded-[2rem] p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-brand-dark/10 flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-foreground mb-3">Email Support</h3>
            <p className="text-muted-foreground mb-6">Send us an email anytime and we will get back to you within 24 hours.</p>
            <a href="mailto:info@juzdog.co" className="text-foreground font-bold hover:underline">info@juzdog.co</a>
          </div>

          <div className="bg-card border border-border rounded-[2rem] p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-brand-dark/10 flex items-center justify-center mb-6">
              <Phone className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-foreground mb-3">Phone Support</h3>
            <p className="text-muted-foreground mb-6">Our support line is open Monday to Saturday from 9:00 AM to 7:00 PM.</p>
            <a href="tel:+919943899418" className="text-foreground font-bold hover:underline">+91 99438 99418</a>
          </div>

          <div className="bg-card border border-border rounded-[2rem] p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-brand-dark/10 flex items-center justify-center mb-6">
              <LifeBuoy className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-foreground mb-3">Help Center</h3>
            <p className="text-muted-foreground mb-6">Browse our FAQ and help center for quick answers to common questions.</p>
            <a href="/contact" className="mt-auto">
              <Button variant="outline">Visit FAQ</Button>
            </a>
          </div>
        </div>

        <div className="bg-card p-10 rounded-[2.5rem] premium-shadow border border-border max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold font-outfit text-foreground mb-2 text-center">Submit a Ticket</h2>
          <p className="text-muted-foreground font-medium mb-8 text-center">Fill out the form below and our support team will assist you.</p>

          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-10 bg-green-500/10 rounded-2xl border border-green-500/20">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Ticket Submitted!</h3>
              <p className="text-muted-foreground text-center">We have received your support request and will get back to you shortly.</p>
              <Button onClick={() => setStatus('idle')} variant="outline" className="mt-6">Submit Another</Button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Your Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all text-foreground" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Email Address</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all text-foreground" placeholder="john@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Subject</label>
                <select required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all appearance-none text-muted-foreground">
                  <option value="">Select a topic...</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="Payment/Billing">Payment / Billing</option>
                  <option value="Technical Problem">Technical Problem</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Description</label>
                <textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows={5} className="w-full bg-card border border-border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all resize-none text-foreground" placeholder="Please describe the issue you are facing..."></textarea>
              </div>

              {status === 'error' && <p className="text-red-500 text-sm font-bold text-center">Failed to submit ticket. Please try again.</p>}

              <Button type="submit" disabled={status === 'loading'} size="lg" className="w-full h-14 text-lg mt-4 disabled:opacity-50">
                {status === 'loading' ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
