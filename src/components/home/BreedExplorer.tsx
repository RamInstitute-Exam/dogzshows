'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, Shield, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BreedExplorer() {
  const [activeTab, setActiveTab] = useState('Golden Retriever');

  const breeds = [
    { name: 'Golden Retriever', group: 'Group 8', popularity: '#1', desc: 'Intelligent, friendly, and devoted.', image: '/images/hero_banner.png' },
    { name: 'German Shepherd', group: 'Group 1', popularity: '#3', desc: 'Confident, courageous, and smart.', image: '/images/events_banner.png' },
    { name: 'Poodle', group: 'Group 9', popularity: '#5', desc: 'Active, proud, and very smart.', image: '/images/gallery_banner.png' }
  ];

  const activeBreed = breeds.find(b => b.name === activeTab) || breeds[0];

  return (
    <section className="pt-8 lg:pt-10 pb-12 lg:pb-16 bg-background relative">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 sm:mb-16 gap-4 sm:gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-[800] text-foreground mb-2 sm:mb-4">Breed Explorer</h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl">Discover breed standards, eligibility, and historical statistics from our KCI database.</p>
          </motion.div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search breeds..." 
              className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 bg-card border border-border rounded-full focus:ring-2 focus:ring-[#F59E0B] outline-none text-sm sm:text-base text-foreground"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
          {/* Tabs */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto hide-scrollbar lg:w-64 shrink-0 pb-2 lg:pb-0">
            {breeds.map(breed => (
              <button
                key={breed.name}
                onClick={() => setActiveTab(breed.name)}
                className={`text-left px-4 py-2 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold whitespace-nowrap transition-all duration-300 ${activeTab === breed.name ? 'bg-[#F59E0B] text-foreground shadow-lg shadow-[#F59E0B]/20' : 'bg-card text-muted-foreground hover:bg-input'}`}
              >
                {breed.name}
              </button>
            ))}
          </div>

          {/* Content View */}
          <div className="flex-1 bg-card rounded-2xl md:rounded-[2.5rem] p-4 sm:p-8 md:p-12 border border-border flex flex-col md:flex-row gap-6 md:gap-12 items-center">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeBreed.image}
                src={activeBreed.image} 
                alt={activeBreed.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full md:w-1/2 h-48 sm:h-80 object-cover rounded-xl sm:rounded-[2rem] shadow-xl"
              />
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div 
                key={activeBreed.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full md:w-1/2 space-y-4 sm:space-y-6"
              >
                <div>
                  <h3 className="text-2xl sm:text-4xl font-[800] text-foreground mb-1 sm:mb-2">{activeBreed.name}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{activeBreed.desc}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-background rounded-xl border border-border h-full flex flex-col justify-center">
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#38BDF8] mb-1 sm:mb-2" />
                    <p className="small-label text-[10px] sm:text-xs">FCI Classification</p>
                    <p className="font-[700] text-foreground text-xs sm:text-base">{activeBreed.group}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-background rounded-xl border border-border h-full flex flex-col justify-center">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#22C55E] mb-1 sm:mb-2" />
                    <p className="small-label text-[10px] sm:text-xs">Popularity Rank</p>
                    <p className="font-[700] text-foreground text-xs sm:text-base">{activeBreed.popularity}</p>
                  </div>
                </div>

                <Button className="w-full rounded-[14px] h-10 sm:h-[48px] btn-secondary-luxury font-[700] text-muted-foreground text-sm sm:text-base">
                  View Full Standard <Info className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
