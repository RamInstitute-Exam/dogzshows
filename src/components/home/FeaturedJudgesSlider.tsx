'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';

const MOCK_JUDGES = [
  { name: 'Dr. Sarah Jenkins', country: 'United Kingdom', exp: '15 Years', groups: 'Groups 1, 2, 8', photoUrl: '/images/judges_banner.png' },
  { name: 'Marcus Sterling', country: 'Germany', exp: '22 Years', groups: 'Groups 3, 5, 10', photoUrl: '/images/judges_banner.png' },
  { name: 'Elena Rostova', country: 'Russia', exp: '10 Years', groups: 'Groups 4, 6, 9', photoUrl: '/images/judges_banner.png' },
  { name: 'James Wilson', country: 'USA', exp: '18 Years', groups: 'Groups 7, 8', photoUrl: '/images/judges_banner.png' },
];

export default function FeaturedJudgesSlider() {
  const [judges, setJudges] = useState<any[]>([]);

  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '${config.apiUrl}';
        const res = await fetch(`${apiUrl}/judges`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setJudges(data);
          } else {
            setJudges(MOCK_JUDGES);
          }
        } else {
          setJudges(MOCK_JUDGES);
        }
      } catch (error) {
        console.error('Failed to fetch judges:', error);
        setJudges(MOCK_JUDGES);
      }
    };
    
    fetchJudges();
  }, []);

  const displayJudges = judges.length > 0 ? judges.slice(0, 4) : MOCK_JUDGES;

  return (
    <section className="pt-8 lg:pt-10 pb-12 lg:pb-16 bg-background">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-[800] text-foreground tracking-tight mb-6">
            Elite International Judges
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-xl text-muted-foreground">
            Learn from the masters. Our championships feature the most respected FCI-certified judges from around the globe.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
          {displayJudges.map((judge, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="h-full flex flex-col rounded-[24px] overflow-hidden bg-[#0B1220] border border-border group hover:shadow-2xl hover:shadow-[#F59E0B]/10 transition-all duration-300"
            >
              <div className="relative aspect-[4/5] overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-transparent z-10" />
                <img 
                  src={judge.photoUrl || "/images/judges_banner.png"} 
                  alt={judge.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-foreground text-xs font-bold border border-border flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> <span>{judge.country || 'International'}</span>
                </div>
              </div>

              <div className="flex flex-col flex-1 p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-[700] text-foreground mb-2 line-clamp-1">{judge.name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-[500]">
                    <Award className="w-4 h-4 text-[#F59E0B]" /> {judge.experience || judge.exp || 'Experienced'}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="small-label text-[10px] mb-1.5">Licensed For</p>
                  <p className="font-[700] text-foreground text-sm bg-white/5 inline-block px-3 py-1 rounded-md border border-border truncate max-w-full">{judge.groups || 'All Groups'}</p>
                </div>
                
                <div className="mt-auto pt-6">
                  <Button className="w-full h-[48px] rounded-[14px] bg-transparent text-foreground border border-[rgba(255,255,255,0.15)] hover:bg-[#F59E0B] hover:text-foreground font-semibold transition-colors">
                    View Profile
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="link" className="text-brand-orange font-bold text-lg hover:text-orange-600">
            View All Judges <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
