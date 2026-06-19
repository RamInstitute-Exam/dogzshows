'use client';

import { Shield, Sparkles, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AgeClasses({ classes }: { classes: any[] }) {
  // Guard: hide section if no classes
  if (!classes || classes.length === 0) return null;

  return (
    <div className="bg-card rounded-[20px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-50 mb-[80px]">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8">Age Classes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map((cls: any, i: number) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 p-5 bg-card border border-border rounded-[16px] hover:border-brand-orange/30 transition-colors"
          >
            <div className="w-12 h-12 bg-card rounded-xl shadow-sm flex items-center justify-center shrink-0">
              {i < 2 ? <Sparkles className="w-6 h-6 text-yellow-500" /> : i === classes.length - 2 ? <Award className="w-6 h-6 text-brand-orange" /> : <Shield className="w-6 h-6 text-blue-500" />}
            </div>
            <div>
              <h4 className="font-extrabold text-foreground text-lg">{cls.name}</h4>
              <p className="text-sm font-bold text-muted-foreground">{cls.age}</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-card border border-border text-muted-foreground text-xs font-bold rounded-md shadow-sm">Eligible</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
