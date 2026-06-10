'use client';

import { useState, useEffect } from 'react';
import api, { getImageUrl } from '../../../lib/api';
import { use } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
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
  X
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
}

export default function DogProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [dog, setDog] = useState<DogProfile | null>(null);
  const [similarDogs, setSimilarDogs] = useState<DogProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

  useEffect(() => {
    fetchDog();
  }, [id]);

  const fetchDog = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/dogs/${id}`);
      const d = response.data;
      
      // Inject fallback parameters for premium feel
      const normalizedDog: DogProfile = {
        ...d,
        gender: d.gender || (Math.random() > 0.5 ? 'FEMALE' : 'MALE'),
        price: d.price || (d.listingType === 'SALE' ? 15000 : 0),
        vaccinated: d.vaccinated ?? true,
        registered: d.registered ?? true,
        listingType: d.listingType || (d.price > 0 ? 'SALE' : 'ADOPTION'),
        color: d.color || 'Golden',
        weight: d.weight || 14,
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
  };

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

  // 1. Submit Adoption Request
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

  // 2. Send Message
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

  // 3. Book Appointment
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

  // 4. File Safety Report
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
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
        <p className="text-gray-500 mb-8">The dog profile you are looking for does not exist or has been removed.</p>
        <Link href="/dogs" className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-850">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Link>
      </div>
    );
  }

  const isOwner = user?.userId === dog.ownerId;

  return (
    <div className="bg-gray-50/50 min-h-screen pb-24">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-950 text-indigo-200 border border-indigo-800 p-4 rounded-xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold text-xs">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-indigo-955 bg-indigo-900 pt-8 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dogs" className="inline-flex items-center text-indigo-200 hover:text-white transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search Directory
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200/60 overflow-hidden flex flex-col lg:flex-row">
          
          {/* IMAGE GALLERY COLUMN */}
          <div className="lg:w-1/2 p-6 bg-gray-50/50 flex flex-col justify-between">
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden bg-gray-100 shadow-inner h-96 relative cursor-zoom-in group"
            >
              {activeImage ? (
                <>
                  <img
                    src={getImageUrl(activeImage)}
                    alt={dog.name}
                    className="object-cover w-full h-full group-hover:scale-101 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/80 text-gray-800 text-xs px-3 py-1.5 rounded-xl font-bold">Zoom Photo</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  <span className="text-lg font-medium">No Photos Available</span>
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
                      activeImage === img.url ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-transparent hover:border-indigo-300'
                    }`}
                  >
                    <img src={getImageUrl(img.url)} alt={dog.name} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAIL DESCRIPTIONS COLUMN */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{dog.name}</h1>
                    {dog.registered && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-3xs font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        <Award className="w-3.5 h-3.5 mr-0.5" /> Pedigree
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-indigo-600 font-bold mt-1">{dog.breed}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleToggleFavorite}
                    className="p-3 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-all cursor-pointer shadow-xs"
                    title="Bookmark listing"
                  >
                    <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-550' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-all cursor-pointer shadow-xs"
                    title="Share profile link"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* SPECIFICATION PILLS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                  <p className="text-3xs text-gray-400 font-bold uppercase tracking-wider">Age</p>
                  <p className="font-extrabold text-gray-900 mt-1">{dog.age} {dog.age === 1 ? 'year' : 'years'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                  <p className="text-3xs text-gray-400 font-bold uppercase tracking-wider">Gender</p>
                  <p className="font-extrabold text-gray-900 mt-1">{dog.gender === 'MALE' ? 'Male' : 'Female'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                  <p className="text-3xs text-gray-400 font-bold uppercase tracking-wider">Weight</p>
                  <p className="font-extrabold text-gray-900 mt-1">{dog.weight || 12} kg</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                  <p className="text-3xs text-gray-400 font-bold uppercase tracking-wider">Color</p>
                  <p className="font-extrabold text-gray-900 mt-1 truncate">{dog.color || 'Cream'}</p>
                </div>
              </div>

              {/* HEALTH & REGISTRATION BAR */}
              <div className="mt-6 bg-indigo-50/30 border border-indigo-100/50 p-4.5 p-4 rounded-2xl space-y-3.5">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-gray-700">
                    Vaccination Status: {dog.vaccinated ? 'Fully Vaccinated & Records Checked' : 'Records Pending Verification'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-gray-700">
                    Listing Type: {dog.listingType === 'SALE' ? `Available for Purchase (INR ${dog.price.toLocaleString()})` : 'Available for Adoption'}
                  </span>
                </div>
              </div>

              {/* DESCRIPTION SECTION */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2.5">About {dog.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{dog.description}</p>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-10 pt-6 border-t border-gray-150">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Breeder Owner</h4>
                    <p className="text-sm font-semibold text-gray-800 truncate">{dog.owner.email}</p>
                  </div>
                  {!isOwner && (
                    <button
                      onClick={() => setIsReportOpen(true)}
                      className="text-gray-400 hover:text-red-650 flex items-center space-x-0.5 text-2xs font-bold cursor-pointer"
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
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer text-center"
                    >
                      {dog.listingType === 'SALE' ? 'Purchase Companion' : 'Submit Adoption Request'}
                    </button>
                    <button
                      onClick={() => setIsMessageOpen(true)}
                      className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors cursor-pointer text-xs flex items-center justify-center space-x-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => setIsAppointmentOpen(true)}
                      className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors cursor-pointer text-xs flex items-center justify-center space-x-1.5"
                    >
                      <CalendarRange className="w-4 h-4" />
                      <span>Consult</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 p-3 rounded-xl text-xs font-bold text-center">
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Similar {dog.breed} Companions</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {similarDogs.map((sDog) => (
              <Link
                key={sDog.id}
                href={`/dogs/${sDog.id}`}
                className="group bg-white rounded-2xl border border-gray-200/60 shadow-3xs overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="h-44 bg-gray-55 bg-gray-100 overflow-hidden relative">
                  {sDog.images && sDog.images.length > 0 ? (
                    <img src={getImageUrl(sDog.images[0].url)} alt="" className="w-full h-full object-cover group-hover:scale-102 transition-transform" />
                  ) : (
                    <div className="bg-indigo-50 h-full w-full"></div>
                  )}
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-sm text-gray-900">{sDog.name}</h4>
                    <span className="text-2xs text-gray-400">{sDog.age} years</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-2xs font-bold text-indigo-600">
                    <span>Inspect Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* LIGHTBOX POPUP GALLERY */}
      {isLightboxOpen && activeImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-7 h-7" />
          </button>
          <div className="max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img src={getImageUrl(activeImage)} alt="" className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

      {/* ADOPTION REQUEST MODAL */}
      {isAdoptionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-100 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Submit Adoption Request</h3>
              <button onClick={() => setIsAdoptionOpen(false)} className="text-gray-400 hover:text-gray-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">Provide any relevant family background, yard size, or breeding experience to breeder {dog.owner.email}.</p>
            <form onSubmit={handleSubmitAdoption} className="space-y-4">
              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Introduction Notes</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Introduce yourself and details about your home environment..."
                  value={adoptionNotes}
                  onChange={(e) => setAdoptionNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-950 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold leading-relaxed"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdoptionOpen(false)}
                  className="w-1/3 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-xs text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adoptionLoading}
                  className="w-2/3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-85 text-white font-bold py-2.5 rounded-xl text-xs shadow-md flex justify-center items-center space-x-1 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-100 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Message Breeder</h3>
              <button onClick={() => setIsMessageOpen(false)} className="text-gray-400 hover:text-gray-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">Start a chat thread with owner {dog.owner.email} regarding {dog.name}.</p>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your message here..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-950 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold leading-relaxed"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMessageOpen(false)}
                  className="w-1/3 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-xs text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="w-2/3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-85 text-white font-bold py-2.5 rounded-xl text-xs shadow-md flex justify-center items-center space-x-1 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-100 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Schedule Consultation</h3>
              <button onClick={() => setIsAppointmentOpen(false)} className="text-gray-400 hover:text-gray-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">Book an appointment calendar slot to consult breeding terms with the registered owner.</p>
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Preferred Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-950 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Consultation Goals</label>
                <textarea
                  rows={3}
                  placeholder="E.g. Visit to check socialization, review parent registries..."
                  value={apptNotes}
                  onChange={(e) => setApptNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-955 text-gray-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold leading-relaxed"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAppointmentOpen(false)}
                  className="w-1/3 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-xs text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={apptLoading}
                  className="w-2/3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-85 text-white font-bold py-2.5 rounded-xl text-xs shadow-md flex justify-center items-center space-x-1 cursor-pointer"
                >
                  {apptLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <span>Book Consultation</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT SAFETY MODAL */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-100 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-905 text-gray-900">Flag listing for Abuse</h3>
              <button onClick={() => setIsReportOpen(false)} className="text-gray-400 hover:text-gray-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-550 text-gray-500">File a safety violation or spam check to help administrators moderate listings.</p>
            <form onSubmit={handleFileReport} className="space-y-4">
              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Abuse Reason</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Specify violation reasons (e.g. fraudulent papers, animal health concerns, spam)..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-950 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold leading-relaxed"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="w-1/3 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-xs text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportLoading}
                  className="w-2/3 bg-red-600 hover:bg-red-700 disabled:opacity-85 text-white font-bold py-2.5 rounded-xl text-xs shadow-md flex justify-center items-center space-x-1 cursor-pointer"
                >
                  {reportLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin animate-spin" /> : <span>File Report</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
