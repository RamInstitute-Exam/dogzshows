const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<button\s+onClick=\{handlePrev\}[\s\S]*?<ChevronLeft className="w-7 h-7" \/>\s*<\/button>/g,
  `<button
    onClick={handlePrev}
    className={\`absolute z-30 w-12 h-12 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none shrink-0 hover:scale-105 hover:bg-white/10 cursor-pointer \${isMobile ? 'top-2 left-[calc(50%-24px)]' : 'left-6'}\`}
    title="Previous Page"
  >
    <ChevronLeft className={\`w-7 h-7 \${isMobile ? 'rotate-90' : ''}\`} />
  </button>`
);

content = content.replace(
  /<button\s+onClick=\{handleNext\}[\s\S]*?<ChevronRight className="w-7 h-7" \/>\s*<\/button>/g,
  `<button
    onClick={handleNext}
    disabled={currentPage >= totalPages - 1}
    className={\`absolute z-30 w-12 h-12 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none shrink-0 \${isMobile ? 'bottom-2 left-[calc(50%-24px)]' : 'right-6'} \${currentPage >= totalPages - 1 ? 'opacity-0 pointer-events-none' : 'hover:scale-105 hover:bg-white/10 cursor-pointer'}\`}
    title="Next Page"
  >
    <ChevronRight className={\`w-7 h-7 \${isMobile ? 'rotate-90' : ''}\`} />
  </button>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed buttons distortion');
