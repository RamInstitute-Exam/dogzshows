'use client';

import Link from 'next/link';
import { Dog, MapPin, Phone, Mail } from 'lucide-react';
import { config } from '@/lib/config';
import api from '@/lib/api';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [footerData, setFooterData] = useState<any>(null);

  useEffect(() => {
    async function fetchFooter() {
      try {
        const result = await api.get('/cms/global');
        if (result.success) {
          setFooterData(result.data?.footer);
        }
      } catch (error) {
        console.error('Failed to fetch footer data:', error);
      }
    }
    fetchFooter();
  }, []);

  // Fallbacks
  const quickLinks = footerData?.quickLinks || [];
  const services = footerData?.services || [];
  const supportLinks = footerData?.resources || [];
  const socialLinks = footerData?.socialLinks || [];
  const contact = footerData?.contactDetails || {};

  return (
    <footer className="bg-[#050b18] border-t border-border relative z-50 w-full">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-10 lg:py-12">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 pb-12 border-b border-border">
          <div className="flex items-center gap-2">
            <Dog className="h-8 w-8 text-[#f59e0b]" />
            <span className="font-extrabold text-[#ffffff] text-2xl tracking-tight">Juz<span className="text-[#f59e0b]">Dog</span></span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 w-full lg:w-auto">
            {socialLinks.map((social: any) => (
              <a key={social.name} href={social.url} className="text-xs font-bold text-[#94a3b8] bg-[#0f172a] border border-border px-4 py-2 rounded-full hover:bg-white/5 hover:text-brand-orange transition-all">
                {social.name}
              </a>
            ))}
            <Link href="/login" className="w-full sm:w-auto mt-4 sm:mt-0 bg-yellow-500 hover:bg-yellow-600 text-foreground px-8 h-[42px] rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-yellow-500/30">
              Login
            </Link>
          </div>
        </div>

        {/* MAIN GRID */}
        {/* Main layout: 1 column on mobile (so each glass card is full width), 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16 items-start w-full">

          {/* SECTION 1: QUICK LINKS */}
          <div className="rounded-2xl bg-slate-900/60 border border-border backdrop-blur-xl p-6 flex flex-col items-start w-full min-h-[280px]">
            <h4 className="text-foreground font-bold mb-6 tracking-widest text-sm uppercase text-left w-full">Quick Links</h4>
            <ul className="grid grid-cols-2 gap-y-5 gap-x-8 w-full items-start">
              {quickLinks.map((link: any) => (
                <li key={link.label} className="text-left flex items-start min-h-[32px]">
                  <Link href={link.url} className="text-slate-300 hover:text-amber-400 inline-block transition-all duration-300 text-sm font-medium whitespace-normal break-words">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 2: SERVICES */}
          <div className="rounded-2xl bg-slate-900/60 border border-border backdrop-blur-xl p-6 flex flex-col items-start w-full min-h-[280px]">
            <h4 className="text-foreground font-bold mb-6 tracking-widest text-sm uppercase text-left w-full">Services</h4>
            <ul className="grid grid-cols-2 gap-y-5 gap-x-8 w-full items-start">
              {services.map((link: any) => (
                <li key={link.label} className="text-left flex items-start min-h-[32px]">
                  <Link href={link.url} className="text-slate-300 hover:text-amber-400 inline-block transition-all duration-300 text-sm font-medium whitespace-normal break-words">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 3: SUPPORT */}
          <div className="rounded-2xl bg-slate-900/60 border border-border backdrop-blur-xl p-6 flex flex-col items-start w-full min-h-[280px]">
            <h4 className="text-foreground font-bold mb-6 tracking-widest text-sm uppercase text-left w-full">Support</h4>
            <ul className="grid grid-cols-2 gap-y-5 gap-x-8 w-full items-start">
              {supportLinks.map((link: any) => (
                <li key={link.label} className="text-left flex items-start min-h-[32px]">
                  <Link href={link.url} className="text-slate-300 hover:text-amber-400 inline-block transition-all duration-300 text-sm font-medium whitespace-normal break-words">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 4: CONTACT */}
          <div className="rounded-2xl bg-slate-900/60 border border-border backdrop-blur-xl p-6 flex flex-col items-start w-full md:col-span-3 lg:col-span-1 min-h-[280px]">
            <h4 className="text-foreground font-bold mb-6 tracking-widest text-sm uppercase text-left w-full">Contact</h4>
            <ul className="space-y-5 flex flex-col w-full items-start">
              <li className="flex flex-row items-start justify-start gap-3 text-slate-300 text-sm font-medium min-h-[32px]">
                <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-left">{contact?.phone || '+91 98765 43210'}</span>
              </li>
              <li className="flex flex-row items-start justify-start gap-3 text-slate-300 text-sm font-medium min-h-[32px]">
                <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-left">{contact?.email || 'support@juzdog.com'}</span>
              </li>
              <li className="flex flex-row items-start justify-start gap-3 text-slate-300 text-sm font-medium min-h-[32px]">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-left leading-relaxed">{contact?.address || 'Mumbai, India'}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM FOOTER */}
        <div className="pt-8 border-t border-border flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-[#94a3b8] text-sm font-medium">{footerData?.copyrightText || '© 2026 JuzDog'}</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
            <Link href={footerData?.privacyUrl || "/privacy"} className="text-slate-300 hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <span className="text-slate-500">•</span>
            <Link href={footerData?.termsUrl || "/terms"} className="text-slate-300 hover:text-amber-400 transition-colors">Terms</Link>
            <span className="text-slate-500">•</span>
            <Link href="/support" className="text-slate-300 hover:text-amber-400 transition-colors">Support</Link>
          </div>
          <p className="text-[#94a3b8] text-sm font-medium">{footerData?.description || 'Made with ❤️ in India'}</p>
        </div>

      </div>

    </footer>
  );
}
