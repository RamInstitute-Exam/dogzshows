'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const TESTIMONIALS = [
  { name: 'Elena Rostova', role: 'FCI Judge', text: 'JuzDog has revolutionized international event scoring. The real-time bracket updates make our job incredibly efficient.' },
  { name: 'Marcus Sterling', role: 'Breeder', text: 'The OCR certificate upload saved me hours of manual entry. This is exactly what the dog show community needed.' },
  { name: 'Sarah Jenkins', role: 'Event Organizer', text: 'Managing 500+ registrations used to be a nightmare. With JuzDog, everything from Razorpay payments to QR passes is fully automated.' }
];

export default function Testimonials() {
  return (
    <section className="pt-8 lg:pt-10 pb-12 lg:pb-16 bg-[#071225] border-y border-border">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Trusted by the Elite
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-xl text-muted-foreground">
            Hear from judges, breeders, and organizers who rely on our platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="luxury-card p-8 relative"
            >
              <Quote className="absolute top-8 right-8 w-10 h-10 text-muted-foreground group-hover:text-brand-orange/10 transition-colors" />
              
              <div className="flex gap-1 mb-6 text-yellow-400">
                {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-current" />)}
              </div>
              
              <p className="text-muted-foreground text-lg mb-8 relative z-10 leading-relaxed italic">
                "{t.text}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div>
                  <h4 className="font-bold text-foreground">{t.name}</h4>
                  <p className="text-sm font-medium text-brand-orange">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
