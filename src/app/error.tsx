'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-lg w-full p-8 rounded-3xl border border-border shadow-xl bg-card relative overflow-hidden">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-3">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't load this part of the application. Please try again.
        </p>
        
        <div className="flex justify-center gap-4">
          <Button onClick={() => reset()} className="bg-blue-600 hover:bg-blue-700 font-bold">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
          <Link href="/">
            <Button variant="outline" className="border-border text-foreground hover:bg-accent">
              <Home className="w-4 h-4 mr-2" /> Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
