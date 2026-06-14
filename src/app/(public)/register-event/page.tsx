'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight, QrCode, CreditCard, Dog, Calendar } from 'lucide-react';

export default function EventRegistrationWorkflow() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { num: 1, title: 'Choose Event', icon: Calendar },
    { num: 2, title: 'Select Dog', icon: Dog },
    { num: 3, title: 'Validation', icon: CheckCircle2 },
    { num: 4, title: 'Payment', icon: CreditCard },
    { num: 5, title: 'QR Pass', icon: QrCode },
  ];

  const handleNext = () => {
    if (step === 4) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setStep(5);
      }, 2000);
    } else {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  return (
    <div className="min-h-fit bg-background pt-8 lg:pt-10 pb-12 lg:pb-16">
      
      <div className="pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h1 className="text-muted-foregroundxl font-extrabold text-foreground tracking-tight mb-4">Event Registration</h1>
            <p className="text-muted-foreground">Secure your spot in the upcoming championship.</p>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-16">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-brand-orange -translate-y-1/2 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            />
            
            <div className="relative flex justify-between">
              {steps.map((s, i) => {
                const isActive = step === s.num;
                const isPassed = step > s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${
                      isActive ? 'bg-brand-orange border-orange-100 text-foreground' : 
                      isPassed ? 'bg-green-500 border-green-100 text-foreground' : 'bg-card border-border text-muted-foreground'
                    }`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <span className={`absolute -bottom-8 text-xs font-bold whitespace-nowrap ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-card rounded-[2rem] p-8 shadow-sm border border-border min-h-[400px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-bold mb-6">Select an Event</h3>
                  <div className="space-y-4">
                    {['National Specialty Show 2026', 'Winter Classic Championship'].map((event, i) => (
                      <div key={i} className="p-4 border-2 border-border rounded-2xl hover:border-brand-orange cursor-pointer transition-colors flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-brand-orange" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{event}</p>
                          <p className="text-sm text-muted-foreground">Mumbai, IN • Oct 15, 2026</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-bold mb-6">Select Your Dog</h3>
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-brand-orange bg-orange-50/50 rounded-2xl cursor-pointer transition-colors flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <img src="/images/hero_banner.png" alt="Dog" className="w-12 h-12 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-foreground">Sir Maximus</p>
                          <p className="text-sm text-muted-foreground">Golden Retriever • KCI-2023-4589</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-brand-orange" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-bold mb-6">Eligibility Validation</h3>
                  <div className="bg-card rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                      <span className="text-muted-foreground font-medium">Breed Validation</span>
                      <span className="text-green-600 font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Passed</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-4">
                      <span className="text-muted-foreground font-medium">FCI Group Assigment</span>
                      <span className="text-foreground font-bold">Group 8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Calculated Class</span>
                      <span className="text-foreground font-bold">Intermediate (18-36 mo)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-bold mb-6">Payment Gateway</h3>
                  <div className="p-6 border-2 border-border rounded-2xl text-center">
                    <p className="text-muted-foreground mb-2">Total Entry Fee</p>
                    <p className="text-muted-foregroundxl font-extrabold text-foreground mb-6">₹1,500</p>
                    
                    <Button 
                      className="w-full h-14 text-lg font-bold bg-card hover:bg-foreground text-background rounded-xl flex items-center justify-center gap-2"
                      disabled={isProcessing}
                      onClick={handleNext}
                    >
                      {isProcessing ? 'Processing via Razorpay...' : 'Pay with Razorpay'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-muted-foregroundxl font-extrabold text-foreground mb-2">Registration Complete!</h3>
                  <p className="text-muted-foreground mb-8">Your QR Pass and Receipt have been sent via WhatsApp and Email.</p>
                  
                  <div className="max-w-xs mx-auto bg-card p-6 rounded-2xl border border-border">
                    <QrCode className="w-32 h-32 mx-auto text-foreground mb-4" />
                    <p className="text-sm font-bold text-foreground tracking-widest">SN: JUZ-98421-26</p>
                  </div>
                  
                  <Button variant="outline" className="mt-8 font-bold border-border rounded-full px-8">Download PDF Pass</Button>
                </motion.div>
              )}
            </AnimatePresence>

            {step < 4 && (
              <div className="mt-8 flex justify-end pt-6 border-t border-border">
                <Button onClick={handleNext} className="bg-brand-orange hover:bg-orange-600 rounded-full px-8 shadow-sm">
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
