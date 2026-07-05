const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove SKIP INTRO
content = content.replace(
  /<motion\.p[\s\S]*?Click anywhere to skip intro[\s\S]*?<\/motion\.p>/g,
  ''
);

// 2. Remove top right controls
// We want to remove the <div className="flex items-center gap-2"> that contains toggleBookmark.
// Let's remove the buttons individually to be safe from bad regex matches.
content = content.replace(/<button\s+onClick=\{\(\) => toggleBookmark[\s\S]*?<\/button>/g, '');
content = content.replace(/<button\s+onClick=\{\(\) => setShowBookmarksPanel[\s\S]*?<\/button>/g, '');
content = content.replace(/<button\s+onClick=\{\(\) => setIsMuted[\s\S]*?<\/button>/g, '');

// 3. Remove bottom footer
content = content.replace(/<AnimatePresence>\s*\{\!isPlayingIntro && showToolbar && \([\s\S]*?<motion\.footer[\s\S]*?<\/motion\.footer>\s*\)\}\s*<\/AnimatePresence>/g, '');

// 4. Hide giant arrows on mobile
// In <button onClick={handlePrev} ... className="...">
// Add `hidden md:flex` if not present.
content = content.replace(/className="absolute left-6 z-30 w-14 h-14 rounded-full border border-white\/10 bg-black\/60 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none hover:scale-105 hover:bg-white\/10 cursor-pointer"/g, 'className="absolute left-6 z-30 w-14 h-14 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl hidden md:flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none hover:scale-105 hover:bg-white/10 cursor-pointer"');
content = content.replace(/className=\{`absolute right-6 z-30 w-14 h-14 rounded-full border border-white\/10 bg-black\/60 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none \$\{/g, 'className={`absolute right-6 z-30 w-14 h-14 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl hidden md:flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all select-none ${');

// 5. Ensure handleResize handles rotation correctly.
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

// 6. Apply the rotation to motion.div
content = content.replace(/rotate:\s*isMobile\s*\?\s*90\s*:\s*0,/g, '');
content = content.replace(/rotate:\s*0,/g, '');
content = content.replace(
  /scale: zoomScale,/g,
  'scale: zoomScale, rotate: isMobile ? 90 : 0,'
);

// 7. Maximize the width and height of the wrapper on mobile
content = content.replace(
  /className="flex-1 flex items-center justify-center relative overflow-hidden px-4 py-8 z-20 cursor-grab active:cursor-grabbing"/g,
  'className="flex-1 flex items-center justify-center relative overflow-hidden md:px-4 md:py-8 px-0 py-0 z-20 cursor-grab active:cursor-grabbing"'
);

fs.writeFileSync(file, content, 'utf8');
console.log('done');
