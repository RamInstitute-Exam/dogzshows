const fs = require('fs');

// 1. Hide in JudgesClient.tsx
const judgesFile = 'src/app/judges/JudgesClient.tsx';
let judgesContent = fs.readFileSync(judgesFile, 'utf8');
judgesContent = judgesContent.replace(
  /\{\s*judge\.source && \(\s*<div className="mt-4 text-center text-\[10px\] text-muted-foreground\/60 italic">\s*Source - \{judge\.source\}\s*<\/div>\s*\)\s*\}/g,
  '{/* {judge.source && (<div className="mt-4 text-center text-[10px] text-muted-foreground/60 italic">Source - {judge.source}</div>)} */}'
);
fs.writeFileSync(judgesFile, judgesContent, 'utf8');

// 2. Hide in JudgeDetailClient.tsx
const detailFile = 'src/app/judge-details/JudgeDetailClient.tsx';
let detailContent = fs.readFileSync(detailFile, 'utf8');
detailContent = detailContent.replace(
  /\{\s*judge\.source && \(\s*<div className="mt-6 text-center text-xs text-muted-foreground\/60 italic">\s*Source - \{judge\.source\}\s*<\/div>\s*\)\s*\}/g,
  '{/* {judge.source && (<div className="mt-6 text-center text-xs text-muted-foreground/60 italic">Source - {judge.source}</div>)} */}'
);
fs.writeFileSync(detailFile, detailContent, 'utf8');

console.log('Hidden Judge Source texts');
