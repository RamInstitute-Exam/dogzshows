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
  const quickLinks = footerData?.quickLinks || [
    { label: 'Home', url: '/' },
    { label: 'Events', url: '/events' },
    { label: 'Judges', url: '/judges' },
    { label: 'Gallery', url: '/gallery' },
    { label: 'Winners', url: '/winners' },
    { label: 'About', url: '/about' },
  ];
  
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
  
  const socialLinks = footerData?.socialLinks || [
    { name: 'Facebook', url: 'https://facebook.com' },
    { name: 'Instagram', url: 'https://instagram.com' },
    { name: 'Twitter', url: 'https://twitter.com' },
    { name: 'YouTube', url: 'https://youtube.com' },
  ];
  
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
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mt-5">
              India&apos;s modern dog show &amp; breed registration platform.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 w-full lg:w-auto">
            {socialLinks.map((social: any) => (
              <a 
                key={social.name} 
                href={social.url} 
                className="text-xs font-bold text-muted-foreground bg-accent/20 dark:bg-[#0A0A0A] border border-border px-5 py-2.5 rounded-full hover:bg-accent hover:text-primary hover:-translate-y-1 transition-all duration-300"
              >
                {social.name}
              </a>
            ))}
            <Link 
              href="/login" 
              className="w-full sm:w-auto mt-4 sm:mt-0 bg-primary hover:opacity-90 text-primary-foreground px-8 h-[42px] rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all"
            >
              Login
            </Link>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start w-full">

          {/* SECTION 1: QUICK LINKS */}
          <div className="bg-card dark:bg-[#0A0A0A] border border-border rounded-[24px] p-[32px] flex flex-col items-start w-full min-h-[280px] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <h4 className="text-foreground text-[20px] font-bold mb-6 tracking-[1px] text-left w-full">QUICK LINKS</h4>
            <ul className="grid grid-cols-2 gap-y-5 gap-x-8 w-full items-start">
              {quickLinks.map((link: any) => (
                <li key={link.label} className="text-left flex items-start">
                  <Link href={link.url} className="text-muted-foreground hover:text-primary transition-colors duration-250 text-sm font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 2: SERVICES */}
          <div className="bg-card dark:bg-[#0A0A0A] border border-border rounded-[24px] p-[32px] flex flex-col items-start w-full min-h-[280px] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <h4 className="text-foreground text-[20px] font-bold mb-6 tracking-[1px] text-left w-full">SERVICES</h4>
            <ul className="grid grid-cols-2 gap-y-5 gap-x-8 w-full items-start">
              {services.map((link: any) => (
                <li key={link.label} className="text-left flex items-start">
                  <Link href={link.url} className="text-muted-foreground hover:text-primary transition-colors duration-250 text-sm font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 3: SUPPORT */}
          <div className="bg-card dark:bg-[#0A0A0A] border border-border rounded-[24px] p-[32px] flex flex-col items-start w-full min-h-[280px] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <h4 className="text-foreground text-[20px] font-bold mb-6 tracking-[1px] text-left w-full">SUPPORT</h4>
            <ul className="grid grid-cols-2 gap-y-5 gap-x-8 w-full items-start">
              {supportLinks.map((link: any) => (
                <li key={link.label} className="text-left flex items-start">
                  <Link href={link.url} className="text-muted-foreground hover:text-primary transition-colors duration-250 text-sm font-medium">
                    {link.label}
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
                <span className="text-muted-foreground text-sm font-medium text-left">{contact?.phone || '+91 98765 43210'}</span>
              </li>
              <li className="flex flex-row items-start justify-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground text-sm font-medium text-left">{contact?.email || 'support@juzdog.com'}</span>
              </li>
              <li className="flex flex-row items-start justify-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground text-sm font-medium text-left leading-relaxed">{contact?.address || 'Mumbai, India'}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="w-full border-t border-border mt-[60px] mb-[20px]" />

        {/* BOTTOM COPYRIGHT */}
        <div className="w-full bg-transparent flex flex-col md:flex-row justify-between items-center gap-4 pt-[10px]">
          <p className="text-muted-foreground text-sm font-medium">
            {footerData?.copyrightText || '© 2026 JuzDog'}
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <Link href={footerData?.privacyUrl || "/privacy"} className="text-muted-foreground hover:text-primary transition-colors duration-250">Privacy Policy</Link>
            <Link href={footerData?.termsUrl || "/terms"} className="text-muted-foreground hover:text-primary transition-colors duration-250">Terms</Link>
            <Link href="/support" className="text-muted-foreground hover:text-primary transition-colors duration-250">Support</Link>
          </div>
          
          <p className="text-muted-foreground text-sm font-medium">
            {footerData?.description || 'Made with ❤️ in India'}
          </p>
        </div>

      </PublicContainer>
    </footer>
  );
}
