'use client';

import { Dog, Mail, Phone, MapPin, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PremiumFooter() {
  return (
    <footer className="bg-background pt-24 pb-12 border-t border-border">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img src="/Untitled-1.png" alt="JuzDog" className="w-[180px] h-auto object-contain" />
            </div>
            <p className="text-muted-foreground text-[18px] mb-8 max-w-sm leading-[1.8] font-[400]">
              The premium enterprise dog event management ERP. Combining KCI registration, competition tracking, and professional media into one unified platform.
            </p>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((_, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:bg-[#F59E0B] hover:text-foreground transition-colors border border-border">
                  <Globe className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Cols */}
          <div>
            <h4 className="text-foreground font-[800] mb-6 tracking-wide">Platform</h4>
            <ul className="space-y-4">
              {['Home', 'Events', 'Judges', 'Gallery', 'Winners Hall'].map(link => (
                <li key={link}>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-[800] mb-6 tracking-wide">Resources</h4>
            <ul className="space-y-4">
              {['About Us', 'Photography', 'Rule Book', 'FCI Guidelines', 'Downloads'].map(link => (
                <li key={link}>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-[800] mb-6 tracking-wide">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-[#F59E0B] shrink-0 mt-1" />
                <span>123 Enterprise Tower,<br/>Bandra West, Mumbai 400050</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-[#F59E0B] shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-[#F59E0B] shrink-0" />
                <span>hello@juzdog.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm font-[500]">© {new Date().getFullYear()} JuzDog Management Platform. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-[500]">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
