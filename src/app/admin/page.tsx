'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import api, { getImageUrl } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Trash2,
  Users,
  Dog as DogIcon,
  ShieldAlert,
  Plus,
  Search,
  Mail,
  Lock,
  Shield,
  X,
  ChevronDown,
  Check,
  Eye,
  EyeOff,
  UserPlus,
  Database,
  BarChart2,
  Award,
  Globe,
  Settings,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  subscriptionType: string;
  _count: { profiles: number };
}

interface DogData {
  id: string;
  name: string;
  breed: string;
  owner: { email: string };
  images: { url: string }[];
}

interface BreederData {
  id: string;
  companyName: string;
  licenseNo: string;
  address: string;
  phone: string;
  rating: number;
  verified: boolean;
  user: { email: string };
}

interface ReportData {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { email: string };
}

interface AnalyticsData {
  summary: {
    totalUsers: number;
    totalDogs: number;
    totalBreeders: number;
    verifiedBreeders: number;
    totalRevenue: number;
  };
  subscriptionBreakdown: {
    FREE: number;
    PRO: number;
    ENTERPRISE: number;
  };
  popularBreeds: { breed: string; count: number }[];
  userGrowth: { name: string; users: number }[];
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Tabs: analytics, users, dogs, approvals, reports, settings
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'dogs' | 'approvals' | 'reports' | 'settings'>('analytics');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Datasets
  const [users, setUsers] = useState<UserData[]>([]);
  const [dogs, setDogs] = useState<DogData[]>([]);
  const [breeders, setBreeders] = useState<BreederData[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // User Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('USER');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status Action Loading States
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [approvingBreederId, setApprovingBreederId] = useState<string | null>(null);
  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);

  // System Settings Mock Form
  const [gaTag, setGaTag] = useState('UA-1892804-1');
  const [razorpayMode, setRazorpayMode] = useState('test');
  const [s3Bucket, setS3Bucket] = useState('namma-orru-foods');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'analytics') {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'dogs') {
        const res = await api.get('/dogs');
        setDogs(res.data);
      } else if (activeTab === 'approvals') {
        const res = await api.get('/breeders');
        setBreeders(res.data || []);
      } else if (activeTab === 'reports') {
        const res = await api.get('/moderation/reports');
        setReports(res.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessNotification = (message: string) => {
    setSuccess(message);
    const timer = setTimeout(() => {
      setSuccess('');
    }, 4000);
    return () => clearTimeout(timer);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user and all their dogs? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      showSuccessNotification('User and all associated data deleted successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleDeleteDog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dog profile?')) return;
    try {
      await api.delete(`/dogs/${id}`);
      setDogs(dogs.filter(d => d.id !== id));
      showSuccessNotification('Dog profile deleted successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete dog');
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (userId === user?.userId) {
      alert('You cannot change your own role.');
      return;
    }
    setUpdatingRoleId(userId);
    setError('');
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: res.data.role } : u));
      showSuccessNotification(`Role updated to ${newRole} successfully.`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user role');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleVerifyBreeder = async (breederId: string, currentStatus: boolean) => {
    setApprovingBreederId(breederId);
    try {
      await api.patch(`/admin/breeders/${breederId}/verify`, { verified: !currentStatus });
      setBreeders(breeders.map(b => b.id === breederId ? { ...b, verified: !currentStatus } : b));
      showSuccessNotification(`Breeder verification status successfully toggled.`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update breeder verification status');
    } finally {
      setApprovingBreederId(null);
    }
  };

  const handleModerateReport = async (reportId: string, status: 'RESOLVED' | 'DISMISSED') => {
    setResolvingReportId(reportId);
    try {
      await api.patch(`/moderation/reports/${reportId}`, { status });
      setReports(reports.map(r => r.id === reportId ? { ...r, status } : r));
      showSuccessNotification(`Report successfully marked as ${status}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update report status');
    } finally {
      setResolvingReportId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      const res = await api.post('/admin/users', {
        email: newEmail,
        password: newPassword,
        role: newRole,
      });
      setUsers([res.data, ...users]);
      setIsCreateModalOpen(false);
      setNewEmail('');
      setNewPassword('');
      setNewRole('USER');
      showSuccessNotification(`Account created successfully for ${res.data.email}`);
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccessNotification('System and SEO configuration variables updated successfully');
  };

  // Live filter users
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Live filter dogs
  const filteredDogs = dogs.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-gray-50/50">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between flex-shrink-0 md:h-[calc(100vh-4rem)] md:sticky md:top-16">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 tracking-tight">SEMrush Admin</h2>
                <p className="text-xs text-gray-500 font-medium">SaaS Marketplace Portal</p>
              </div>
            </div>

            <nav className="space-y-1.5">
              <button
                onClick={() => { setActiveTab('analytics'); setSearchTerm(''); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'analytics' ? 'bg-indigo-50/80 text-indigo-600 shadow-sm border-l-4 border-indigo-600 rounded-l-none' : 'text-gray-650 hover:bg-gray-55 text-gray-600'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'users' ? 'bg-indigo-50/80 text-indigo-600 shadow-sm border-l-4 border-indigo-600 rounded-l-none' : 'text-gray-650 hover:bg-gray-55 text-gray-650 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Manage Users</span>
              </button>

              <button
                onClick={() => { setActiveTab('dogs'); setSearchTerm(''); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'dogs' ? 'bg-indigo-50/80 text-indigo-600 shadow-sm border-l-4 border-indigo-600 rounded-l-none' : 'text-gray-650 hover:bg-gray-55 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <DogIcon className="w-4 h-4" />
                <span>Moderate Listings</span>
              </button>

              <button
                onClick={() => { setActiveTab('approvals'); setSearchTerm(''); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'approvals' ? 'bg-indigo-50/80 text-indigo-600 shadow-sm border-l-4 border-indigo-600 rounded-l-none' : 'text-gray-650 hover:bg-gray-55 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Breeder Approvals</span>
              </button>

              <button
                onClick={() => { setActiveTab('reports'); setSearchTerm(''); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'reports' ? 'bg-indigo-50/80 text-indigo-600 shadow-sm border-l-4 border-indigo-600 rounded-l-none' : 'text-gray-650 hover:bg-gray-55 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Safety Moderation</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setSearchTerm(''); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'settings' ? 'bg-indigo-50/80 text-indigo-600 shadow-sm border-l-4 border-indigo-600 rounded-l-none' : 'text-gray-655 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>System Settings</span>
              </button>
            </nav>
          </div>

          <div className="hidden md:block p-6 border-t border-gray-100 bg-gray-50/40">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center shadow-sm">
                {user.email.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 mt-0.5">
                  Super Admin
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {success && (
            <div className="fixed bottom-6 right-6 z-50 bg-green-950 text-green-200 border border-green-800 p-4 rounded-xl shadow-xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
              <div className="bg-green-800 text-white rounded-full p-1">
                <Check className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs">{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium mb-6 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {activeTab === 'analytics' && 'Dashboard Overview'}
                {activeTab === 'users' && 'Users Directory'}
                {activeTab === 'dogs' && 'Pet Listings Moderation'}
                {activeTab === 'approvals' && 'Breeder Approvals'}
                {activeTab === 'reports' && 'Safety Moderation Queue'}
                {activeTab === 'settings' && 'System Parameters Settings'}
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                {activeTab === 'analytics' && 'Monitor registrations, Breeder growth, active listings, and subscription revenue.'}
                {activeTab === 'users' && 'Edit user accounts, update RBAC authorization levels, and search user database.'}
                {activeTab === 'dogs' && 'Moderate public listing profiles, inspect breed categories, and remove listings.'}
                {activeTab === 'approvals' && 'Inspect breeder license documents and toggle verified badges.'}
                {activeTab === 'reports' && 'Resolve user abuse complaints, dismiss spam flags, and suspend violators.'}
                {activeTab === 'settings' && 'Configure Google Analytics tags, Razorpay key sets, and S3 media storage.'}
              </p>
            </div>

            {activeTab === 'users' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-150/80 shadow-sm flex justify-center items-center py-32">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <span className="text-sm font-semibold text-gray-500">Retrieving system database logs...</span>
              </div>
            </div>
          ) : (
            <>
              {/* 1. ANALYTICS OVERVIEW TAB */}
              {activeTab === 'analytics' && analytics && (
                <div className="space-y-8">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center space-x-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Users className="w-5 h-5" /></div>
                      <div>
                        <p className="text-4xs font-bold text-gray-400 uppercase tracking-wider">Total Accounts</p>
                        <h3 className="text-xl font-bold text-gray-900 mt-0.5">{analytics.summary.totalUsers}</h3>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center space-x-4">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><DogIcon className="w-5 h-5" /></div>
                      <div>
                        <p className="text-4xs font-bold text-gray-400 uppercase tracking-wider">Active Listings</p>
                        <h3 className="text-xl font-bold text-gray-900 mt-0.5">{analytics.summary.totalDogs}</h3>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center space-x-4">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Award className="w-5 h-5" /></div>
                      <div>
                        <p className="text-4xs font-bold text-gray-400 uppercase tracking-wider">Verified Breeders</p>
                        <h3 className="text-xl font-bold text-gray-900 mt-0.5">{analytics.summary.verifiedBreeders} / {analytics.summary.totalBreeders}</h3>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center space-x-4">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><DollarSign className="w-5 h-5" /></div>
                      <div>
                        <p className="text-4xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
                        <h3 className="text-xl font-bold text-gray-900 mt-0.5">INR {analytics.summary.totalRevenue.toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>

                  {/* VISUAL CHARTS ROW */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* SVG Line Chart: User Growth */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm">
                      <h3 className="font-extrabold text-sm text-gray-900 mb-6">User Registrations Growth</h3>
                      <div className="h-56 w-full flex items-end">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                          {/* Grid Lines */}
                          <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="190" x2="500" y2="190" stroke="#cbd5e1" strokeWidth="1.5" />

                          {/* Polyline Path */}
                          <polyline
                            fill="none"
                            stroke="url(#indigoGrad)"
                            strokeWidth="3.5"
                            points={analytics.userGrowth.map((g, idx) => {
                              const x = (idx / (analytics.userGrowth.length - 1)) * 500;
                              // Scale y relative to total users
                              const y = 190 - (g.users / Math.max(1, analytics.summary.totalUsers)) * 140;
                              return `${x},${y}`;
                            }).join(' ')}
                          />

                          {/* Gradients */}
                          <defs>
                            <linearGradient id="indigoGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#4f46e5" />
                              <stop offset="100%" stopColor="#c084fc" />
                            </linearGradient>
                          </defs>

                          {/* Labels */}
                          {analytics.userGrowth.map((g, idx) => {
                            const x = (idx / (analytics.userGrowth.length - 1)) * 480 + 10;
                            return (
                              <text key={idx} x={x} y="198" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">
                                {g.name}
                              </text>
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                    {/* Custom Progress Leaderboard: Popular Breeds */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm space-y-6">
                      <h3 className="font-extrabold text-sm text-gray-900">Breed Search Registries</h3>
                      
                      <div className="space-y-4">
                        {analytics.popularBreeds.map((breed, idx) => {
                          const maxCount = Math.max(1, analytics.popularBreeds[0]?.count || 1);
                          const percentage = (breed.count / maxCount) * 100;
                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-gray-800">{breed.breed}</span>
                                <span className="text-indigo-600">{breed.count} listed</span>
                              </div>
                              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                        {analytics.popularBreeds.length === 0 && (
                          <p className="text-xs text-gray-400 text-center py-10">No breed data listed yet.</p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* 2. MANAGE USERS TABLE */}
              {activeTab === 'users' && (
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                  
                  {/* Search users */}
                  <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex items-center space-x-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filter users directory by email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent border-none text-xs focus:outline-none text-gray-900"
                    />
                  </div>

                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Account</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Access Role</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredUsers.map((u) => {
                        const isSelf = u.id === user.userId;
                        return (
                          <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2.5">
                                <div className="h-8 w-8 rounded-full bg-indigo-55 bg-indigo-100 text-indigo-750 text-indigo-700 font-extrabold flex items-center justify-center text-xs">
                                  {u.email.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-xs font-bold text-gray-900">{u.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="relative inline-flex items-center">
                                <select
                                  value={u.role}
                                  disabled={isSelf || updatingRoleId === u.id}
                                  onChange={(e) => handleRoleChange(u.id, u.role, e.target.value)}
                                  className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs rounded-xl pl-3 pr-8 py-1.5 font-semibold cursor-pointer focus:outline-none"
                                >
                                  <option value="USER">Standard User</option>
                                  <option value="ADMIN">Administrator</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 pointer-events-none" />
                                {updatingRoleId === u.id && (
                                  <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin ml-1" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold border ${
                                u.subscriptionType === 'FREE' ? 'bg-gray-55 bg-gray-50 text-gray-600 border-gray-200' : 'bg-green-50 text-green-700 border-green-200'
                              }`}>
                                {u.subscriptionType || 'FREE'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                              {!isSelf && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-gray-400 hover:text-red-650 p-2 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 3. MODERATE PET LISTINGS */}
              {activeTab === 'dogs' && (
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                  
                  {/* Search dogs */}
                  <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex items-center space-x-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filter listings by name or breed..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent border-none text-xs focus:outline-none text-gray-900"
                    />
                  </div>

                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dog Details</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Breed</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered Owner</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredDogs.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="h-9 w-9 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
                                {d.images && d.images.length > 0 ? (
                                  <img className="h-full w-full object-cover" src={getImageUrl(d.images[0].url)} alt="" />
                                ) : (
                                  <DogIcon className="w-5 h-5 text-gray-300" />
                                )}
                              </div>
                              <span className="text-xs font-bold text-gray-900">{d.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-700">{d.breed}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-505 text-gray-500">{d.owner?.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                            <button
                              onClick={() => handleDeleteDog(d.id)}
                              className="text-gray-400 hover:text-red-650 p-2 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 4. BREEDER VERIFICATION QUEUE */}
              {activeTab === 'approvals' && (
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Breeder / Company</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">License ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification State</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Phone</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Approvals</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {breeders.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-xs font-bold text-gray-900">{b.companyName}</p>
                              <p className="text-4xs text-gray-400 font-semibold mt-0.5">Owner: {b.user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-700">{b.licenseNo || 'Pending'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold border ${
                              b.verified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {b.verified ? 'Verified Badge' : 'Pending Documents'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-505 text-gray-550 text-gray-500">{b.phone || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                            <button
                              disabled={approvingBreederId === b.id}
                              onClick={() => handleVerifyBreeder(b.id, b.verified)}
                              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-2xs cursor-pointer shadow-3xs border ${
                                b.verified
                                  ? 'bg-white text-red-600 border-red-100 hover:bg-red-50'
                                  : 'bg-indigo-650 bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700'
                              }`}
                            >
                              {approvingBreederId === b.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : b.verified ? (
                                'Revoke Verification'
                              ) : (
                                'Verify Breeder License'
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {breeders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-semibold">No breeder records registered.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 5. SAFETY MODERATION REPORTS */}
              {activeTab === 'reports' && (
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Details</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason / Allegation</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reporter</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-550 text-gray-500">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {reports.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-xs font-bold text-gray-900">{r.targetType}: {r.targetId.substring(0, 8)}...</p>
                              <p className="text-4xs text-gray-400 font-semibold mt-0.5">Date: {new Date(r.createdAt).toLocaleDateString()}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-gray-600 max-w-sm truncate">"{r.reason}"</td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-500">{r.reporter.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold border ${
                              r.status === 'RESOLVED'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : r.status === 'DISMISSED'
                                ? 'bg-gray-50 text-gray-600 border-gray-200'
                                : 'bg-red-50 text-red-750 text-red-700 border-red-150'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold">
                            {r.status === 'PENDING' && (
                              <div className="flex justify-end space-x-2">
                                <button
                                  disabled={resolvingReportId === r.id}
                                  onClick={() => handleModerateReport(r.id, 'RESOLVED')}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-xl border border-indigo-500 text-2xs cursor-pointer shadow-3xs"
                                >
                                  Resolve
                                </button>
                                <button
                                  disabled={resolvingReportId === r.id}
                                  onClick={() => handleModerateReport(r.id, 'DISMISSED')}
                                  className="bg-white border border-gray-200 text-gray-750 hover:bg-gray-50 px-2.5 py-1.5 rounded-xl text-2xs cursor-pointer"
                                >
                                  Dismiss
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {reports.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-semibold">Safety queue is clean. No safety reports.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 6. CONFIGURATION SETTINGS PANEL */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-3xl border border-gray-200/60 p-6 md:p-8 max-w-xl shadow-xs">
                  <h3 className="font-extrabold text-sm text-gray-900 mb-6 flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-indigo-650 text-indigo-600" />
                    <span>Global SEO & Payment Integrations</span>
                  </h3>

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div>
                      <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Google Analytics ID</label>
                      <input
                        type="text"
                        value={gaTag}
                        onChange={(e) => setGaTag(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Razorpay Checkout Mode</label>
                      <select
                        value={razorpayMode}
                        onChange={(e) => setRazorpayMode(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-905 text-gray-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
                      >
                        <option value="test">Sandbox (rzp_test_RW6NQI...)</option>
                        <option value="live">Live Production Node Mode</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">AWS S3 Media Storage Bucket</label>
                      <input
                        type="text"
                        value={s3Bucket}
                        onChange={(e) => setS3Bucket(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-905 text-gray-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
                      />
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
                      >
                        Save Configurations
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* CREATE USER MODAL DIALOG */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-100 flex flex-col space-y-6 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-605 text-indigo-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Create New Account</h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateError('');
                }}
                className="text-gray-400 hover:text-gray-650 p-1 hover:bg-gray-55 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Error */}
            {createError && (
              <div className="bg-red-50 border border-red-100 text-red-650 text-red-600 p-3.5 rounded-xl text-sm font-medium flex items-center space-x-2">
                <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-950 text-gray-900 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Account Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-gray-950 text-gray-900 text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-655 absolute right-3.5 p-0.5 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Authorization Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewRole('USER')}
                    className={`p-3.5 rounded-xl border text-sm font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                      newRole === 'USER'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-xs'
                        : 'border-gray-200 hover:bg-gray-55 text-gray-600'
                    }`}
                  >
                    <Users className="w-4.5 h-4.5" />
                    <span>Standard User</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole('ADMIN')}
                    className={`p-3.5 rounded-xl border text-sm font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                      newRole === 'ADMIN'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-750 shadow-xs'
                        : 'border-gray-200 hover:bg-gray-55 text-gray-600'
                    }`}
                  >
                    <Shield className="w-4.5 h-4.5" />
                    <span>System Admin</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setCreateError('');
                  }}
                  className="w-1/3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl transition-all border border-gray-200 text-sm text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-2/3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-75 text-white font-bold py-3 rounded-xl transition-all shadow-md flex justify-center items-center space-x-2 text-sm cursor-pointer"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create User</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
