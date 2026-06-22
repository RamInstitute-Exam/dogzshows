'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Redirects legacy /admin/events/edit/[id] URLs to /admin/events/edit?id=xxx
export default function RedirectToEdit() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params?.id && params.id !== '_') {
      router.replace(`/admin/events/edit?id=${params.id}`);
    } else {
      router.replace('/admin/events');
    }
  }, [params, router]);

  return null;
}
