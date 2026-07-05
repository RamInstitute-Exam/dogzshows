const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Left Button
const leftButtonRegex = /<button\s+onClick=\{handlePrev\}\s+className=\{`absolute z-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 \$\{isMobile \? 'top-4 left-1\/2 -translate-x-1\/2 text-white\/90 drop-shadow-md w-16 h-16' : 'w-12 h-12 rounded-full border border-white\/10 bg-black\/60 backdrop-blur-xl text-white shadow-2xl select-none shrink-0 hover:scale-105 hover:bg-white\/10 left-6'\}`\}\s+title="Previous Page"\s*>/;

const newLeftButton = `<button
    onClick={handlePrev}
    style={isMobile ? { top: \`calc(50% - \${dimensions.wrapperWidth / 2 + 36}px)\` } : undefined}
    className={\`absolute z-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 \${isMobile ? 'left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 drop-shadow-md w-16 h-16' : 'w-12 h-12 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl text-white shadow-2xl select-none shrink-0 hover:scale-105 hover:bg-white/10 left-6'}\`}
    title="Previous Page"
  >`;

content = content.replace(leftButtonRegex, newLeftButton);


// Replace Right Button
const rightButtonRegex = /<button\s+onClick=\{handleNext\}\s+disabled=\{currentPage >= totalPages - 1\}\s+className=\{`absolute z-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 \$\{isMobile \? 'bottom-4 left-1\/2 -translate-x-1\/2 text-white\/90 drop-shadow-md w-16 h-16' : 'w-12 h-12 rounded-full border border-white\/10 bg-black\/60 backdrop-blur-xl text-white shadow-2xl select-none shrink-0 right-6'\} \$\{currentPage >= totalPages - 1 \? 'opacity-0 pointer-events-none' : 'hover:scale-105 hover:bg-white\/10'\}`\}\s+title="Next Page"\s*>/;

const newRightButton = `<button
    onClick={handleNext}
    disabled={currentPage >= totalPages - 1}
    style={isMobile ? { top: \`calc(50% + \${dimensions.wrapperWidth / 2 + 36}px)\` } : undefined}
    className={\`absolute z-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 \${isMobile ? 'left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 drop-shadow-md w-16 h-16' : 'w-12 h-12 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl text-white shadow-2xl select-none shrink-0 right-6'} \${currentPage >= totalPages - 1 ? 'opacity-0 pointer-events-none' : 'hover:scale-105 hover:bg-white/10'}\`}
    title="Next Page"
  >`;

content = content.replace(rightButtonRegex, newRightButton);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed arrow positioning by dynamically calculating placement near the magazine edges');
