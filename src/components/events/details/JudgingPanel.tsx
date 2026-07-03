'use client';

import { User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JudgingPanel({ panel }: { panel: any[] }) {
  if (!panel || panel.length === 0) return null;

  return (
    <div className="bg-card rounded-[20px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-border mb-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8 flex items-center gap-3">
        <span>👨‍⚖️</span> JUDGING PANEL
      </h2>
      
      <div className="flex flex-col gap-3">
        {panel.map((judge: any, i: number) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 p-4 bg-accent/10 border border-border rounded-xl hover:bg-accent/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <h4 className="font-bold text-foreground text-lg">
              {judge.name}
            </h4>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
