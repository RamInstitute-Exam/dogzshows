'use client';

import { useAuthModalStore } from '@/store/useAuthModalStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function ForgotPasswordForm() {
  const { setView } = useAuthModalStore();
  const [isSent, setIsSent] = useState(false);

  return (
    <div className="p-8">
      <button 
        onClick={() => setView('LOGIN')}
        className="absolute top-6 left-6 p-2 text-muted-foreground hover:bg-input hover:text-foreground rounded-full transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="text-center mb-8 mt-2">
        <h2 className="text-2xl font-extrabold text-foreground">Reset Password</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-[260px] mx-auto">
          {isSent ? "We've sent a 6-digit OTP to your email." : "Enter your email or mobile to receive a password reset link."}
        </p>
      </div>

      {!isSent ? (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsSent(true); }}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email or Mobile</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input required type="text" placeholder="you@example.com" className="pl-10 rounded-xl bg-card h-12" />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl bg-card hover:bg-accent text-foreground font-bold text-base mt-2">
            Send Reset OTP
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setView('LOGIN'); }}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Enter OTP</label>
            <Input required type="text" placeholder="• • • • • •" className="text-center tracking-[1em] font-bold rounded-xl bg-card h-12" />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl bg-brand-orange hover:bg-orange-600 text-foreground font-bold text-base mt-2 shadow-lg shadow-orange-500/20">
            Verify & Reset
          </Button>
          
          <p className="text-center text-xs font-bold text-muted-foreground mt-4 cursor-pointer hover:text-brand-orange">
            Resend OTP
          </p>
        </form>
      )}
    </div>
  );
}
