const fs = require('fs');
let s = fs.readFileSync('src/app/contact/ContactClient.tsx', 'utf8');

s = s.replace(
  'fallbackImage="/images/contact_banner.png"',
  'fallbackImage="/images/contact_banner.png"\n        initialBannerData={initialBannerData}'
);

fs.writeFileSync('src/app/contact/ContactClient.tsx', s);
