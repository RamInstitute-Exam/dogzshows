const fs = require('fs');
const content = fs.readFileSync('src/app/e-magazines/[slug]/MagazineViewerClient.tsx', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('Floating Left Control'));
if (start !== -1) {
  console.log(lines.slice(start - 10, start + 30).join('\n'));
} else {
  console.log('Not found');
}
