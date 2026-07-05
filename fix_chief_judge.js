const fs = require('fs');
const file = 'src/components/events/details/EventJudges.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove the Chief Judge badge
content = content.replace(
  /\{\/\* Chief Judge badge \*\/\}\s*\{judge\?\.isChiefJudge && \(\s*<div className="mt-3 inline-block px-3 py-1 bg-foreground text-background font-bold text-xs rounded-full">\s*Chief Judge\s*<\/div>\s*\)\}/g,
  ''
);

fs.writeFileSync(file, content, 'utf8');
console.log('Removed Chief Judge badges');
