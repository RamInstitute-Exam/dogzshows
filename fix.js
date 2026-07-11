const fs = require('fs');
const file = 'src/app/admin/entries/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');
content = content.replace(/\\\\n/g, '\\n');
fs.writeFileSync(file, content);
console.log('Fixed syntax escapes in ' + file);
