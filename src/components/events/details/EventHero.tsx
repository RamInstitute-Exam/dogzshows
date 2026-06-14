'use client';

import { Calendar, MapPin, Share2, Download, Timer, Trophy, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function EventHero({ event }: { event: any }) {
  return (
    <div className="relative w-full h-[650px] bg-card overflow-hidden flex items-center">
      {/* Background Image & Gradient */}
      <div className="absolute inset-0 z-0">
        <img src="/images/hero_banner.png" alt="Event Banner" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-[#0F172A]/40" />
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 mt-24">
        
        {/* Left Side Content */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex-1 max-w-2xl">
          <div className="flex gap-3 mb-6">
            <span className="px-4 py-1.5 bg-brand-orange text-foreground font-bold text-xs uppercase tracking-widest rounded-full shadow-md">
              {event.status}
            </span>
            <span className="px-4 py-1.5 bg-card/10 backdrop-blur-md border border-border text-foreground font-bold text-xs uppercase tracking-widest rounded-full">
              {event.type}
            </span>
          </div>
          
          <h1 className="text-muted-foregroundxl md:text-muted-foregroundxl lg:text-[56px] font-extrabold text-foreground tracking-tight mb-4 leading-tight drop-shadow-md">
            {event.name}
          </h1>
          <p className="text-xl text-muted-foreground font-medium mb-8 leading-relaxed">
            Register your dogs in India's most prestigious {event.type} championship, hosted by the {event.club}.
          </p>
          
          <div className="flex flex-wrap gap-8 text-foreground font-medium mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
                <Calendar className="w-5 h-5 text-brand-orange" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p>{event.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30">
                <MapPin className="w-5 h-5 text-brand-orange" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Venue</p>
                <p>{event.location}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Button className="h-[56px] px-8 bg-[#FF9800] hover:bg-orange-600 text-foreground font-bold text-base rounded-[14px] shadow-[0_0_30px_rgba(255,152,0,0.4)] flex items-center justify-center transition-all">
              Register Now
            </Button>
            <Button variant="outline" className="h-[56px] px-6 bg-card/10 hover:bg-card/20 text-foreground border-border backdrop-blur-sm rounded-[14px] font-bold flex items-center justify-center transition-all">
              <Download className="w-5 h-5 mr-2" /> Schedule
            </Button>
            <Button variant="outline" className="h-[56px] px-6 bg-card/10 hover:bg-card/20 text-foreground border-border backdrop-blur-sm rounded-[14px] font-bold flex items-center justify-center transition-all">
              <Share2 className="w-5 h-5 mr-2" /> Share
            </Button>
          </div>
        </motion.div>

        {/* Right Side Floating Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="hidden lg:block w-[380px] bg-card/10 backdrop-blur-xl border border-border rounded-[28px] p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 opacity-10">
            <Trophy className="w-48 h-48 text-foreground" />
          </div>
          
          <h3 className="text-foreground font-extrabold text-2xl mb-6">Event Snapshot</h3>
          
          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div className="flex items-center gap-3 text-muted-foreground font-medium">
                <Timer className="w-5 h-5 text-brand-orange" /> Registration Ends
              </div>
              <span className="text-foreground font-bold">{event.closingDate}</span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div className="flex items-center gap-3 text-muted-foreground font-medium">
                <Users className="w-5 h-5 text-brand-orange" /> Slots Left
              </div>
              <span className="text-foreground font-bold">{event.availableSlots}</span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div className="flex items-center gap-3 text-muted-foreground font-medium">
                <Award className="w-5 h-5 text-brand-orange" /> Prize Pool
              </div>
              <span className="text-brand-orange font-bold text-xl">{event.prizePool}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-muted-foreground font-medium">
                <Trophy className="w-5 h-5 text-brand-orange" /> Entry Fee
              </div>
              <span className="text-foreground font-bold text-2xl">{event.entryFee}</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
