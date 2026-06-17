'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  moduleName?: string;
}

export default function UnderConstruction({ moduleName }: Props) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center bg-[#020617]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-10 flex flex-col items-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
          <Construction className="w-10 h-10 text-yellow-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">
          🚧 Module Under Development
        </h2>
        
        {moduleName && (
          <p className="text-sm font-semibold text-yellow-500 mb-2 uppercase tracking-widest">
            {moduleName}
          </p>
        )}
        
        <p className="text-[#94A3B8] leading-relaxed mb-8">
          This feature is currently being implemented and is not yet available in the administrative dashboard. Check back soon!
        </p>
        
        <Link 
          href="/admin"
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
