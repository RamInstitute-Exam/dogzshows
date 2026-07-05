const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace x: -250 with x: -(dimensions.wrapperWidth / 4)
content = content.replace(/x:\s*\[\s*-250,\s*0\s*\]/g, 'x: [-(dimensions.wrapperWidth / 4), 0]');
content = content.replace(/x:\s*-250/g, 'x: -(dimensions.wrapperWidth / 4)');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed mobile intro x-shift');
