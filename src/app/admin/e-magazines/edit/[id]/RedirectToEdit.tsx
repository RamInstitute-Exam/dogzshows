'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Redirects dynamic /admin/e-magazines/edit/[id] path URLs to static-export /admin/e-magazines/edit?id=xxx
export default function RedirectToEdit() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params?.id && params.id !== '_') {
      router.replace(`/admin/e-magazines/edit?id=${params.id}`);
    } else {
      router.replace('/admin/e-magazines');
    }
  }, [params, router]);

  return null;
}
