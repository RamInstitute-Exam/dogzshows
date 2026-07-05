const fs = require('fs');

// 1. Hide Contact FAQs
const contactFile = 'src/app/contact/ContactClient.tsx';
let contactContent = fs.readFileSync(contactFile, 'utf8');
contactContent = contactContent.replace(
  /\{\/\* FAQ Section \*\/\}\s*<div className="max-w-4xl mx-auto">/g,
  '{/* FAQ Section */}\n        <div className="hidden max-w-4xl mx-auto">'
);
fs.writeFileSync(contactFile, contactContent, 'utf8');

// 2. Hide Home FAQs
const faqFile = 'src/components/home/FAQ.tsx';
let faqContent = fs.readFileSync(faqFile, 'utf8');
faqContent = faqContent.replace(
  /export default function FAQ\(\) \{[\s\S]*?return \(/g,
  'export default function FAQ() {\n  return null;\n  return ('
);
fs.writeFileSync(faqFile, faqContent, 'utf8');

// 3. Hide Event FAQs
const eventFaqFile = 'src/components/events/details/EventFAQs.tsx';
let eventFaqContent = fs.readFileSync(eventFaqFile, 'utf8');
eventFaqContent = eventFaqContent.replace(
  /export default function EventFAQs\(\{ faqs \}: \{ faqs: any\[\] \}\) \{/g,
  'export default function EventFAQs({ faqs }: { faqs: any[] }) {\n  return null;'
);
fs.writeFileSync(eventFaqFile, eventFaqContent, 'utf8');

console.log('Hidden all FAQs');
