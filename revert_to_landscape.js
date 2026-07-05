const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Revert calculateDimensions to use SPREAD_WIDTH and original H/W logic for rotation
content = content.replace(
  /if \(isMobilePortrait\) \{\s*const availableW = w \* 0\.98;\s*const availableH = h \* 0\.85;\s*scale = Math\.min\(availableW \/ PAGE_WIDTH, availableH \/ PAGE_HEIGHT\);\s*setIsMobile\(true\);\s*setIsDesktop\(false\);\s*\}/g,
  `if (isMobilePortrait) {
          // Rotated 90 degrees: available width is height, available height is width
          const availableW = h * 0.98; // maximize size
          const availableH = w * 0.95; // maximize size
          scale = Math.min(availableW / SPREAD_WIDTH, availableH / PAGE_HEIGHT);
          setIsMobile(true);
          setIsDesktop(false);
        }`
);

// 2. Revert HTMLFlipBook usePortrait
content = content.replace(/usePortrait=\{isMobile\}/g, 'usePortrait={false}');

// 3. Revert HTMLFlipBook width to dimensions.wrapperWidth
content = content.replace(
  /width: isMobile \? dimensions\.width : dimensions\.wrapperWidth,/g,
  'width: dimensions.wrapperWidth,'
);

// 4. Revert rotate: 0 to rotate: isMobile ? 90 : 0 in main motion.div
content = content.replace(
  /animate=\{\{\s*scale: zoomScale,\s*rotate: 0,\s*x: panOffset\.x,\s*y: panOffset\.y,\s*\}\}/g,
  `animate={{
              scale: zoomScale,
              rotate: isMobile ? 90 : 0,
              
              x: panOffset.x,
              y: panOffset.y,
            }}`
);

// 5. Wrap intro-book-wrapper in a rotated container
// Look for className="intro-book-wrapper relative cursor-pointer shrink-0"
content = content.replace(
  /<motion\.div\s*className="intro-book-wrapper relative cursor-pointer shrink-0"/g,
  `<div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: isMobile ? 'rotate(90deg)' : 'none' }}>
            <motion.div
              className="intro-book-wrapper relative cursor-pointer shrink-0 pointer-events-auto"`
);

// Find the closing tag of intro-book-wrapper and add the closing div for the new wrapper
// It ends with:
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
// We need to inject </div> after </motion.div> of intro-book-wrapper.
// The intro-book-wrapper ends right before `)}` and `</AnimatePresence>`.
content = content.replace(
  /(\s*)<\/motion\.div>\n\s*\}\)\n\s*<\/AnimatePresence>/g,
  `$1</motion.div>\n$1</div>\n        )}\n      </AnimatePresence>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Reverted to landscape rotated layout');
