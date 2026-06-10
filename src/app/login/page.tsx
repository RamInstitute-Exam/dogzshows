'use client';

import { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[85vh] bg-slate-950 text-white">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-xs font-semibold">Loading secure portal...</p>
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}
