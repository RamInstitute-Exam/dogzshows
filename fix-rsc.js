const fs = require('fs');
const path = require('path');

// Recursively find all files in a directory
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  let filesArray = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      filesArray = getAllFiles(path.join(dirPath, file), filesArray);
    } else {
      filesArray.push(path.join(dirPath, file));
    }
  });
  return filesArray;
}

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (entry.name.startsWith('__next.')) {
        // This is an RSC payload root folder
        const allTxtFiles = getAllFiles(fullPath).filter(f => f.endsWith('.txt'));
        
        for (const txtFile of allTxtFiles) {
          // Get relative path from the directory containing __next.*
          const relativePath = path.relative(dir, txtFile);
          
          // Replace all OS-specific separators with dots to match Next.js client request format
          const flattenedName = relativePath.split(path.sep).join('.');
          
          // Next.js client requests format: __next.winners.categories.$d$slug.__PAGE__.txt
          // So if relativePath is `__next.winners\categories\$d$slug\__PAGE__.txt`
          // flattenedName will be `__next.winners.categories.$d$slug.__PAGE__.txt`
          
          const newFilePath = path.join(dir, flattenedName);
          
          // Copy the file to the flattened location
          fs.copyFileSync(txtFile, newFilePath);
        }
      }
      
      // Recursively process subdirectories
      processDir(fullPath);
    }
  }
}

const outDir = path.join(__dirname, 'out');
processDir(outDir);
console.log('✅ Successfully mapped nested Next.js RSC payload files for Firebase Hosting');
