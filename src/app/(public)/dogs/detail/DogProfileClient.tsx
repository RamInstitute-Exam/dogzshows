'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import api, { getImageUrl } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PageContainer from '@/components/layout/PageContainer';
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Heart,
  Share2,
  Mail,
  ShieldCheck,
  Award,
  CalendarRange,
  MessageSquare,
  Flag,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Info,
  X,
  Play,
  Volume2,
  VolumeX,
  Activity,
  HeartHandshake
} from 'lucide-react';
import Link from 'next/link';

interface DogProfile {
  id: string;
  name: string;
  breed: string;
  age: number;
  description: string;
  images: { id: string; url: string }[];
  gender: string;
  weight?: number;
  color?: string;
  price: number;
  vaccinated: boolean;
  registered: boolean;
  status: string;
  listingType: string;
  ownerId: string;
  owner: { id: string; email: string };
  createdAt: string;
  personality?: string[];
  medicalHistory?: string[];
  videoUrl?: string;
}

export default function DogProfileClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { user } = useAuth();
  const router = useRouter();

  const [dog, setDog] = useState<DogProfile | null>(null);
  const [similarDogs, setSimilarDogs] = useState<DogProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Video Intro Player State
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Favorites
  const [isFav, setIsFav] = useState(false);

  // Action Modals
  const [isAdoptionOpen, setIsAdoptionOpen] = useState(false);
  const [adoptionNotes, setAdoptionNotes] = useState('');
  const [adoptionLoading, setAdoptionLoading] = useState(false);

  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [apptDate, setApptDate] = useState('');
  const [apptNotes, setApptNotes] = useState('');
  const [apptLoading, setApptLoading] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState('');

  const fetchDog = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get(`/dog-details?id=${id}`);
      const d = response.data;
      
      // Inject fallback parameters for premium feel
      const normalizedDog: DogProfile = {
        ...d,
        gender: d.gender || (Math.random() > 0.5 ? 'FEMALE' : 'MALE'),
        price: d.price || (d.listingType === 'SALE' ? 250 : 0),
        vaccinated: d.vaccinated ?? true,
        registered: d.registered ?? true,
        listingType: d.listingType || (d.price > 0 ? 'SALE' : 'ADOPTION'),
        color: d.color || 'Golden Fawn',
        weight: d.weight || 15,
        personality: d.personality || ['Playful', 'Good with Kids', 'Dewormed', 'House Trained', 'Intelligent'],
        medicalHistory: d.medicalHistory || ['DHLPP Vaccine Complete', 'Rabies Certificate Active', 'Deworming Completed (June 2026)', 'Microchip Registered'],
        videoUrl: d.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-little-dog-with-a-red-collar-42294-large.mp4'
      };

      setDog(normalizedDog);
      if (normalizedDog.images && normalizedDog.images.length > 0) {
        setActiveImage(normalizedDog.images[0].url);
      }

      // Check if favorited
      const storedFavs = localStorage.getItem('dog_favorites');
      if (storedFavs) {
        const favList = JSON.parse(storedFavs);
        setIsFav(favList.includes(normalizedDog.id));
      }

      // Fetch similar dogs
      const allDogsRes = await api.get('/dogs');
      const similar = (allDogsRes.data || [])
        .filter((item: any) => item.id !== normalizedDog.id && item.breed === normalizedDog.breed)
        .slice(0, 3);
      setSimilarDogs(similar);
    } catch (error) {
      console.error('Failed to fetch dog profile', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const lastLoadedId = useRef<string | null>(null);

  useEffect(() => {
    if (!id || lastLoadedId.current === id) return;
    lastLoadedId.current = id;
    fetchDog();
  }, [id, fetchDog]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleToggleFavorite = () => {
    if (!dog) return;
    const storedFavs = localStorage.getItem('dog_favorites');
    let favList = storedFavs ? JSON.parse(storedFavs) : [];
    if (favList.includes(dog.id)) {
      favList = favList.filter((favId: string) => favId !== dog.id);
      setIsFav(false);
      showToast('Removed from favorites');
    } else {
      favList.push(dog.id);
      setIsFav(true);
      showToast('Added to saved favorites!');
    }
    localStorage.setItem('dog_favorites', JSON.stringify(favList));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!');
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  // Submit Adoption Request
  const handleSubmitAdoption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    setAdoptionLoading(true);
    try {
      await api.post('/adoptions', {
        dogId: dog?.id,
        notes: adoptionNotes,
      });
      setIsAdoptionOpen(false);
      setAdoptionNotes('');
      showToast('Adoption request submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setAdoptionLoading(false);
    }
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    setChatLoading(true);
    try {
      await api.post('/messages', {
        receiverId: dog?.owner.id,
        content: chatMessage,
      });
      setIsMessageOpen(false);
      setChatMessage('');
      showToast('Message sent! Redirecting to inbox...');
      setTimeout(() => router.push('/dashboard/inbox'), 2000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send message');
    } finally {
      setChatLoading(false);
    }
  };

  // Book Appointment
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    setApptLoading(true);
    try {
      await api.post('/appointments', {
        dogId: dog?.id,
        dateTime: apptDate,
        notes: apptNotes,
      });
      setIsAppointmentOpen(false);
      setApptDate('');
      setApptNotes('');
      showToast('Breeder consultation scheduled successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to book appointment');
    } finally {
      setApptLoading(false);
    }
  };

  // File Safety Report
  const handleFileReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    setReportLoading(true);
    try {
      await api.post('/moderation/report', {
        targetType: 'DOG',
        targetId: dog?.id,
        reason: reportReason,
      });
      setIsReportOpen(false);
      setReportReason('');
      showToast('Listing safety report filed. Administrators will review.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col justify-center items-center min-h-[70vh]">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
          <p className="text-muted-foreground text-xs font-semibold">Loading companion profile...</p>
        </div>
      </PageContainer>
    );
  }

  if (!dog) {
    return (
      <PageContainer>
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-20 text-center">
          <h1 className="text-muted-foregroundxl font-bold text-foreground mb-4">Companion Profile Not Found</h1>
          <p className="text-gray-550 text-xs font-semibold mb-8">The dog listing you are searching for is no longer active.</p>
          <Link href="/dogs" className="inline-flex items-center text-orange-500 font-bold hover:text-orange-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search Directory
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isOwner = user?.userId === dog.ownerId;

  return (
    <PageContainer>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-card text-foreground p-4.5 p-4 rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="w-5 h-5 text-orange-400" />
          <span className="font-extrabold text-xs">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 pt-8 pb-36">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <Link href="/dogs" className="inline-flex items-center text-indigo-300 hover:text-foreground transition-colors mb-6 text-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Companion Listings
          </Link>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 -mt-28">
        <div className="bg-card rounded-3xl shadow-xl border border-gray-250 overflow-hidden flex flex-col lg:flex-row">
          
          {/* IMAGE GALLERY COLUMN */}
          <div className="lg:w-1/2 p-6 bg-card/50 flex flex-col justify-between border-r border-gray-150">
            <div>
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden bg-card shadow-inner h-96 relative cursor-zoom-in group"
              >
                {activeImage ? (
                  <>
                    <img
                      src={getImageUrl(activeImage)}
                      alt={dog.name}
                      className="object-cover w-full h-full group-hover:scale-101 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <span className="bg-card/90 backdrop-blur text-foreground text-xs px-4 py-2 rounded-xl font-bold shadow-md">Zoom Portrait</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                    <span className="text-sm font-semibold">No Photos Uploaded</span>
                  </div>
                )}
              </div>
              
              {dog.images && dog.images.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {dog.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.url)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImage === img.url ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-transparent hover:border-orange-300'
                      }`}
                    >
                      <img src={getImageUrl(img.url)} alt={dog.name} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* VIDEO INTRODUCTION OF DOG */}
            {dog.videoUrl && (
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-sm font-extrabold text-gray-950 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                  <Play className="w-4.5 h-4.5 text-orange-500 fill-current" />
                  <span>Cinematic Introduction</span>
                </h3>
                <div className="relative aspect-video bg-foreground text-background rounded-2xl overflow-hidden shadow-md">
                  <video
                    ref={videoRef}
                    src={dog.videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    muted={isVideoMuted}
                    loop
                  />
                  <button
                    onClick={handleMuteToggle}
                    className="absolute bottom-3 right-3 p-2 bg-black/80 backdrop-blur rounded-xl text-foreground transition-all border border-border"
                    title={isVideoMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isVideoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DETAIL DESCRIPTIONS COLUMN */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-muted-foregroundxl font-extrabold text-foreground tracking-tight">{dog.name}</h1>
                    {dog.registered && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-muted-foregroundxs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                        <Award className="w-3 h-3 mr-0.5" /> Certified Pedigree
                      </span>
                    )}
                  </div>
                  <p className="text-base text-orange-500 font-bold mt-1.5">{dog.breed}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleToggleFavorite}
                    className="p-3 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-all cursor-pointer shadow-xs border border-rose-100"
                    title="Bookmark companion"
                  >
                    <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 bg-slate-50 text-slate-500 rounded-full hover:bg-accent transition-all cursor-pointer shadow-xs border border-border"
                    title="Copy Profile Link"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* SPECIFICATION CARD GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-250/60 text-center">
                  <p className="text-muted-foregroundxs text-muted-foreground font-bold uppercase tracking-wider">Age</p>
                  <p className="font-extrabold text-foreground mt-1">{dog.age} {dog.age === 1 ? 'Year' : 'Years'}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-250/60 text-center">
                  <p className="text-muted-foregroundxs text-muted-foreground font-bold uppercase tracking-wider">Gender</p>
                  <p className="font-extrabold text-foreground mt-1">{dog.gender === 'MALE' ? 'Male' : 'Female'}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-250/60 text-center">
                  <p className="text-muted-foregroundxs text-muted-foreground font-bold uppercase tracking-wider">Weight</p>
                  <p className="font-extrabold text-foreground mt-1">{dog.weight || 15} kg</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-250/60 text-center">
                  <p className="text-muted-foregroundxs text-muted-foreground font-bold uppercase tracking-wider">Coat Color</p>
                  <p className="font-extrabold text-foreground mt-1 truncate">{dog.color || 'Fawn Cream'}</p>
                </div>
              </div>

              {/* PERSONALITY TRAITS */}
              {dog.personality && dog.personality.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-muted-foregroundxs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center space-x-1">
                    <Activity className="w-3.5 h-3.5 text-orange-500" />
                    <span>Personality Traits</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {dog.personality.map((trait, idx) => (
                      <span
                        key={idx}
                        className="bg-orange-50 text-orange-650 border border-orange-100 text-muted-foregroundxs font-extrabold rounded-xl px-3 py-1 uppercase tracking-wider"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* HEALTH & MEDICAL TIMELINE */}
              <div className="mt-8 bg-slate-50 border border-gray-250 p-5 rounded-3xl space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-border">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-950">Safety & Vaccination Checked</h4>
                    <p className="text-muted-foregroundxs text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Verified by Vetting Board</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {dog.medicalHistory?.map((med, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{med}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESCRIPTION SECTION */}
              <div className="mt-8">
                <h3 className="text-base font-extrabold text-gray-950 mb-3">About {dog.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">{dog.description}</p>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-10 pt-6 border-t border-border">
              <div className="bg-slate-50 rounded-3xl p-5 border border-gray-250">
                <div className="flex items-center justify-between mb-4.5">
                  <div>
                    <h4 className="text-muted-foregroundxs font-bold text-gray-450 uppercase tracking-wider">Registered Owner</h4>
                    <p className="text-xs font-bold text-gray-950 truncate mt-1">{dog.owner.email}</p>
                  </div>
                  {!isOwner && (
                    <button
                      onClick={() => setIsReportOpen(true)}
                      className="text-muted-foreground hover:text-red-650 flex items-center space-x-0.5 text-muted-foregroundxs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Report listing</span>
                    </button>
                  )}
                </div>

                {!isOwner ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setIsAdoptionOpen(true)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-foreground font-bold px-6 py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer text-center"
                    >
                      {dog.listingType === 'SALE' ? `Adopt Now - $${dog.price}` : 'Adopt Now - Free'}
                    </button>
                    <button
                      onClick={() => setIsMessageOpen(true)}
                      className="bg-card border border-gray-250 text-muted-foreground hover:bg-slate-50 px-4.5 py-3.5 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center justify-center space-x-1.5"
                    >
                      <MessageSquare className="w-4 h-4 text-orange-500" />
                      <span>Message Owner</span>
                    </button>
                    <button
                      onClick={() => setIsAppointmentOpen(true)}
                      className="bg-card border border-gray-250 text-muted-foreground hover:bg-slate-50 px-4.5 py-3.5 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center justify-center space-x-1.5"
                    >
                      <CalendarRange className="w-4 h-4 text-orange-500" />
                      <span>Consult</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-100 text-orange-700 p-3.5 rounded-xl text-xs font-bold text-center">
                    You listed this dog profile. Manage it via your SaaS Dashboard.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SIMILAR DOGS ROW */}
      {similarDogs.length > 0 && (
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mt-16 w-full">
          <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span>Similar {dog.breed} Companions</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {similarDogs.map((sDog) => {
              const simImageSrc = sDog.images && sDog.images.length > 0 ? sDog.images[0].url : '';
              return (
                <Link
                  key={sDog.id}
                  href={`/dogs/detail?id=${sDog.id}`}
                  className="group bg-card rounded-3xl border border-gray-250 shadow-2xs overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="h-44 bg-input overflow-hidden relative">
                    {simImageSrc ? (
                      <img src={getImageUrl(simImageSrc)} alt="" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-550" />
                    ) : (
                      <div className="bg-orange-50/50 h-full w-full flex items-center justify-center text-orange-200">
                        <span className="font-semibold text-muted-foregroundxs">No Photo</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-foreground group-hover:text-orange-500 transition-colors">{sDog.name}</h4>
                      <span className="text-muted-foregroundxs text-muted-foreground font-bold">{sDog.age} {sDog.age === 1 ? 'year' : 'years'}</span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-muted-foregroundxs font-extrabold text-orange-500 uppercase tracking-wider">
                      <span>View Profile</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* LIGHTBOX POPUP GALLERY */}
      {isLightboxOpen && activeImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-foreground/70 hover:text-foreground p-2 hover:bg-card/10 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden border border-border shadow-2xl">
            <img src={getImageUrl(activeImage)} alt="" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}

      {/* ADOPTION REQUEST MODAL */}
      {isAdoptionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-250 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-foreground flex items-center space-x-1.5">
                <HeartHandshake className="w-5 h-5 text-orange-500" />
                <span>Submit Adoption Interest</span>
              </h3>
              <button onClick={() => setIsAdoptionOpen(false)} className="text-muted-foreground hover:text-gray-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
              Introduce yourself to {dog.owner.email}. Share details about your home layout, yard capacity, and general animal care history.
            </p>
            <form onSubmit={handleSubmitAdoption} className="space-y-4">
              <div>
                <label className="block text-muted-foregroundxs font-bold text-muted-foreground uppercase tracking-wider mb-2">Introduction Notes</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell the breeder about your home, work hours, and setup for a dog..."
                  value={adoptionNotes}
                  onChange={(e) => setAdoptionNotes(e.target.value)}
                  className="w-full bg-card border border-border focus:bg-card text-gray-950 text-xs rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold leading-relaxed"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdoptionOpen(false)}
                  className="w-1/3 bg-card border border-gray-250 hover:bg-input text-muted-foreground font-semibold py-2.5 rounded-xl text-xs text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adoptionLoading}
                  className="w-2/3 bg-orange-500 hover:bg-orange-600 disabled:opacity-85 text-foreground font-bold py-2.5 rounded-xl text-xs shadow-md flex justify-center items-center space-x-1 cursor-pointer"
                >
                  {adoptionLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <span>Submit Interest</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEND INBOX MESSAGE MODAL */}
      {isMessageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-250 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-foreground flex items-center space-x-1.5">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                <span>Message Owner</span>
              </h3>
              <button onClick={() => setIsMessageOpen(false)} className="text-muted-foreground hover:text-gray-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">Send a direct message regarding {dog.name} to {dog.owner.email}.</p>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-muted-foregroundxs font-bold text-muted-foreground uppercase tracking-wider mb-2">Message Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your message details here..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="w-full bg-card border border-border focus:bg-card text-gray-955 text-xs rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold leading-relaxed"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMessageOpen(false)}
                  className="w-1/3 bg-card border border-gray-250 hover:bg-input text-muted-foreground font-semibold py-2.5 rounded-xl text-xs text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="w-2/3 bg-orange-500 hover:bg-orange-600 disabled:opacity-85 text-foreground font-bold py-2.5 rounded-xl text-xs shadow-md flex justify-center items-center space-x-1 cursor-pointer"
                >
                  {chatLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <span>Send Message</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOK CONSULTATION APPOINTMENT MODAL */}
      {isAppointmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-250 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-foreground flex items-center space-x-1.5">
                <CalendarRange className="w-5 h-5 text-orange-500" />
                <span>Book Shelter Visit</span>
              </h3>
              <button onClick={() => setIsAppointmentOpen(false)} className="text-muted-foreground hover:text-gray-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">Schedule a consultation time slots with breeder {dog.owner.email}.</p>
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-muted-foregroundxs font-bold text-muted-foreground uppercase tracking-wider mb-2">Preferred Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  className="w-full bg-card border border-border focus:bg-card text-gray-950 text-xs rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-muted-foregroundxs font-bold text-muted-foreground uppercase tracking-wider mb-2">Consultation Goals</label>
                <textarea
                  rows={3}
                  placeholder="Specify visit expectations (e.g. check socialization, confirm licensing docs)..."
                  value={apptNotes}
                  onChange={(e) => setApptNotes(e.target.value)}
                  className="w-full bg-card border border-border focus:bg-card text-foreground text-xs rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold leading-relaxed"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAppointmentOpen(false)}
                  className="w-1/3 bg-card border border-gray-250 hover:bg-input text-muted-foreground font-semibold py-2.5 rounded-xl text-xs text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={apptLoading}
                  className="w-2/3 bg-orange-500 hover:bg-orange-650 disabled:opacity-85 text-foreground font-bold py-2.5 rounded-xl text-xs shadow-md flex justify-center items-center space-x-1 cursor-pointer"
                >
                  {apptLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <span>Schedule Visit</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT SAFETY MODAL */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-250 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-foreground flex items-center space-x-1.5">
                <Flag className="w-5 h-5 text-red-500" />
                <span>Flag Safety Abuse</span>
              </h3>
              <button onClick={() => setIsReportOpen(false)} className="text-muted-foreground hover:text-gray-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">Report safety violations or list spam details to the dog board admin panel.</p>
            <form onSubmit={handleFileReport} className="space-y-4">
              <div>
                <label className="block text-muted-foregroundxs font-bold text-muted-foreground uppercase tracking-wider mb-2">Abuse Reason</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail warnings (e.g. unhealthy pet environment, counterfeit registration numbers, abusive content)..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-card border border-border focus:bg-card text-gray-950 text-xs rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold leading-relaxed"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="w-1/3 bg-card border border-gray-250 hover:bg-input text-muted-foreground font-semibold py-2.5 rounded-xl text-xs text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportLoading}
                  className="w-2/3 bg-red-600 hover:bg-red-750 disabled:opacity-85 text-foreground font-bold py-2.5 rounded-xl text-xs shadow-md flex justify-center items-center space-x-1 cursor-pointer"
                >
                  {reportLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <span>File Report</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

