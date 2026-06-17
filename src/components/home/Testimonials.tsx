'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';



interface TestimonialsProps {
  testimonialsData: any[];
}

export default function Testimonials({ testimonialsData }: TestimonialsProps) {
  const testimonials = testimonialsData && testimonialsData.length > 0 ? testimonialsData : [];
  if (testimonials.length === 0) return null;

  return (
    <section className="w-full overflow-hidden pb-8 md:pb-12 lg:pb-16 bg-background border-y border-border pt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Trusted by the Elite
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-xl text-muted-foreground">
            Hear from judges, breeders, and organizers who rely on our platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
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
                "{t.text || t.content}"
              </p>
              
              <div className="flex items-center gap-4">
                {t.photoUrl ? (
                  <img src={t.photoUrl} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-muted-foreground font-bold text-xl">
                    {t.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-foreground">{t.name}</h4>
                  <p className="text-sm font-medium text-brand-orange">{t.role || t.designation}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
