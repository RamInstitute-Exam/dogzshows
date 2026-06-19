'use client';

import { Users, Clock, Trophy, Award, CreditCard, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuickStats({ event }: { event: any }) {
  const stats = [
    { label: 'Entry Fee', value: event?.entryFee ?? '-', icon: CreditCard },
    { label: 'Registration Ends', value: event?.closingDate ?? event?.registrationWindowEnd ?? '-', icon: Clock },
    { label: 'Expected Dogs', value: event?.expectedDogs ?? event?.capacity ?? '-', icon: Activity },
    { label: 'Total Judges', value: event?.judgeCount ?? event?.judges?.length ?? '-', icon: Users },
    { label: 'Prize Pool', value: event?.prizePool ?? '-', icon: Award },
    { label: 'FCI Groups', value: '10 Groups', icon: Trophy },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 py-12">
      {stats.map((stat, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -5 }}
          className="bg-card p-6 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex flex-col items-center text-center border border-gray-50 cursor-default transition-shadow hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)]"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <stat.icon className="w-6 h-6" style={{ color: '#FFFFFF' }} />
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
          <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
