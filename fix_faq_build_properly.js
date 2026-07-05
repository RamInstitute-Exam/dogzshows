const fs = require('fs');
const file = 'src/components/home/FAQ.tsx';
let content = fs.readFileSync(file, 'utf8');

// Restore the useState declaration using a more robust regex for newlines
content = content.replace(
  /export default function FAQ\(\) \{\r?\n\s*return null;\r?\n\s*return \(/g,
  'export default function FAQ() {\n  return null;\n  const [openIndex, setOpenIndex] = useState<number | null>(0);\n  return ('
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed FAQ.tsx build error properly');
