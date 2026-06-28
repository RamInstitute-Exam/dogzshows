const fs = require('fs');
const path = require('path');

const srcAppPath = path.join(__dirname, '../src/app');

function findFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findFiles(fullPath, files);
    } else if (fullPath.endsWith('page.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const pageFiles = findFiles(srcAppPath);

let modified = 0;
for (const file of pageFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  // Case 1: export { ... as generateStaticParams };
  if (content.includes('as generateStaticParams')) {
    content = content.replace(/import\s+\{\s*([a-zA-Z0-9_]+)\s*\}\s+from\s+['"]@\/lib\/staticParams['"];?\n?/g, '');
    content = content.replace(/export\s+\{\s*([a-zA-Z0-9_]+)\s+as\s+generateStaticParams\s*\};?\n?/g, 'export const dynamic = "force-dynamic";\n');
  }
  
  // Case 2: export async function generateStaticParams() { ... }
  if (content.includes('export async function generateStaticParams()')) {
    const regex = /export\s+async\s+function\s+generateStaticParams\(\)\s*\{[\s\S]*?\n\}\n?/g;
    content = content.replace(regex, 'export const dynamic = "force-dynamic";\n');
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Updated', file);
    modified++;
  }
}

console.log(`Updated ${modified} files.`);
