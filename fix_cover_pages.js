const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove bg-[#faf9f6] from HTMLFlipBook
content = content.replace(
  /className="rounded-\[12px\] overflow-hidden bg-\[#faf9f6\]"/g,
  'className="rounded-[12px] overflow-hidden bg-transparent"'
);

// 2. Add autoShiftX and autoShiftY calculations
const shiftLogic = `
  // Calculate dynamic shifts to center the single cover pages
  let autoShiftX = 0;
  let autoShiftY = 0;
  if (!isOpening) {
    if (currentPage === 1) {
      const shift = (dimensions.width / 4) * zoomScale;
      if (isMobile) {
        autoShiftY = -shift;
      } else {
        autoShiftX = -shift;
      }
    } else if (currentPage >= totalPages) {
      const shift = (dimensions.width / 4) * zoomScale;
      if (isMobile) {
        autoShiftY = shift;
      } else {
        autoShiftX = shift;
      }
    }
  }
`;

content = content.replace(
  /\{\/\*\s*Book Perspective Zoom Scale Frame\s*\*\/\}/g,
  shiftLogic + '\n          {/* Book Perspective Zoom Scale Frame */}'
);

// 3. Apply the shift to motion.div
content = content.replace(
  /x: panOffset\.x,/g,
  'x: panOffset.x + autoShiftX,'
);

content = content.replace(
  /y: panOffset\.y,/g,
  'y: panOffset.y + autoShiftY,'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Applied cover page centering and transparent background');
