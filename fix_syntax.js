const fs = require('fs');
const file = 'src/app/e-magazines/[slug]/MagazineViewerClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the bad </div> I injected at the very end
content = content.replace(
  /<\/motion\.div>\n\s*<\/div>\n\s*\}\)\n\s*<\/AnimatePresence>/g,
  `</motion.div>\n        )}\n      </AnimatePresence>`
);

// 2. Add the correct </div> right before the tap-to-skip hint
content = content.replace(
  /(\s*)<\/motion\.div>\n\s*\{\/\* Tap-to-skip hint \*\/\}/g,
  `$1</motion.div>\n$1</div>\n\n            {/* Tap-to-skip hint */}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax error by placing closing div in correct location');
