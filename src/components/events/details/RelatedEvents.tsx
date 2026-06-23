'use client';

import { Calendar, MapPin, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toTitleCase, formatTitle } from '@/lib/utils';

export default function RelatedEvents({ events }: { events: any[] }) {
  // Only show first 2 for carousel preview
  const displayEvents = events.slice(1, 3);

  return (
    <div className="mb-[80px]">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Related Events</h2>
        <Button variant="link" className="text-foreground font-bold">View Calendar</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayEvents.map((event, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col bg-card rounded-[20px] shadow-sm border border-border overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
          >
            <div className={`h-32 ${event.bg} relative p-4 flex flex-col justify-between overflow-hidden`}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute -right-5 -bottom-5 opacity-20 group-hover:scale-110 transition-transform">
                <Trophy className="w-32 h-32 text-foreground" />
              </div>
              <span className="relative z-10 inline-block bg-card/90 text-foreground text-[10px] font-bold px-2 py-1 rounded-full uppercase self-start">
                {event.status}
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h4 className="font-extrabold text-foreground text-lg mb-3 line-clamp-1 group-hover:text-foreground transition-colors">{formatTitle(event.name)}</h4>
              <div className="space-y-2 text-sm text-muted-foreground font-medium mb-4">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /> {event.date}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> {toTitleCase(event.location)}</div>
              </div>
              <Button className="w-full mt-auto bg-card hover:bg-foreground text-background text-foreground font-bold rounded-xl">View Details</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
