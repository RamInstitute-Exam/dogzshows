'use client';

import { motion } from 'framer-motion';
import { Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WINNERS = [
  { dog: 'Sir Maximus', breed: 'Golden Retriever', award: 'Best in Show', event: 'Winter Classic 2025', image: '/images/winners_banner.png' },
  { dog: 'Bella Rosa', breed: 'Poodle', award: 'Best of Group 9', event: 'National Specialty 2025', image: '/images/gallery_banner_1781291255354.png' },
  { dog: 'Thunder Strike', breed: 'German Shepherd', award: 'Best of Breed', event: 'Mumbai KCI Show', image: '/images/events_banner.png' },
];

export default function WinnersHallSlider() {
  return (
    <section className="pt-8 lg:pt-10 pb-12 lg:pb-16 bg-background relative overflow-hidden border-t border-border">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-primary text-sm font-bold mb-6">
            <Star className="w-4 h-4 fill-primary text-primary" /> Hall of Fame
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-[800] text-foreground tracking-tight mb-6">
            Recent Champions
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {WINNERS.map((winner, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease relative flex flex-col min-h-[260px] sm:min-h-[320px] lg:min-h-[380px]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-muted-foreground z-20" />
              
              <div className="h-[120px] sm:h-[160px] lg:h-[220px] relative overflow-hidden shrink-0">
                <img src={winner.image} alt={winner.dog} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-foreground bg-black/50 backdrop-blur rounded-lg px-2 py-1 border border-border">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <div>
                    <p className="small-label text-[8px] sm:text-[10px] text-primary leading-none">Award</p>
                    <p className="font-[700] text-foreground text-[10px] sm:text-xs leading-none mt-0.5 truncate max-w-[100px] sm:max-w-[140px]">{winner.award}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-lg font-[700] text-foreground mb-0.5 line-clamp-1">{winner.dog}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{winner.breed}</p>
                </div>
                <div className="pt-2 sm:pt-3 border-t border-border mt-auto">
                  <p className="small-label text-[10px] mb-0.5">Event</p>
                  <p className="font-[700] text-foreground text-xs sm:text-sm line-clamp-1">{winner.event}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center w-full px-4 md:px-0">
          <Button className="w-full md:w-auto btn-primary-luxury h-[54px] md:h-[52px] px-8 font-bold rounded-[14px]">
            Explore Hall of Fame
          </Button>
        </div>
      </div>
    </section>
  );
}
