const fs = require('fs');
const file = 'src/components/Footer.tsx';
let content = fs.readFileSync(file, 'utf8');

// Filter quickLinks (to hide About)
content = content.replace(
  /const quickLinks = footerData\?\.quickLinks \|\| \[([\s\S]*?)\];/g,
  'const quickLinks = (footerData?.quickLinks || [$1]).filter((l: any) => l.label?.toLowerCase() !== \'about\');'
);

// Hide the entire SUPPORT section
content = content.replace(
  /\{\/\* SECTION 3: SUPPORT \*\/\}\s*<div className="bg-card dark:bg-\[#0A0A0A\] border border-border rounded-\[24px\] p-\[32px\] flex flex-col items-start w-full min-h-\[280px\] transition-all duration-300 hover:-translate-y-\[6px\] hover:shadow-\[0_20px_60px_rgba\(0,0,0,0\.1\)\] dark:hover:shadow-\[0_20px_60px_rgba\(0,0,0,0\.4\)\]">/g,
  '{/* SECTION 3: SUPPORT */}\n          <div className="hidden bg-card dark:bg-[#0A0A0A] border border-border rounded-[24px] p-[32px] flex-col items-start w-full min-h-[280px] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">'
);

// Change grid-cols-3 to grid-cols-2 so it balances beautifully when SUPPORT is hidden
content = content.replace(
  /className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 items-start w-full"/g,
  'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 items-start w-full"'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Hidden SUPPORT section entirely and About link');
