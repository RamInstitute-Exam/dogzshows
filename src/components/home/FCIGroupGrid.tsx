'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { config } from '@/lib/config';

interface FCIGroup {
  id: string;
  groupNumber: number;
  name: string;
  slug: string;
  heroImage?: string;
  cardImage?: string;
  _count?: {
    breeds: number;
  };
}

export default function FCIGroupGrid() {
  const [groups, setGroups] = useState<FCIGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('${config.apiUrl}/groups'); // Backend port is 5001
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setGroups(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter(group => {
    const query = searchQuery.toLowerCase();
    return (
      group.name.toLowerCase().includes(query) ||
      group.groupNumber.toString().includes(query)
    );
  });

  return (
    <section className="pt-8 lg:pt-10 pb-12 lg:pb-16 bg-background relative w-full">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 w-full">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-16">
          <motion.div initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-brand-orange font-bold text-[10px] sm:text-sm tracking-widest uppercase mb-2 sm:mb-4">Official FCI Breed Groups</div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">Explore all internationally recognized breed classifications used across championships worldwide.</h2>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative w-full max-w-xl mt-4 sm:mt-8">
            <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            <Input 
              placeholder="Search breed groups..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 sm:h-16 pl-12 sm:pl-16 bg-card border-border text-foreground rounded-xl sm:rounded-[20px] focus-visible:ring-brand-orange/50 text-sm sm:text-lg placeholder:text-muted-foreground shadow-lg"
            />
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredGroups.map((group, i) => (
              <Link href={`/groups/${group.slug}`} key={group.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group luxury-card relative w-full h-[240px] sm:h-[320px] lg:h-[380px] overflow-hidden cursor-pointer"
                >
                  {/* Background Image */}
                  {group.cardImage && (
                    <img 
                      src={group.cardImage} 
                      alt={group.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  
                  {/* Dark Overlay Gradient */}
                  <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.85))' }} />
                  
                  {/* Content */}
                  <div className="relative z-20 flex flex-col h-full justify-between p-3 sm:p-4">
                    {/* Top Left */}
                    <div>
                      <span className="inline-block px-2 py-1 bg-brand-orange/90 backdrop-blur text-foreground text-[10px] font-black tracking-widest uppercase rounded-lg shadow-lg border border-border">
                        Group {group.groupNumber}
                      </span>
                    </div>
                    
                    {/* Center / Bottom */}
                    <div className="flex flex-col gap-2 sm:gap-4">
                      <h3 className="text-[14px] sm:text-lg font-bold text-foreground leading-tight line-clamp-2">
                        {group.name}
                      </h3>
                      
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-0.5 sm:gap-1">
                          <span className="text-slate-300 text-[10px] sm:text-xs font-semibold">{group._count?.breeds || 0} Breeds</span>
                          <span className="hidden sm:inline-block text-muted-foreground text-[10px] font-bold uppercase tracking-widest">FCI Certified</span>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur border border-border flex items-center justify-center transition-all duration-300 group-hover:bg-brand-orange group-hover:border-brand-orange group-hover:scale-110 shrink-0">
                          <ArrowRight className="w-4 h-4 text-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
