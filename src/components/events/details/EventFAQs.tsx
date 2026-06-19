'use client';

import { motion } from 'framer-motion';

export default function EventFAQs({ faqs }: { faqs: any[] }) {
  // Guard: hide section if no FAQs
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="bg-card rounded-[20px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-50 mb-[80px]">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8">Frequently Asked Questions</h2>
      
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <motion.details 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group bg-card rounded-[16px] p-6 cursor-pointer border border-border hover:border-brand-orange/30 transition-colors"
          >
            <summary className="flex items-center justify-between font-bold text-foreground text-lg">
              {faq.question}
              <span className="transition-transform duration-300 group-open:rotate-180 bg-card shadow-sm rounded-full p-1 text-muted-foreground">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-muted-foreground leading-relaxed font-medium">
                {faq.answer}
              </p>
            </div>
          </motion.details>
        ))}
      </div>
    </div>
  );
}
