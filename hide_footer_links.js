const fs = require('fs');
const file = 'src/components/Footer.tsx';
let content = fs.readFileSync(file, 'utf8');

// Filter quickLinks
content = content.replace(
  /const quickLinks = footerData\?\.quickLinks \|\| \[([\s\S]*?)\];/g,
  'const quickLinks = (footerData?.quickLinks || [$1]).filter((l: any) => l.label?.toLowerCase() !== \'about\');'
);

// Filter supportLinks
content = content.replace(
  /const supportLinks = footerData\?\.resources \|\| \[([\s\S]*?)\];/g,
  'const supportLinks = (footerData?.resources || [$1]).filter((l: any) => ![\'help center\', \'terms & conditions\', \'privacy policy\'].includes(l.label?.toLowerCase()));'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Filtered out requested footer links');
