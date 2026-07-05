'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useGlobalCMS } from '@/hooks/useCMS';
import PublicContainer from '@/components/layout/PublicContainer';

export default function Footer() {
  const { data } = useGlobalCMS();
  const footerData = data?.success ? data.data?.footer : null;

  // Fallbacks
  const quickLinks = (footerData?.quickLinks || [
    { label: 'Home', url: '/' },
    { label: 'Events', url: '/events' },
    { label: 'Judges', url: '/judges' },
    { label: 'Gallery', url: '/gallery' },
    { label: 'Winners', url: '/winners' },
    { label: 'About', url: '/about' },
  ]).filter((l: any) => l.label?.toLowerCase() !== 'about');

  const services = footerData?.services || [
    { label: 'Dog Registration', url: '/dashboard/dogs/add' },
    { label: 'Show Entry', url: '/events' },
    { label: 'KCI Verification', url: '/dashboard/dogs/kci' },
    { label: 'Results Hall', url: '/winners' },
  ];

  const supportLinks = footerData?.resources || [
    { label: 'Help Center', url: '/support' },
    { label: 'Contact Us', url: '/contact' },
    { label: 'Terms & Conditions', url: '/terms' },
    { label: 'Privacy Policy', url: '/privacy' },
  ];

  const socialLinks = (footerData?.socialLinks || [
    { name: 'Facebook', url: 'https://facebook.com' },
    { name: 'Instagram', url: 'https://instagram.com' },
    { name: 'Twitter', url: 'https://twitter.com' },
    { name: 'YouTube', url: 'https://youtube.com' },
  ]).filter((l: any) => l.name?.toLowerCase() !== 'twitter');

  const contact = footerData?.contactDetails || {};

  return (
    <footer
      className="w-full relative z-10 overflow-hidden border-t border-border bg-white dark:bg-[#0A0A0A]"
    >
      <PublicContainer className="pt-[80px] pb-[40px]">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 pb-12 border-b border-border">
          <div className="flex flex-col items-start gap-3">
            <Link href="/" aria-label="JuzDog Home" className="footer-logo">
              <img
                src="/Untitled-1.png"
                alt="JuzDog"
                width={180}
                height={56}
                loading="lazy"
                className="footer-logo-img"
              />
            </Link>
            {/* <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mt-5">
              India&apos;s modern dog show &amp; breed registration platform.
            </p> */}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 w-full lg:w-auto">
            {socialLinks.map((social: any) => (
              <a
                key={social.name}
                href={social.url}
                className="text-xs font-bold text-muted-foreground bg-accent/20 dark:bg-[#0A0A0A] border border-border px-5 py-2.5 rounded-full hover:bg-accent hover:text-primary hover:-translate-y-1 transition-all duration-300 uppercase"
              >
                {social.name?.toUpperCase()}
              </a>
            ))}
            <Link
              href="/login"
              className="w-full sm:w-auto mt-4 sm:mt-0 bg-primary hover:opacity-90 text-primary-foreground px-8 h-[42px] rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all uppercase"
            >
              LOGIN
            </Link>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 items-start w-full">

          {/* SECTION 1: QUICK LINKS */}
          <div className="bg-card dark:bg-[#0A0A0A] border border-border rounded-[24px] p-[32px] flex flex-col items-start w-full min-h-[280px] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <h4 className="text-foreground text-[20px] font-bold mb-6 tracking-[1px] text-left w-full">QUICK LINKS</h4>
            <ul className="grid grid-cols-2 gap-y-5 gap-x-8 w-full items-start">
              {quickLinks.map((link: any) => (
                <li key={link.label} className="text-left flex items-start">
                  <Link href={link.url} className="text-muted-foreground hover:text-primary transition-colors duration-250 text-sm font-medium uppercase">
                    {link.label?.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 3: SUPPORT */}
          <div className="hidden bg-card dark:bg-[#0A0A0A] border border-border rounded-[24px] p-[32px] flex-col items-start w-full min-h-[280px] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <h4 className="text-foreground text-[20px] font-bold mb-6 tracking-[1px] text-left w-full">SUPPORT</h4>
            <ul className="grid grid-cols-2 gap-y-5 gap-x-8 w-full items-start">
              {supportLinks.map((link: any) => (
                <li key={link.label} className="text-left flex items-start">
                  <Link href={link.url} className="text-muted-foreground hover:text-primary transition-colors duration-250 text-sm font-medium uppercase">
                    {link.label?.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 4: CONTACT */}
          <div className="bg-card dark:bg-[#0A0A0A] border border-border rounded-[24px] p-[32px] flex flex-col items-start w-full min-h-[280px] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <h4 className="text-foreground text-[20px] font-bold mb-6 tracking-[1px] text-left w-full">CONTACT</h4>
            <ul className="space-y-5 flex flex-col w-full items-start">
              <li className="flex flex-row items-start justify-start gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground text-sm font-medium text-left">{contact?.phone || '+91  99438 99418'}</span>
              </li>
              <li className="flex flex-row items-start justify-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground text-sm font-medium text-left">{contact?.email || 'info@juzdog.co'}</span>
              </li>
              <li className="flex flex-row items-start justify-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground text-sm font-medium text-left leading-relaxed uppercase">{(contact?.address || 'Coimbatore, Tamil Nadu')?.toUpperCase()}</span>
              </li>
            </ul>
            <h4 className="text-foreground text-[16px] font-bold mt-8 mb-4 tracking-[1px] text-left w-full uppercase">SOCIAL MEDIA</h4>
            <div className="flex gap-4 items-center">
              <a href="https://www.facebook.com/share/1GLkRXtdvZ/" target="_blank" rel="noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              <a href="https://www.instagram.com/juz_dog?igsh=b25seHlnZGlpdnNo" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </a>
              <a href="https://www.youtube.com/@Juzdog" target="_blank" rel="noreferrer" aria-label="YouTube" className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
              </a>
            </div>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="w-full border-t border-border mt-[60px] mb-[20px]" />

        {/* BOTTOM COPYRIGHT */}
        <div className="w-full bg-transparent flex justify-center items-center pt-[10px]">
          <p className="text-muted-foreground text-sm font-medium text-center">
            {footerData?.copyrightText || '© 2026 JuzDog. All Rights Reserved.'}
          </p>
        </div>

      </PublicContainer>
    </footer>
  );
}
