const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change setCurrentPage(3) to setCurrentPage(2) globally
content = content.replace(/setCurrentPage\(3\)/g, 'setCurrentPage(2)');

// 2. Change startPage={currentPage - 3} to startPage={currentPage - 2}
content = content.replace(/startPage=\{currentPage - 3\}/g, 'startPage={currentPage - 2}');

// 3. Change pages.slice(2) to pages.slice(1)
content = content.replace(/pages\.slice\(2\)/g, 'pages.slice(1)');

// 4. Update the intro 3D pages
content = content.replace(
  /\{pages\[2\] && <Image src=\{getOriginalUrl\(pages\[2\]\.imageUrl\)\} alt=\"L\"/g, 
  '{pages[1] && <Image src={getOriginalUrl(pages[1].imageUrl)} alt="L"'
);

content = content.replace(
  /\{pages\[3\] && <Image src=\{getOriginalUrl\(pages\[3\]\.imageUrl\)\} alt=\"R\"/g, 
  '{pages[2] && <Image src={getOriginalUrl(pages[2].imageUrl)} alt="R"'
);

content = content.replace(
  /\{pages\[2\] && <Image src=\{getOriginalUrl\(pages\[2\]\.imageUrl\)\} alt=\"IC\"/g, 
  '{pages[1] && <Image src={getOriginalUrl(pages[1].imageUrl)} alt="IC"'
);

// 5. Update onFlip logic:
content = content.replace(/setCurrentPage\(e\.data \+ 3\)/g, 'setCurrentPage(e.data + 2)');

// 6. Update jumpToPage target targetIndex logic
content = content.replace(
  /const targetIndex = pageNumber % 2 === 1 \? pageNumber - 3 : pageNumber - 4;/g,
  'const targetIndex = pageNumber % 2 === 0 ? pageNumber - 2 : pageNumber - 3;'
);

// 7. handlePrev logic for close book
content = content.replace(
  /if \(\!isMobile && currentPage <= 3\) \{/g,
  'if (!isMobile && currentPage <= 2) {'
);

fs.writeFileSync(file, content, 'utf8');
console.log('done');
