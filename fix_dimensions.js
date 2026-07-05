const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /setDimensions\(\{\s*width:\s*PAGE_WIDTH,\s*height:\s*PAGE_HEIGHT,\s*wrapperWidth:\s*SPREAD_WIDTH,\s*wrapperHeight:\s*PAGE_HEIGHT,?\s*\}\);/g,
  `setDimensions({
          width:         PAGE_WIDTH * scale,
          height:        PAGE_HEIGHT * scale,
          wrapperWidth:  SPREAD_WIDTH * scale,
          wrapperHeight: PAGE_HEIGHT * scale,
        });`
);

fs.writeFileSync(file, content, 'utf8');
console.log('done');
