'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BulkUploadRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/bulk-upload?module=entries');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-t-foreground border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted-foreground text-sm">Redirecting to Universal Bulk Upload...</p>
      </div>
    </div>
  );
}
