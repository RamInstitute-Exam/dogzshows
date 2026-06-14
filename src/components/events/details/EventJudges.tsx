'use client';

import { MapPin, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function EventJudges({ judges }: { judges: any[] }) {
  return (
    <div className="bg-card rounded-[20px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-50 mb-[80px]">
      <h2 className="text-muted-foregroundxl font-extrabold text-[#0F172A] mb-8">Esteemed Judges</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {judges.map((judge, i) => (
          <motion.div 
            key={judge.id} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group p-6 bg-[#F8FAFC] rounded-[20px] border border-border hover:border-brand-orange/50 transition-colors text-center"
          >
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-border shadow-lg group-hover:scale-105 transition-transform duration-300">
              <img src={judge.image} alt={judge.name} className="w-full h-full object-cover" />
            </div>
            <h4 className="font-extrabold text-[#0F172A] text-xl mb-2">{judge.name}</h4>
            
            <div className="flex items-center justify-center gap-4 mb-4 text-sm font-semibold text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-muted-foreground" /> {judge.country}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{judge.experience} Exp</span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-brand-orange font-bold text-xs rounded-lg mb-6">
              <Trophy className="w-3.5 h-3.5" /> {judge.groups}
            </div>
            
            <Button variant="outline" className="w-full rounded-xl border-border text-muted-foreground font-bold hover:bg-card hover:text-brand-orange hover:border-brand-orange/50 transition-all">
              View Profile
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
