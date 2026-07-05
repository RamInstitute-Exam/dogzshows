const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// The block to move
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

// 1. Remove the broken block from the JSX
content = content.replace(
  /\n\s*\/\/ Calculate dynamic shifts to center the single cover pages[\s\S]*?}\n\s*}/,
  ''
);

// Wait, the regex might be tricky. Let's just do a string replacement for the exact text.
const textToRemove = `
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
  }`;

content = content.replace(textToRemove, '');

// 2. Insert the shiftLogic just before the main return statement
content = content.replace(
  /\n  return \(\n    <div\n      ref={viewerRef}/,
  `\n${shiftLogic}\n\n  return (\n    <div\n      ref={viewerRef}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed build error by moving JS logic out of JSX');
