'use client';

import { Suspense } from 'react';
import EditProfileClient from './EditProfileClient';
import { Loader2 } from 'lucide-react';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    }>
      <EditProfileClient />
    </Suspense>
  );
}
