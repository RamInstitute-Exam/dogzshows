const fs = require('fs');
fs.copyFileSync('src/app/entries/dogs/page.tsx', 'src/app/entries/dogs/DogsEntriesClient.tsx');
let s = fs.readFileSync('src/app/entries/dogs/DogsEntriesClient.tsx', 'utf8');

s = s.replace('export default function DogEntriesCatalogPage()', 'export default function DogsEntriesClient({ initialBannerData }: { initialBannerData?: any })');
s = s.replace(
  'fallbackImage="/images/competitions_banner.png"',
  'fallbackImage="/images/competitions_banner.png"\n        initialBannerData={initialBannerData}'
);

fs.writeFileSync('src/app/entries/dogs/DogsEntriesClient.tsx', s);
