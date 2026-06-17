'use client';

import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Dog, Trophy, Calendar, Users, DollarSign, Activity } from 'lucide-react';

const DEFAULT_STATS = [
  { label: 'Registered Dogs', value: 15000, suffix: '+', icon: Dog, color: 'text-[#F59E0B]', key: 'registered_dogs' },
  { label: 'Dog Shows', value: 250, suffix: '+', icon: Calendar, color: 'text-[#38BDF8]', key: 'dog_shows' },
  { label: 'Verified Judges', value: 500, suffix: '+', icon: Activity, color: 'text-[#22C55E]', key: 'verified_judges' },
  { label: 'Active Users', value: 12000, suffix: '+', icon: Users, color: 'text-[#F59E0B]', key: 'active_users' },
  { label: 'Breeds Supported', value: 350, suffix: '+', icon: Trophy, color: 'text-[#38BDF8]', key: 'breeds_supported' },
];

function Counter({ from, to, duration = 2 }: { from: number, to: number, duration?: number }) {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      let start = from;
      const end = to;
      if (start === end) return;
      const totalMilSecDur = duration * 1000;
      const incrementTime = (totalMilSecDur / end) * 2;
      
      const timer = setInterval(() => {
        start += Math.ceil(end / 50);
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, incrementTime);
      
      return () => clearInterval(timer);
    }
  }, [inView, from, to, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

interface StatsCounterProps {
  statsData: any;
}

export default function StatsCounter({ statsData }: StatsCounterProps) {
  const stats = (() => {
    if (statsData && statsData?.stats?.length > 0) {
      const backendStats = statsData.stats;
      return DEFAULT_STATS.map(defaultStat => {
        const matchedStat = backendStats.find((bs: any) => bs.metricKey.toLowerCase() === defaultStat.key.toLowerCase());
        if (matchedStat) {
          return { ...defaultStat, value: matchedStat.metricValue };
        }
        return defaultStat;
      });
    }
    return DEFAULT_STATS;
  })();

  return (
    <section className="w-full overflow-hidden pb-8 md:pb-12 lg:pb-16 bg-background relative z-20 border-y border-border pt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="luxury-card p-4 sm:p-6 flex flex-col items-center text-center group h-full justify-center"
            >
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-background shadow-sm mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <stat.icon className={`w-5 h-5 sm:w-8 sm:h-8 ${stat.color}`} />
              </div>
              <h3 className="text-xl sm:text-3xl font-extrabold text-foreground mb-1 flex items-center justify-center">
                <Counter from={0} to={stat.value} />
                <span className={stat.color}>{stat.suffix}</span>
              </h3>
              <p className="small-label text-[11px] sm:text-sm tracking-wider mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
