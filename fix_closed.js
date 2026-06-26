const fs = require('fs');
fs.copyFileSync('src/app/entries/closed/page.tsx', 'src/app/entries/closed/ClosedEntriesClient.tsx');
let s = fs.readFileSync('src/app/entries/closed/ClosedEntriesClient.tsx', 'utf8');

s = s.replace('export default function ClosedEntriesPage()', 'export default function ClosedEntriesClient({ initialBannerData }: { initialBannerData?: any })');
s = s.replace(
  'fallbackImage="/images/registration_banner.png"',
  'fallbackImage="/images/registration_banner.png"\n        initialBannerData={initialBannerData}'
);

fs.writeFileSync('src/app/entries/closed/ClosedEntriesClient.tsx', s);
