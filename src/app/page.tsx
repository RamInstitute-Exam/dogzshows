'use client';

import { useState, useEffect } from 'react';
import api, { getImageUrl } from '../lib/api';
import {
  Search,
  Loader2,
  Heart,
  ChevronRight,
  ShieldCheck,
  Award,
  Users,
  Compass,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Inbox
} from 'lucide-react';
import Link from 'next/link';

interface DogProfile {
  id: string;
  name: string;
  breed: string;
  age: number;
  description: string;
  images: { id: string; url: string }[];
  price?: number;
  listingType?: string;
  vaccinated?: boolean;
}

interface BreederData {
  id: string;
  companyName: string;
  address: string;
  rating: number;
  verified: boolean;
  user: { email: string; createdAt: string };
}

export default function HomePage() {
  const [featuredDogs, setFeaturedDogs] = useState<DogProfile[]>([]);
  const [recentDogs, setRecentDogs] = useState<DogProfile[]>([]);
  const [breeders, setBreeders] = useState<BreederData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailSub, setEmailSub] = useState('');
  const [subStatus, setSubStatus] = useState('');

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      // Fetch dogs
      const dogsRes = await api.get('/dogs');
      const allDogs = dogsRes.data || [];
      // Take first 4 as featured
      setFeaturedDogs(allDogs.slice(0, 4));
      // Take next 4 as recently added
      setRecentDogs(allDogs.slice(4, 8));

      // Fetch breeders
      const breedersRes = await api.get('/breeders');
      setBreeders((breedersRes.data || []).slice(0, 3));
    } catch (error) {
      console.error('Failed to load homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSub) return;
    setSubStatus('subscribing');
    setTimeout(() => {
      setSubStatus('success');
      setEmailSub('');
      setTimeout(() => setSubStatus(''), 4000);
    }, 1500);
  };

  // Popular Breeds Static Data
  const popularBreeds = [
    { name: 'Golden Retriever', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=300', count: '142 listed' },
    { name: 'German Shepherd', image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=300', count: '98 listed' },
    { name: 'Siberian Husky', image: 'https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&q=80&w=300', count: '73 listed' },
    { name: 'French Bulldog', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=300', count: '115 listed' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      
      {/* 1. HERO SECTION WITH IMAGE BACKGROUND & SMART SEARCH OVERLAY */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-950 text-white overflow-hidden py-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center mix-blend-overlay opacity-25"></div>
        
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-400/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-300 tracking-wide mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Verified Breeders & Purebred Registries</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-none max-w-4xl">
            Find Your Next Perfect <span className="bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent">Companion</span>
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl font-medium leading-relaxed">
            The premium directory platform connecting responsible pet owners with certified ethical breeders and loving rescue dogs.
          </p>

          {/* Smart Search Bar */}
          <div className="mt-10 w-full max-w-2xl bg-white/95 backdrop-blur-md p-2 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-white/20">
            <div className="flex items-center w-full px-4 py-2">
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                className="w-full bg-transparent border-none text-gray-900 ml-2 focus:outline-none text-sm placeholder-gray-500 font-medium"
                placeholder="Search dog breeds, names, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.location.href = `/dogs?search=${searchQuery}`;
                  }
                }}
              />
            </div>
            <Link
              href={`/dogs?search=${searchQuery}`}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3.5 rounded-xl sm:rounded-full shadow-lg transition-all text-center flex items-center justify-center space-x-2"
            >
              <span>Explore Listings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS COUNTERS GRID */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-indigo-600 tracking-tight">12,400+</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-wider mt-1.5">Registered Users</p>
          </div>
          <div className="border-l border-gray-100">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-indigo-600 tracking-tight">4,800+</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-wider mt-1.5">Listed Dogs</p>
          </div>
          <div className="border-l border-gray-100">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-indigo-600 tracking-tight">320+</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-wider mt-1.5">Verified Breeders</p>
          </div>
          <div className="border-l border-gray-100">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-indigo-600 tracking-tight">3,100+</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-wider mt-1.5">Happy Homes</p>
          </div>
        </div>
      </section>

      {/* 3. POPULAR BREEDS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Popular Breeds</h2>
          <p className="text-gray-500 text-sm font-semibold mt-2">Explore active listings across our most frequently sought breeds.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {popularBreeds.map((breed, index) => (
            <Link
              key={index}
              href={`/dogs?breed=${breed.name}`}
              className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer h-48 hover:-translate-y-1 duration-200"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent z-10 opacity-70"></div>
              <img
                src={breed.image}
                alt={breed.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-4 left-4 z-20 text-white">
                <h4 className="font-bold text-base tracking-tight">{breed.name}</h4>
                <p className="text-xs text-indigo-200 font-semibold mt-0.5">{breed.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. DYNAMIC FEATURED DOGS SECTION */}
      <section className="bg-indigo-50/30 border-y border-indigo-100/50 py-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
                <Sparkles className="w-7 h-7 text-indigo-600 fill-indigo-100" />
                <span>Featured Companions</span>
              </h2>
              <p className="text-gray-500 text-sm font-semibold mt-1">Stunning profiles selected for safety, health registration, and background verification.</p>
            </div>
            <Link href="/dogs" className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center space-x-1 transition-all">
              <span>View All Listings</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-3" />
              <p className="text-gray-500 font-medium">Looking for active profiles...</p>
            </div>
          ) : featuredDogs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-150 shadow-sm">
              <Compass className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">No active listings</h3>
              <p className="text-gray-500 text-sm mt-1">Be the first to list a dog profile on the directory!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredDogs.map((dog) => (
                <Link
                  key={dog.id}
                  href={`/dogs/${dog.id}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200/60 overflow-hidden flex flex-col h-full hover:-translate-y-1"
                >
                  <div className="aspect-w-4 aspect-h-3 bg-gray-100 relative overflow-hidden h-52">
                    {dog.images && dog.images.length > 0 ? (
                      <img
                        src={getImageUrl(dog.images[0].url)}
                        alt={dog.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-indigo-50 text-indigo-200">
                        <span className="font-semibold text-sm">No Photo</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-900 text-2xs font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                      {dog.age} {dog.age === 1 ? 'Year' : 'Years'}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-bold text-gray-900 truncate pr-2 group-hover:text-indigo-600 transition-colors">
                        {dog.name}
                      </h3>
                      <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2 py-0.5 text-2xs font-semibold text-indigo-700 border border-indigo-100">
                        {dog.breed}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs line-clamp-2 mt-2 leading-relaxed flex-grow">
                      {dog.description}
                    </p>
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-550 text-gray-500">
                        {dog.listingType === 'SALE' ? `INR ${dog.price || 'Ask'}` : 'Adoption'}
                      </span>
                      <span className="text-indigo-600 group-hover:underline flex items-center space-x-0.5">
                        <span>Profile</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. VERIFIED BREEDERS ROW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
              <Award className="w-7 h-7 text-indigo-600" />
              <span>Verified Breeders</span>
            </h2>
            <p className="text-gray-500 text-sm font-semibold mt-1">Connect with professional breeders adhering to safety, vaccination, and license guidelines.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : breeders.length === 0 ? (
          <div className="text-center py-10 bg-white border border-gray-100 rounded-3xl">
            <Users className="mx-auto h-10 w-10 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm font-medium">No verified breeder accounts registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {breeders.map((breeder) => (
              <div
                key={breeder.id}
                className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-extrabold bg-green-50 text-green-700 border border-green-100">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      Verified License
                    </span>
                    <div className="flex items-center space-x-1 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span className="text-sm font-bold text-gray-800">{breeder.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <h3 className="font-extrabold text-lg text-gray-900 tracking-tight">{breeder.companyName}</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Owner: {breeder.user.email}</p>
                  <p className="text-xs text-gray-600 mt-3 line-clamp-2">{breeder.address || 'Address unlisted'}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-2xs text-gray-400 font-medium">
                    Registered: {breeder.user.createdAt ? new Date(breeder.user.createdAt).toLocaleDateString() : 'Pending'}
                  </span>
                  <Link
                    href={`/dogs?breeder=${breeder.companyName}`}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center space-x-0.5"
                  >
                    <span>View Listings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. SUCCESS STORIES & TESTIMONIALS */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white py-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Success Stories</h2>
            <p className="text-indigo-200 text-sm font-medium mt-2">Hear from families who found their perfect companions and breeders who use our SaaS panel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-md p-6.5 p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <p className="text-sm text-gray-200 italic leading-relaxed">
                "Adopting Max changed our lives! The verification process made us trust the breeder immediately. We scheduled a booking consultation through the calendar module and everything went perfectly."
              </p>
              <div className="mt-6 flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-500/30">SK</div>
                <div>
                  <h4 className="text-sm font-bold text-white">Sarah K.</h4>
                  <p className="text-2xs text-indigo-300 font-semibold">Golden Retriever Owner</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-6.5 p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <p className="text-sm text-gray-200 italic leading-relaxed">
                "As a licensed breeder, DogProfiles has helped me connect with truly dedicated families. The SaaS panel dashboard makes it simple to review leads, verify credentials, and manage bookings."
              </p>
              <div className="mt-6 flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-500/30">DL</div>
                <div>
                  <h4 className="text-sm font-bold text-white">David L.</h4>
                  <p className="text-2xs text-indigo-300 font-semibold">Siberian Husky Breeder</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-6.5 p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <p className="text-sm text-gray-200 italic leading-relaxed">
                "The advanced filters made it so easy to search for a pug that fits well in our small apartment. We filtered by vaccine status, weight, and pedigree. Outstanding user experience!"
              </p>
              <div className="mt-6 flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-500/30">ER</div>
                <div>
                  <h4 className="text-sm font-bold text-white">Emily R.</h4>
                  <p className="text-2xs text-indigo-300 font-semibold">Pug Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. NEWSLETTER SUBSCRIPTION */}
      <section className="bg-white py-20 border-b border-gray-100 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl mb-4">
            <Inbox className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Stay Updated on Breeders</h2>
          <p className="text-gray-500 text-sm font-semibold max-w-md mt-2">Get notified when certified breeders add new litters or rescue dogs near your area.</p>

          <form onSubmit={handleSubscribe} className="mt-8 w-full max-w-md flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              value={emailSub}
              onChange={(e) => setEmailSub(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
            />
            <button
              type="submit"
              disabled={subStatus === 'subscribing'}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-80 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md flex-shrink-0 cursor-pointer"
            >
              {subStatus === 'subscribing' ? 'Joining...' : subStatus === 'success' ? 'Joined! ✓' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
