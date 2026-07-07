'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, AlertCircle, ShieldAlert, Award, CreditCard, 
  Plus, ArrowRight, ArrowLeft, CheckCircle2, QrCode, Download, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import api from '@/lib/api';
import Link from 'next/link';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onSuccess: (regDetails: any) => void;
}

export default function RegisterForEventModal({ isOpen, onClose, event, onSuccess }: RegisterModalProps) {
  const [step, setStep] = useState(1); // 1: Dog Selection, 2: Class Selection, 3: Summary, 4: Success
  const [dogs, setDogs] = useState<any[]>([]);
  const [loadingDogs, setLoadingDogs] = useState(false);
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);
  
  // Selected classes per dog: { [dogId]: classId/name }
  const [dogClasses, setDogClasses] = useState<Record<string, string>>({});
  
  // Validation errors: { [dogId]: string }
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [successDetails, setSuccessDetails] = useState<any>(null);

  // Load user's dogs & load Razorpay script
  useEffect(() => {
    if (isOpen) {
      fetchUserDogs();
      
      if (!(window as any).Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [isOpen]);

  const fetchUserDogs = async () => {
    setLoadingDogs(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiUrl}/dogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDogs(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load your registered dogs');
    } finally {
      setLoadingDogs(false);
    }
  };

  // Age Calculator & Class Recommendation helper
  const recommendClass = (dobString: string): string => {
    if (!dobString) return 'Open';
    const dob = new Date(dobString);
    const start = new Date(event.startDate);
    
    // Calculate total months difference
    const diffTime = Math.abs(start.getTime() - dob.getTime());
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.4375);

    if (diffMonths >= 3 && diffMonths < 6) return 'Baby Puppy';
    if (diffMonths >= 6 && diffMonths < 12) return 'Puppy';
    if (diffMonths >= 12 && diffMonths < 18) return 'Junior';
    if (diffMonths >= 15 && diffMonths < 24) return 'Intermediate';
    if (diffMonths >= 96) return 'Veteran'; // 8+ years
    return 'Open';
  };

  // Toggle Dog Checkbox Selection
  const handleToggleDog = async (dog: any) => {
    const isSelected = selectedDogIds.includes(dog.id);
    let nextIds = [...selectedDogIds];
    
    if (isSelected) {
      nextIds = nextIds.filter(id => id !== dog.id);
      setSelectedDogIds(nextIds);
      // Remove validation error
      const nextErrors = { ...validationErrors };
      delete nextErrors[dog.id];
      setValidationErrors(nextErrors);
    } else {
      // Validate Eligibility
      setValidationErrors(prev => ({ ...prev, [dog.id]: '' }));
      try {
        const token = localStorage.getItem('token');
        const checkRes = await fetch(`${config.apiUrl}/registrations/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ eventId: event.id, dogId: dog.id })
        });
        const checkData = await checkRes.json();
        
        if (!checkData.success || !checkData.eligible) {
          setValidationErrors(prev => ({ 
            ...prev, 
            [dog.id]: checkData.message || 'Dog is not eligible for this event.' 
          }));
          return;
        }

        // Setup recommended class automatically
        const rec = recommendClass(dog.dob);
        setDogClasses(prev => ({ ...prev, [dog.id]: rec }));
        
        setSelectedDogIds([...selectedDogIds, dog.id]);
      } catch (err) {
        toast.error('Eligibility validation failed.');
      }
    }
  };

  const handleNextStep = () => {
    if (selectedDogIds.length === 0) {
      toast.error('Please select at least one dog to register');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  // Calculate pricing breakdown
  const feePerDog = event.paymentSettings?.registrationFee ?? event.entryFee ?? 1500;
  const gstPercent = event.paymentSettings?.gst ?? 18;
  const convenienceFee = event.paymentSettings?.convenienceFee ?? 50;

  const subtotal = feePerDog * selectedDogIds.length;
  const gstAmount = Math.round(subtotal * (gstPercent / 100));
  const grandTotal = subtotal + gstAmount + convenienceFee;

  // Razorpay Checkout Integration
  const handleProceedToPayment = async () => {
    setCheckoutLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Step 1: Create Registration record (returns PENDING state)
      // Loop through all selected dogs and register them
      const registeredList = [];
      
      for (const dogId of selectedDogIds) {
        // Map recommended class to category (retrieve from event categories or default ID)
        // Find matching event category
        const className = dogClasses[dogId] || 'Open';
        let categoryId = event.categories?.[0]?.id; // Default fallback
        const matchingCat = event.categories?.find((c: any) => c.name.toLowerCase() === className.toLowerCase());
        if (matchingCat) {
          categoryId = matchingCat.id;
        }

        const regRes = await fetch(`${config.apiUrl}/registrations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            eventId: event.id,
            dogId,
            categoryId: categoryId || null,
            className
          })
        });
        const regData = await regRes.json();
        if (!regData.success) {
          throw new Error(regData.message || 'Registration failed to initialize');
        }
        registeredList.push(regData.data);
      }

      // Step 2: Initialize Razorpay Checkout order using the aggregate pricing
      // We will create the payment order for the first registration representing the total invoice
      const primaryReg = registeredList[0];
      const orderRes = await fetch(`${config.apiUrl}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          registrationId: primaryReg.id,
          amount: grandTotal
        })
      });
      const orderResData = await orderRes.json();
      if (!orderResData.success) {
        throw new Error(orderResData.message || 'Payment order creation failed');
      }

      const orderData = orderResData.data;

      // Step 3: Open Razorpay checkout interface
      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'JUZDOG Platform',
        description: `Show Registration: ${event.name}`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            // Verify Payment Signature
            const verifyRes = await fetch(`${config.apiUrl}/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              // Confirm all registrations in list
              for (let i = 1; i < registeredList.length; i++) {
                await fetch(`${config.apiUrl}/registrations/${registeredList[i].id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ status: 'CONFIRMED' })
                });
              }

              // Update state for Success page
              setSuccessDetails({
                serialNumber: primaryReg.serialNumber,
                registeredDogs: dogs.filter(d => selectedDogIds.includes(d.id)),
                classes: Object.values(dogClasses),
                grandTotal
              });
              setStep(4);
              onSuccess(primaryReg);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (e) {
            toast.error('Verification error');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: event.paymentSettings?.themeColor || '#3B82F6'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      toast.error(error.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/65 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-border bg-background/50">
            <div>
              <h3 className="font-extrabold text-foreground text-lg">Event Registration</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{event.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps Progress Indicator */}
          {step < 4 && (
            <div className="flex items-center justify-between px-8 py-3 bg-muted/20 border-b border-border text-xs font-bold text-muted-foreground">
              <span className={step === 1 ? 'text-primary font-black' : ''}>1. Select Dogs</span>
              <ArrowRight className="w-3 h-3" />
              <span className={step === 2 ? 'text-primary font-black' : ''}>2. Show Class</span>
              <ArrowRight className="w-3 h-3" />
              <span className={step === 3 ? 'text-primary font-black' : ''}>3. Review & Pay</span>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* STEP 1: DOG SELECTION */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-foreground text-sm">Select Registered Dogs</h4>
                  <Link href="/dashboard/dogs/add">
                    <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add New Dog
                    </Button>
                  </Link>
                </div>

                {loadingDogs ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-20 bg-muted/30 animate-pulse rounded-xl" />)}
                  </div>
                ) : dogs.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-muted/10 space-y-4">
                    <AlertCircle className="w-12 h-12 text-[#1E293B] mx-auto" />
                    <h5 className="font-bold text-foreground">You haven't added any dogs yet</h5>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">Please add your dogs in the customer dashboard before registering for shows.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {dogs.map(dog => {
                      const isSelected = selectedDogIds.includes(dog.id);
                      const hasError = validationErrors[dog.id];
                      return (
                        <div 
                          key={dog.id}
                          onClick={() => handleToggleDog(dog)}
                          className={`p-4 rounded-xl border flex gap-4 items-center justify-between cursor-pointer transition-all ${
                            isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'
                          } ${hasError ? 'border-red-500 bg-red-500/5' : ''}`}
                        >
                          <div className="flex gap-3 items-center min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center">
                              {dog.photos?.[0]?.url ? (
                                <img src={dog.photos[0].url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-black text-muted-foreground">Dog</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-foreground text-sm truncate">{dog.name}</h5>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{dog.breed?.name} • {dog.gender}</p>
                              {dog.kciNumber && <span className="text-[10px] text-primary font-mono font-bold mt-1 block">KCI: {dog.kciNumber}</span>}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {/* Checkbox */}
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                              isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            {/* Eligibility Error message */}
                            {hasError && (
                              <span className="text-[10px] font-semibold text-red-500 max-w-[155px] text-right leading-tight">
                                {hasError}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: CLASS SELECTION */}
            {step === 2 && (
              <div className="space-y-4">
                <h4 className="font-bold text-foreground text-sm">Select Competition Classes</h4>
                <p className="text-xs text-muted-foreground mt-1">Recommended classes are auto-suggested based on the dog's Date of Birth relative to the event start date.</p>

                <div className="space-y-4">
                  {dogs.filter(d => selectedDogIds.includes(d.id)).map(dog => (
                    <div key={dog.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex justify-between items-center border-b border-border/40 pb-2">
                        <span className="font-bold text-foreground text-sm">{dog.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">DOB: {new Date(dog.dob).toLocaleDateString()}</span>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Competition Class</label>
                        <select 
                          value={dogClasses[dog.id] || 'Open'}
                          onChange={e => setDogClasses({ ...dogClasses, [dog.id]: e.target.value })}
                          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary appearance-none"
                        >
                          <option value="Baby Puppy">Baby Puppy (3-6 Months)</option>
                          <option value="Puppy">Puppy (6-12 Months)</option>
                          <option value="Junior">Junior (9-18 Months)</option>
                          <option value="Intermediate">Intermediate (15-24 Months)</option>
                          <option value="Open">Open Class (15+ Months)</option>
                          <option value="Champion">Champion (Awarded Only)</option>
                          <option value="Veteran">Veteran Class (8+ Years)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: SUMMARY */}
            {step === 3 && (
              <div className="space-y-6">
                <h4 className="font-bold text-foreground text-sm border-b border-border pb-2">Review Registration Summary</h4>

                <div className="space-y-3">
                  {dogs.filter(d => selectedDogIds.includes(d.id)).map(dog => (
                    <div key={dog.id} className="flex justify-between items-center text-sm font-semibold">
                      <div className="text-foreground">
                        <span>{dog.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">({dogClasses[dog.id] || 'Open'})</span>
                      </div>
                      <span className="text-foreground">₹{feePerDog}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2 text-xs font-bold text-muted-foreground">
                  <div className="flex justify-between">
                    <span>GST ({gstPercent}%)</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience Fee</span>
                    <span>₹{convenienceFee}</span>
                  </div>
                  <div className="flex justify-between text-base text-foreground font-extrabold border-t border-border/40 pt-2 mt-2">
                    <span>Grand Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3.5 text-xs text-yellow-600 font-semibold space-y-1">
                  <p className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wide">🛠️ Razorpay Test Card Credentials:</p>
                  <p>• Card Number: <span className="font-mono font-bold select-all bg-yellow-500/20 px-1 rounded">4111 1111 1111 1111</span></p>
                  <p>• Expiry: <span className="font-mono font-bold">Any future date (e.g. 12/30)</span></p>
                  <p>• CVV: <span className="font-mono font-bold">123</span></p>
                  <p>• OTP (on next screen): <span className="font-mono font-bold">Any value (e.g. 123456)</span></p>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS VIEW */}
            {step === 4 && successDetails && (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center mx-auto text-green-500">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h4 className="text-2xl font-black text-foreground">Registration Successful!</h4>
                  <p className="text-xs text-muted-foreground mt-1">Payment verified and registration confirmed.</p>
                </div>

                <div className="max-w-md mx-auto bg-muted/40 border border-border rounded-2xl p-5 space-y-3 text-sm text-foreground text-left">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                    <span className="font-semibold text-muted-foreground text-xs uppercase">Reg Serial Number</span>
                    <span className="font-mono font-bold text-primary">{successDetails.serialNumber}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-muted-foreground block uppercase">Registered Dogs</span>
                    {successDetails.registeredDogs.map((d: any, idx: number) => (
                      <p key={d.id} className="font-semibold">{d.name} — Class: {successDetails.classes[idx]}</p>
                    ))}
                  </div>
                  <div className="flex justify-between items-center border-t border-border/40 pt-2.5">
                    <span className="font-semibold text-muted-foreground text-xs uppercase">Payment Amount</span>
                    <span className="font-extrabold">₹{successDetails.grandTotal}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/dashboard/events/registered">
                    <Button className="bg-[#38BDF8] hover:bg-blue-500 text-foreground font-bold flex items-center gap-2 px-5 py-2.5 rounded-xl">
                      <ExternalLink className="w-4 h-4" /> Go to Dashboard
                    </Button>
                  </Link>
                  <Button onClick={onClose} variant="outline" className="border-border text-foreground hover:bg-accent font-bold px-5 py-2.5 rounded-xl">
                    Back to Calendar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          {step < 4 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-background/50">
              {step > 1 ? (
                <Button variant="ghost" onClick={handlePrevStep} className="text-muted-foreground hover:text-foreground font-bold flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button onClick={handleNextStep} className="bg-primary hover:opacity-95 text-primary-foreground font-bold flex items-center gap-1.5 px-6">
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleProceedToPayment} disabled={checkoutLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-1.5 px-6">
                  <CreditCard className="w-4 h-4" /> {checkoutLoading ? 'Processing...' : 'Proceed To Payment'}
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
