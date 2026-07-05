const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change the div to be absolute inset-0 so it fills the screen
content = content.replace(
  /<div className="flex items-center justify-center gap-6 md:gap-10 lg:gap-14 w-full h-full max-w-\[100vw\] relative">/g,
  '<div className="absolute inset-0 flex items-center justify-center gap-6 md:gap-10 lg:gap-14 w-full max-w-[100vw]">'
);

// 2. Adjust availableW to make room for the arrows on mobile portrait
content = content.replace(
  /const availableW = h \* 0\.98; \/\/ maximize size/g,
  'const availableW = h - 140; // maximize size but leave room for top/bottom arrows'
);

// 3. Move the arrows to top-4 and bottom-4 for better edge spacing
content = content.replace(
  /top-2 left-1\/2 -translate-x-1\/2 text-white\/90 drop-shadow-md w-16 h-16/g,
  'top-4 left-1/2 -translate-x-1/2 text-white/90 drop-shadow-md w-16 h-16'
);

content = content.replace(
  /bottom-2 left-1\/2 -translate-x-1\/2 text-white\/90 drop-shadow-md w-16 h-16/g,
  'bottom-4 left-1/2 -translate-x-1/2 text-white/90 drop-shadow-md w-16 h-16'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed arrow positioning by making container absolute inset-0 and adjusting magazine scale');
