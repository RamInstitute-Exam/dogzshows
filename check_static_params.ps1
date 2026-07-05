$base = 'D:\bala backend\frontend'
$files = @(
  'src\app\admin\e-magazines\edit\[id]\page.tsx',
  'src\app\clubs\category\[slug]\page.tsx',
  'src\app\clubs\[slug]\page.tsx',
  'src\app\clubs\[slug]\winners\page.tsx',
  'src\app\e-magazines\[slug]\page.tsx',
  'src\app\gallery\album\[slug]\page.tsx',
  'src\app\gallery\outdoor\[id]\page.tsx',
  'src\app\gallery\show-photos\[eventId]\page.tsx',
  'src\app\gallery\shows\[id]\page.tsx',
  'src\app\gallery\[categorySlug]\page.tsx',
  'src\app\winners\categories\[slug]\page.tsx',
  'src\app\winners\category\[slug]\page.tsx',
  'src\app\winners\[id]\page.tsx'
)
foreach ($f in $files) {
  $full = Join-Path $base $f
  $content = [System.IO.File]::ReadAllText($full)
  if ($content -notmatch 'generateStaticParams') {
    Write-Host "MISSING: $f"
  } else {
    Write-Host "OK:      $f"
  }
}
