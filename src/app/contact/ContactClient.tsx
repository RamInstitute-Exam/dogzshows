'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Clock, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import PageContainer from '@/components/layout/PageContainer';
import { config } from '@/lib/config';
import api from '@/lib/api';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function ContactClient({ initialBannerData }: { initialBannerData?: any }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    service: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${config.apiUrl}`;
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      const payload = {
        name: name || 'Anonymous',
        email: formData.email,
        message: `Service: ${formData.service}\n\n${formData.message}`
      };

      const result = await api.post('/contact', payload);

      if (result.success) {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', service: '', message: '' });
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
        slug="contact"
        fallbackTitle="Get In Touch"
        fallbackSubtitle="Booking for an upcoming dog show or need a private studio session for your champion? We'd love to hear from you."
        fallbackImage="/images/contact_banner.png"
        initialBannerData={initialBannerData}
      />
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-12 lg:py-16">

        {/* Contact Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">

          {/* Contact Details & Map */}
          <div className="space-y-8">
            <div className="bg-brand-darker text-foreground p-10 rounded-[2.5rem] shadow-xl">
              <h2 className="text-2xl font-bold font-outfit mb-8">Contact Information</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-card/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1">Phone</p>
                    <p className="font-medium text-lg">+91 99438 99418</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-card/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1">Email</p>
                    <p className="font-medium text-lg">info@juzdog.co</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-card/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1">Office</p>
                    <p className="font-medium text-lg leading-relaxed">
                      COIMBATORE, TAMIL NADU
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-card/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1">Business Hours</p>
                    <p className="font-medium text-lg">Mon - Sat: 9:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-border">
                <a href="https://wa.me/919943899418" target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] hover:bg-[#1DA851] text-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                </a>
              </div>
            </div>


          </div>

          {/* Contact Form */}
          <div className="bg-card p-10 rounded-[2.5rem] premium-shadow border border-border">
            <h2 className="text-3xl font-bold font-outfit text-foreground mb-2">Send a Message</h2>
            <p className="text-muted-foreground font-medium mb-8">Fill out the form below and we'll get back to you within 24 hours.</p>

            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-10 bg-green-500/10 rounded-2xl border border-green-500/20">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Message Sent!</h3>
                <p className="text-muted-foreground">We'll get back to you as soon as possible.</p>
                <Button onClick={() => setStatus('idle')} variant="outline" className="mt-6">Send Another Message</Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-muted-foreground mb-2">First Name</label>
                    <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all text-foreground" placeholder="John" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Last Name</label>
                    <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all text-foreground" placeholder="Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Email Address</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all text-foreground" placeholder="john@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Service Required</label>
                  <select required value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} className="w-full bg-card border border-border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all appearance-none text-muted-foreground">
                    <option value="">Select a service...</option>
                    <option value="Dog Show Photography">Dog Show Photography Coverage</option>
                    <option value="Studio Portrait">Studio Pet Portrait</option>
                    <option value="Event Videography">Event Videography</option>
                    <option value="Graphic Design">Poster & Graphic Design</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Message</label>
                  <textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows={5} className="w-full bg-card border border-border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-foreground/20 focus:border-border outline-none transition-all resize-none text-foreground" placeholder="Tell us about your event or dog..."></textarea>
                </div>

                {status === 'error' && <p className="text-red-500 text-sm font-bold">Failed to send message. Please try again.</p>}

                <Button type="submit" disabled={status === 'loading'} size="lg" className="w-full h-14 text-lg mt-4 disabled:opacity-50">
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>

        </div>

        {/* FAQ Section */}
        <div className="hidden max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold font-outfit text-foreground mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'How early should we book for a dog show?', a: 'For national or major championship shows, we recommend booking our team at least 2 months in advance to guarantee availability and allow for pre-event marketing material design.' },
              { q: 'Do you provide raw photos/videos?', a: 'We pride ourselves on the final polished product. Therefore, we do not provide RAW unedited files. All packages include high-resolution edited images that reflect our brand quality.' },
              { q: 'Can you cover shows outside of India?', a: 'Yes! While based in India, our team frequently travels internationally for major FCI and specialty shows. Travel and accommodation fees will apply.' }
            ].map((faq, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 premium-shadow">
                <div className="flex justify-between items-center cursor-pointer">
                  <h3 className="font-bold text-foreground text-lg uppercase tracking-wider">{faq.q}</h3>
                  <ChevronDown className="w-5 h-5 text-foreground" />
                </div>
                <div className="mt-4 text-muted-foreground font-medium leading-relaxed">
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
