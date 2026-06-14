'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  { q: 'How does the OCR Certificate extraction work?', a: 'When you upload a KCI Certificate PDF or JPG, our AI immediately scans the document to pull the Dog Name, KCI Number, Microchip, and DOB. You can manually adjust the values before confirming.' },
  { q: 'Can I change my dogs FCI Group?', a: 'No, FCI Groups are rigidly mapped to official breeds by the Platform Admin. If your dog is a Golden Retriever, it will automatically be placed in Group 8.' },
  { q: 'How do I receive my Event QR Pass?', a: 'Once your Razorpay transaction clears, the system automatically emails you the PDF pass and sends the QR code directly to your WhatsApp.' },
  { q: 'Is the judge scoring live?', a: 'Yes! As soon as a judge inputs the winner on their tablet, the competition bracket updates instantly across the global network.' }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="pt-8 lg:pt-10 pb-12 lg:pb-16 bg-[#071225]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">Everything you need to know about the JuzDog platform.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`border rounded-[1.5rem] transition-colors duration-300 ${isOpen ? 'border-brand-orange bg-brand-orange/10' : 'border-border bg-card hover:border-border'}`}
              >
                <button 
                  className="w-full flex justify-between items-center p-6 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span className="font-bold text-lg text-foreground">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-brand-orange text-foreground' : 'bg-[#071225] text-muted-foreground'}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
