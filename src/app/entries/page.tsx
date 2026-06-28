'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Upload, CheckCircle, ChevronRight, FileText, IndianRupee, Clock, Share2, Bookmark, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import OptimizedImage from '@/components/shared/OptimizedImage';
import api from '@/lib/api';
import { toTitleCase } from '@/lib/utils';

export default function ShowEntries() {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [formStep, setFormStep] = useState(1);

  const [upcomingShows, setUpcomingShows] = useState<any[]>([]);
  const [pastShows, setPastShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShows = async () => {
      setLoading(true);
      setError(null);
      try {
        const [upcomingRes, completedRes] = await Promise.all([
          api.get('/public/events/upcoming?limit=20'),
          api.get('/public/events/completed?limit=20'),
        ]);
        setUpcomingShows(upcomingRes?.success ? (upcomingRes.data || []) : []);
        setPastShows(completedRes?.success ? (completedRes.data || []) : []);
      } catch (err: any) {
        console.error('[Entries] Failed to load shows:', err?.message || err);
        setError('Failed to load shows from the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, []);

  const currentShows = activeTab === 'open' ? upcomingShows : pastShows;
  const selectedShowData = currentShows.find((s) => s.id === selectedShow);

  if (loading) {
    return (
      <PageContainer>
        <PublicContainer>
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 text-foreground animate-spin" />
            <p className="text-muted-foreground font-medium">Loading shows...</p>
          </div>
        </PublicContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PublicContainer>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Failed to Load Shows</h2>
            <p className="text-muted-foreground max-w-sm">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-2">
              Retry
            </Button>
          </div>
        </PublicContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PublicContainer>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-[80px]">
          <h1 className="text-4xl md:text-5xl font-outfit font-extrabold text-foreground mb-4">Dog Show Entries</h1>
          <p className="text-muted-foreground font-medium text-lg">Register your purebred companions for upcoming premium events, or browse the archives of our past covered shows.</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-card p-1 rounded-full shadow-sm border border-border inline-flex">
            <button
              onClick={() => { setActiveTab('open'); setSelectedShow(null); setFormStep(1); }}
              className={`px-8 py-3 rounded-full font-bold text-sm transition-colors ${activeTab === 'open' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-primary'}`}
            >
              Upcoming Shows
            </button>
            <button
              onClick={() => { setActiveTab('closed'); setSelectedShow(null); }}
              className={`px-8 py-3 rounded-full font-bold text-sm transition-colors ${activeTab === 'closed' ? 'bg-card text-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Past Shows Archive
            </button>
          </div>
        </div>

        {/* Form View (When a show is selected for registration) */}
        <AnimatePresence mode="wait">
          {selectedShow && activeTab === 'open' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card rounded-[20px] shadow-lg border border-border overflow-hidden flex flex-col max-w-4xl mx-auto mb-20"
            >
              {/* Form Header */}
              <div className="bg-card p-8 text-foreground relative">
                <button
                  onClick={() => setSelectedShow(null)}
                  className="absolute top-4 right-4 text-foreground/70 hover:text-foreground bg-card/10 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                >
                  Cancel Registration
                </button>
                <h2 className="text-2xl font-bold font-outfit mb-2">Registration Portal</h2>
                <p className="text-muted-foreground text-sm">
                  Fill out the details below to enter your dog into {toTitleCase(selectedShowData?.name || '')}
                </p>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mt-8">
                  {[1, 2, 3, 4].map(step => (
                    <div key={step} className="flex-1 flex flex-col gap-2">
                      <div className={`h-1.5 rounded-full ${step <= formStep ? 'bg-primary' : 'bg-card/10'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${step <= formStep ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step === 1 ? 'Owner' : step === 2 ? 'Dog' : step === 3 ? 'Docs' : 'Pay'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Body */}
              <div className="p-8 flex-grow">
                {formStep === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h3 className="text-xl font-bold text-foreground">Owner Details</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-bold text-foreground mb-2">First Name</label>
                        <input type="text" className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-bold text-foreground mb-2">Last Name</label>
                        <input type="text" className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-foreground mb-2">Email Address</label>
                        <input type="email" className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {formStep === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h3 className="text-xl font-bold text-foreground">Dog Details</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-bold text-foreground mb-2">Registered Name</label>
                        <input type="text" className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-bold text-foreground mb-2">Call Name</label>
                        <input type="text" className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-bold text-foreground mb-2">Date of Birth</label>
                        <input type="date" className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-muted-foreground" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {formStep === 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h3 className="text-xl font-bold text-foreground">Documentation Upload</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-foreground mb-2">Registration Certificate (KCI/FCI)</label>
                        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors bg-card cursor-pointer">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground font-medium">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG (max. 5MB)</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-foreground mb-2">Latest Vaccination Record</label>
                        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors bg-card cursor-pointer">
                          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground font-medium">Click to upload or drag and drop</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {formStep === 4 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center py-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold font-outfit text-foreground mb-2">Review & Payment</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">Your registration is almost complete. Please proceed to payment to secure your entry.</p>

                    <div className="bg-card rounded-xl p-6 max-w-sm mx-auto mb-8 text-left border border-border">
                      <div className="flex justify-between mb-3 text-sm">
                        <span className="text-muted-foreground font-bold">Entry Fee</span>
                        <span className="text-foreground font-bold">
                          {selectedShowData?.entryFee ? `₹${selectedShowData.entryFee}` : 'Contact organizer'}
                        </span>
                      </div>
                      <div className="flex justify-between mb-3 text-sm">
                        <span className="text-muted-foreground font-bold">Catalog Fee</span>
                        <span className="text-foreground font-bold">₹200</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Form Footer */}
              <div className="p-8 border-t border-border bg-card flex justify-between">
                {formStep > 1 ? (
                  <Button variant="outline" className="border-border text-foreground" onClick={() => setFormStep(formStep - 1)}>Back</Button>
                ) : (
                  <div></div>
                )}
                {formStep < 4 ? (
                  <Button className="bg-primary hover:bg-primary/95 text-primary-foreground" onClick={() => setFormStep(formStep + 1)}>
                    Next Step <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button className="bg-green-600 hover:bg-green-700 text-white">Pay Securely</Button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-[80px]">
              {currentShows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-accent/40 flex items-center justify-center mb-6">
                    <Calendar className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {activeTab === 'open' ? 'No Upcoming Shows' : 'No Past Shows'}
                  </h3>
                  <p className="text-muted-foreground font-medium max-w-sm">
                    {activeTab === 'open'
                      ? 'There are no upcoming shows open for registration at this time.'
                      : 'No past show records are available yet.'}
                  </p>
                </div>
              ) : (
                <div className={`
                  ${currentShows.length === 1
                    ? 'flex justify-center'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'
                  }
                `}>
                  {currentShows.map((show, index) => (
                    <motion.div
                      key={show.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.5 }}
                      className={currentShows.length === 1 ? 'flex justify-center w-full max-w-md' : 'w-full h-full'}
                    >
                      <div
                        onClick={() => {
                          if (activeTab === 'open') setSelectedShow(show.id);
                        }}
                        className={`
                          bg-card rounded-[20px] border border-border overflow-hidden flex flex-col group text-left w-full h-full
                          ${activeTab === 'open' ? 'cursor-pointer hover:border-primary/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease' : ''}
                        `}
                      >
                        {/* Banner Image */}
                        <div className="relative w-full aspect-[16/9] overflow-hidden bg-input">
                          <OptimizedImage
                            src={show.cardImage || show.bannerUrl || show.featuredImage || '/images/events_banner.png'}
                            alt={show.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          {/* Status Badge */}
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm backdrop-blur-md ${activeTab === 'open' ? 'bg-green-500/90 text-white' : 'bg-accent/90 text-foreground'}`}>
                              {activeTab === 'open' ? 'Registration Open' : 'Archived'}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-xl font-bold font-outfit text-foreground mb-4 line-clamp-2 leading-snug group-hover:text-primary transition-colors normal-case">
                            {show.name}
                          </h3>

                          <div className="space-y-3 mb-6 text-sm font-medium text-muted-foreground">
                            {show.startDate && (
                              <div className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <span>{new Date(show.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              </div>
                            )}
                            {(show.venue || show.city) && (
                              <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <span>{[show.venue, show.city].filter(Boolean).join(', ')}</span>
                              </div>
                            )}
                            {show.club?.name && (
                              <div className="flex items-start gap-3">
                                <Users className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <span>{show.club.name}</span>
                              </div>
                            )}
                          </div>

                          {show.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-6">
                              {show.description}
                            </p>
                          )}

                          {/* Footer Info */}
                          <div className="mt-auto">
                            <div className="flex items-center justify-between py-4 border-t border-border">
                              {show.entryFee ? (
                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Entry Fee</span>
                                  <span className="text-foreground font-bold flex items-center">
                                    <IndianRupee className="w-3 h-3 mr-0.5" /> {show.entryFee}
                                  </span>
                                </div>
                              ) : <div />}
                              {show.registrationWindowEnd && (
                                <div className="flex flex-col text-right">
                                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Deadline</span>
                                  <span className="text-foreground font-bold flex items-center justify-end">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(show.registrationWindowEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </PublicContainer>
    </PageContainer>
  );
}
