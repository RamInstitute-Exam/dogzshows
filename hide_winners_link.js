const fs = require('fs');
const file = 'src/components/home/FeaturedWinnersSlider.tsx';
let content = fs.readFileSync(file, 'utf8');

// Hide View All Winners Link
content = content.replace(
  /\{(\/\* View All Winners Link \*\/[\s\S]*?)<div className="flex justify-end pt-2">/g,
  '{/* $1 */}\n      <div className="hidden flex justify-end pt-2">'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Hidden View All Winners link');
