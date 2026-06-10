'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import api, { getImageUrl } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Dog as DogIcon,
  MessageSquare,
  CalendarRange,
  CreditCard,
  Award,
  Sparkles,
  Info,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Building,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DogProfile {
  id: string;
  name: string;
  breed: string;
  age: number;
  description: string;
  images: { id: string; url: string }[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  // Dashboard Stats
  const [apptCount, setApptCount] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);
  const [subType, setSubType] = useState('FREE');

  // Breeder Registration Modal
  const [isBreederModalOpen, setIsBreederModalOpen] = useState(false);
  const [isBreeder, setIsBreeder] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [breederLoading, setBreederLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dogs
      const response = await api.get('/dogs/me');
      setDogs(response.data || []);

      // Fetch appointments
      const apptRes = await api.get('/appointments');
      setApptCount((apptRes.data || []).filter((a: any) => a.status === 'PENDING').length);

      // Fetch chats
      const chatsRes = await api.get('/messages/chats');
      setUnreadChats(
        (chatsRes.data || []).filter(
          (c: any) => !c.lastMessage.read && c.lastMessage.senderId !== user?.userId
        ).length
      );

      // Fetch breeder profile status
      try {
        const breederRes = await api.get('/breeders/me');
        if (breederRes.data) {
          setIsBreeder(true);
          setIsVerified(breederRes.data.verified);
          setCompanyName(breederRes.data.companyName);
          setLicenseNo(breederRes.data.licenseNo || '');
          setAddress(breederRes.data.address || '');
          setPhone(breederRes.data.phone || '');
          setWebsite(breederRes.data.website || '');
        }
      } catch (e) {
        // No breeder profile registered
      }

      // Fetch user sub plan
      const userRes = await api.get('/admin/users');
      const self = userRes.data.find((u: any) => u.id === user?.userId);
      if (self) {
        setSubType(self.subscriptionType || 'FREE');
      }
    } catch (error) {
      console.error('Failed to fetch user dogs', error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessNotification = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/dogs/${id}`);
      setDogs(dogs.filter((dog) => dog.id !== id));
      showSuccessNotification('Dog profile removed successfully');
    } catch (error) {
      console.error('Failed to delete dog profile', error);
      alert('Failed to delete the profile. Please try again.');
    }
  };

  const handleRegisterBreeder = async (e: React.FormEvent) => {
    e.preventDefault();
    setBreederLoading(true);
    try {
      const res = await api.post('/breeders', {
        companyName,
        licenseNo,
        address,
        phone,
        website,
      });
      setIsBreeder(true);
      setIsVerified(res.data.profile.verified);
      setIsBreederModalOpen(false);
      showSuccessNotification('Breeder profile submitted for verification!');
    } catch (error) {
      console.error('Breeder submission failed:', error);
      alert('Failed to save breeder information.');
    } finally {
      setBreederLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-screen">
        
        {/* Success Alert */}
        {success && (
          <div className="fixed bottom-6 right-6 z-50 bg-green-950 text-green-200 border border-green-800 p-4 rounded-xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="font-semibold text-xs">{success}</span>
          </div>
        )}

        {/* Dashboard Title & Top Nav tabs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-gray-200/60 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
              <Activity className="h-7 w-7 text-indigo-650 text-indigo-600" />
              <span>SaaS Breeder Center</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Manage listings, check inquiries, consult billing settings, and view calendar appointments.
            </p>
          </div>
          
          <div className="flex space-x-3 flex-wrap gap-2">
            <button
              onClick={() => setIsBreederModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-3xs"
            >
              <Building className="w-4 h-4 text-gray-500" />
              <span>{isBreeder ? 'Breeder details' : 'Register Breeder'}</span>
            </button>
            <Link
              href="/dashboard/create"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Listing</span>
            </Link>
          </div>
        </div>

        {/* TOP QUICK NAVIGATION TABS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/dashboard"
            className="bg-indigo-50/80 border border-indigo-150 border-indigo-200 p-4.5 p-4 rounded-2xl flex flex-col justify-between hover:shadow-xs transition-shadow"
          >
            <DogIcon className="w-5 h-5 text-indigo-600" />
            <div className="mt-4">
              <span className="text-4xs font-bold text-indigo-600 uppercase tracking-wider block">My Listings</span>
              <span className="text-2xl font-extrabold text-indigo-900 mt-1">{dogs.length} dogs</span>
            </div>
          </Link>

          <Link
            href="/dashboard/inbox"
            className="bg-white border border-gray-200/60 p-4.5 p-4 rounded-2xl flex flex-col justify-between hover:shadow-xs transition-shadow"
          >
            <div className="flex justify-between items-center w-full">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              {unreadChats > 0 && (
                <span className="bg-rose-500 text-white text-4xs font-extrabold px-2 py-0.5 rounded-full">
                  {unreadChats} new
                </span>
              )}
            </div>
            <div className="mt-4">
              <span className="text-4xs font-bold text-gray-400 uppercase tracking-wider block">Inbox Messages</span>
              <span className="text-2xl font-extrabold text-gray-800 mt-1">Open Chat</span>
            </div>
          </Link>

          <Link
            href="/dashboard/appointments"
            className="bg-white border border-gray-200/60 p-4.5 p-4 rounded-2xl flex flex-col justify-between hover:shadow-xs transition-shadow"
          >
            <div className="flex justify-between items-center w-full">
              <CalendarRange className="w-5 h-5 text-gray-500" />
              {apptCount > 0 && (
                <span className="bg-amber-500 text-white text-4xs font-extrabold px-2 py-0.5 rounded-full">
                  {apptCount} pending
                </span>
              )}
            </div>
            <div className="mt-4">
              <span className="text-4xs font-bold text-gray-400 uppercase tracking-wider block">Consultation Slots</span>
              <span className="text-2xl font-extrabold text-gray-800 mt-1">Calendar</span>
            </div>
          </Link>

          <Link
            href="/dashboard/billing"
            className="bg-white border border-gray-200/60 p-4.5 p-4 rounded-2xl flex flex-col justify-between hover:shadow-xs transition-shadow"
          >
            <CreditCard className="w-5 h-5 text-gray-500" />
            <div className="mt-4">
              <span className="text-4xs font-bold text-gray-400 uppercase tracking-wider block">Subscription billing</span>
              <span className="text-2xl font-extrabold text-gray-800 mt-1 uppercase">{subType} Plan</span>
            </div>
          </Link>
        </div>

        {/* BREEDER VERIFICATION BANNER */}
        {isBreeder && !isVerified && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs font-semibold mb-8 flex items-center space-x-2">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>Your Breeder Account is pending admin document verification. Some listings might not showcase a verification badge until approved.</span>
          </div>
        )}

        {/* ACTIVE DOG LISTINGS CONTAINER */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : dogs.length === 0 ? (
          <div className="text-center bg-white py-24 px-4 rounded-3xl border border-gray-200/60 shadow-sm flex flex-col items-center">
            <DogIcon className="h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No companions listed</h3>
            <p className="text-gray-500 text-xs mt-1 max-w-sm mb-6">List your dog profiles with ages, pedigree papers, and health check checkmarks to reach homes.</p>
            <Link
              href="/dashboard/create"
              className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors cursor-pointer"
            >
              <span>Add Companion</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog) => (
              <div key={dog.id} className="bg-white rounded-3xl border border-gray-200/65 shadow-xs overflow-hidden flex flex-col group h-full justify-between hover:shadow-md transition-all">
                <div>
                  <div className="aspect-w-3 aspect-h-2 bg-gray-50 relative h-48">
                    {dog.images && dog.images.length > 0 ? (
                      <img
                        src={getImageUrl(dog.images[0].url)}
                        alt={dog.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-indigo-50 text-indigo-300">
                        <DogIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-base font-bold text-gray-900 truncate pr-2">{dog.name}</h3>
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-2xs font-semibold text-indigo-700 border border-indigo-100">
                        {dog.breed}
                      </span>
                    </div>
                    <span className="text-3xs text-gray-400 font-bold block mt-1">{dog.age} years old</span>
                    <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {dog.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3 text-xs font-bold">
                    <button
                      onClick={() => router.push(`/dashboard/edit/${dog.id}`)}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(dog.id)}
                      className="inline-flex items-center text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BREEDER DETAILS REGISTRATION MODAL */}
      {isBreederModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-100 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-1 border-b border-gray-50">
              <div className="flex items-center space-x-2">
                <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
                  <Building className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-905 text-gray-900">Breeder Profile Registry</h3>
              </div>
              <button
                onClick={() => setIsBreederModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterBreeder} className="space-y-4">
              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Company/Breeder Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Royal Golden Retrievers Kennel"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-950 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">License ID</label>
                  <input
                    type="text"
                    placeholder="E.g. LIC-4929"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-950 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-955 text-gray-950 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Business Address</label>
                <input
                  type="text"
                  placeholder="Address details, city..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-950 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Website URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-950 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsBreederModalOpen(false)}
                  className="w-1/3 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-xs text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={breederLoading}
                  className="w-2/3 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-85 text-white font-bold py-2.5 rounded-xl text-xs shadow-md flex justify-center items-center space-x-1 cursor-pointer"
                >
                  {breederLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <span>Submit Profile</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
