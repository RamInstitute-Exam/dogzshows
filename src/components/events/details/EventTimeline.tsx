'use client';

import { CheckCircle2, Clock, MapPin, ClipboardCheck, Play, Award, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EventTimeline({ timeline }: { timeline: any[] }) {
  // Guard: hide section if no timeline data
  if (!timeline || timeline.length === 0) return null;

  const getIcon = (i: number) => {
    switch (i) {
      case 0: return <ClipboardCheck className="w-5 h-5" />;
      case 1: return <Play className="w-5 h-5" />;
      case 2: return <Clock className="w-5 h-5" />;
      case timeline.length - 2: return <Award className="w-5 h-5" />;
      case timeline.length - 1: return <Gift className="w-5 h-5" />;
      default: return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-card rounded-[20px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-50 mb-[80px]">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-10">Event Timeline</h2>
      
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[3px] before:bg-gradient-to-b before:from-brand-orange/20 before:via-brand-orange before:to-brand-orange/20">
        {timeline.map((item: any, i: number) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
          >
            {/* Center Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-border bg-brand-orange text-foreground shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {getIcon(i)}
            </div>
            
            {/* Content Box */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-[20px] bg-card border border-border shadow-sm group-hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-foreground text-xl">{item?.title ?? '-'}</h4>
                {item?.time && (
                  <span
                    className="font-bold text-sm px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }}
                  >
                    {item.time}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground font-medium leading-relaxed">{item?.description ?? ''}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
