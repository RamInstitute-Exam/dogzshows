const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace left button
const oldLeft = 'className="absolute left-6 z-30 w-14 h-14 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none hidden md:flex shrink-0 hover:scale-105 hover:bg-white/10 cursor-pointer"';
const newLeft = 'className={`absolute z-30 w-14 h-14 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none shrink-0 hover:scale-105 hover:bg-white/10 cursor-pointer ${isMobile ? \'top-6 rotate-90\' : \'left-6\'}`}';

// Replace right button
const oldRight = 'className={`absolute right-6 z-30 w-14 h-14 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl hidden md:flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none ${';
const newRight = 'className={`absolute z-30 w-14 h-14 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none ${isMobile ? \'bottom-6 rotate-90\' : \'right-6\'} ${';

content = content.replace(oldLeft, newLeft);
content = content.replace(oldRight, newRight);

// Let's make absolutely sure they aren't hidden by earlier code either
content = content.replace(/hidden md:flex/g, 'flex');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed buttons');
