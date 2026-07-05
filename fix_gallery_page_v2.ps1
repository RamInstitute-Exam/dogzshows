$base = 'D:\bala backend\frontend'
$targetPath = "$base\src\app\gallery\show-photos\[eventId]\page.tsx"

$content = @'
import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import EventGalleryClient from './EventGalleryClient';
import { Loader2 } from 'lucide-react';
import { getShowPhotoEventIds } from '@/lib/staticParams';

export { getShowPhotoEventIds as generateStaticParams };

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

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($targetPath, $content, $utf8NoBom)
Write-Host "Written: $targetPath"

# Verify first bytes (no BOM)
$bytes = [System.IO.File]::ReadAllBytes($targetPath)
$hex = ($bytes[0..4] | ForEach-Object { $_.ToString("X2") }) -join ' '
Write-Host "First 5 bytes: $hex  (should start with 69=i)"
