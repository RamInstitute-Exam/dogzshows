const fs = require('fs');
const file = 'src/components/Footer.tsx';
let content = fs.readFileSync(file, 'utf8');

// Filter Twitter from socialLinks
content = content.replace(
  /const socialLinks = footerData\?\.socialLinks \|\| \[([\s\S]*?)\];/g,
  'const socialLinks = (footerData?.socialLinks || [$1]).filter((l: any) => l.name?.toLowerCase() !== \'twitter\');'
);

// Hide Login Button
content = content.replace(
  /<Link\n              href="\/login"\n              className="w-full sm:w-auto mt-4 sm:mt-0 bg-primary/g,
  '<Link\n              href="/login"\n              className="hidden w-full sm:w-auto mt-4 sm:mt-0 bg-primary'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Hidden Twitter and Login');
