'use client';

import { Trophy, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BreedCategories() {
  const groups = [
    { id: 1, name: 'Sheepdogs and Cattle Dogs', count: 43 },
    { id: 2, name: 'Pinscher and Schnauzer', count: 56 },
    { id: 3, name: 'Terriers', count: 34 },
    { id: 4, name: 'Dachshunds', count: 9 },
    { id: 5, name: 'Spitz and primitive types', count: 45 },
    { id: 6, name: 'Scent hounds', count: 72 },
    { id: 7, name: 'Pointing Dogs', count: 36 },
    { id: 8, name: 'Retrievers - Flushing Dogs', count: 22 },
    { id: 9, name: 'Companion and Toy Dogs', count: 26 },
    { id: 10, name: 'Sighthounds', count: 13 },
  ];

  return (
    <div className="bg-card rounded-[20px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-50 mb-[80px]">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8">FCI Breed Groups</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {groups.map((group, i) => (
          <motion.details 
            key={group.id} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group bg-card rounded-[16px] p-5 border border-border cursor-pointer hover:border-border/50 transition-colors"
          >
            <summary className="flex items-center justify-between font-bold text-foreground">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-foreground shadow-sm border border-border">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-sm text-muted-foreground font-semibold mb-0.5">Group {group.id}</span>
                  <span className="block leading-tight">{group.name}</span>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
            </summary>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground">Eligible Breeds: {group.count} recognized breeds in this group can participate.</p>
              <button className="text-foreground text-sm font-bold mt-2 hover:underline">View All Breeds</button>
            </div>
          </motion.details>
        ))}
      </div>
    </div>
  );
}
