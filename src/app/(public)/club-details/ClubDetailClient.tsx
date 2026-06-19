'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MapPin, Phone, Mail, Globe, Calendar, Users,
  ChevronLeft, Award, Share2, Tent, Building2, ExternalLink
} from 'lucide-react';
import { getImageUrl } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';

interface ClubDetailClientProps {
  club: any;
  recommendedClubs?: any[];
}

export default function ClubDetailClient({ club, recommendedClubs = [] }: ClubDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('about');

  if (!club) {
    return (
      <PageContainer>
        <section className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-4 bg-black relative overflow-hidden text-center border-b border-border">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-brand-orange/20 blur-[120px]"></div>
          </div>

          <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center">
            <div className="w-24 h-24 bg-card rounded-3xl border-2 border-border shadow-2xl flex items-center justify-center mb-8 rotate-12">
              <Building2 className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white font-outfit">
              🏢 Club <span className="text-brand-orange">Not Found</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed mb-10">
              The requested club may have been removed, unpublished, or does not exist.
            </p>

            <div className="flex items-center gap-4">
              <Link href="/clubs" className="px-8 py-3 bg-brand-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                Browse All Clubs
              </Link>
              <Link href="/" className="px-8 py-3 bg-card border border-border text-foreground font-bold rounded-xl hover:bg-accent transition-colors">
                Go Home
              </Link>
            </div>
          </div>
        </section>

        {recommendedClubs.length > 0 && (
          <section className="py-20 bg-background min-h-screen">
            <PublicContainer>
              <h2 className="text-3xl font-extrabold text-foreground mb-10 text-center">Recommended Clubs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {recommendedClubs.map((rec) => (
                  <Link key={rec.id} href={`/clubs/${rec.slug || rec.id}`} className="group bg-card rounded-2xl border border-border overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 block">
                    <div className="h-32 bg-accent relative overflow-hidden">
                      {rec.bannerUrl ? (
                        <img src={getImageUrl(rec.bannerUrl)} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-orange/20 to-orange-600/10 flex items-center justify-center">
                          <Tent className="w-8 h-8 text-brand-orange/40" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-foreground line-clamp-1 mb-1 group-hover:text-brand-orange transition-colors">{rec.name}</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 mr-1" /> {rec.city ? `${rec.city}, ` : ''}{rec.state || 'India'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </PublicContainer>
          </section>
        )}
      </PageContainer>
    );
  }

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'KC';
  };

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <PageContainer>
      {/* Premium Hero */}
      <section className="relative pt-6 md:pt-8 pb-12 overflow-hidden bg-black border-b border-border">
        {club.bannerUrl && (
          <div className="absolute inset-0 opacity-30">
            <img src={getImageUrl(club.bannerUrl)} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#020817]/80 to-transparent"></div>
          </div>
        )}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[100px]"></div>
        </div>

        <PublicContainer className="relative z-10">
          <button
            onClick={() => router.push('/clubs')}
            className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8 group bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-md w-fit"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Directory
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-card border-4 border-card shadow-2xl flex items-center justify-center text-4xl font-bold overflow-hidden shrink-0"
            >
              {club.logoUrl ? (
                <img src={getImageUrl(club.logoUrl)} alt={club.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted-foreground bg-brand-orange w-full h-full flex items-center justify-center text-white">{getInitials(club.name)}</span>
              )}
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-grow"
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {club.kciApproved && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/30 flex items-center gap-1.5 backdrop-blur-md">
                    <Award className="w-3.5 h-3.5" /> KCI Approved
                  </span>
                )}
                {club.clubType && (
                  <span className="px-3 py-1 bg-brand-orange/20 text-brand-orange rounded-full text-xs font-bold uppercase tracking-wider border border-brand-orange/30 backdrop-blur-md">
                    {club.clubType}
                  </span>
                )}
                {club.registrationNumber && (
                  <span className="px-3 py-1 bg-accent/50 text-gray-300 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    Reg: {club.registrationNumber}
                  </span>
                )}
                {club.establishedYear && (
                  <span className="px-3 py-1 bg-accent/50 text-gray-300 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    Est: {club.establishedYear}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-white font-outfit mb-4">{club.name}</h1>

              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-400">
                {(club.city || club.state) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {[club.city, club.state, club.country].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </PublicContainer>
      </section>

      {/* Tabs Navigation */}
      <section className="bg-card border-b border-border sticky top-[var(--nav-height, 84px)] z-40 shadow-sm overflow-x-auto hide-scrollbar">
        <PublicContainer>
          <div className="flex items-center gap-8 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-brand-orange text-brand-orange'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </PublicContainer>
      </section>

      {/* Tab Content */}
      <section className="py-12 bg-background min-h-[400px]">
        <PublicContainer>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'about' && (
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-bold text-foreground mb-6">About {club.name}</h2>
                  <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {club.description || 'No description provided.'}
                  </div>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Gallery</h2>
                  {club.clubGalleries?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                      {club.clubGalleries.map((img: any) => (
                        <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-accent border border-border group relative">
                          <img src={getImageUrl(img.image)} alt={img.title || 'Gallery Image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          {img.title && <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-white text-xs font-bold backdrop-blur-sm">{img.title}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-card border border-border rounded-xl text-muted-foreground">
                      No gallery images available.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'events' && (
                <div className="space-y-10">
                  {/* Platform Registered Shows */}
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Registered Shows & Events</h2>
                    {club.events?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {club.events.map((evt: any) => (
                          <Link
                            key={evt.id}
                            href={`/shows/${evt.slug || evt.id}`}
                            className="bg-card rounded-2xl border border-border overflow-hidden group block hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                          >
                            {evt.bannerUrl ? (
                              <div className="h-40 bg-accent overflow-hidden">
                                <img src={getImageUrl(evt.bannerUrl)} alt={evt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </div>
                            ) : (
                              <div className="h-40 bg-gradient-to-br from-brand-orange/20 to-orange-600/10 flex items-center justify-center">
                                <Tent className="w-10 h-10 text-brand-orange/40" />
                              </div>
                            )}
                            <div className="p-6">
                              <h3 className="font-extrabold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-brand-orange transition-colors">{evt.name}</h3>
                              <div className="flex items-center text-sm text-muted-foreground mb-1"><Calendar className="w-4 h-4 mr-2" /> {new Date(evt.startDate).toLocaleDateString()}</div>
                              <div className="flex items-center text-sm text-muted-foreground"><MapPin className="w-4 h-4 mr-2" /> {evt.venue}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-card border border-border rounded-xl text-muted-foreground">
                        No registered upcoming shows listed on the platform.
                      </div>
                    )}
                  </div>

                  {/* Club Activities */}
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Other Club Activities & Events</h2>
                    {club.clubEvents?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {club.clubEvents.map((evt: any) => (
                          <div key={evt.id} className="bg-card rounded-2xl border border-border overflow-hidden group">
                            {evt.banner && (
                              <div className="h-40 bg-accent overflow-hidden">
                                <img src={getImageUrl(evt.banner)} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </div>
                            )}
                            <div className="p-6">
                              <h3 className="font-bold text-lg text-foreground mb-2">{evt.title}</h3>
                              <div className="flex items-center text-sm text-muted-foreground mb-1"><Calendar className="w-4 h-4 mr-2" /> {new Date(evt.startDate).toLocaleDateString()}</div>
                              <div className="flex items-center text-sm text-muted-foreground"><MapPin className="w-4 h-4 mr-2" /> {evt.venue}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-card border border-border rounded-xl text-muted-foreground">
                        No other club events listed.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'committee' && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Committee Members</h2>
                  {club.clubCommittees?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                      {club.clubCommittees.map((member: any) => (
                        <div key={member.id} className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-accent overflow-hidden shrink-0 flex items-center justify-center font-bold text-xl text-muted-foreground border border-border">
                            {member.photo ? <img src={getImageUrl(member.photo)} className="w-full h-full object-cover" alt={member.name} /> : getInitials(member.name)}
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">{member.name}</h3>
                            <div className="text-brand-orange text-sm font-semibold mb-1">{member.designation}</div>
                            {member.email && <div className="text-xs text-muted-foreground">{member.email}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-card border border-border rounded-xl text-muted-foreground">
                      No committee members listed.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'members' && (
                <div className="p-8 text-center bg-card border border-border rounded-xl text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Membership list is not publicly available at this time.</p>
                </div>
              )}

              {activeTab === 'judges' && (
                <div className="p-8 text-center bg-card border border-border rounded-xl text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No resident judges listed.</p>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="max-w-2xl bg-card rounded-2xl border border-border p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
                  <div className="space-y-6">
                    {(club.secretaryName || club.secretary) && (
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground mb-1">Secretary Details</h4>
                          <p className="text-muted-foreground leading-relaxed">
                            <span className="font-semibold text-foreground">{club.secretaryName || club.secretary}</span>
                            {club.designation && <span className="block text-xs text-muted-foreground mt-0.5">{club.designation}</span>}
                          </p>
                        </div>
                      </div>
                    )}
                    {club.address && (
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground mb-1">Address</h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {club.address}<br />
                            {[club.city, club.state, club.zipcode, club.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>
                    )}

                    {club.phone && (
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground mb-1">Phone</h4>
                          <a href={`tel:${club.phone}`} className="text-muted-foreground hover:text-primary transition-colors">{club.phone}</a>
                        </div>
                      </div>
                    )}

                    {club.email && (
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground mb-1">Email</h4>
                          <a href={`mailto:${club.email}`} className="text-muted-foreground hover:text-primary transition-colors">{club.email}</a>
                        </div>
                      </div>
                    )}

                    {club.website && (
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Globe className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground mb-1">Website</h4>
                          <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                            {club.website} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </PublicContainer>
      </section>
    </PageContainer>
  );
}
