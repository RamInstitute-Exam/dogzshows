'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight, Dog } from 'lucide-react';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { login } = useAuth();
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMsg('Account created successfully! Please sign in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, role } = response.data;
      login(token, { userId: 'unknown', email, role: role || 'USER' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setSuccessMsg('Reset password verification link has been dispatched to your email.');
  };

  return (
    <div className="flex-grow min-h-[85vh] flex items-center justify-center py-16 px-4 relative overflow-hidden bg-black">
      {/* Dynamic Back-glow shapes */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-foreground/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Glassmorphic Form Card */}
      <div className="max-w-md w-full bg-card/10 backdrop-blur-lg border border-border p-10 rounded-3xl shadow-2xl relative z-10 text-foreground">
        
        {/* Logo Badge */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-foreground rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Dog className="h-8 w-8 text-foreground" />
          </div>
          <h2 className="text-muted-foregroundxl font-extrabold tracking-tight">Welcome Back</h2>
          <p className="text-muted-foreground text-xs mt-1.5 font-semibold">Sign in to list and adopt companions</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 text-rose-400 p-4 rounded-xl text-xs font-bold border border-rose-500/20 mb-6">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl text-xs font-bold border border-emerald-500/20 mb-6">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-muted-foregroundxs font-bold uppercase tracking-wider text-muted-foreground mb-2">Email Address</label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-muted-foreground" />
              <input
                type="email"
                required
                className="w-full bg-card/5 border border-border focus:border-border rounded-xl pl-10 pr-4 py-3.5 focus:outline-none transition-all text-xs font-semibold placeholder-gray-500 focus:bg-card/10 text-foreground"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foregroundxs font-bold uppercase tracking-wider text-muted-foreground mb-2">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-muted-foreground" />
              <input
                type="password"
                required
                className="w-full bg-card/5 border border-border focus:border-border rounded-xl pl-10 pr-4 py-3.5 focus:outline-none transition-all text-xs font-semibold placeholder-gray-500 focus:bg-card/10 text-foreground"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center text-muted-foreground font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded bg-card/5 border-border text-foreground focus:ring-0 mr-2"
              />
              <span>Remember me</span>
            </label>
            <a 
              href="#" 
              onClick={handleForgotPassword}
              className="font-bold text-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent text-xs font-bold rounded-xl text-foreground bg-foreground/100 hover:bg-foreground disabled:opacity-70 transition-all shadow-lg shadow-black/20 hover:shadow-black/20/40 cursor-pointer mt-6"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Brand Dividers */}
        <div className="relative my-8 text-center text-muted-foregroundxs font-bold uppercase tracking-wider text-muted-foreground">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <span className="bg-card px-3 relative z-10">Or continue with</span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => alert('Social authentication triggers client authorization pipelines.')}
            className="flex items-center justify-center space-x-2 py-2.5 border border-border bg-card/5 rounded-xl hover:bg-card/10 transition-colors text-xs font-bold cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.76 5.76 0 0 1 8.24 12.8a5.76 5.76 0 0 1 5.751-5.73c2.4 0 4.17 1.04 4.96 1.8l3.15-3.15C20.15 3.84 17.21 2.24 14 2.24A9.76 9.76 0 0 0 4.24 12a9.76 9.76 0 0 0 9.76 9.76c5.4 0 9.76-4 9.76-9.76 0-.6-.08-1.2-.24-1.715H12.24z"/>
            </svg>
            <span>Google</span>
          </button>
          <button 
            type="button"
            onClick={() => alert('Social authentication triggers client authorization pipelines.')}
            className="flex items-center justify-center space-x-2 py-2.5 border border-border bg-card/5 rounded-xl hover:bg-card/10 transition-colors text-xs font-bold cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.63.73-1.18 1.87-1.03 2.97 1.1.09 2.22-.55 2.96-1.42z"/>
            </svg>
            <span>Apple</span>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 font-semibold">
          Don't have an account yet?{' '}
          <Link href="/register" className="font-extrabold text-foreground hover:text-foreground transition-colors">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}

