const fs = require('fs');

// 1. Hide in JudgesClient.tsx
const judgesFile = 'src/app/judges/JudgesClient.tsx';
let judgesContent = fs.readFileSync(judgesFile, 'utf8');
judgesContent = judgesContent.replace(
  /\{\s*judge\.source && \(\s*<p className="text-\[10px\] text-muted-foreground\/70 italic truncate w-full text-center" title=\{judge\.source\}>\s*Source - \{judge\.source\}\s*<\/p>\s*\)\s*\}/g,
  '{/* Source hidden */}'
);
fs.writeFileSync(judgesFile, judgesContent, 'utf8');

// 2. Hide in JudgeDetailClient.tsx
const detailFile = 'src/app/judge-details/JudgeDetailClient.tsx';
let detailContent = fs.readFileSync(detailFile, 'utf8');
detailContent = detailContent.replace(
  /<div className="mt-5 pt-4 border-t border-border">\s*<p className="text-\[11px\] text-muted-foreground italic leading-relaxed">\s*Source - \{judge\.source\}\s*<\/p>\s*<\/div>/g,
  '{/* Source hidden */}'
);
fs.writeFileSync(detailFile, detailContent, 'utf8');

console.log('Hidden Judge Source texts correctly');
