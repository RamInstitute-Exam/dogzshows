const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<\/motion\.div>\s*\{\/\* Tap-to-skip hint \*\/\}/g,
  `</motion.div>\n            </div>\n\n            {/* Tap-to-skip hint */}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax error by actually placing the closing div');
