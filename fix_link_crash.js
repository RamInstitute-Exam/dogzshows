const fs = require('fs');
const file = 'src/components/home/FeaturedWinnersSlider.tsx';
let content = fs.readFileSync(file, 'utf8');

// Restore the content of the Link
content = content.replace(
  /\{\/\* View All Winners <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" \/> \*\/\}/g,
  'View All Winners <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Restored Link content to fix React crash');
