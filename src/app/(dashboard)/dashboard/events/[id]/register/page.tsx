'use client'
import { EventService } from '@/services/event.service';
import { DogService } from '@/services/dog.service';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Dog, MapPin, Calendar, CheckCircle2, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLoader } from '@/components/shared/GlobalLoader';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import { PaymentService } from '@/services/payment.service';

export default function RegisterForEvent() {
  const params = useParams();
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedDog, setSelectedDog] = useState('');
  const [eligibility, setEligibility] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [step, setStep] = useState(1); // 1: Select Dog, 2: Payment/Confirm

  useEffect(() => {
    fetchEventDetails();
    fetchUserDogs();
    loadRazorpayScript();
  }, [eventId]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchEventDetails = async () => {
    showLoader();
    try {
      const data = await EventService.getEvent(eventId);
      if (data.success) setEvent(data.data);
    } catch (error) {
      toast.error('Failed to load event details');
    } finally {
      hideLoader();
    }
  };

  const fetchUserDogs = async () => {
    try {
      const data = await DogService.getDogs();
      if (data.success) {
        setDogs(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkEligibility = async (dogId: string) => {
    setSelectedDog(dogId);
    setSelectedClass('');
    setEligibility(null);
    if (!dogId) return;

    showLoader();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('${config.apiUrl}/registrations/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId, dogId })
      });
      const data = await res.json();
      if (data.success) {
        setEligibility(data);
        if (data.eligibleClasses && data.eligibleClasses.length === 1) {
          setSelectedClass(data.eligibleClasses[0].id);
        }
      } else {
        toast.error(data.message || 'Validation failed');
      }
    } catch (error) {
      toast.error('Eligibility check failed');
    } finally {
      hideLoader();
    }
  };

  const handleRegister = async () => {
    if (!selectedDog || !selectedClass) {
      toast.error('Please select a dog and a competition class');
      return;
    }

    showLoader();
    try {
      const token = localStorage.getItem('token');

      // Step 1: Create Registration
      const regRes = await fetch(`${config.apiUrl}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId,
          dogId: selectedDog,
          categoryId: selectedClass
        })
      });

      const regData = await regRes.json();
      if (regData.success) {

        // Step 2: Create Razorpay Order
        const orderData = await PaymentService.createOrder({ registrationId: regData.data.id });

        if (orderData.success) {
          hideLoader();

          const options = {
            key: orderData.keyId,
            amount: orderData.order.amount,
            currency: orderData.order.currency,
            name: "JuzDog Event Registration",
            description: `Registration for ${event.name}`,
            order_id: orderData.order.id,
            handler: async function (response: any) {
              showLoader();
              try {
                const verifyData = await PaymentService.verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  registrationId: regData.data.id,
                  userId: regData.data.userId // backend typically infers this, passing just in case
                });

                if (verifyData.success) {
                  toast.success('Registration and Payment Successful!');
                  router.push('/dashboard/events/registered');
                } else {
                  toast.error('Payment Verification Failed');
                }
              } catch (err) {
                toast.error('Payment Verification Error');
              } finally {
                hideLoader();
              }
            },
            prefill: {
              name: "Dog Owner",
              email: "user@example.com",
            },
            theme: {
              color: "#F59E0B"
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (response: any) {
            toast.error('Payment Failed: ' + response.error.description);
          });
          rzp.open();

        } else {
          toast.error('Failed to create payment order');
          hideLoader();
        }
      } else {
        toast.error(regData.error || 'Failed to create registration');
        hideLoader();
      }
    } catch (error) {
      toast.error('Registration process failed');
      hideLoader();
    }
  };

  if (!event) return null;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex items-center gap-4 border-b border-border pb-6">
          <Link href="/dashboard/events/upcoming">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Event Registration</h1>
            <p className="text-muted-foreground mt-1">{event.name}</p>
          </div>
        </div>

        {/* Event Summary Card */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-lg flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center shrink-0">
            <Calendar className="w-8 h-8 text-brand-orange" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2">{event.name}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {event.venue}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(event.startDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm text-muted-foreground mb-1">Entry Fee</p>
            <p className="text-2xl font-black text-brand-orange">₹{event.entryFee || 0}</p>
          </div>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Select Your Dog</h2>

            {dogs.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Dog className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium mb-4">You have no dogs registered in your profile.</p>
                <Link href="/dashboard/dogs/create">
                  <Button className="bg-brand-orange hover:bg-orange-600 text-white">Register a Dog First</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dogs.map(dog => (
                  <div
                    key={dog.id}
                    onClick={() => checkEligibility(dog.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedDog === dog.id ? 'border-brand-orange bg-brand-orange/5' : 'border-border bg-card hover:border-[rgba(255,255,255,0.2)]'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <Dog className={`w-6 h-6 ${selectedDog === dog.id ? 'text-brand-orange' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{dog.name}</p>
                      <p className="text-xs text-muted-foreground">KCI: {dog.kciNumber || 'N/A'} • {dog.breed?.name}</p>
                    </div>
                    {selectedDog === dog.id && <CheckCircle2 className="w-5 h-5 text-brand-orange ml-auto" />}
                  </div>
                ))}
              </div>
            )}

            {eligibility && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6">
                {eligibility.eligible ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <div>
                        <h4 className="font-bold text-green-500">Dog is Eligible!</h4>
                        <p className="text-sm text-green-500/80">Calculated Age: {eligibility.ageData?.totalMonths?.toFixed(1)} months at time of show.</p>
                      </div>
                    </div>

                    <label className="block text-sm font-bold text-foreground mb-2 mt-6">Select Competition Class</label>
                    <select
                      value={selectedClass}
                      onChange={e => setSelectedClass(e.target.value)}
                      className="w-full px-4 py-3 bg-card border border-green-500/30 rounded-lg text-foreground focus:border-green-500 outline-none appearance-none"
                    >
                      <option value="">-- Choose Class --</option>
                      {eligibility.eligibleClasses.map((cls: any) => (
                        <option key={cls.id} value={cls.id}>{cls.name} ({cls.minAgeMonths}-{cls.maxAgeMonths} months)</option>
                      ))}
                    </select>

                    <div className="mt-8 flex justify-end">
                      <Button onClick={() => setStep(2)} disabled={!selectedClass} className="bg-brand-orange hover:bg-orange-600 text-white font-bold px-8">
                        Proceed to Payment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-red-500 mb-1">Not Eligible</h4>
                      <p className="text-sm text-red-500/80">{eligibility.message}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Payment Confirmation</h2>
            <div className="bg-card border border-border rounded-xl p-8 space-y-6 shadow-xl">
              <div className="flex justify-between items-center pb-6 border-b border-border">
                <div>
                  <p className="text-muted-foreground font-medium">Registration Fee</p>
                  <p className="text-sm text-muted-foreground mt-1">1x Event Entry</p>
                </div>
                <p className="text-2xl font-black text-foreground">₹{event.entryFee}</p>
              </div>

              <div className="bg-accent/50 rounded-lg p-4 flex items-center gap-4 border border-[rgba(255,255,255,0.05)]">
                <CreditCard className="w-8 h-8 text-brand-orange" />
                <div>
                  <p className="font-bold text-foreground">Razorpay Secure Checkout</p>
                  <p className="text-xs text-muted-foreground">You will be redirected to Razorpay to complete your transaction securely.</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleRegister} className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 shadow-lg shadow-green-500/20">
                  Pay ₹{event.entryFee} & Register
                </Button>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
