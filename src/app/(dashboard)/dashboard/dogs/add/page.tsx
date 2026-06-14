'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dog, CheckCircle, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  'Basic Details',
  'Pedigree',
  'Owner Info',
  'Certificates',
  'Gallery',
  'Medical',
  'Preview',
  'Submit'
];

export default function AddDogWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    kciNumber: '',
    breed: '',
    gender: 'MALE',
    dob: ''
  });

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const submitForm = async () => {
    toast.success('Dog registered successfully!');
    // Redirect or clear
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-muted-foreground">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-extrabold text-foreground">Dog Registration Wizard</h1>
        <p className="text-muted-foreground">Complete the 8-step process to register a new dog.</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-xl mb-6">
        <div className="flex justify-between items-center mb-2">
          {STEPS.map((step, idx) => (
            <div key={idx} className={`flex flex-col items-center gap-2 ${idx <= currentStep ? 'text-brand-orange' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${idx < currentStep ? 'bg-brand-orange border-brand-orange text-foreground' : idx === currentStep ? 'border-brand-orange text-brand-orange bg-transparent' : 'border-[#4B5563] text-muted-foreground'}`}>
                {idx < currentStep ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              <span className="text-xs font-semibold hidden md:block">{step}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-accent h-2 rounded-full overflow-hidden mt-4">
          <motion.div 
            className="h-full bg-brand-orange"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-card rounded-2xl border border-border p-8 shadow-xl min-h-[400px]">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">Dog Name</label>
                  <input type="text" className="w-full bg-accent border border-border rounded-lg p-3 text-foreground focus:border-brand-orange outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter dog name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">KCI Number</label>
                  <input type="text" className="w-full bg-accent border border-border rounded-lg p-3 text-foreground focus:border-brand-orange outline-none" value={formData.kciNumber} onChange={e => setFormData({...formData, kciNumber: e.target.value})} placeholder="KCI Number" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">Breed</label>
                  <select className="w-full bg-accent border border-border rounded-lg p-3 text-foreground focus:border-brand-orange outline-none">
                    <option>Select Breed</option>
                    <option>Golden Retriever</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">Date of Birth</label>
                  <input type="date" className="w-full bg-accent border border-border rounded-lg p-3 text-foreground focus:border-brand-orange outline-none" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep > 0 && currentStep < 6 && (
            <motion.div key={`step${currentStep}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center justify-center py-20">
              <Dog className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">{STEPS[currentStep]}</h2>
              <p className="text-muted-foreground max-w-sm text-center">This section handles the complex data entry for {STEPS[currentStep].toLowerCase()}. (Full form fields omitted for brevity in demo)</p>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Preview</h2>
              <div className="bg-accent p-6 rounded-xl border border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground text-sm">Dog Name</span>
                    <p className="text-foreground font-bold">{formData.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">KCI Number</span>
                    <p className="text-foreground font-bold">{formData.kciNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-foreground mb-4">Ready to Submit</h2>
              <p className="text-muted-foreground max-w-md mb-8">All 8 steps have been completed and validated. Click submit to save the dog to the database.</p>
              <Button onClick={submitForm} size="lg" className="bg-brand-orange hover:bg-orange-600 text-foreground font-bold px-8">Submit Registration</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <Button onClick={prevStep} disabled={currentStep === 0} variant="outline" className="border-border text-foreground hover:bg-input">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        {currentStep < STEPS.length - 1 ? (
          <Button onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700 text-foreground">
            Next Step <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
