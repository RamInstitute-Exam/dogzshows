const fs = require('fs');

// 1. Hide Event Snapshot
const heroFile = 'src/components/events/details/EventHero.tsx';
let heroContent = fs.readFileSync(heroFile, 'utf8');
heroContent = heroContent.replace(
  /className="hidden lg:block w-\[340px\] rounded-\[24px\] p-7 shadow-2xl relative overflow-hidden shrink-0"/g,
  'className="hidden w-[340px] rounded-[24px] p-7 shadow-2xl relative overflow-hidden shrink-0"'
);
fs.writeFileSync(heroFile, heroContent, 'utf8');
console.log('Hidden Event Snapshot');

// 2. Remove Guest Judge badge
const judgesFile = 'src/components/events/details/EventJudges.tsx';
let judgesContent = fs.readFileSync(judgesFile, 'utf8');
judgesContent = judgesContent.replace(
  /\{\/\* Guest Judge badge \*\/\}\s*\{judge\?\.isCustom && \(\s*<div className="mt-3 inline-block px-3 py-1 bg-accent text-foreground font-bold text-xs rounded-full border border-border">\s*Guest Judge\s*<\/div>\s*\)\}/g,
  ''
);
fs.writeFileSync(judgesFile, judgesContent, 'utf8');
console.log('Removed Guest Judge badges');
