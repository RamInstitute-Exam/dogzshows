'use client';

import { motion } from 'framer-motion';
import { Camera, Video, Plane, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PhotographyPromo() {
  return (
    <section className="pt-8 lg:pt-10 pb-12 lg:pb-16 bg-background relative overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-foreground/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white border border-zinc-800 text-sm font-bold shadow-sm mb-6">
              <Sparkles className="w-4 h-4" /> Professional Coverage
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-black dark:text-white tracking-tight leading-[1.1] mb-6">
              Capture Every Champion Moment.
            </h2>
            
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Don't let your dog's greatest victories fade. Book our elite team of professional event photographers, 4K videographers, and drone operators for your next show.
            </p>

            <div className="space-y-6 mb-10">
              {[
                { icon: Camera, title: 'Professional Dog Photography', desc: 'High-speed, sharp action shots in the ring.' },
                { icon: Video, title: '4K Event Videography', desc: 'Cinematic highlight reels and live streaming.' },
                { icon: Plane, title: 'Drone Coverage', desc: 'Stunning aerial views of outdoor championships.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="p-3 rounded-2xl bg-card border border-border text-foreground group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-all duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-1">{item.title}</h4>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="btn-primary-luxury group">
              Book Photography Session <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-[6px] transition-transform duration-300" />
            </Button>
          </motion.div>

          {/* Visuals */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 relative"
          >
            <div className="space-y-4 translate-y-12">
              <img src="/images/hero_banner.png" alt="Photography 1" className="rounded-3xl w-full h-64 object-cover border-4 border-border" />
              <img src="/images/events_banner.png" alt="Photography 2" className="rounded-3xl w-full h-80 object-cover border-4 border-border" />
            </div>
            <div className="space-y-4 -translate-y-4">
              <img src="/images/winners_banner.png" alt="Photography 3" className="rounded-3xl w-full h-80 object-cover border-4 border-border" />
              <div className="bg-foreground rounded-3xl w-full h-64 p-8 flex flex-col justify-end text-white border-4 border-border shadow-lg">
                <Camera className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-2xl font-bold mb-2">Winner Portraits</h3>
                <p className="text-muted-foreground text-sm">Studio-grade lighting at the podium.</p>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
