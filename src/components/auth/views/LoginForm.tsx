'use client';

import { useState } from 'react';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import api from '@/lib/api';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function LoginForm() {
  const { setView, closeModal } = useAuthModalStore();
  const { login } = useAuthStore();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });

      if (res.tokens?.accessToken) {
        login(res.user, res.tokens.accessToken);
        toast.success('Welcome back!');
        closeModal();

        // Redirect based on role
        if (res.user.roles?.includes('Super Admin') || res.user.roles?.includes('Admin')) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast.error('Unexpected response from server.');
      }
    } catch (error: any) {
      // api.ts interceptor already toasts most errors, but we can handle specific ones if needed
      console.error('Login failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 pt-[24px]">
      <div className="flex justify-center items-center gap-4 mb-[20px]">
        <Link href="/" onClick={closeModal} className="cursor-pointer">
          <OptimizedImage
            src="/Untitled-1.png"
            alt="JUZDOG"
            className="w-[100px] md:w-[140px] h-auto object-contain animate-in fade-in duration-500"
          />
        </Link>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Welcome Back</h2>
        <p className="text-sm text-muted-foreground mt-2 px-4">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email or Mobile</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              required
              type="text"
              placeholder="you@example.com"
              className="pl-10 rounded-xl bg-card h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
            <button type="button" onClick={() => setView('FORGOT_PASSWORD')} className="text-xs font-bold text-foreground hover:text-foreground hover:underline">Forgot Password?</button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              required
              type="password"
              placeholder="••••••••"
              className="pl-10 rounded-xl bg-card h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <Button disabled={loading} type="submit" className="w-full btn-primary-luxury">
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          Sign In
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-xs font-medium text-muted-foreground uppercase">Or continue with</span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 rounded-xl border-border font-bold text-muted-foreground hover:bg-card flex items-center justify-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </Button>
        <Button variant="outline" className="h-12 rounded-xl border-border font-bold text-muted-foreground hover:bg-card flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
          Facebook
        </Button>
      </div>

      {/* <p className="text-center text-sm text-muted-foreground mt-8 font-medium">
        Don't have an account?{' '}
        <button type="button" onClick={() => setView('REGISTER')} className="text-foreground font-bold hover:underline">
          Create Account
        </button>
      </p> */}
    </div>
  );
}
