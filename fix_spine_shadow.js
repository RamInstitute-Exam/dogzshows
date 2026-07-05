const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove the spine crease shading gradient
content = content.replace(/\{\!isMobile && \(\s*<div className="absolute top-0 bottom-0 left-1\/2 -translate-x-1\/2 w-\[16px\] h-full bg-\[linear-gradient\(90deg,rgba\(0,0,0,0\.25\)_0%,rgba\(0,0,0,0\.65\)_50%,rgba\(0,0,0,0\.25\)_100%\)\] z-30 pointer-events-none mix-blend-multiply" \/>\s*\)\}/g, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Removed spine shadow gradient');
