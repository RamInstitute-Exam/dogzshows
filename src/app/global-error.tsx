'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-card flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-card max-w-lg w-full p-8 rounded-3xl border border-border shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-extrabold text-foreground mb-4">Something went wrong</h1>
            
            <p className="text-muted-foreground mb-8 text-lg">
              We've encountered an unexpected system error. Our team has been notified and is looking into it.
            </p>
            
            <div className="bg-background rounded-lg p-4 mb-8 border border-border/50 text-left overflow-hidden">
              <p className="text-sm font-mono text-red-400 break-words">{error.message || 'Unknown Error'}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => reset()} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-xl"
              >
                <RefreshCw className="w-5 h-5 mr-2" /> Try Again
              </Button>
              
              <Link href="/">
                <Button variant="outline" className="border-border text-foreground hover:bg-accent px-8 py-6 rounded-xl w-full">
                  <Home className="w-5 h-5 mr-2" /> Go to Homepage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
