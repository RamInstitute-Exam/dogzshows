const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change fake left page from pages[2] to pages[1]
content = content.replace(
  /\{pages\[2\] && \(\s*<Image\s*src=\{getOriginalUrl\(pages\[2\]\.imageUrl\)\}/g,
  '{pages[1] && (\n                  <Image\n                    src={getOriginalUrl(pages[1].imageUrl)}'
);

// 2. Change fake right page from pages[3] to pages[2]
content = content.replace(
  /\{pages\[3\] && \(\s*<Image\s*src=\{getOriginalUrl\(pages\[3\]\.imageUrl\)\}/g,
  '{pages[2] && (\n                  <Image\n                    src={getOriginalUrl(pages[2].imageUrl)}'
);

// 3. Update the comments for clarity
content = content.replace(/\{\/\* Inside Left Page \(Page 3\) \*\/\}/g, '{/* Inside Left Page (Page 1) */}');
content = content.replace(/\{\/\* Inside Right Page \(Page 4\) \*\/\}/g, '{/* Inside Right Page (Page 2) */}');

// 4. Update handleOpenBook to turnToPage(1) instead of turnToPage(0)
content = content.replace(
  /bookRef\.current\.pageFlip\(\)\.turnToPage\(0\);/g,
  'bookRef.current.pageFlip().turnToPage(1);'
);

// 5. Also replace turnToPage(currentPage - 1) if it exists anywhere else
content = content.replace(
  /bookRef\.current\.pageFlip\(\)\.turnToPage\(currentPage - 1\);/g,
  'bookRef.current.pageFlip().turnToPage(1);'
);


fs.writeFileSync(file, content, 'utf8');
console.log('Fixed magazine intro pages');
