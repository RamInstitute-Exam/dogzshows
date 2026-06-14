'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Shield, Award, ChevronRight } from 'lucide-react';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import { config } from '@/lib/config';

export default function JudgesPage() {
  const [judges, setJudges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '${config.apiUrl}';
        const res = await fetch(`${apiUrl}/judges`);
        if (res.ok) {
          const result = await res.json();
          setJudges(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch judges:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJudges();
  }, []);

  return (
    <div className="min-h-fit bg-background">
      
      <BreadcrumbBanner
        slug="judges"
        fallbackTitle="Our Esteemed Judges"
        fallbackSubtitle="Meet the world-class professionals bringing decades of expertise to evaluate our champions."
        fallbackImage="/images/judges_banner.png"
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-16">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
             <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {judges.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">No judges found.</div>
            ) : judges.map((judge, i) => (
              <motion.div 
                key={judge.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0B1220] rounded-[2rem] p-6 shadow-sm border border-border premium-hover flex flex-col items-center text-center group"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 relative border-4 border-[#020817] group-hover:border-[#F59E0B] transition-colors">
                  <img src={judge.photoUrl || "/images/judges_banner.png"} alt={judge.name} className="w-full h-full object-cover" />
                </div>
                
                <h3 className="text-2xl font-[800] text-foreground mb-1">{judge.name}</h3>
                <p className="text-[#F59E0B] font-[700] text-sm mb-4">{judge.country || 'International Judge'}</p>
                
                <div className="flex gap-4 justify-center w-full mb-6 py-4 border-y border-border">
                  <div className="text-center">
                    <p className="text-foreground font-[700]">{judge.experienceYears || '15'} Years</p>
                    <p className="small-label text-[10px]">Experience</p>
                  </div>
                  <div className="w-px bg-[rgba(255,255,255,0.08)]" />
                  <div className="text-center">
                    <p className="text-foreground font-[700]">{judge.allowedGroups ? judge.allowedGroups.split(',').length : 'All'}</p>
                    <p className="small-label text-[10px]">FCI Groups</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {judge.allowedGroups ? judge.allowedGroups.split(',').map((g: string) => (
                    <span key={g} className="px-3 py-1 bg-background text-muted-foreground rounded-full text-xs font-[700]">{g.trim()}</span>
                  )) : (
                    <span className="px-3 py-1 bg-background text-muted-foreground rounded-full text-xs font-[700]">All Groups</span>
                  )}
                </div>

                <button className="flex items-center text-[#F59E0B] font-[700] hover:text-[#FB923C] transition-colors">
                  View Full Profile <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
