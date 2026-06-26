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
import OptimizedImage from '@/components/shared/OptimizedImage';

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
            <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-foreground/20 blur-[120px]"></div>
          </div>

          <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center">
            <div className="w-24 h-24 bg-card rounded-3xl border-2 border-border shadow-2xl flex items-center justify-center mb-8 rotate-12">
              <Building2 className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white font-outfit">
              🏢 Club <span className="text-foreground">Not Found</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed mb-10">
              The requested club may have been removed, unpublished, or does not exist.
            </p>

            <div className="flex items-center gap-4">
              <Link href="/clubs" className="px-8 py-3 bg-foreground text-white font-bold rounded-xl hover:bg-foreground transition-colors shadow-lg shadow-black/20">
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
                        <OptimizedImage src={getImageUrl(rec.bannerUrl)} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-muted/40 flex items-center justify-center">
                          <Tent className="w-8 h-8 text-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-foreground line-clamp-1 mb-1 group-hover:text-foreground transition-colors">{rec.name}</h3>
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

  const getSecretaries = () => {
    if (club?.clubSecretaries?.length > 0) return club.clubSecretaries;
    if (club?.secretaries?.length > 0) return club.secretaries;
    
    if (club?.events?.length > 0) {
      for (const evt of club.events) {
        if (evt.eventSecretaries && evt.eventSecretaries.length > 0) {
          return evt.eventSecretaries;
        }
      }
    }
    
    // Fallback to basic club info
    if (club?.secretaryName || club?.secretary || club?.phone || club?.email || club?.address) {
      return [{
        name: club.secretaryName || club.secretary || 'Club Contact',
        designation: club.designation || 'Contact Person',
        mobile: club.mobile || club.phone,
        alternateMobile: '',
        phone: club.phone !== club.mobile ? club.phone : '',
        email: club.email,
        alternateEmail: '',
        website: club.website,
        addressLine1: club.address,
        addressLine2: '',
        city: club.city,
        state: club.state,
        pincode: club.zipcode,
        country: club.country
      }];
    }
    
    return [];
  };

  const secretaries = getSecretaries();

  return (
    <PageContainer>
      {/* Premium Hero */}
      <section className="relative pt-6 md:pt-8 pb-12 overflow-hidden bg-black border-b border-border">
        {club.bannerUrl && (
          <div className="absolute inset-0 opacity-30">
            <OptimizedImage src={getImageUrl(club.bannerUrl)} alt="Banner" className="w-full h-full object-cover" />
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
              className="w-[140px] h-[140px] rounded-full bg-card border-[4px] border-card shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex items-center justify-center text-4xl font-bold overflow-hidden shrink-0 mx-auto md:mx-0"
            >
              {club.logoUrl ? (
                <OptimizedImage src={getImageUrl(club.logoUrl)} alt={club.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted-foreground bg-foreground w-full h-full flex items-center justify-center text-white">{getInitials(club.name)}</span>
              )}
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-grow flex flex-col items-center md:items-start text-center md:text-left"
            >
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">

                {club.clubType && (
                  <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-md">
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

              <h1 className="text-3xl md:text-5xl font-extrabold text-white font-outfit mb-4 normal-case leading-tight">{club.name}</h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-medium text-white/80 mb-5">
                {(club.city || club.state) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {[club.city, club.state, club.country].filter(Boolean).join(', ')}
                  </div>
                )}
                {club.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    {club.email}
                  </div>
                )}
                {club.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    {club.phone}
                  </div>
                )}
                {club.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <a href={club.website.startsWith('http') ? club.website : `https://${club.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                      {club.website}
                    </a>
                  </div>
                )}
              </div>

              {club.description && (
                <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-3xl line-clamp-3">
                  {club.description}
                </p>
              )}
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
                    ? 'border-border text-foreground'
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
                  <h2 className="text-2xl font-bold text-foreground mb-6 normal-case">About {club.name}</h2>
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
                          <OptimizedImage src={getImageUrl(img.image)} alt={img.title || 'Gallery Image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                    <h2 className="text-2xl font-bold text-foreground mb-6 normal-case">Upcoming Registered Shows & Events</h2>
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
                                <OptimizedImage src={getImageUrl(evt.bannerUrl)} alt={evt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </div>
                            ) : (
                              <div className="h-40 bg-muted/40 flex items-center justify-center">
                                <Tent className="w-10 h-10 text-foreground/40" />
                              </div>
                            )}
                            <div className="p-6">
                              <h3 className="font-extrabold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-foreground transition-colors">{evt.name}</h3>
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
                    <h2 className="text-2xl font-bold text-foreground mb-6 normal-case">Other Club Activities & Events</h2>
                    {club.clubEvents?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {club.clubEvents.map((evt: any) => (
                          <div key={evt.id} className="bg-card rounded-2xl border border-border overflow-hidden group">
                            {evt.banner && (
                              <div className="h-40 bg-accent overflow-hidden">
                                <OptimizedImage src={getImageUrl(evt.banner)} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                  <h2 className="text-2xl font-bold text-foreground mb-6 normal-case">Committee Members</h2>
                  {club.clubCommittees?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                      {club.clubCommittees.map((member: any) => (
                        <div key={member.id} className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-accent overflow-hidden shrink-0 flex items-center justify-center font-bold text-xl text-muted-foreground border border-border">
                            {member.photo ? <OptimizedImage src={getImageUrl(member.photo)} className="w-full h-full object-cover" alt={member.name} /> : getInitials(member.name)}
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground normal-case">{member.name}</h3>
                            <div className="text-foreground text-sm font-semibold mb-1">{member.designation}</div>
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
                <div className="w-full">
                  <h2 className="text-2xl font-bold text-foreground mb-6 normal-case">Contact Information</h2>
                  
                  {secretaries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1400px]">
                      {secretaries.map((sec: any, idx: number) => (
                        <div key={idx} className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col h-full">
                          <div className="flex items-center gap-4 mb-6 border-b border-border/50 pb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-foreground leading-tight normal-case">{sec.name}</h3>
                              {sec.designation && <span className="text-sm font-semibold text-muted-foreground">{sec.designation}</span>}
                            </div>
                          </div>
                          
                          <div className="space-y-4 flex-grow">
                            {sec.mobile && (
                              <div className="flex gap-3">
                                <Phone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider mb-0.5">Mobile</span>
                                  <a href={`tel:${sec.mobile}`} className="text-foreground hover:text-primary transition-colors font-medium">{sec.mobile}</a>
                                </div>
                              </div>
                            )}

                            {sec.alternateMobile && (
                              <div className="flex gap-3">
                                <Phone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider mb-0.5">Alternate Mobile</span>
                                  <a href={`tel:${sec.alternateMobile}`} className="text-foreground hover:text-primary transition-colors font-medium">{sec.alternateMobile}</a>
                                </div>
                              </div>
                            )}

                            {sec.phone && (
                              <div className="flex gap-3">
                                <Phone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider mb-0.5">Landline</span>
                                  <a href={`tel:${sec.phone}`} className="text-foreground hover:text-primary transition-colors font-medium">{sec.phone}</a>
                                </div>
                              </div>
                            )}
                            
                            {sec.email && (
                              <div className="flex gap-3">
                                <Mail className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider mb-0.5">Email</span>
                                  <a href={`mailto:${sec.email}`} className="text-foreground hover:text-primary transition-colors font-medium break-all">{sec.email}</a>
                                </div>
                              </div>
                            )}

                            {sec.alternateEmail && (
                              <div className="flex gap-3">
                                <Mail className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider mb-0.5">Alternate Email</span>
                                  <a href={`mailto:${sec.alternateEmail}`} className="text-foreground hover:text-primary transition-colors font-medium break-all">{sec.alternateEmail}</a>
                                </div>
                              </div>
                            )}

                            {sec.website && (
                              <div className="flex gap-3">
                                <Globe className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider mb-0.5">Website</span>
                                  <a href={sec.website.startsWith('http') ? sec.website : `https://${sec.website}`} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors font-medium break-all flex items-center gap-1">
                                    {sec.website} <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            )}

                            {(sec.addressLine1 || sec.addressLine2 || sec.address || sec.city || sec.state) && (
                              <div className="flex gap-3">
                                <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider mb-0.5">Address</span>
                                  <p className="text-foreground font-medium leading-relaxed">
                                    {[
                                      sec.addressLine1 || sec.address, 
                                      sec.addressLine2, 
                                      sec.city, 
                                      sec.state ? `${sec.state}${sec.pincode ? ` - ${sec.pincode}` : ''}` : null,
                                      sec.country || 'India'
                                    ].filter(Boolean).join(', ')}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-card border border-border rounded-xl text-muted-foreground max-w-2xl">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No contact information available for this club.</p>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </PublicContainer>
      </section>
    </PageContainer>
  );
}
