const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace left button
content = content.replace(
  /className=\{`absolute z-30 w-12 h-12 rounded-full border border-white\/10 bg-black\/60 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none shrink-0 hover:scale-105 hover:bg-white\/10 cursor-pointer \$\{isMobile \? 'top-2 left-\[calc\(50%-24px\)\]' : 'left-6'}`\}/g,
  'className={`absolute z-30 w-12 h-12 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none shrink-0 hover:scale-105 hover:bg-white/10 cursor-pointer ${isMobile ? \'top-4 left-1/2 -translate-x-1/2\' : \'left-6\'}`}'
);

// Replace right button
content = content.replace(
  /className=\{`absolute z-30 w-12 h-12 rounded-full border border-white\/10 bg-black\/60 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none shrink-0 \$\{isMobile \? 'bottom-2 left-\[calc\(50%-24px\)\]' : 'right-6'\} \$\{currentPage >= totalPages - 1 \? 'opacity-0 pointer-events-none' : 'hover:scale-105 hover:bg-white\/10 cursor-pointer'\}`\}/g,
  'className={`absolute z-30 w-12 h-12 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none shrink-0 ${isMobile ? \'bottom-4 left-1/2 -translate-x-1/2\' : \'right-6\'} ${currentPage >= totalPages - 1 ? \'opacity-0 pointer-events-none\' : \'hover:scale-105 hover:bg-white/10 cursor-pointer\'}`}'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed buttons properly');
