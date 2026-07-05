const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove Gold edge lighting/sheen
content = content.replace(
  /\{\/\* Gold edge lighting\/sheen \*\/\}\s*<div\s*className="absolute inset-y-0 w-\[2\.5px\] z-30 pointer-events-none"\s*style=\{\{[\s\S]*?\}\}\s*\/>/g,
  ''
);

// Remove Spine crease shadow
content = content.replace(
  /\{\/\* Spine crease shadow \*\/\}\s*<div\s*className="absolute inset-y-0 w-\[45px\] z-30 pointer-events-none mix-blend-multiply"\s*style=\{\{[\s\S]*?\}\}\s*\/>/g,
  ''
);

fs.writeFileSync(file, content, 'utf8');
console.log('done');
