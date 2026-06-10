'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Clock, ChevronDown } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function ContactUs() {
  return (
    <main className="min-h-screen bg-brand-light pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-outfit font-extrabold text-brand-dark mb-6 tracking-tight">Get In Touch</h1>
          <p className="text-xl text-gray-500 font-medium">
            Booking for an upcoming dog show or need a private studio session for your champion? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          
          {/* Contact Details & Map */}
          <div className="space-y-8">
            <div className="bg-brand-darker text-white p-10 rounded-[2.5rem] shadow-xl">
              <h2 className="text-2xl font-bold font-outfit mb-8">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Phone</p>
                    <p className="font-medium text-lg">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Email</p>
                    <p className="font-medium text-lg">hello@juztdogmedia.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Office</p>
                    <p className="font-medium text-lg leading-relaxed">
                      123 Photography Lane, Studio District<br />
                      Bangalore, Karnataka 560001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Business Hours</p>
                    <p className="font-medium text-lg">Mon - Sat: 9:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/10">
                <button className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                </button>
              </div>
            </div>

            {/* Google Map Mock */}
            <div className="w-full h-64 bg-gray-200 rounded-[2.5rem] overflow-hidden border border-gray-300 relative group">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" alt="Map View" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-lg premium-shadow text-brand-dark font-bold text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-orange" /> View on Google Maps
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-10 rounded-[2.5rem] premium-shadow border border-gray-100">
            <h2 className="text-3xl font-bold font-outfit text-brand-dark mb-2">Send a Message</h2>
            <p className="text-gray-500 font-medium mb-8">Fill out the form below and we'll get back to you within 24 hours.</p>
            
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all" placeholder="John" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all" placeholder="john@example.com" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Service Required</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all appearance-none text-gray-600">
                  <option>Select a service...</option>
                  <option>Dog Show Photography Coverage</option>
                  <option>Studio Pet Portrait</option>
                  <option>Event Videography</option>
                  <option>Poster & Graphic Design</option>
                  <option>General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all resize-none" placeholder="Tell us about your event or dog..."></textarea>
              </div>

              <Button size="lg" className="w-full h-14 text-lg mt-4">
                Send Message
              </Button>
            </form>
          </div>

        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold font-outfit text-brand-dark mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { q: 'How early should we book for a dog show?', a: 'For national or major championship shows, we recommend booking our team at least 2 months in advance to guarantee availability and allow for pre-event marketing material design.' },
              { q: 'Do you provide raw photos/videos?', a: 'We pride ourselves on the final polished product. Therefore, we do not provide RAW unedited files. All packages include high-resolution edited images that reflect our brand quality.' },
              { q: 'Can you cover shows outside of India?', a: 'Yes! While based in India, our team frequently travels internationally for major FCI and specialty shows. Travel and accommodation fees will apply.' }
            ].map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 premium-shadow">
                <div className="flex justify-between items-center cursor-pointer">
                  <h3 className="font-bold text-brand-dark text-lg">{faq.q}</h3>
                  <ChevronDown className="w-5 h-5 text-brand-orange" />
                </div>
                <div className="mt-4 text-gray-500 font-medium leading-relaxed">
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
