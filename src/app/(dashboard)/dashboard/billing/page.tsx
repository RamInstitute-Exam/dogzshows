'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CreditCard, Sparkles, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [currentPlan, setCurrentPlan] = useState('FREE');
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [checkingOutPlan, setCheckingOutPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    fetchSubscriptionState();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchSubscriptionState = async () => {
    try {
      const res = await api.get('/admin/users'); // admins can query user detail
      const self = res.data.find((u: any) => u.id === user?.userId);
      if (self) {
        setCurrentPlan(self.subscriptionType || 'FREE');
        setExpiryDate(self.subExpiresAt);
      }
    } catch (e) {
      // Fallback if not admin (standard auth user)
      if (user) {
        setCurrentPlan(user.role === 'ADMIN' ? 'ENTERPRISE' : 'FREE');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (plan: 'PRO' | 'ENTERPRISE') => {
    setCheckingOutPlan(plan);
    try {
      const checkoutRes = await api.post('/subscriptions/checkout', { plan });
      const { orderId, amount, currency } = checkoutRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RW6NQI0SjBZbsw',
        amount: amount,
        currency: currency,
        name: 'DogProfiles Premium',
        description: `${plan} Membership Subscription Plan`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/subscriptions/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan,
            });
            
            setSuccessMsg(`Congratulations! You upgraded to ${plan} Plan.`);
            setCurrentPlan(plan);
            
            // Sync local storage user state
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const uObj = JSON.parse(storedUser);
              uObj.subscriptionType = plan;
              localStorage.setItem('user', JSON.stringify(uObj));
            }
          } catch (err) {
            console.error(err);
            alert('Failed to verify payment signature.');
          }
        },
        prefill: {
          email: user?.email || '',
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      alert('Failed to initialize payment gateway.');
    } finally {
      setCheckingOutPlan(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-10 w-full min-h-screen">
        
        <div className="mb-10">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            <span>Premium Billing Plans</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-0.5">Upgrade Breeder listing limits, activate search spotlights, and unlock advanced lead analytics.</p>
        </div>

        {successMsg && (
          <div className="bg-indigo-950 text-indigo-200 border border-indigo-800 p-5 rounded-2xl shadow-xl flex items-center space-x-3 mb-8 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-6 h-6 text-indigo-400" />
            <div>
              <p className="font-bold text-sm">{successMsg}</p>
              <p className="text-2xs text-indigo-300 font-semibold mt-0.5">Your premium capabilities have been activated successfully.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* CURRENT SUBSCRIPTION OVERVIEW CARD */}
            <div className="bg-card p-6 rounded-3xl border border-border/60 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Account Active Tier</p>
                <div className="flex items-center space-x-2 mt-1">
                  <h3 className="text-2xl font-extrabold text-foreground">{currentPlan} Membership</h3>
                  {currentPlan !== 'FREE' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-muted-foregroundxs font-extrabold bg-green-100 text-green-800 border border-green-200">
                      <ShieldCheck className="w-3.5 h-3.5 mr-0.5" /> Active
                    </span>
                  )}
                </div>
                {expiryDate && (
                  <p className="text-xs text-muted-foreground font-semibold mt-1">Renews on: {new Date(expiryDate).toLocaleDateString()}</p>
                )}
              </div>
              <div className="text-xs font-semibold text-muted-foreground max-w-sm">
                Unlock higher search relevance, listing spotlights, and priority verification badging by provisioning premium tiers.
              </div>
            </div>

            {/* THREE COLUMN PRICING GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* PLAN 1: FREE */}
              <div className={`bg-card p-6 rounded-3xl border shadow-sm flex flex-col justify-between h-[55vh] ${
                currentPlan === 'FREE' ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-border/60'
              }`}>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Basic Starter</h4>
                  <h3 className="text-xl font-extrabold text-foreground">Free Tier</h3>
                  <div className="flex items-baseline mt-4">
                    <span className="text-muted-foregroundxl font-extrabold text-foreground tracking-tight">INR 0</span>
                    <span className="text-muted-foreground text-xs font-semibold ml-1">/month</span>
                  </div>
                  <ul className="mt-6 space-y-3.5 text-xs text-muted-foreground font-semibold">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>List up to 3 Dog Profiles</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>In-app Message chat replies</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Access Advanced filters</span>
                    </li>
                  </ul>
                </div>
                <button
                  disabled
                  className="w-full bg-card text-muted-foreground font-semibold py-3 rounded-xl border border-border text-xs text-center cursor-not-allowed mt-8"
                >
                  {currentPlan === 'FREE' ? 'Active Plan' : 'Free Entry'}
                </button>
              </div>

              {/* PLAN 2: PRO */}
              <div className={`bg-card p-6 rounded-3xl border shadow-sm flex flex-col justify-between h-[55vh] relative ${
                currentPlan === 'PRO' ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-border/60'
              }`}>
                <span className="absolute -top-3.5 left-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-foreground text-muted-foregroundxs font-extrabold px-3 py-1 rounded-full shadow-sm">
                  Recommended
                </span>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Market Breeder</h4>
                  <h3 className="text-xl font-extrabold text-foreground flex items-center space-x-1">
                    <span>Professional</span>
                    <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
                  </h3>
                  <div className="flex items-baseline mt-4">
                    <span className="text-muted-foregroundxl font-extrabold text-foreground tracking-tight">INR 499</span>
                    <span className="text-muted-foreground text-xs font-semibold ml-1">/month</span>
                  </div>
                  <ul className="mt-6 space-y-3.5 text-xs text-muted-foreground font-semibold">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>List up to 15 Dog Profiles</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Breeder Verification Badge application</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Consultation Booking Module</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Search Result Spotlight (3x visibility)</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleCheckout('PRO')}
                  disabled={currentPlan === 'PRO' || checkingOutPlan !== null}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-55 text-foreground font-bold py-3 rounded-xl transition-all shadow-md text-xs text-center cursor-pointer flex justify-center items-center mt-8"
                >
                  {checkingOutPlan === 'PRO' ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : currentPlan === 'PRO' ? (
                    'Active Plan'
                  ) : (
                    'Upgrade Pro Plan'
                  )}
                </button>
              </div>

              {/* PLAN 3: ENTERPRISE */}
              <div className={`bg-card p-6 rounded-3xl border shadow-sm flex flex-col justify-between h-[55vh] ${
                currentPlan === 'ENTERPRISE' ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-border/60'
              }`}>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Corporate Registry</h4>
                  <h3 className="text-xl font-extrabold text-foreground">Enterprise</h3>
                  <div className="flex items-baseline mt-4">
                    <span className="text-muted-foregroundxl font-extrabold text-foreground tracking-tight">INR 1,999</span>
                    <span className="text-muted-foreground text-xs font-semibold ml-1">/month</span>
                  </div>
                  <ul className="mt-6 space-y-3.5 text-xs text-muted-foreground font-semibold">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Unlimited Dog & Breeder Listings</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Dedicated Account Success Manager</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Export Reports (PDF / Excel leads)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Featured Carousel placement</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleCheckout('ENTERPRISE')}
                  disabled={currentPlan === 'ENTERPRISE' || checkingOutPlan !== null}
                  className="w-full bg-gradient-to-r from-indigo-650 to-purple-650 bg-indigo-650 text-indigo-600 border border-indigo-200 hover:bg-indigo-50 font-bold py-3 rounded-xl transition-all text-xs text-center cursor-pointer flex justify-center items-center mt-8"
                >
                  {checkingOutPlan === 'ENTERPRISE' ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : currentPlan === 'ENTERPRISE' ? (
                    'Active Plan'
                  ) : (
                    'Upgrade Enterprise Plan'
                  )}
                </button>
              </div>

            </div>

          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

