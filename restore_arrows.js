const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<ChevronLeft className="w-10 h-10" \/>/g,
  '<ChevronLeft className={`w-10 h-10 ${isMobile ? \'rotate-90\' : \'\'}`} />'
);

content = content.replace(
  /<ChevronRight className="w-10 h-10" \/>/g,
  '<ChevronRight className={`w-10 h-10 ${isMobile ? \'rotate-90\' : \'\'}`} />'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Restored rotate-90 to Chevron arrows for mobile');
