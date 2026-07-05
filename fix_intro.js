const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace hardcoded -250 with responsive centering offset
// 1/4th of the wrapper width exactly centers the right page (cover)
const offsetStr = '-(dimensions.wrapperWidth / 4)';

content = content.replace(
  /\{ x: -250, scale: 0\.85, opacity: 1 \}/g,
  `{ x: ${offsetStr}, scale: 0.85, opacity: 1 }`
);

content = content.replace(
  /\{ x: \[-250, 0\], scale: \[0\.85, 1\] \}/g,
  `{ x: [${offsetStr}, 0], scale: [0.85, 1] }`
);

content = content.replace(
  /x: -250, \/\/ Shifted left/g,
  `x: ${offsetStr}, // Shifted left`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed intro animation positioning');
