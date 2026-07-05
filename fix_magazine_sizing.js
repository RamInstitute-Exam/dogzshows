const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update calculateDimensions for isMobilePortrait
content = content.replace(
  /if \(isMobilePortrait\) \{\s*\/\/ Rotated 90 degrees: available width is height, available height is width\s*const availableW = h \* 0\.98; \/\/ maximize size\s*const availableH = w \* 0\.95; \/\/ maximize size\s*scale = Math\.min\(availableW \/ SPREAD_WIDTH, availableH \/ PAGE_HEIGHT\);/g,
  `if (isMobilePortrait) {
          const availableW = w * 0.98;
          const availableH = h * 0.85; 
          scale = Math.min(availableW / PAGE_WIDTH, availableH / PAGE_HEIGHT);`
);

// 2. Remove rotate: isMobile ? 90 : 0
content = content.replace(/rotate:\s*isMobile \? 90 : 0/g, 'rotate: 0');
content = content.replace(/<ChevronLeft className=\{`w-10 h-10 \$\{isMobile \? 'rotate-90' : ''\}`\} \/>/g, '<ChevronLeft className="w-10 h-10" />');
content = content.replace(/<ChevronRight className=\{`w-10 h-10 \$\{isMobile \? 'rotate-90' : ''\}`\} \/>/g, '<ChevronRight className="w-10 h-10" />');

// 3. Update HTMLFlipBook container width
content = content.replace(
  /className=\{`relative bg-zinc-950 transition-shadow duration-500 rounded-\[12px\] \$\{\n\s*isDesktop \? 'shadow-\[0_45px_110px_rgba\(0,0,0,0\.85\)\] border border-white\/5' : ''\n\s*\}\`\}\n\s*style=\{\{\n\s*width:\s*dimensions\.wrapperWidth,\n\s*height:\s*dimensions\.wrapperHeight,\n\s*\}\}/g,
  `className={\`relative bg-zinc-950 transition-shadow duration-500 rounded-[12px] \${
                isDesktop ? 'shadow-[0_45px_110px_rgba(0,0,0,0.85)] border border-white/5' : ''
              }\`}
              style={{
                width: isMobile ? dimensions.width : dimensions.wrapperWidth,
                height: dimensions.wrapperHeight,
              }}`
);

// 4. Update HTMLFlipBook usePortrait prop
content = content.replace(/usePortrait=\{false\}/g, 'usePortrait={isMobile}');

// Write back
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed mobile sizing and rotation');
