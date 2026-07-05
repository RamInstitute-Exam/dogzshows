const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace left button
content = content.replace(
  /<button\s+onClick=\{handlePrev\}[\s\S]*?<ChevronLeft[\s\S]*?<\/button>/g,
  `<button
    onClick={handlePrev}
    className={\`absolute z-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 \${isMobile ? 'top-2 left-1/2 -translate-x-1/2 text-white/90 drop-shadow-md w-16 h-16' : 'w-12 h-12 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl text-white shadow-2xl select-none shrink-0 hover:scale-105 hover:bg-white/10 left-6'}\`}
    title="Previous Page"
  >
    <ChevronLeft className={\`w-10 h-10 \${isMobile ? 'rotate-90' : ''}\`} />
  </button>`
);

// Replace right button
content = content.replace(
  /<button\s+onClick=\{handleNext\}[\s\S]*?<ChevronRight[\s\S]*?<\/button>/g,
  `<button
    onClick={handleNext}
    disabled={currentPage >= totalPages - 1}
    className={\`absolute z-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 \${isMobile ? 'bottom-2 left-1/2 -translate-x-1/2 text-white/90 drop-shadow-md w-16 h-16' : 'w-12 h-12 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl text-white shadow-2xl select-none shrink-0 right-6'} \${currentPage >= totalPages - 1 ? 'opacity-0 pointer-events-none' : 'hover:scale-105 hover:bg-white/10'}\`}
    title="Next Page"
  >
    <ChevronRight className={\`w-10 h-10 \${isMobile ? 'rotate-90' : ''}\`} />
  </button>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed buttons to be just arrows on mobile');
