const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /if \(isMobilePortrait\) \{[\s\S]*?setIsDesktop\(false\);\s+\} else if \(isMobileLand\)/g,
  `if (isMobilePortrait) {
          const availableW = w * 0.95;
          const availableH = h - 140;
          scale = Math.min(availableW / SPREAD_WIDTH, availableH / PAGE_HEIGHT);
          setIsMobile(true);
          setIsDesktop(false);
        } else if (isMobileLand)`
);

content = content.replace(/rotate: isMobile \? 90 : 0,/g, 'rotate: 0,');

// Ensure that HTMLFlipBook has usePortrait={false} and no mobileScrollSupport
content = content.replace(/usePortrait=\{isMobilePortrait\}/g, 'usePortrait={false}');
content = content.replace(/usePortrait=\{isMobile\}/g, 'usePortrait={false}');
content = content.replace(/mobileScrollSupport=\{true\}/g, 'mobileScrollSupport={false}');

fs.writeFileSync(file, content, 'utf8');
console.log('done');
