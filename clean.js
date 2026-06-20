const fs = require('fs');
const path = require('path');

function clean(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (!fs.existsSync(fullPath)) continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      clean(fullPath);
    } else if (file === 'page.tsx') {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Module Under Construction')) {
        try {
          fs.rmSync(path.dirname(fullPath), { recursive: true, force: true });
          console.log('Deleted:', path.dirname(fullPath));
        } catch (e) {
          console.error('Failed to delete:', path.dirname(fullPath), e.message);
        }
      }
    }
  }
}

clean('d:\bala backend/frontend/src/app/(admin)/admin');
