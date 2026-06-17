"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MapPin, Phone, Mail, Award, ChevronLeft, 
  UserCircle, Star, BookOpen
} from 'lucide-react';
import { getImageUrl } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';

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
    if (!name) return 'J';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const licensedGroups = judge.groups ? String(judge.groups).split(',').map(g => g.trim()) : [];

  return (
    <PageContainer>
      {/* Premium Hero */}
      <section className="relative pt-6 md:pt-8 pb-12 overflow-hidden bg-black border-b border-border">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#F59E0B]/10 blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#FB923C]/10 blur-[100px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <button 
            onClick={() => router.push('/judges')}
            className="flex items-center text-sm font-bold text-muted-foreground hover:text-[#F59E0B] transition-colors mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Panel
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-card border-[4px] border-[#020817] shadow-[0_0_0_2px_rgba(245,158,11,0.3)] flex items-center justify-center text-6xl font-bold overflow-hidden shrink-0 relative"
            >
              {judge.photoUrl ? (
                <img src={getImageUrl(judge.photoUrl)} alt={judge.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted-foreground">{getInitials(judge.name)}</span>
              )}
              {judge.isFeatured && (
                <div className="absolute bottom-2 right-6 bg-[#F59E0B] text-white p-1.5 rounded-full border-2 border-[#020817]">
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
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-[#F59E0B]/20 text-[#F59E0B] rounded-full text-xs font-bold uppercase tracking-wider border border-[#F59E0B]/30 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> KCI Approved Judge
                </span>
                {judge.experience && (
                  <span className="px-3 py-1 bg-accent text-muted-foreground rounded-full text-xs font-bold uppercase tracking-wider">
                    {judge.experience} Exp
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold text-white font-outfit mb-4">{judge.name}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-400">
                {(judge.city || judge.state || judge.country) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#F59E0B]" />
                    {[judge.city, judge.state, judge.country].filter(Boolean).join(', ')}
                  </div>
                )}
                {judge.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#F59E0B]" />
                    <a href={`mailto:${judge.email}`} className="hover:text-white transition-colors">{judge.email}</a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 border-b border-border pb-px">
              {['about', 'qualifications', 'groups'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab 
                      ? 'border-[#F59E0B] text-[#F59E0B]' 
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

              {activeTab === 'qualifications' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold font-outfit mb-6">Professional Qualifications</h2>
                    {judge.qualifications || judge.certifications ? (
                      <div className="p-6 bg-card border border-border rounded-2xl flex items-start gap-4 shadow-sm">
                        <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                          <BookOpen className="w-6 h-6 text-[#F59E0B]" />
                        </div>
                        <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {judge.qualifications || judge.certifications}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">No qualifications explicitly listed.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'groups' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-2xl font-bold font-outfit mb-6">Licensed Breed Groups</h2>
                  
                  {licensedGroups.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {licensedGroups.map((group: string, idx: number) => (
                        <div key={idx} className="px-5 py-3 rounded-xl bg-card border border-[#F59E0B]/30 shadow-sm flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div>
                          <span className="font-bold text-foreground">{group}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-accent/50 rounded-2xl border border-border text-center">
                      <p className="text-muted-foreground">This judge's licensed groups are not detailed yet. Please contact KCI for specific group licensing information.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-[120px] space-y-6">
              <div className="bg-card border border-border rounded-3xl p-6 shadow-lg">
                <h3 className="text-lg font-bold font-outfit mb-6 flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-[#F59E0B]" /> Quick Facts
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
                        <a href={`tel:${judge.phone}`} className="text-[#F59E0B] hover:underline">{judge.phone}</a>
                      </div>
                    </li>
                  )}
                  {judge.email && (
                    <li className="flex items-start gap-3 text-sm">
                      <Mail className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
                      <div className="break-all">
                        <p className="font-bold text-foreground">Email</p>
                        <a href={`mailto:${judge.email}`} className="text-[#F59E0B] hover:underline">{judge.email}</a>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>
    </PageContainer>
  );
}
