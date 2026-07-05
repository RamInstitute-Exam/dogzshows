const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove renderPageThickness references completely
content = content.replace(/\{\!isMobile && renderPageThickness\('left'\)\}/g, '');
content = content.replace(/\{\!isMobile && renderPageThickness\('right'\)\}/g, '');

// 2. Remove the spine crease line that looks like a white line
content = content.replace(/\{\!isMobile && \(\s*<div className="absolute top-0 bottom-0 left-\[calc\(50%-0\.5px\)\] w-\[1px\] h-full bg-white\/10 z-30 pointer-events-none" \/>\s*\)\}/g, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Removed edge and spine lines');
