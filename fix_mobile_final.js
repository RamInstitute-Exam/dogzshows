const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove SKIP INTRO
content = content.replace(
  /<div className="absolute bottom-8 left-1\/2 -translate-x-1\/2 text-white\/50 text-xs font-bold tracking-widest flex items-center gap-3">[\s\S]*?<\/div>/g,
  ''
);

// 2. Remove top right controls
// We will match the entire div holding the 4 buttons.
// Usually it looks like: <div className="flex items-center gap-2 md:gap-4 ml-auto">...</div>
// We can just find the button that contains toggleBookmark and replace its parent.
// Let's use regex to remove the buttons individually to be safe.
content = content.replace(/<button\s+onClick=\{toggleBookmark\}[\s\S]*?<\/button>/g, '');
content = content.replace(/<button\s+onClick=\{toggleThumbnails\}[\s\S]*?<\/button>/g, '');
content = content.replace(/<button\s+onClick=\{toggleMute\}[\s\S]*?<\/button>/g, '');
content = content.replace(/<button\s+onClick=\{toggleFullscreen\}[\s\S]*?<\/button>/g, '');
// Also if there's a divider, remove it: <div className="w-px h-6 bg-white\/10 mx-2" \/>
content = content.replace(/<div className="w-px h-6 bg-white\/10 mx-2" \/>/g, '');


// 3. Hide giant arrows on mobile
// In previous steps, I replaced 'hidden md:flex shrink-0 hover:scale-105' with 'flex shrink-0 hover:scale-105'
// Let's change it back so they only show on desktop.
content = content.replace(
  /flex shrink-0 hover:scale-105/g,
  'hidden md:flex shrink-0 hover:scale-105'
);

// 4. Ensure handleResize handles rotation correctly.
// Let's replace the whole handleResize block
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

// 5. Apply the rotation to motion.div
// We need to find the `scale: zoomScale,` and add `rotate: isMobile ? 90 : 0,`
// First remove any existing rotate if present
content = content.replace(/rotate:\s*isMobile\s*\?\s*90\s*:\s*0,/g, '');
content = content.replace(/rotate:\s*0,/g, '');
// Now add it
content = content.replace(
  /scale: zoomScale,/g,
  'scale: zoomScale, rotate: isMobile ? 90 : 0,'
);

// 6. Maximize the width and height of the wrapper on mobile
// The wrapper is inside <main className="... px-4 py-8 ...">
// On mobile we don't want padding! So change `px-4 py-8` to `md:px-4 md:py-8 px-0 py-0`.
content = content.replace(
  /className="flex-1 flex items-center justify-center relative overflow-hidden px-4 py-8 z-20 cursor-grab active:cursor-grabbing"/g,
  'className="flex-1 flex items-center justify-center relative overflow-hidden md:px-4 md:py-8 px-0 py-0 z-20 cursor-grab active:cursor-grabbing"'
);

fs.writeFileSync(file, content, 'utf8');
console.log('done');
