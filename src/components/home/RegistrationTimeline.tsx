'use client';

import { motion } from 'framer-motion';
import { UserPlus, UploadCloud, Cpu, Award, QrCode } from 'lucide-react';

const STEPS = [
  { title: 'Create Profile', desc: 'Sign up and add your dog.', icon: UserPlus },
  { title: 'Upload KCI', desc: 'Securely upload your KCI certificate.', icon: UploadCloud },
  { title: 'AI OCR Extraction', desc: 'Our AI instantly extracts breed and owner data.', icon: Cpu },
  { title: 'Get QR Pass', desc: 'Pay online and receive a digital pass.', icon: QrCode },
  { title: 'Compete & Win', desc: 'Track your live bracket to victory.', icon: Award },
];

export default function RegistrationTimeline() {
  return (
    <section className="pt-8 lg:pt-10 pb-12 lg:pb-16 bg-background border-y border-border relative overflow-hidden">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        
        <div className="text-center mb-8 sm:mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 sm:mb-6">
            The Fastest Path to the Ring
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Say goodbye to paper forms. Experience our seamless 5-step registration powered by advanced OCR and instant QR generation.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting Line - Only visible on LG */}
          <div className="hidden lg:block absolute top-[40px] left-0 w-full h-1 bg-accent rounded-full" />
          <div className="hidden lg:block absolute top-[40px] left-0 w-2/3 h-1 bg-foreground rounded-full" />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {STEPS.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="luxury-card relative flex flex-col items-center text-center p-4 sm:p-6 group h-full"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-[3px] relative z-10 mb-3 sm:mb-6 transition-transform hover:scale-110 shrink-0 ${
                  i < 3 ? 'bg-foreground border-transparent text-white shadow-sm' : 'bg-accent border-border text-muted-foreground'
                }`}>
                  <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-[15px] sm:text-base font-bold text-foreground mb-1 sm:mb-2 leading-tight">{step.title}</h3>
                <p className="text-muted-foreground text-[12px] sm:text-[13px] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
