const fs = require('fs');
const path = require('path');

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // If we find a directory like __next.clubs
      if (entry.name.startsWith('__next.')) {
        const pageTxtPath = path.join(fullPath, '__PAGE__.txt');
        if (fs.existsSync(pageTxtPath)) {
          // Copy to __next.clubs.__PAGE__.txt in the parent directory
          const newFileName = `${entry.name}.__PAGE__.txt`;
          const newFilePath = path.join(dir, newFileName);
          fs.copyFileSync(pageTxtPath, newFilePath);
        }
      }
      // Recursively process subdirectories
      processDir(fullPath);
    }
  }
}

const outDir = path.join(__dirname, 'out');
processDir(outDir);
console.log('✅ Successfully mapped Next.js RSC payload files for Firebase Hosting');
