const fs = require('fs');
fs.copyFileSync('src/app/entries/upcoming/page.tsx', 'src/app/entries/upcoming/UpcomingEntriesClient.tsx');
let s = fs.readFileSync('src/app/entries/upcoming/UpcomingEntriesClient.tsx', 'utf8');

s = s.replace('export default function UpcomingEntriesPage()', 'export default function UpcomingEntriesClient({ initialBannerData }: { initialBannerData?: any })');
s = s.replace(
  'fallbackImage="/images/registration_banner.png"',
  'fallbackImage="/images/registration_banner.png"\n        initialBannerData={initialBannerData}'
);

fs.writeFileSync('src/app/entries/upcoming/UpcomingEntriesClient.tsx', s);
