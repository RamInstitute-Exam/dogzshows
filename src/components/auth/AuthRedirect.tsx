'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModalStore, AuthView } from '@/store/useAuthModalStore';

export default function AuthRedirect({ view }: { view: AuthView }) {
  const router = useRouter();
  const { openModal } = useAuthModalStore();

  useEffect(() => {
    // Redirect to home immediately without pushing to history stack
    router.replace('/');
    // Open the modal after a slight delay to ensure root layout has mounted it
    setTimeout(() => openModal(view), 100);
  }, [router, openModal, view]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-card">
      <div className="w-8 h-8 border-4 border-border border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
