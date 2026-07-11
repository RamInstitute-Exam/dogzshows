'use client';

import { motion } from 'framer-motion';
import { Award, Globe, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { getThumbnailUrl } from '@/lib/api';

interface FeaturedJudgesSliderProps {
  judges: any[];
}

export default function FeaturedJudgesSlider({ judges }: FeaturedJudgesSliderProps) {
  const displayJudges = judges && judges.length > 0 ? judges.slice(0, 5) : [];

  if (displayJudges.length === 0) {
    return null;
  }

  return (
    <section className="premium-section-spacing bg-background overflow-hidden">
      <div className="premium-container">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-[800] text-foreground tracking-tight mb-6 uppercase">
            ELITE INTERNATIONAL JUDGES
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-xl text-muted-foreground">
            Learn from the masters. Our championships feature the most respected FCI-certified judges from around the globe.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {displayJudges.map((judge: any, i: number) => (
            <motion.div
              key={judge.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/judge-details?slug=${judge.slug || judge.id}`}
                className="group h-full flex flex-col rounded-[24px] sm:rounded-[2rem] bg-card border border-border hover:border-primary/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease p-4 sm:p-8 items-center text-center cursor-pointer block"
              >
                <div className="shrink-0 overflow-hidden relative border-2 sm:border-[3px] border-[#1f2937] bg-[#f8fafc] shadow-[0_10px_30px_rgba(0,0,0,0.12)] rounded-full sm:rounded-[24px] w-[72px] h-[72px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px] mb-3 sm:mb-[20px]">
                  {judge.photoUrl ? (
                    <Image src={getThumbnailUrl(judge.photoUrl)} alt={judge.name} width={150} height={150} quality={80} className="w-full h-full object-cover object-top group-hover:scale-[1.05] transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-[#f8fafc] flex flex-col items-center justify-center text-[#64748b] group-hover:scale-[1.05] transition-transform duration-300">
                      <User className="w-6 h-6 sm:w-10 sm:h-10 mb-0 sm:mb-1 opacity-70" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 w-full">
                  <h3 className="text-sm sm:text-xl font-[800] text-foreground mb-1 group-hover:text-primary transition-colors normal-case leading-snug sm:leading-normal break-words">{judge.name}</h3>

                  <p className="text-primary font-[700] text-[10px] sm:text-sm mb-2 sm:mb-3 flex items-center justify-center gap-1 sm:gap-1.5 normal-case">
                    <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {judge.country || 'International'}
                  </p>

                  <div className="flex gap-2 sm:gap-4 mb-3 sm:mb-4 py-2 sm:py-3 border-y border-border justify-center w-full">
                    <div className="w-full text-center">
                      <p className="text-foreground font-[700] text-[11px] sm:text-sm line-clamp-2 sm:line-clamp-1 normal-case leading-tight">{judge.groups || judge.specialization || 'All Groups'}</p>
                      <p className="small-label text-[9px] sm:text-[10px] mt-0.5">Specialization</p>
                    </div>
                    {(judge.experience || judge.exp) && (
                      <div className="border-l border-border pl-2 sm:pl-4 text-center">
                        <p className="text-foreground font-[700] text-[11px] sm:text-sm whitespace-nowrap leading-tight">{judge.experience || judge.exp} Yrs</p>
                        <p className="small-label text-[9px] sm:text-[10px] mt-0.5">Experience</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-1 sm:pt-2 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-[700] text-primary group-hover:gap-2 transition-all duration-200 uppercase">
                    VIEW PROFILE <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/judges">
            <Button variant="link" className="text-primary font-bold text-lg hover:opacity-75 uppercase">
              VIEW ALL JUDGES <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
