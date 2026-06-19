'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Upload, ChevronRight, ChevronLeft, CheckCircle2, Dog, Image as ImageIcon, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import Link from 'next/link';
import { determineAgeClass } from '@/lib/age-calculator';
import { config } from '@/lib/config';

export default function CreateDogWizard() {
  const { showLoader, hideLoader } = useGlobalLoading();
  const [step, setStep] = useState(1);
  const [breeds, setBreeds] = useState<{ id: string; name: string; }[]>([]);
  
  // Massive state holding all steps
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '', breedId: '', gender: '', dob: '', 
    color: '', weight: '', height: '', microchipNumber: '', kciNumber: '', micNumber: '',
    isImported: false, countryOfOrigin: '', isChampion: false,
    
    // Step 2: Pedigree
    bloodline: { sire: '', dam: '', grandSire: '', grandDam: '', notes: '' },
    
    // Step 3: Ownership
    owner: { name: '', fatherName: '', email: '', phone: '', whatsapp: '', address: '', state: '', district: '', city: '', pincode: '' },
    breeder: { name: '', kennelName: '', country: '', address: '', phone: '' },
    
    // Step 4: Medical
    medical: { vaccinationStatus: '', vetName: '', healthCertUrl: '', notes: '' },

    // Step 5: Gallery
    pedigreeUrl: '', certificateFrontUrl: '', certificateBackUrl: '',
    photos: [] as string[]
  });

  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${config.apiUrl}/breeds`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setBreeds(data.data || []);
      })
      .catch(() => {});
  }, []);

  const nextStep = () => {
    if (step < 7) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showLoader();
    try {
      const mockFormData = new FormData();
      mockFormData.append('certificate', file);
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiUrl}/ocr/certificate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: mockFormData
      });
      
      const result = await res.json();
      if (result.success && result.data) {
        toast.success(`OCR Extracted with ${result.data.confidence}% confidence`);
        setOcrConfidence(result.data.confidence);
        setFormData(prev => ({
          ...prev,
          name: result.data.dogName || prev.name,
          kciNumber: result.data.kciNumber || prev.kciNumber,
          micNumber: result.data.micNumber || prev.micNumber,
          color: result.data.color || prev.color,
          gender: result.data.gender || prev.gender,
          dob: result.data.dob || prev.dob,
          owner: { ...prev.owner, name: result.data.ownerName || prev.owner.name }
        }));
      }
    } catch (error) {
      toast.error('OCR Extraction failed');
    } finally {
      hideLoader();
    }
  };

  const mockFileUpload = (field: string) => {
    // Mocking file upload for Step 5 Gallery
    toast.success('File uploaded successfully (Mocked)');
    setFormData(prev => ({
      ...prev,
      [field]: 'https://via.placeholder.com/150'
    }));
  };

  const handleSubmit = async () => {
    showLoader();
    try {
      const payload = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight as string) : null,
        height: formData.height ? parseFloat(formData.height as string) : null,
      };

      const res = await fetch(`${config.apiUrl}/dogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setStep(7); // Go to Success Screen
      } else {
        toast.error('Failed to create dog profile');
      }
    } catch (error) {
      toast.error('Submission failed');
    } finally {
      hideLoader();
    }
  };

  const renderStepIndicators = () => (
    <div className="flex justify-between items-center mb-8 relative px-4">
      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-accent -z-10" />
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className={`flex flex-col items-center gap-2 ${step >= i ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border-2 transition-all ${step === i ? 'bg-foreground border-border text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' : step > i ? 'bg-green-500 border-green-500 text-white' : 'bg-card border-border text-muted-foreground'}`}>
            {step > i ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : i}
          </div>
          <span className="text-[10px] md:text-xs font-bold text-muted-foreground hidden md:block">
            {i === 1 ? 'Basic Info' : i === 2 ? 'Pedigree' : i === 3 ? 'Ownership' : i === 4 ? 'Medical' : i === 5 ? 'Gallery' : 'Preview'}
          </span>
        </div>
      ))}
    </div>
  );

  if (step === 7) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background text-foreground space-y-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h1 className="text-3xl font-extrabold text-center">Dog Profile Created!</h1>
        <p className="text-muted-foreground text-center max-w-md">
          {formData.name} has been successfully added to your records. You can now register this dog for upcoming shows and competitions.
        </p>
        <div className="flex gap-4 mt-8">
          <Link href="/dashboard/dogs">
            <Button variant="outline" className="border-border">Go to Dogs Directory</Button>
          </Link>
          <Button onClick={() => window.location.reload()} className="bg-foreground hover:bg-foreground text-white">Register Another Dog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-background min-h-[80vh] text-muted-foreground">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Register New Dog</h1>
        <p className="text-muted-foreground mb-8">Follow the wizard to create a comprehensive dog profile.</p>

        {renderStepIndicators()}

        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* ----------------- STEP 1: Basic Info ----------------- */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-input p-4 rounded-xl border border-border/20 mb-6">
                  <h3 className="text-foreground font-bold mb-2 flex items-center gap-2"><Upload className="w-4 h-4 text-foreground"/> Auto-Fill via KCI Certificate (OCR)</h3>
                  <p className="text-sm text-muted-foreground mb-4">Upload a high-quality photo of your KCI Certificate to automatically extract details.</p>
                  <input type="file" onChange={handleOcrUpload} className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-foreground/10 file:text-foreground hover:file:bg-foreground/20 cursor-pointer"/>
                  {ocrConfidence && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#22C55E]">
                      <CheckCircle2 className="w-4 h-4"/> Extracted with {ocrConfidence}% confidence.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Dog Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground" placeholder="Registered Name"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Breed</label>
                    <select value={formData.breedId} onChange={e => setFormData({...formData, breedId: e.target.value})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground">
                      <option value="">Select Breed</option>
                      {breeds.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">KCI Number</label>
                    <input type="text" value={formData.kciNumber} onChange={e => setFormData({...formData, kciNumber: e.target.value})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground" placeholder="KCI-1234"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Microchip Number</label>
                    <input type="text" value={formData.microchipNumber} onChange={e => setFormData({...formData, microchipNumber: e.target.value})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground" placeholder="MC-54321"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Date of Birth</label>
                    <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground color-scheme-dark"/>
                    {formData.dob && (
                      <p className="text-xs text-foreground mt-1">Calculated Class: <span className="font-bold">{determineAgeClass(formData.dob)}</span></p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Gender</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground">
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Color / Markings</label>
                    <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground" placeholder="Color"/>
                  </div>
                  <div className="flex items-center gap-4 mt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-foreground font-semibold">
                      <input type="checkbox" checked={formData.isChampion} onChange={e => setFormData({...formData, isChampion: e.target.checked})} className="w-5 h-5 rounded border-border text-foreground focus:ring-foreground bg-card"/>
                      Is Champion?
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-foreground font-semibold">
                      <input type="checkbox" checked={formData.isImported} onChange={e => setFormData({...formData, isImported: e.target.checked})} className="w-5 h-5 rounded border-border text-foreground focus:ring-foreground bg-card"/>
                      Is Imported?
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ----------------- STEP 2: Pedigree ----------------- */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-4">Bloodline / Pedigree</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Sire (Father)</label>
                    <input type="text" value={formData.bloodline.sire} onChange={e => setFormData({...formData, bloodline: {...formData.bloodline, sire: e.target.value}})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Dam (Mother)</label>
                    <input type="text" value={formData.bloodline.dam} onChange={e => setFormData({...formData, bloodline: {...formData.bloodline, dam: e.target.value}})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Grand Sire</label>
                    <input type="text" value={formData.bloodline.grandSire} onChange={e => setFormData({...formData, bloodline: {...formData.bloodline, grandSire: e.target.value}})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Grand Dam</label>
                    <input type="text" value={formData.bloodline.grandDam} onChange={e => setFormData({...formData, bloodline: {...formData.bloodline, grandDam: e.target.value}})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground"/>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ----------------- STEP 3: Ownership ----------------- */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-4">Owner Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Owner Name</label>
                    <input type="text" value={formData.owner.name} onChange={e => setFormData({...formData, owner: {...formData.owner, name: e.target.value}})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Email</label>
                    <input type="email" value={formData.owner.email} onChange={e => setFormData({...formData, owner: {...formData.owner, email: e.target.value}})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Phone</label>
                    <input type="text" value={formData.owner.phone} onChange={e => setFormData({...formData, owner: {...formData.owner, phone: e.target.value}})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">City</label>
                    <input type="text" value={formData.owner.city} onChange={e => setFormData({...formData, owner: {...formData.owner, city: e.target.value}})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground"/>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-4">Breeder Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Breeder Name</label>
                    <input type="text" value={formData.breeder.name} onChange={e => setFormData({...formData, breeder: {...formData.breeder, name: e.target.value}})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Kennel Name</label>
                    <input type="text" value={formData.breeder.kennelName} onChange={e => setFormData({...formData, breeder: {...formData.breeder, kennelName: e.target.value}})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground"/>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ----------------- STEP 4: Medical ----------------- */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-4">Medical & Vaccination</h3>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Vaccination Status</label>
                    <select value={formData.medical.vaccinationStatus} onChange={e => setFormData({...formData, medical: {...formData.medical, vaccinationStatus: e.target.value}})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground">
                      <option value="">Select Status</option>
                      <option value="FULLY_VACCINATED">Fully Vaccinated</option>
                      <option value="PARTIALLY_VACCINATED">Partially Vaccinated</option>
                      <option value="NOT_VACCINATED">Not Vaccinated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Veterinary Name / Clinic</label>
                    <input type="text" value={formData.medical.vetName} onChange={e => setFormData({...formData, medical: {...formData.medical, vetName: e.target.value}})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1">Medical Notes</label>
                    <textarea value={formData.medical.notes} onChange={e => setFormData({...formData, medical: {...formData.medical, notes: e.target.value}})} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground h-24 resize-none"/>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ----------------- STEP 5: Gallery ----------------- */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-4">Gallery & Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-input transition-colors">
                    <ImageIcon className="w-10 h-10 text-muted-foreground mb-4" />
                    <p className="font-bold text-foreground mb-1">Dog Photos</p>
                    <p className="text-xs text-muted-foreground mb-4">Upload primary display pictures</p>
                    <Button variant="outline" size="sm" onClick={() => mockFileUpload('photos')} className="border-border text-foreground hover:bg-foreground hover:text-white">Upload Photos</Button>
                    {formData.photos.length > 0 && <span className="mt-2 text-xs text-green-500 font-bold"><CheckCircle2 className="inline w-3 h-3"/> Uploaded</span>}
                  </div>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-input transition-colors">
                    <FileText className="w-10 h-10 text-muted-foreground mb-4" />
                    <p className="font-bold text-foreground mb-1">KCI Certificate (Front)</p>
                    <p className="text-xs text-muted-foreground mb-4">Upload original certificate</p>
                    <Button variant="outline" size="sm" onClick={() => mockFileUpload('certificateFrontUrl')} className="border-border text-foreground hover:bg-foreground hover:text-white">Upload Certificate</Button>
                    {formData.certificateFrontUrl && <span className="mt-2 text-xs text-green-500 font-bold"><CheckCircle2 className="inline w-3 h-3"/> Uploaded</span>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ----------------- STEP 6: Preview ----------------- */}
            {step === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-4">Preview & Confirm</h3>
                <div className="bg-input rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-4 border-b border-border pb-4">
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center overflow-hidden">
                      <Dog className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-foreground">{formData.name || 'Unnamed Dog'}</h4>
                      <p className="text-foreground font-bold text-sm">KCI: {formData.kciNumber || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="block text-muted-foreground mb-1">Gender</span>
                      <span className="font-semibold text-foreground">{formData.gender || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-muted-foreground mb-1">Date of Birth</span>
                      <span className="font-semibold text-foreground">{formData.dob || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-muted-foreground mb-1">Age Class</span>
                      <span className="font-semibold text-foreground">{determineAgeClass(formData.dob)}</span>
                    </div>
                    <div>
                      <span className="block text-muted-foreground mb-1">Color</span>
                      <span className="font-semibold text-foreground">{formData.color || '-'}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-bold text-foreground mb-2">Pedigree</h5>
                      <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Sire:</span> {formData.bloodline.sire || '-'}</p>
                      <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Dam:</span> {formData.bloodline.dam || '-'}</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-foreground mb-2">Ownership</h5>
                      <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Owner:</span> {formData.owner.name || '-'}</p>
                      <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Phone:</span> {formData.owner.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
            <Button variant="outline" onClick={prevStep} disabled={step === 1} className="border-border hover:bg-input text-foreground disabled:opacity-50">
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            {step < 6 ? (
              <Button onClick={nextStep} className="bg-foreground hover:bg-foreground text-white font-bold">
                Next Step <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-[#22C55E] hover:bg-green-600 text-white font-bold px-8 shadow-lg shadow-green-500/20">
                Confirm & Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
