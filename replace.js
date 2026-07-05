const fs = require('fs');
const file = 'd:/bala backend/frontend/src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const FlipPage = React\.forwardRef<\s+HTMLDivElement,\s+\{ children: React\.ReactNode; index: number; className\?: string; isMobile: boolean \}\s+>\(\(\{ children, index, className, isMobile \}, ref\) => \{\s+const isLeft = !isMobile && index % 2 === 0;\s+const isRight = isMobile \|\| index % 2 === 1;[\s\S]*?(?=\s+return \()/g,
  `const FlipPage = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; index: number; className?: string; isMobile: boolean }
>(({ children, index, className }, ref) => {
  const isLeft = index % 2 === 0;
  const isRight = index % 2 === 1;`
);

content = content.replace(
  /borderTopLeftRadius: isLeft && !isMobile \? '12px' : '0px'/g,
  "borderTopLeftRadius: isLeft ? '12px' : '0px'"
);
content = content.replace(
  /borderBottomLeftRadius: isLeft && !isMobile \? '12px' : '0px'/g,
  "borderBottomLeftRadius: isLeft ? '12px' : '0px'"
);
content = content.replace(
  /borderTopRightRadius: isRight && !isMobile \? '12px' : '0px'/g,
  "borderTopRightRadius: isRight ? '12px' : '0px'"
);
content = content.replace(
  /borderBottomRightRadius: isRight && !isMobile \? '12px' : '0px'/g,
  "borderBottomRightRadius: isRight ? '12px' : '0px'"
);

content = content.replace(
  /boxShadow: isMobile \? 'none' : \(isLeft\s+\? '-4px 0 12px rgba\(0,0,0,0.15\), -1px 0 3px rgba\(0,0,0,0.05\), inset -1px 0 0 rgba\(255,255,255,0.4\)'\s+: '4px 0 12px rgba\(0,0,0,0.15\), 1px 0 3px rgba\(0,0,0,0.05\), inset 1px 0 0 rgba\(255,255,255,0.4\)'\),/g,
  `boxShadow: isLeft
          ? '-4px 0 12px rgba(0,0,0,0.15), -1px 0 3px rgba(0,0,0,0.05), inset -1px 0 0 rgba(255,255,255,0.4)'
          : '4px 0 12px rgba(0,0,0,0.15), 1px 0 3px rgba(0,0,0,0.05), inset 1px 0 0 rgba(255,255,255,0.4)',`
);

content = content.replace(
  /\{!isMobile && \(\s+<>\s+<div/g,
  `<>\n          <div`
);
content = content.replace(
  /100%\)'\s+\}\}\s+\/>\s+<\/>\s+\)\}/g,
  `100%)',\n            }}\n          />\n        </>`
);


// Dimensions
content = content.replace(
  /if \(mobile\) \{[\s\S]*?\} else \{[\s\S]*?wrapperHeight = wrapperWidth \* \(707 \/ 1000\);\s+\}\s+pageWidth = wrapperWidth \/ 2;\s+pageHeight = wrapperHeight;\s+\}/g,
  `const availableW = mobile ? w * 0.95 : w * 0.92;
        const availableH = mobile ? h - 140 : h - 180;

        if (availableW / availableH > 1000 / 707) {
          wrapperHeight = availableH;
          wrapperWidth = wrapperHeight * (1000 / 707);
        } else {
          wrapperWidth = availableW;
          wrapperHeight = wrapperWidth * (707 / 1000);
        }
        pageWidth = wrapperWidth / 2;
        pageHeight = wrapperHeight;`
);

// handlePrev
content = content.replace(
  /if \(!isMobile && currentPage <= 3\) \{[\s\S]*?bookRef\.current\.pageFlip\(\)\.flipPrev\(\);\s+\}/g,
  `if (currentPage <= 3) {
        handleCloseBook();
      } else {
        bookRef.current.pageFlip().flipPrev();
      }`
);

// onFlip
content = content.replace(
  /if \(isMobile\) \{\s+setCurrentPage\(e\.data \+ 1\);\s+\} else \{\s+\/\/ On desktop, HTMLFlipBook is supplied pages\.slice\(2\) so index 0 = page 3\s+setCurrentPage\(e\.data \+ 3\);\s+\}/g,
  `setCurrentPage(e.data + 3);`
);

// handleOpenBook
content = content.replace(
  /if \(isMobile\) \{\s+\/\/ Mobile simple fade transition\s+await animate\('\.intro-book-wrapper', \{ scale: 1\.1, opacity: 0 \}, \{ duration: 0\.5 \}\);\s+\} else \{\s+\/\/ Desktop 3D open[\s\S]*?await animate\('\.intro-book-wrapper', \{ scale: 1\.15, opacity: 0 \}, \{ duration: 0\.4, ease: 'easeOut' \}\);\s+\}/g,
  `const coverOffsetX = -(dimensions.wrapperWidth / 4);
      await Promise.all([
        animate('.intro-cover', { rotateY: -180 }, { duration: 1.6, ease: [0.25, 1, 0.5, 1] }),
        animate('.intro-book-wrapper', { x: [coverOffsetX, 0], scale: [0.85, 1] }, { duration: 1.6, ease: [0.25, 1, 0.5, 1] }),
        animate('.intro-left-page', { opacity: [0, 1] }, { duration: 1.6, ease: [0.25, 1, 0.5, 1] }),
        animate('.intro-right-page', { opacity: [0, 1] }, { duration: 1.6, ease: [0.25, 1, 0.5, 1] }),
        animate('.click-to-open-badge', { opacity: 0, scale: 0.8 }, { duration: 0.3 })
      ]);
      await animate('.intro-book-wrapper', { scale: 1.15, opacity: 0 }, { duration: 0.4, ease: 'easeOut' });`
);

content = content.replace(
  /if \(isMobile\) \{\s+bookRef\.current\.pageFlip\(\)\.turnToPage\(currentPage - 1 > 0 \? currentPage - 1 : 0\);\s+\} else \{\s+\/\/ If we open, jump to page 3 \(first content spread\)\s+setCurrentPage\(3\);\s+bookRef\.current\.pageFlip\(\)\.turnToPage\(0\); \/\/ index 0 is page 3\s+\}/g,
  `setCurrentPage(3);
          bookRef.current.pageFlip().turnToPage(0);`
);

// playIntroSequence
content = content.replace(
  /const coverOffsetX = isMobile \? 0 : -\(dimensions\.wrapperWidth \/ 4\);/g,
  `const coverOffsetX = -(dimensions.wrapperWidth / 4);`
);
content = content.replace(
  /scale: \[0\.6, isMobile \? 1 : 0\.85\],/g,
  `scale: [0.6, 0.85],`
);

// jumpToPage
content = content.replace(
  /if \(isMobile\) \{\s+if \(isPlayingIntro\) setIsPlayingIntro\(false\);\s+if \(bookRef\.current\) bookRef\.current\.pageFlip\(\)\.turnToPage\(pageNumber - 1\);\s+\} else \{\s+if \(pageNumber <= 2\) \{[\s\S]*?\}\s+\}/g,
  `if (pageNumber <= 2) {
        handleCloseBook();
      } else {
        if (isPlayingIntro) setIsPlayingIntro(false);
        if (bookRef.current) {
          const targetIndex = pageNumber % 2 === 1 ? pageNumber - 3 : pageNumber - 4;
          bookRef.current.pageFlip().turnToPage(targetIndex);
        }
      }`
);

// flipbookPages
content = content.replace(
  /const flipbookPages = isMobile \? pages : pages\.slice\(2\);\s+const startPageIndex = isMobile\s+\? Math\.max\(0, currentPage - 1\)\s+: Math\.max\(0, currentPage - 3\);/g,
  `const flipbookPages = pages.slice(2);
  const startPageIndex = Math.max(0, currentPage - 3);`
);

// remove isMobile check for thickness
content = content.replace(
  /if \(isMobile\) return null;/g,
  ``
);

// shadow and border roundness on wrapper
content = content.replace(
  /className=\{\`relative transition-shadow duration-500 \$\{\!isMobile \? 'shadow-\[0_45px_110px_rgba\(0,0,0,0\.85\)\] border border-white\/5 rounded-\[12px\]' : ''\}\`\}/g,
  `className="relative transition-shadow duration-500 shadow-[0_45px_110px_rgba(0,0,0,0.85)] border border-white/5 rounded-[12px]"`
);
content = content.replace(
  /\{\!isMobile && <div className=\"absolute top-0 bottom-0 left-1\/2 -translate-x-1\/2 w-\[16px\] h-full bg-\[linear-gradient\(90deg,rgba\(0,0,0,0\.25\)_0%,rgba\(0,0,0,0\.65\)_50%,rgba\(0,0,0,0\.25\)_100%\)\] z-30 pointer-events-none mix-blend-multiply\" \/>\}/g,
  `<div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[16px] h-full bg-[linear-gradient(90deg,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.65)_50%,rgba(0,0,0,0.25)_100%)] z-30 pointer-events-none mix-blend-multiply" />`
);


// HTMLFlipBook config
content = content.replace(
  /key=\{isMobile \? 'mobile' : 'desktop'\}/g,
  `key="desktop"`
);
content = content.replace(
  /useMouseEvents=\{\!isMobile && zoomScale === 1\}/g,
  `useMouseEvents={zoomScale === 1}`
);
content = content.replace(
  /usePortrait=\{isMobile\}/g,
  `usePortrait={false}`
);
content = content.replace(
  /drawShadow=\{\!isMobile\}/g,
  `drawShadow={true}`
);
content = content.replace(
  /showPageCorners=\{\!isMobile\}/g,
  `showPageCorners={true}`
);
content = content.replace(
  /className=\{\`\$\{isMobile \? '' : 'rounded-\[12px\]'\} overflow-hidden bg-\[\#faf9f6\]\`\}/g,
  `className="rounded-[12px] overflow-hidden bg-[#faf9f6]"`
);


// Image gradient
content = content.replace(
  /\{\!isMobile && \(\s+<div className=\{\`absolute top-0 bottom-0 w-2 pointer-events-none z-15 \$\{index % 2 === 0 \? 'left-0 bg-gradient-to-r from-black\/5' : 'right-0 bg-gradient-to-l from-black\/5'\s+\}\`\} \/>\s+\)\}/g,
  `<div className={\`absolute top-0 bottom-0 w-2 pointer-events-none z-15 \${index % 2 === 0 ? 'left-0 bg-gradient-to-r from-black/5' : 'right-0 bg-gradient-to-l from-black/5'
                                }\`} />`
);

// Cover logic
content = content.replace(
  /\{isMobile \? \([\s\S]*?\} : \(\s+\/\/ Desktop 3D setup/g,
  `{false ? null : (`
);
content = content.replace(
  /width: isMobile \? dimensions\.width : dimensions\.wrapperWidth,/g,
  `width: dimensions.wrapperWidth,`
);
content = content.replace(
  /x: isMobile \? 0 : -\(dimensions\.wrapperWidth \/ 4\),/g,
  `x: -(dimensions.wrapperWidth / 4),`
);


// Ambient background
content = content.replace(
  /\{leftBgImg && \!isMobile &&/g,
  `{leftBgImg &&`
);
content = content.replace(
  /\{rightBgImg && \!isMobile &&/g,
  `{rightBgImg &&`
);
content = content.replace(
  /\{isMobile && leftBgImg && <div className=\"absolute inset-0 opacity-40 blur-\[80px\]\" style=\{\{ backgroundImage: \`url\(\$\{leftBgImg\}\)\`, backgroundSize: 'cover' \}\} \/>\}/g,
  ``
);

// Mobile text replacement in toolbar
content = content.replace(
  /\{isMobile \? \`Page \$\{currentPage\}\` : \`Page \$\{currentPage\} - \$\{Math\.min\(currentPage \+ 1, totalPages\)\}\}/g,
  `\`Page \${currentPage} - \${Math.min(currentPage + 1, totalPages)}\``
);

// Show thumbnails selection highlight
content = content.replace(
  /const isSelected = isMobile \? p\.pageNumber === currentPage : \(p\.pageNumber === currentPage \|\| p\.pageNumber === currentPage \+ 1\);/g,
  `const isSelected = (p.pageNumber === currentPage || p.pageNumber === currentPage + 1);`
);

fs.writeFileSync(file, content, 'utf8');
console.log('done');
