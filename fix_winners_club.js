const fs = require('fs');
const file = 'src/app/clubs/[slug]/winners/ClubWinnersClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix image cropping by using object-contain
content = content.replace(
  /className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" \/>/g,
  'className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />'
);

// 2. Change text-amber-500 to text-foreground (which appears white in dark mode)
content = content.replace(
  /className="text-xs font-bold text-amber-500 uppercase tracking-wider block mb-1"/g,
  'className="text-xs font-bold text-foreground uppercase tracking-wider block mb-1"'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed ClubWinnersClient card');
