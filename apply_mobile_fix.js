const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace handleResize block to apply scale directly to dimensions
content = content.replace(
  /function handleResize\(\) \{[\s\S]*?setBookScale\(scale\);\s+setDimensions\(\{\s+width:\s+PAGE_WIDTH,\s+height:\s+PAGE_HEIGHT,\s+wrapperWidth:\s+SPREAD_WIDTH,\s+wrapperHeight:\s+PAGE_HEIGHT,\s+\}\);\s+\}\s+handleResize\(\);/g,
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
          const availableW = w * 0.95;
          const availableH = h - 140;
          scale = Math.min(availableW / SPREAD_WIDTH, availableH / PAGE_HEIGHT);
          setIsMobile(true);
          setIsDesktop(false);
        } else if (isMobileLand) {
          const availableW = w * 0.92;
          const availableH = h - 140;
          scale = Math.min(availableW / SPREAD_WIDTH, availableH / PAGE_HEIGHT);
          setIsMobile(false);
          setIsDesktop(false);
        } else {
          const availableW = w * 0.92;
          const availableH = h - 220; 
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
    }
    handleResize();`
);

content = content.replace(/scale: bookScale \* zoomScale,/g, 'scale: zoomScale,');
content = content.replace(/rotate: isMobile \? 90 : 0,/g, 'rotate: 0,');
content = content.replace(/hidden md:flex shrink-0 hover:scale-105/g, 'flex shrink-0 hover:scale-105');

fs.writeFileSync(file, content, 'utf8');
console.log('done');
