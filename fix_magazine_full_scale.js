const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Hide Skip Intro button
content = content.replace(
  /className="absolute top-6 right-6 z-\[110\] px-4 py-2 rounded-lg glass-btn/g,
  'className="hidden absolute top-6 right-6 z-[110] px-4 py-2 rounded-lg glass-btn'
);

// Update scale: 0.85 to scale: 1 for intro animations
content = content.replace(/scale:\s*0\.85/g, 'scale: 1');
content = content.replace(/scale:\s*\[0\.85,\s*1\]/g, 'scale: [1, 1]');
content = content.replace(/scale:\s*\[0\.6,\s*0\.85\]/g, 'scale: [0.6, 1]');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed mobile intro scale and skip intro button');
