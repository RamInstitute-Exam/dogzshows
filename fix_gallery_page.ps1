$content = @'
import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import EventGalleryClient from './EventGalleryClient';
import { Loader2 } from 'lucide-react';

export function generateStaticParams() {
  return [];
}

export const dynamic = 'force-static';

export default function EventGalleryPage() {
  return (
    <PageContainer>
      <PublicContainer className="pb-24 pt-8 md:pt-12">
        <Suspense fallback={
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        }>
          <EventGalleryClient />
        </Suspense>
      </PublicContainer>
    </PageContainer>
  );
}
'@

$path = 'D:\bala backend\frontend\src\app\gallery\show-photos\[eventId]\page.tsx'
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host 'File written successfully.'
