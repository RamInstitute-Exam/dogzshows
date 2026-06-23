const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedCount = 0;

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.tsx')) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Check if file has standard <img tags
  if (content.includes('<img ')) {
    // Replace <img with <OptimizedImage
    content = content.replace(/<img /g, '<OptimizedImage ');
    // Replace </img> with </OptimizedImage>
    content = content.replace(/<\/img>/g, '</OptimizedImage>');

    // Add import statement at the top if not present
    if (!content.includes('OptimizedImage')) {
      // This case shouldn't hit because we just replaced <img with <OptimizedImage
    }
    
    if (!content.includes("import OptimizedImage from '@/components/shared/OptimizedImage'")) {
       // Insert after the last import, or at the top
       const lines = content.split('\n');
       let lastImportIndex = -1;
       for (let i = 0; i < lines.length; i++) {
         if (lines[i].startsWith('import ')) {
           lastImportIndex = i;
         }
       }
       
       const importLine = "import OptimizedImage from '@/components/shared/OptimizedImage';";
       if (lastImportIndex !== -1) {
         lines.splice(lastImportIndex + 1, 0, importLine);
       } else {
         lines.unshift(importLine);
       }
       content = lines.join('\n');
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
      modifiedCount++;
    }
  }
});

console.log(`Done! Modified ${modifiedCount} files.`);
