const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add rotate-90 to ChevronLeft and ChevronRight in the handlePrev/handleNext buttons
// We will do this as part of the dynamic arrows replacement.

// 2. Dynamic arrows replacement (replaces the old Left and Right buttons)
const leftButtonRegex = /<button\s+onClick=\{handlePrev\}\s+className=\{`absolute z-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 \$\{isMobile \? 'top-2 left-1\/2 -translate-x-1\/2 text-white\/90 drop-shadow-md w-16 h-16' : 'w-12 h-12 rounded-full border border-white\/10 bg-black\/60 backdrop-blur-xl text-white shadow-2xl select-none shrink-0 hover:scale-105 hover:bg-white\/10 left-6'\}`\}\s+title="Previous Page"\s*>\s*<ChevronLeft className="w-10 h-10" \/>\s*<\/button>/;

const newLeftButton = `<button
    onClick={handlePrev}
    style={isMobile ? { top: \`calc(50% - \${dimensions.wrapperWidth / 2 + 36}px)\` } : undefined}
    className={\`absolute z-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 \${isMobile ? 'left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 drop-shadow-md w-16 h-16' : 'w-12 h-12 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl text-white shadow-2xl select-none shrink-0 hover:scale-105 hover:bg-white/10 left-6'}\`}
    title="Previous Page"
  >
    <ChevronLeft className={\`w-10 h-10 \${isMobile ? 'rotate-90' : ''}\`} />
  </button>`;

content = content.replace(leftButtonRegex, newLeftButton);

const rightButtonRegex = /<button\s+onClick=\{handleNext\}\s+disabled=\{currentPage >= totalPages - 1\}\s+className=\{`absolute z-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 \$\{isMobile \? 'bottom-2 left-1\/2 -translate-x-1\/2 text-white\/90 drop-shadow-md w-16 h-16' : 'w-12 h-12 rounded-full border border-white\/10 bg-black\/60 backdrop-blur-xl text-white shadow-2xl select-none shrink-0 right-6'\} \$\{currentPage >= totalPages - 1 \? 'opacity-0 pointer-events-none' : 'hover:scale-105 hover:bg-white\/10'\}`\}\s+title="Next Page"\s*>\s*<ChevronRight className="w-10 h-10" \/>\s*<\/button>/;

const newRightButton = `<button
    onClick={handleNext}
    disabled={currentPage >= totalPages - 1}
    style={isMobile ? { top: \`calc(50% + \${dimensions.wrapperWidth / 2 + 36}px)\` } : undefined}
    className={\`absolute z-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 \${isMobile ? 'left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 drop-shadow-md w-16 h-16' : 'w-12 h-12 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl text-white shadow-2xl select-none shrink-0 right-6'} \${currentPage >= totalPages - 1 ? 'opacity-0 pointer-events-none' : 'hover:scale-105 hover:bg-white/10'}\`}
    title="Next Page"
  >
    <ChevronRight className={\`w-10 h-10 \${isMobile ? 'rotate-90' : ''}\`} />
  </button>`;

content = content.replace(rightButtonRegex, newRightButton);

// 3. Make the main div absolute inset-0 so arrows don't get clipped or offset by shrink-wrapping
content = content.replace(
  /<div className="flex items-center justify-center gap-6 md:gap-10 lg:gap-14 w-full h-full max-w-\[100vw\] relative">/g,
  '<div className="absolute inset-0 flex items-center justify-center gap-6 md:gap-10 lg:gap-14 w-full max-w-[100vw]">'
);

// 4. Center cover pages logic BEFORE the main return
const shiftLogic = `
  // Calculate dynamic shifts to center the single cover pages
  let autoShiftX = 0;
  let autoShiftY = 0;
  if (!isOpening) {
    if (currentPage === 1) {
      const shift = (dimensions.width / 4) * zoomScale;
      if (isMobile) {
        autoShiftY = -shift;
      } else {
        autoShiftX = -shift;
      }
    } else if (currentPage >= totalPages) {
      const shift = (dimensions.width / 4) * zoomScale;
      if (isMobile) {
        autoShiftY = shift;
      } else {
        autoShiftX = shift;
      }
    }
  }
`;

content = content.replace(
  /\n  return \(\n    <div\n      ref=\{viewerRef\}/,
  `\n${shiftLogic}\n\n  return (\n    <div\n      ref={viewerRef}`
);

// 5. Apply shift to motion.div
content = content.replace(
  /x: panOffset\.x,/g,
  'x: panOffset.x + autoShiftX,'
);

content = content.replace(
  /y: panOffset\.y,/g,
  'y: panOffset.y + autoShiftY,'
);

// 6. Make HTMLFlipBook bg-transparent
content = content.replace(
  /className="rounded-\[12px\] overflow-hidden bg-\[#faf9f6\]"/g,
  'className="rounded-[12px] overflow-hidden bg-transparent"'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Applied all fixes cleanly!');
