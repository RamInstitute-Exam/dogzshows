'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, SearchX, AlertTriangle, CreditCard, Calendar, ShieldCheck } from 'lucide-react';
import { formatTitle } from '@/lib/utils';
import PageContainer from '@/components/layout/PageContainer';
import api, { getImageUrl } from '@/lib/api';
import RegisterForEventModal from '@/components/events/details/RegisterForEventModal';
import { Button } from '@/components/ui/button';

// Components
import EventHero from '@/components/events/details/EventHero';
import EventJudges from '@/components/events/details/EventJudges';
import OrganizingCommittee from '@/components/events/details/OrganizingCommittee';
import AboutEvent from '@/components/events/details/AboutEvent';
import BreedCategories from '@/components/events/details/BreedCategories';
import EventGallery from '@/components/events/details/EventGallery';
import EventSidebar from '@/components/events/details/EventSidebar';
import EventSponsors from '@/components/events/details/EventSponsors';
import EventTimeline from '@/components/events/details/EventTimeline';
import EventVenue from '@/components/events/details/EventVenue';

export default function EventDetailClient({ params }: { params?: Promise<{ slug: string }> }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Resolve slug from path parameter Promise, falling back to query search parameters
  let resolvedSlug = '';
  if (params) {
    try {
      const resolvedParams = use(params);
      resolvedSlug = resolvedParams.slug || '';
    } catch (e) {
      console.error('[EventDetail] Failed to resolve params Promise:', e);
    }
  }

  const slug = (resolvedSlug || searchParams.get('slug') || searchParams.get('id') || '').trim();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

  // Check if user has already registered for this event
  useEffect(() => {
    if (event) {
      const token = localStorage.getItem('token');
      if (token) {
        api.get('/registrations').then(res => {
          if (res.success && res.data) {
            const registered = res.data.some((r: any) => r.eventId === event.id);
            setHasRegistered(registered);
          }
        }).catch(err => console.error(err));
      }
    }
  }, [event]);

  // Handle URL query trigger for registration modal
  useEffect(() => {
    if (event && searchParams.get('register') === 'true') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(`/login?redirect=/events/detail/${event.slug}?register=true`);
      } else {
        setIsModalOpen(true);
      }
    }
  }, [event, searchParams, router]);

  const handleRegisterClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/login?redirect=/events/detail/${event.slug}?register=true`);
    } else {
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);
      setNotFound(false);
      setError(null);

      try {
        const response = await api.get(`/public/shows/${encodeURIComponent(slug)}`);

        if (response?.success && response?.data) {
          setEvent(response.data);
        } else {
          setNotFound(true);
        }
      } catch (err: any) {
        console.error('[EventDetail] Failed to fetch event:', err?.message || err);
        setError(err?.message || 'Failed to load event data.');
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  // ── Loading State ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
          <div className="w-full h-[450px] bg-card rounded-[24px] mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card h-[120px] rounded-[20px]" />
            ))}
          </div>
          <div className="flex flex-col lg:flex-row gap-8 mt-8">
            <div className="flex-1 space-y-6">
              <div className="bg-card h-[300px] rounded-[24px]" />
              <div className="bg-card h-[200px] rounded-[24px]" />
            </div>
            <div className="w-full lg:w-[30%] space-y-6">
              <div className="bg-card h-[350px] rounded-[24px]" />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────────
  if (error && notFound) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Failed to Load Event</h1>
          <p className="text-muted-foreground font-medium max-w-md mb-8 text-lg">
            {error}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 bg-foreground hover:bg-foreground text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  // ── Not Found State ─────────────────────────────────────────────────────────
  if (notFound || !event) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
          <div className="w-24 h-24 rounded-full bg-foreground/10 flex items-center justify-center mb-6 border border-border/20">
            <SearchX className="w-12 h-12 text-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Event Not Found</h1>
          <p className="text-muted-foreground font-medium max-w-md mb-8 text-lg">
            This event may have been removed, renamed, or does not exist.
            {slug && (
              <span className="block mt-2 text-sm font-mono text-muted-foreground/60 break-all">
                Slug: {slug}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 bg-foreground hover:bg-foreground text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-card hover:bg-accent border border-border text-foreground font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Back Home
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  // ── Event Found ─────────────────────────────────────────────────────────────
  return (
    <PageContainer>
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-0 md:pt-6 md:pb-2 breadcrumb-container">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <Link href="/events" className="hover:text-primary transition-colors">Events</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{formatTitle(event?.name) || 'Event Details'}</span>
        </div>
      </div>

      {/* Hero Banner */}
      <EventHero event={event} />

      {/* Detail Layout Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Event details */}
          <div className="flex-1 space-y-8 min-w-0">
            {/* Club Logo, Name & Title Header */}
            <div className="bg-card rounded-[20px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-border flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {event.club?.logoUrl && (
                <div className="w-24 h-24 rounded-2xl bg-white border border-border p-3 flex items-center justify-center shrink-0 shadow-sm">
                  <img 
                    src={getImageUrl(event.club.logoUrl)} 
                    alt={event.club.name || 'Club Logo'} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.webp';
                    }}
                  />
                </div>
              )}
              <div className="text-center sm:text-left flex-1 space-y-2">
                <span className="text-xs font-black text-primary tracking-[2px] uppercase">
                  {event.club?.name || 'Kennel Club Event'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
                  {formatTitle(event.name)}
                </h1>
                <p className="text-muted-foreground font-semibold text-sm flex items-center justify-center sm:justify-start gap-1">
                  <span>📅</span> {new Date(event.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  {event.endDate && event.endDate !== event.startDate && (
                    <> - {new Date(event.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
                  )}
                </p>
                {event.city && (
                  <p className="text-muted-foreground font-medium text-sm">
                    📍 {event.city}, {event.state || ''} {event.country ? `, ${event.country}` : ', India'}
                  </p>
                )}
              </div>
            </div>

            {/* Judges */}
            {event.judgingPanel && event.judgingPanel.length > 0 && (
              <EventJudges judges={event.judgingPanel} />
            )}

            {/* Organizing Committee */}
            {event.secretaries && event.secretaries.length > 0 && (
              <OrganizingCommittee secretaries={event.secretaries} />
            )}
          </div>

          {/* Right Column: Sticky Registration Card */}
          <div className="w-full lg:w-[360px] shrink-0 sticky top-24 z-10">
            {(() => {
              const isClosed = event.status === 'CLOSED' || event.status === 'COMPLETED' || (event.registrationWindowEnd && new Date(event.registrationWindowEnd) < new Date());
              const isOpen = (event.status === 'REGISTRATION_OPEN' || event.status === 'ACTIVE') && !isClosed;
              
              const regFee = event.paymentSettings?.registrationFee ?? event.entryFee ?? 1500;
              const closingDate = event.registrationWindowEnd 
                ? new Date(event.registrationWindowEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A';
              
              return (
                <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-5">
                  <div className="flex justify-between items-center border-b border-border/40 pb-3">
                    <h3 className="font-extrabold text-foreground text-base">Show Registration</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      hasRegistered ? 'bg-green-500/20 text-green-500 border border-green-500/20' : isOpen ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {hasRegistered ? 'Registered ✓' : isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  <div className="space-y-3.5 text-sm font-semibold">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry Fee:</span>
                      <span className="text-foreground font-bold">₹{regFee} / Dog</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registration Ends:</span>
                      <span className="text-red-500 font-bold">{closingDate}</span>
                    </div>
                    {event.capacity && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Slots Limit:</span>
                        <span className="text-foreground font-bold">{event.capacity} Dogs</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="text-foreground font-bold flex items-center gap-1"><CreditCard className="w-4 h-4 text-primary" /> Razorpay</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {hasRegistered ? (
                      <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 text-center space-y-2">
                        <p className="text-xs text-green-500 font-bold flex items-center justify-center gap-1">
                          <ShieldCheck className="w-4 h-4" /> You are registered for this event
                        </p>
                        <Link href="/dashboard/events/registered" className="block w-full">
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm">
                            View Registration
                          </Button>
                        </Link>
                      </div>
                    ) : isOpen ? (
                      <Button 
                        onClick={handleRegisterClick}
                        className="w-full bg-[#38BDF8] hover:bg-blue-500 text-foreground font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg"
                      >
                        Register My Dog
                      </Button>
                    ) : (
                      <Button 
                        disabled 
                        className="w-full bg-muted text-muted-foreground font-bold py-3.5 rounded-xl text-sm"
                      >
                        Registration Closed
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      </div>

      {/* Registration Modal Wizard */}
      <RegisterForEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={event}
        onSuccess={() => setHasRegistered(true)}
      />
    </PageContainer>
  );
}
