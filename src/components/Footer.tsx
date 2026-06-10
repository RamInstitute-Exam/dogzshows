'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Dog,
  Mail,
  Phone,
  MapPin,
  Heart,
  ArrowRight
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 4000);
    }, 1200);
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-8 relative overflow-hidden z-10">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* MIDDLE ROW: Main footer links matrices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Column 1: Branding and Socials */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <Dog className="h-8 w-8 text-indigo-500" />
              <span className="font-bold text-xl text-white tracking-tight">DogProfiles</span>
            </Link>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
              The premier, secure cloud ecosystem for breeders, veterinarians, and aspiring dog owners. Combining SEMrush-style analytics tracking with Airbnb-level adoption search workflows.
            </p>
            <div className="flex items-center space-x-3.5 text-slate-400">
              {/* Facebook SVG */}
              <a href="#" className="p-2 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-xl transition-all border border-slate-850 hover:border-slate-700">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              {/* Twitter X SVG */}
              <a href="#" className="p-2 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-xl transition-all border border-slate-850 hover:border-slate-700">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Instagram SVG */}
              <a href="#" className="p-2 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-xl transition-all border border-slate-850 hover:border-slate-700">
                <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* LinkedIn SVG */}
              <a href="#" className="p-2 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-xl transition-all border border-slate-850 hover:border-slate-700">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* GitHub SVG */}
              <a href="#" className="p-2 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-xl transition-all border border-slate-850 hover:border-slate-700">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4.5">Marketplace</h4>
            <ul className="space-y-3 text-xs font-medium">
              <li>
                <Link href="/dogs" className="hover:text-white transition-colors">Find a Companion</Link>
              </li>
              <li>
                <Link href="/dogs?listingType=SALE" className="hover:text-white transition-colors">Verified Sale Listings</Link>
              </li>
              <li>
                <Link href="/dogs?listingType=ADOPTION" className="hover:text-white transition-colors">Adoption Registry</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About our Mission</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Breeder SaaS Panel */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4.5">Breeder Platform</h4>
            <ul className="space-y-3 text-xs font-medium">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">SaaS Workspace</Link>
              </li>
              <li>
                <Link href="/dashboard/billing" className="hover:text-white transition-colors">Premium Plans</Link>
              </li>
              <li>
                <Link href="/dashboard/appointments" className="hover:text-white transition-colors">Calendar Schedule</Link>
              </li>
              <li>
                <Link href="/dashboard/inbox" className="hover:text-white transition-colors">Inbox Messaging</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">Super Admin Center</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact details */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4.5">Contact Us</h4>
            <ul className="space-y-3.5 text-xs font-medium">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4.5 h-4.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">100 Pet Haven Boulevard, Suite 500, San Francisco, CA 94103</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4.5 h-4.5 text-indigo-500 flex-shrink-0" />
                <span className="text-slate-400">+1 (800) 555-PETS</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4.5 h-4.5 text-indigo-500 flex-shrink-0" />
                <span className="text-slate-400">support@dogprofiles.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM ROW: Copyright and Security indicators */}
        <div className="pt-8 border-t border-slate-900 flex flex-col lg:flex-row items-center justify-between gap-6 text-xs text-slate-450 font-medium">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} DogProfiles Platform. Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>for pet safety.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="text-slate-700">•</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span className="text-slate-700">•</span>
            <a href="#" className="hover:text-white transition-colors">Cookies Settings</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
