const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove Skip Intro text
content = content.replace('Click anywhere to skip intro', '');

// 2. Hide Top right buttons (just hide them with `hidden` class so we don't break JSX)
// We will find `className="flex items-center gap-2"` under top toolbar and make it hidden
const topToolbarActionsMatch = content.match(/\{\/\* Top Toolbar Actions \*\/\}\s*<div className="flex items-center gap-2">/);
if (topToolbarActionsMatch) {
  content = content.replace(
    /\{\/\* Top Toolbar Actions \*\/\}\s*<div className="flex items-center gap-2">/,
    '{/* Top Toolbar Actions */}\n            <div className="hidden">'
  );
}

// 3. Hide bottom footer (just hide the footer so it doesn't break)
const footerMatch = content.match(/<motion\.footer\s*initial=\{\{ opacity: 0, y: 25 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, y: 25 \}\}\s*className="flex flex-col gap-4 border-t border-white\/5 z-40 bg-zinc-950\/45 backdrop-blur-xl absolute bottom-0 left-0 right-0 p-4"/);
if (footerMatch) {
  content = content.replace(
    /<motion\.footer\s*initial=\{\{ opacity: 0, y: 25 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, y: 25 \}\}\s*className="flex flex-col gap-4 border-t border-white\/5 z-40 bg-zinc-950\/45 backdrop-blur-xl absolute bottom-0 left-0 right-0 p-4"/,
    '<motion.footer initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 25 }} className="hidden"'
  );
}

// 4. Hide giant arrows on mobile
content = content.replace(
  /className="absolute left-6 z-30 w-14 h-14 rounded-full border border-white\/10 bg-black\/60 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none hover:scale-105 hover:bg-white\/10 cursor-pointer"/g,
  'className="absolute left-6 z-30 w-14 h-14 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl hidden md:flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none hover:scale-105 hover:bg-white/10 cursor-pointer"'
);
content = content.replace(
  /className=\{`absolute right-6 z-30 w-14 h-14 rounded-full border border-white\/10 bg-black\/60 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none \$\{/g,
  'className={`absolute right-6 z-30 w-14 h-14 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl hidden md:flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none ${'
);
// For safety, in case it already has hidden md:flex but missing some spaces:
content = content.replace(/hidden md:hidden md:flex/g, 'hidden md:flex');

// 5. Apply dimensions and rotation for mobile
content = content.replace(
  /function handleResize\(\) \{[\s\S]*?\}, 100\);\s*\}/g,
  `function handleResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        const PAGE_WIDTH  = 500;
        const PAGE_HEIGHT = 707;
        const SPREAD_WIDTH = PAGE_WIDTH * 2;

        const isMobilePortrait = w < 768 && w < h;
        const isMobileLand = h < 768 && w > h;

        let scale = 1;

        if (isMobilePortrait) {
          // Rotated 90 degrees: available width is height, available height is width
          const availableW = h * 0.98; // maximize size
          const availableH = w * 0.95; // maximize size
          scale = Math.min(availableW / SPREAD_WIDTH, availableH / PAGE_HEIGHT);
          setIsMobile(true);
          setIsDesktop(false);
        } else if (isMobileLand) {
          const availableW = w * 0.95;
          const availableH = h - 60;
          scale = Math.min(availableW / SPREAD_WIDTH, availableH / PAGE_HEIGHT);
          setIsMobile(false);
          setIsDesktop(false);
        } else {
          const availableW = w * 0.92;
          const availableH = h - 140;
          scale = Math.min(availableW / SPREAD_WIDTH, availableH / PAGE_HEIGHT);
          setIsMobile(false);
          setIsDesktop(w >= 1024);
        }

        setBookScale(scale);
        setDimensions({
          width:         PAGE_WIDTH * scale,
          height:        PAGE_HEIGHT * scale,
          wrapperWidth:  SPREAD_WIDTH * scale,
          wrapperHeight: PAGE_HEIGHT * scale,
        });
      }, 100);
    }`
);

content = content.replace(/rotate:\s*isMobile\s*\?\s*90\s*:\s*0,/g, '');
content = content.replace(/rotate:\s*0,/g, '');
content = content.replace(
  /scale: zoomScale,/g,
  'scale: zoomScale, rotate: isMobile ? 90 : 0,'
);

// 6. Maximize width and height by removing padding on mobile
content = content.replace(
  /className="flex-1 flex items-center justify-center relative overflow-hidden px-4 py-8 z-20 cursor-grab active:cursor-grabbing"/g,
  'className="flex-1 flex items-center justify-center relative overflow-hidden md:px-4 md:py-8 px-0 py-0 z-20 cursor-grab active:cursor-grabbing"'
);

fs.writeFileSync(file, content, 'utf8');
console.log('done');
