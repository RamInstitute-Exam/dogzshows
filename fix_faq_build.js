const fs = require('fs');
const file = 'src/components/home/FAQ.tsx';
let content = fs.readFileSync(file, 'utf8');

// Restore the useState declaration
content = content.replace(
  /export default function FAQ\(\) \{\n  return null;\n  return \(\n    <section/g,
  'export default function FAQ() {\n  return null;\n  const [openIndex, setOpenIndex] = useState<number | null>(0);\n  return (\n    <section'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed FAQ.tsx build error');
