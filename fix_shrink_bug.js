const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add shrink-0 to intro-book-wrapper
content = content.replace(
  /className="intro-book-wrapper relative cursor-pointer"/g,
  'className="intro-book-wrapper relative cursor-pointer shrink-0"'
);

// 2. Add shrink-0 to real book motion.div
content = content.replace(
  /className="flex items-center justify-center overflow-visible relative"\n\s*style=\{\{ transformOrigin: 'center center' \}\}/g,
  `className="flex items-center justify-center overflow-visible relative shrink-0"
            style={{ transformOrigin: 'center center' }}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed flex shrink bug');
