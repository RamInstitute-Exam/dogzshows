"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MapPin, Phone, Mail, Award, ChevronLeft, 
  UserCircle, Star
} from 'lucide-react';
import { getImageUrl } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';

interface JudgeDetailClientProps {
  judge: any;
}

export default function JudgeDetailClient({ judge }: JudgeDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('about');

  if (!judge) {
    return (
      <PageContainer>
        <div className="flex-grow flex items-center justify-center p-8">
          <div className="text-xl font-semibold text-muted-foreground">Judge not found</div>
        </div>
      </PageContainer>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return 'JD';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <PageContainer>
      {/* Premium Hero */}
      <section className="relative pt-6 md:pt-8 pb-12 overflow-hidden bg-black border-b border-border">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-muted/10 blur-[100px]"></div>
        </div>
        
        <PublicContainer className="relative z-10">
          <button 
            onClick={() => router.push('/judges')}
            className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Panel
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-40 h-40 md:w-56 md:h-56 rounded-[20px] md:rounded-[32px] bg-[#f5f5f5] border-[4px] border-[#111827] shadow-[0_8px_20px_rgba(0,0,0,0.12)] flex items-center justify-center text-6xl font-[700] overflow-hidden shrink-0 relative"
            >
              {judge.photoUrl ? (
                <img src={getImageUrl(judge.photoUrl)} alt={judge.name} className="w-full h-full object-cover object-center" />
              ) : (
                <span className="text-[#64748b] text-[72px]">{getInitials(judge.name)}</span>
              )}
              {judge.isFeatured && (
                <div className="absolute bottom-2 right-6 bg-primary text-primary-foreground p-1.5 rounded-full border-2 border-[#020817]">
                  <Star className="w-5 h-5 fill-current" />
                </div>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-grow"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider border border-primary/20 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> KCI Approved Judge
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold text-white font-outfit mb-4">{judge.name}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-400">
                {(judge.city || judge.state || judge.country) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {[judge.city, judge.state, judge.country].filter(Boolean).join(', ')}
                  </div>
                )}
                {judge.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <a href={`mailto:${judge.email}`} className="hover:text-white transition-colors">{judge.email}</a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </PublicContainer>
      </section>

      {/* Content Area */}
      <PublicContainer className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 border-b border-border pb-px">
              {['about'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'about' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold font-outfit mb-4">Biography</h2>
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg">
                      {judge.bio || 'No biography available for this judge.'}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-[120px] space-y-6">
              <div className="bg-card border border-border rounded-3xl p-6 shadow-lg">
                <h3 className="text-lg font-bold font-outfit mb-6 flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-primary" /> Quick Facts
                </h3>
                
                <ul className="space-y-4">
                  {judge.registrationNumber && (
                    <li className="flex items-start gap-3 text-sm">
                      <Award className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-bold text-foreground">Registration ID</p>
                        <p className="text-muted-foreground">{judge.registrationNumber}</p>
                      </div>
                    </li>
                  )}
                  {judge.specialization && (
                    <li className="flex items-start gap-3 text-sm">
                      <Star className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-bold text-foreground">Specialization</p>
                        <p className="text-muted-foreground">{judge.specialization}</p>
                      </div>
                    </li>
                  )}
                  {judge.phone && (
                    <li className="flex items-start gap-3 text-sm">
                      <Phone className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-bold text-foreground">Phone</p>
                        <a href={`tel:${judge.phone}`} className="text-primary hover:underline">{judge.phone}</a>
                      </div>
                    </li>
                  )}
                  {judge.email && (
                    <li className="flex items-start gap-3 text-sm">
                      <Mail className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
                      <div className="break-all">
                        <p className="font-bold text-foreground">Email</p>
                        <a href={`mailto:${judge.email}`} className="text-primary hover:underline">{judge.email}</a>
                      </div>
                    </li>
                  )}
                </ul>

                {judge.source && (
                  <div className="mt-5 pt-4 border-t border-border">
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                      Source - {judge.source}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </PublicContainer>
    </PageContainer>
  );
}
