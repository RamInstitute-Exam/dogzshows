const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the top right controls
// The controls are in a div inside the header:
// <div className="flex items-center gap-2 md:gap-4 ml-auto">
// I will just remove the entire header or just those buttons.
// Let's hide them using regex
content = content.replace(
  /\{!\(isMobile && isFullscreen\) && \([\s\S]*?<button[\s\S]*?onClick=\{toggleFullscreen\}[\s\S]*?<\/button>\s*\)\}/g,
  ''
);

// Alternative: if that regex fails, I can just find the toggleBookmark button and remove the container.
// Let's replace the whole header content's right side buttons:
content = content.replace(
  /<button\s*onClick=\{toggleBookmark\}[\s\S]*?<Bookmark[\s\S]*?<\/button>/g,
  ''
);
content = content.replace(
  /<button\s*onClick=\{toggleThumbnails\}[\s\S]*?<LayoutGrid[\s\S]*?<\/button>/g,
  ''
);
content = content.replace(
  /<button\s*onClick=\{toggleMute\}[\s\S]*?Volume[\s\S]*?<\/button>/g,
  ''
);
content = content.replace(
  /<button\s*onClick=\{toggleFullscreen\}[\s\S]*?Maximize[\s\S]*?<\/button>/g,
  ''
);

// 2. Restore 90 degree rotation on mobile portrait and fix scaling
// I need to change `handleResize` back to rotating the dimensions
content = content.replace(
  /function handleResize\(\) \{[\s\S]*?setDimensions\(\{[\s\S]*?wrapperHeight: PAGE_HEIGHT \* scale,\s*\}\);\s*\}, 100\);\s*\}/g,
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
          // rotated layout: the screen height becomes available width
          const availableW = h * 0.95;
          const availableH = w * 0.92;
          scale = Math.min(availableW / SPREAD_WIDTH, availableH / PAGE_HEIGHT);
          setIsMobile(true);
          setIsDesktop(false);
        } else if (isMobileLand) {
          const availableW = w * 0.92;
          const availableH = h - 60;
          scale = Math.min(availableW / SPREAD_WIDTH, availableH / PAGE_HEIGHT);
          setIsMobile(false);
          setIsDesktop(false);
        } else {
          const availableW = w * 0.92;
          const availableH = h - 180;
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

// Restore rotation in motion.div
// Look for `rotate: 0,` inside the book wrapper motion.div
content = content.replace(
  /scale: zoomScale,\s*rotate: 0,/g,
  'scale: zoomScale,\n              rotate: isMobile ? 90 : 0,'
);

// Fix the arrow buttons (they look gigantic and stretched in the screenshot!)
// Why were they gigantic? Because I changed `hidden md:flex shrink-0 hover:scale-105` to `flex shrink-0 hover:scale-105`
// BUT wait, in rotated mode, the arrow buttons might need to be repositioned!
// Wait, if the wrapper is rotated 90 degrees, the left/right flex layout might not make sense.
// If the wrapper is rotated, the container of the arrows is NOT rotated?
// Let's check how arrows are rendered.

fs.writeFileSync(file, content, 'utf8');
console.log('done');
