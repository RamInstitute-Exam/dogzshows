$base = 'D:\bala backend\frontend'
$targetPath = "$base\src\app\gallery\show-photos\[eventId]\page.tsx"

$content = "import React, { Suspense } from 'react';`nimport PageContainer from '@/components/layout/PageContainer';`nimport PublicContainer from '@/components/layout/PublicContainer';`nimport EventGalleryClient from './EventGalleryClient';`nimport { Loader2 } from 'lucide-react';`n`nexport function generateStaticParams() {`n  return [];`n}`n`nexport const dynamic = 'force-static';`n`nexport default function EventGalleryPage() {`n  return (`n    <PageContainer>`n      <PublicContainer className=""pb-24 pt-8 md:pt-12"">`n        <Suspense fallback={`n          <div className=""flex items-center justify-center py-32"">`n            <Loader2 className=""w-10 h-10 text-primary animate-spin"" />`n          </div>`n        }>`n          <EventGalleryClient />`n        </Suspense>`n      </PublicContainer>`n    </PageContainer>`n  );`n}`n"

# Write WITHOUT BOM using UTF-8 NoBOM encoding
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($targetPath, $content, $utf8NoBom)
Write-Host "Written without BOM: $targetPath"

# Verify first 20 chars as hex to confirm no BOM
$bytes = [System.IO.File]::ReadAllBytes($targetPath)
$hex = ($bytes[0..5] | ForEach-Object { $_.ToString("X2") }) -join ' '
Write-Host "First 6 bytes (hex): $hex"
