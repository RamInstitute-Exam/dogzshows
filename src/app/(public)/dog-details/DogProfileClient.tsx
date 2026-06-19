'use client';

import { motion } from 'framer-motion';
import { Trophy, Award, Scroll, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';

export default function DogProfileClient({ id }: { id: string }) {
  return (
    <PageContainer>
      
      {/* Hero Cover */}
      <div className="h-96 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
        <img 
          src="/images/hero_banner.png" 
          alt="Dog Cover" 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute bottom-0 left-0 right-0 z-20 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pb-12 flex flex-col md:flex-row gap-8 items-end">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-40 h-40 rounded-full border-4 border-border shadow-2xl overflow-hidden bg-card shrink-0"
          >
            <img 
              src="/images/hero_banner.png" 
              alt="Dog Avatar" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <div className="flex-1 pb-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="bg-foreground text-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Champion
                </span>
                <span className="bg-card/20 backdrop-blur text-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-400" /> KCI Verified
                </span>
              </div>
              <h1 className="text-muted-foregroundxl md:text-muted-foregroundxl font-extrabold text-foreground tracking-tight mb-2">Sir Maximus Aurelius</h1>
              <p className="text-xl text-muted-foreground font-medium">Golden Retriever • Male • 3 Years Old</p>
            </motion.div>
          </div>
          

        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card p-8 rounded-[2rem] shadow-sm border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-foreground" /> About
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">KCI Number</p>
                  <p className="font-bold text-foreground">KCI-2023-4589</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Microchip</p>
                  <p className="font-bold text-foreground">981020000123</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                  <p className="font-bold text-foreground">12 Oct 2023</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Color</p>
                  <p className="font-bold text-foreground">Light Golden</p>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card p-8 rounded-[2rem] shadow-sm border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-foreground" /> Achievements
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Best of Breed', event: 'National Specialty Show 2025', date: 'Oct 2025' },
                  { title: 'Best in Group', event: 'FCI CACIB International', date: 'Aug 2025' },
                  { title: 'Reserve Best in Show', event: 'Winter Classic Championship', date: 'Jan 2026' }
                ].map((award, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card hover:bg-foreground/10 transition-colors border border-border">
                    <div className="bg-foreground/10 p-3 rounded-xl h-fit text-foreground">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground">{award.title}</h4>
                      <p className="text-muted-foreground">{award.event}</p>
                      <p className="text-sm text-muted-foreground mt-1">{award.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-card p-8 rounded-[2rem] shadow-sm border border-border">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Scroll className="w-5 h-5 text-muted-foreground" /> Ownership
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Owner</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <p className="font-bold text-foreground">John Doe</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-1">Breeder</p>
                  <p className="font-bold text-foreground">Sunrise Goldens Kennel</p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </PageContainer>
  );
}
