'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight, QrCode, CreditCard, Dog, Calendar, Loader2 } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function EventRegistrationWorkflow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data states
  const [events, setEvents] = useState<any[]>([]);
  const [dogs, setDogs] = useState<any[]>([]);
  
  // Selection states
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [registrationResponse, setRegistrationResponse] = useState<any>(null);

  const steps = [
    { num: 1, title: 'Choose Event', icon: Calendar },
    { num: 2, title: 'Select Dog', icon: Dog },
    { num: 3, title: 'Validation', icon: CheckCircle2 },
    { num: 4, title: 'Payment', icon: CreditCard },
    { num: 5, title: 'QR Pass', icon: QrCode },
  ];

  useEffect(() => {
    fetchEvents();
    fetchDogs();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/public/shows?limit=100');
      if (res.success) {
        setEvents(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load events');
    }
  };

  const fetchDogs = async () => {
    try {
      const res = await api.get('/dogs?limit=100');
      if (res.success) {
        setDogs(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load dogs');
    }
  };

  const handleValidateEligibility = async () => {
    if (!selectedEventId || !selectedDogId) return;
    setLoading(true);
    try {
      const res = await api.post('/registrations/validate', {
        eventId: selectedEventId,
        dogId: selectedDogId
      });
      if (res.success) {
        setValidationResult(res);
        setStep(3);
      } else {
        toast.error(res.message || 'Eligibility check failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRegistration = async () => {
    if (!validationResult?.eligible || !validationResult.eligibleClasses?.length) {
      toast.error('Dog is not eligible for any classes');
      return;
    }
    
    setIsProcessing(true);
    try {
      // Assuming first eligible class is selected automatically for now
      const classId = validationResult.eligibleClasses[0].id;

      const res = await api.post('/registrations', {
        eventId: selectedEventId,
        dogId: selectedDogId,
        categoryId: classId
      });

      if (res.success) {
        setRegistrationResponse(res.data);
        setStep(5);
        toast.success('Registration successful!');
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete registration');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !selectedEventId) {
      toast.error('Please select an event');
      return;
    }
    if (step === 2) {
      if (!selectedDogId) {
        toast.error('Please select a dog');
        return;
      }
      handleValidateEligibility();
      return;
    }
    if (step === 3) {
      if (!validationResult?.eligible) {
        toast.error('Cannot proceed, dog is not eligible.');
        return;
      }
      setStep(4);
      return;
    }
    if (step === 4) {
      handleCreateRegistration();
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const selectedDog = dogs.find(d => d.id === selectedDogId);

  return (
    <PageContainer>
      <div className="pt-8 pb-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-4">Event Registration</h1>
            <p className="text-muted-foreground">Secure your spot in the upcoming championship.</p>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-16">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-foreground -translate-y-1/2 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            />
            
            <div className="relative flex justify-between">
              {steps.map((s, i) => {
                const isActive = step === s.num;
                const isPassed = step > s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${
                      isActive ? 'bg-foreground border-border/20 text-foreground' : 
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
                    {events.length === 0 && <p className="text-muted-foreground py-4">No upcoming events found.</p>}
                    {events.map((event) => (
                      <div 
                        key={event.id} 
                        onClick={() => setSelectedEventId(event.id)}
                        className={`p-4 border-2 rounded-2xl cursor-pointer transition-colors flex items-center gap-4 ${
                          selectedEventId === event.id ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-foreground">{event.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.city && `${event.city} • `} 
                            {event.startDate && new Date(event.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        {selectedEventId === event.id && <CheckCircle2 className="w-6 h-6 text-foreground shrink-0" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-bold mb-6">Select Your Dog</h3>
                  <div className="space-y-4">
                    {dogs.length === 0 && <p className="text-muted-foreground py-4">You have not added any dogs to your profile.</p>}
                    {dogs.map((dog) => (
                      <div 
                        key={dog.id} 
                        onClick={() => setSelectedDogId(dog.id)}
                        className={`p-4 border-2 rounded-2xl cursor-pointer transition-colors flex items-center gap-4 ${
                          selectedDogId === dog.id ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0 overflow-hidden">
                          {dog.imageUrl ? (
                            <img src={dog.imageUrl} alt={dog.name} className="w-full h-full object-cover" />
                          ) : (
                            <Dog className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-foreground">{dog.name}</p>
                          <p className="text-sm text-muted-foreground">{dog.breed?.name || 'Unknown Breed'} • {dog.kciNumber}</p>
                        </div>
                        {selectedDogId === dog.id && <CheckCircle2 className="w-6 h-6 text-foreground shrink-0" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && validationResult && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-bold mb-6">Eligibility Validation</h3>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
                    </div>
                  ) : validationResult.eligible ? (
                    <div className="bg-card rounded-2xl p-6 space-y-4 border border-border shadow-sm">
                      <div className="flex justify-between items-center border-b border-border pb-4">
                        <span className="text-muted-foreground font-medium">Eligibility Status</span>
                        <span className="text-green-600 font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Passed</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-border pb-4">
                        <span className="text-muted-foreground font-medium">Age at Event Date</span>
                        <span className="text-foreground font-bold">{validationResult.ageData?.totalMonths?.toFixed(1)} Months</span>
                      </div>
                      
                      <div className="space-y-3 pt-2">
                        <span className="text-muted-foreground font-medium">Eligible Classes</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {validationResult.eligibleClasses?.map((cls: any) => (
                            <div key={cls.id} className="p-3 bg-accent/30 border border-border rounded-lg flex items-center justify-between">
                              <span className="font-bold text-foreground">{cls.name}</span>
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                      <h4 className="text-red-700 font-bold text-lg mb-2">Not Eligible</h4>
                      <p className="text-red-600">{validationResult.message}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-bold mb-6">Payment Overview</h3>
                  <div className="p-6 border-2 border-border rounded-2xl text-center">
                    <p className="text-muted-foreground mb-2">Total Entry Fee</p>
                    <p className="text-4xl font-extrabold text-foreground mb-6">₹{selectedEvent?.entryFee || 1500}</p>
                    
                    <Button 
                      className="w-full h-14 text-lg font-bold bg-card hover:bg-foreground text-background rounded-xl flex items-center justify-center gap-2"
                      disabled={isProcessing}
                      onClick={handleNext}
                    >
                      {isProcessing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                      ) : (
                        'Confirm Registration (Offline Payment)'
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">Razorpay integration pending. This will create a pending registration.</p>
                  </div>
                </motion.div>
              )}

              {step === 5 && registrationResponse && (
                <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-foreground mb-2">Registration Requested!</h3>
                  <p className="text-muted-foreground mb-8">Your application has been received and is pending payment/approval.</p>
                  
                  <div className="max-w-xs mx-auto bg-card p-6 rounded-2xl border border-border shadow-sm">
                    <QrCode className="w-32 h-32 mx-auto text-foreground mb-4" />
                    <p className="text-sm font-bold text-foreground tracking-widest">{registrationResponse.serialNumber}</p>
                  </div>
                  
                  <div className="mt-8">
                    <Button variant="outline" onClick={() => router.push('/dashboard/user')}>
                      Go to Dashboard
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {step < 4 && (
              <div className="mt-8 flex justify-end pt-6 border-t border-border">
                <Button 
                  onClick={handleNext} 
                  disabled={loading || (step === 3 && !validationResult?.eligible)}
                  className="bg-foreground hover:bg-foreground rounded-full px-8 shadow-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
