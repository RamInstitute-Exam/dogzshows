'use client';

import Link from 'next/link';
import { Camera, Globe, Mail, ArrowRight, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-darker text-gray-300 pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          
          {/* Brand & Intro */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 group mb-6">
              <div className="bg-brand-orange p-2 rounded-xl">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <span className="font-outfit font-extrabold text-2xl tracking-tight text-white">
                JuztDog <span className="font-light text-gray-400">Media</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              India's premier media agency dedicated to capturing the finest dog shows, creating stunning portraits, and delivering professional event videography.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-orange hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-orange hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-orange hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold font-outfit mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-brand-orange transition-colors">Home</Link></li>
              <li><Link href="/photos" className="hover:text-brand-orange transition-colors">Photo Gallery</Link></li>
              <li><Link href="/videos" className="hover:text-brand-orange transition-colors">Video Gallery</Link></li>
              <li><Link href="/entries" className="hover:text-brand-orange transition-colors">Show Entries</Link></li>
              <li><Link href="/about" className="hover:text-brand-orange transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-brand-orange transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold font-outfit mb-6 uppercase tracking-wider text-sm">Services</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-brand-orange transition-colors cursor-pointer">Dog Show Coverage</li>
              <li className="hover:text-brand-orange transition-colors cursor-pointer">Studio Photography</li>
              <li className="hover:text-brand-orange transition-colors cursor-pointer">Event Videography</li>
              <li className="hover:text-brand-orange transition-colors cursor-pointer">Creative Poster Design</li>
              <li className="hover:text-brand-orange transition-colors cursor-pointer">Online Registrations</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold font-outfit mb-6 uppercase tracking-wider text-sm">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Subscribe to receive updates on upcoming dog shows and exclusive gallery releases.</p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-orange transition-colors"
              />
              <button type="submit" className="absolute right-2 top-2 bottom-2 bg-brand-orange text-white px-3 rounded-lg flex items-center justify-center hover:bg-brand-orange-light transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} JuztDog Media. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-brand-orange transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand-orange transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
