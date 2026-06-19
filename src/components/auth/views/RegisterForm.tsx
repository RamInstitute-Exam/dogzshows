'use client';

import { useState, useEffect } from 'react';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dog, CheckCircle2, Star, User, Mail, Lock, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { config } from '@/lib/config';

export default function RegisterForm() {
  const { setView, closeModal } = useAuthModalStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);

  // Form Data State
  const [formData, setFormData] = useState({
    title: 'Mr', firstName: '', lastName: '', dob: '', gender: 'MALE',
    email: '', phone: '', altPhone: '',
    password: '', confirmPassword: '',
    doorNo: '', buildingName: '', street: '', landmark: '', address1: '', address2: '', city: '', state: '', country: 'India', pincode: '',
    occupation: '', organization: '', website: '',
    kciMembershipNo: '', breederLicenseNo: '', kennelClubName: '', experienceInDogShows: '',
    prefSms: true, prefEmail: true, prefWhatsapp: true, termsAccepted: false, privacyAccepted: false,
    otp: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSendOtp = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (resendAttempts >= 5) {
      toast.error('Maximum resend attempts reached.');
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch(`${config.apiUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message);
        setOtpSent(true);
        setStep(2); 
        setCountdown(30);
        setResendAttempts(prev => prev + 1);
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.otp.length !== 6) {
      toast.error('Enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${config.apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp: formData.otp })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Mobile verified successfully!');
        setStep(3);
      } else {
        toast.error(data.error || 'Invalid OTP');
      }
    } catch (err) {
      toast.error('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted || !formData.privacyAccepted) {
      toast.error('You must accept the Terms and Privacy Policy');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${config.apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Account created successfully!');
        setStep(5); // Success Step
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Network Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const stepLabels = ['Personal', 'Verify', 'Address', 'Profile'];

  return (
    <div className="flex flex-col md:flex-row w-full h-full min-h-[600px] bg-card">
      
      {/* LEFT PANEL - 40% Desktop, 45% Tablet */}
      <div className="hidden md:flex w-[45%] lg:w-[40%] relative bg-card text-foreground flex-col justify-between p-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=1974&auto=format&fit=crop" 
            alt="Dog Show" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-foreground p-2 rounded-xl shadow-sm">
              <Dog className="h-6 w-6 text-white" />
            </div>
            <span className="font-outfit font-extrabold text-2xl tracking-tight text-foreground">
              Juz<span className="text-foreground">dog</span>
            </span>
          </div>

          <h1 className="text-[32px] font-extrabold leading-[1.1] mb-8">
            Join India's Largest <br/>Dog Show Platform
          </h1>
          <ul className="space-y-4">
            {["OTP Verification", "KCI Registration", "Dog Registration", "Event Participation", "Instant Certificates"].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-[15px] font-medium text-gray-200">
                <CheckCircle2 className="w-[18px] h-[18px] text-foreground shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="relative z-10 bg-card/10 backdrop-blur-md rounded-[16px] p-5 border border-border mt-auto">
          <div className="flex gap-1 text-yellow-400 mb-3">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-[14px] h-[14px] fill-current" />)}
          </div>
          <p className="text-[13px] italic text-gray-200 mb-4 leading-relaxed">
            "The OCR certificate upload saved me hours of manual work. This is the platform the dog show community has been waiting for."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center font-bold text-xs text-white">VS</div>
            <div>
              <p className="text-[13px] font-bold">Vikram Singh</p>
              <p className="text-[11px] text-muted-foreground">Verified Breeder</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - 60% Desktop, 55% Tablet */}
      <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col p-10 h-full overflow-y-auto">
        
        {/* Stepper (Only show steps 1-4) */}
        {step < 5 && (
          <div className="mb-8 relative w-full max-w-full px-4 mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-input -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-[2px] bg-foreground -translate-y-1/2 z-0 transition-all duration-500 ease-out" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
            
            <div className="relative z-10 flex justify-between">
              {stepLabels.map((label, idx) => {
                const s = idx + 1;
                return (
                  <div key={s} className="flex flex-col items-center gap-[6px]">
                    <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 shadow-sm ${step >= s ? 'bg-foreground text-background ring-4 ring-border/15' : 'bg-card text-muted-foreground border border-border'}`}>
                      {step > s ? <CheckCircle2 className="w-[14px] h-[14px]" /> : s}
                    </div>
                    <span className={`text-[10px] hidden sm:block font-bold uppercase tracking-wider ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Form Content */}
        <div className="flex-1 w-full flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6 w-full">
                <h2 className="text-[24px] font-extrabold text-foreground tracking-tight text-center sm:text-left">Personal Details</h2>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_1fr] gap-4">
                    <select name="title" value={formData.title} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-3 text-[14px] font-medium outline-none focus:ring-2 focus:ring-foreground/20">
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                    </select>
                    <Input required name="firstName" value={formData.firstName} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border text-[14px] px-4" placeholder="First Name *" />
                    <Input required name="lastName" value={formData.lastName} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border text-[14px] px-4" placeholder="Last Name *" />
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border text-[14px] px-4" />
                    <select name="gender" value={formData.gender} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px] font-medium outline-none focus:ring-2 focus:ring-foreground/20">
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input required name="email" value={formData.email} onChange={handleChange} type="email" className="pl-[38px] h-[52px] rounded-[12px] bg-card border-border text-[14px]" placeholder="Email Address *" />
                    </div>
                    <div className="relative flex">
                      <div className="flex items-center justify-center px-3 bg-input border border-border border-r-0 rounded-l-[12px] text-[14px] font-bold text-muted-foreground">+91</div>
                      <Input required name="phone" value={formData.phone} onChange={handleChange} type="tel" maxLength={10} className="rounded-l-none rounded-r-[12px] bg-card border-border h-[52px] text-[14px] w-full" placeholder="Mobile Number *" />
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input required name="password" value={formData.password} onChange={handleChange} type="password" className="pl-[38px] h-[52px] rounded-[12px] bg-card border-border text-[14px]" placeholder="Password *" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input required name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" className="pl-[38px] h-[52px] rounded-[12px] bg-card border-border text-[14px]" placeholder="Confirm Password *" />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button type="button" onClick={handleSendOtp} disabled={loading || !formData.phone || !formData.password} className="w-full btn-primary-luxury">
                    {loading ? 'Sending OTP...' : 'Send OTP & Continue'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 2 && (
              <motion.form key="step2" onSubmit={handleVerifyOtp} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6 w-full max-w-full px-4 mx-auto text-center py-6">
                <div className="w-[64px] h-[64px] bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-[28px] h-[28px] text-foreground" />
                </div>
                <h2 className="text-[24px] font-extrabold text-foreground tracking-tight">Verify Mobile</h2>
                <p className="text-[14px] text-muted-foreground">
                  We sent a code to <span className="font-bold text-foreground">+91 {formData.phone}</span>
                </p>

                <div className="pt-4">
                  <Input required name="otp" value={formData.otp} onChange={handleChange} type="text" maxLength={6} placeholder="••••••" className="text-center text-[24px] tracking-[0.5em] font-bold rounded-[12px] bg-card h-[64px] w-full" />
                </div>

                <Button type="submit" disabled={loading || formData.otp.length !== 6} className="w-full btn-primary-luxury mt-2">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>

                <div className="pt-2">
                  {countdown > 0 ? (
                    <p className="text-[13px] font-bold text-muted-foreground">Resend OTP in 0:{countdown.toString().padStart(2, '0')}</p>
                  ) : (
                    <button type="button" onClick={handleSendOtp} className="text-[13px] font-bold text-foreground hover:text-foreground hover:underline">Resend OTP</button>
                  )}
                </div>
              </motion.form>
            )}

            {/* STEP 3: Address */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6 w-full">
                <h2 className="text-[24px] font-extrabold text-foreground tracking-tight text-center sm:text-left">Address Details</h2>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="doorNo" value={formData.doorNo} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px]" placeholder="Door / Flat No" />
                    <Input name="buildingName" value={formData.buildingName} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px]" placeholder="Building Name" />
                  </div>
                  <Input name="street" value={formData.street} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px]" placeholder="Street / Area" />
                  <Input required name="address1" value={formData.address1} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px]" placeholder="Address Line 1 *" />
                  <Input name="address2" value={formData.address2} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px]" placeholder="Address Line 2" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input required name="city" value={formData.city} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px]" placeholder="City *" />
                    <Input required name="state" value={formData.state} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px]" placeholder="State *" />
                    <Input required name="pincode" value={formData.pincode} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px]" placeholder="Pincode *" />
                    <Input required name="country" value={formData.country} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px]" placeholder="Country *" />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button type="button" onClick={() => setStep(2)} variant="outline" className="flex-[0.4] h-[56px] rounded-[14px] font-bold border-border hover:bg-card text-[15px]">
                     Back
                  </Button>
                  <Button type="button" onClick={() => setStep(4)} className="flex-[1] h-[56px] rounded-[14px] bg-card hover:bg-accent text-foreground font-bold text-[15px] shadow-lg">
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Profile, KCI & Finalize */}
            {step === 4 && (
              <motion.form key="step4" onSubmit={handleRegister} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6 w-full">
                <h2 className="text-[24px] font-extrabold text-foreground tracking-tight text-center sm:text-left">Complete Profile</h2>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="occupation" value={formData.occupation} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px]" placeholder="Occupation" />
                    <Input name="organization" value={formData.organization} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px]" placeholder="Kennel Name" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="kciMembershipNo" value={formData.kciMembershipNo} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px]" placeholder="KCI Membership No" />
                    <Input name="breederLicenseNo" value={formData.breederLicenseNo} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px]" placeholder="Breeder License No" />
                  </div>
                  
                  <select name="experienceInDogShows" value={formData.experienceInDogShows} onChange={handleChange} className="h-[52px] rounded-[12px] bg-card border-border px-4 text-[14px] outline-none focus:ring-2 focus:ring-foreground/20">
                     <option value="">Select Experience Level</option>
                     <option value="BEGINNER">Beginner (0-2 years)</option>
                     <option value="INTERMEDIATE">Intermediate (2-5 years)</option>
                     <option value="EXPERT">Expert (5+ years)</option>
                  </select>

                  <div className="bg-card p-4 rounded-[12px] space-y-3 border border-border mt-2">
                    <div className="grid grid-cols-3 gap-2">
                       <label className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                         <input type="checkbox" name="prefSms" checked={formData.prefSms} onChange={handleChange} className="w-[16px] h-[16px] text-foreground rounded-[4px] border-border accent-foreground" /> SMS
                       </label>
                       <label className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                         <input type="checkbox" name="prefEmail" checked={formData.prefEmail} onChange={handleChange} className="w-[16px] h-[16px] text-foreground rounded-[4px] border-border accent-foreground" /> Email
                       </label>
                       <label className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                         <input type="checkbox" name="prefWhatsapp" checked={formData.prefWhatsapp} onChange={handleChange} className="w-[16px] h-[16px] text-foreground rounded-[4px] border-border accent-foreground" /> WhatsApp
                       </label>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                     <label className="flex items-center gap-2 text-[13px] font-bold text-foreground">
                       <input required type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} className="w-[16px] h-[16px] text-foreground rounded-[4px] border-border accent-foreground" /> I accept the Terms & Conditions *
                     </label>
                     <label className="flex items-center gap-2 text-[13px] font-bold text-foreground">
                       <input required type="checkbox" name="privacyAccepted" checked={formData.privacyAccepted} onChange={handleChange} className="w-[16px] h-[16px] text-foreground rounded-[4px] border-border accent-foreground" /> I accept the Privacy Policy *
                     </label>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button type="button" onClick={() => setStep(3)} variant="outline" disabled={loading} className="flex-[0.4] h-[56px] rounded-[14px] font-bold border-border hover:bg-card text-[15px]">
                     Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-[1] btn-primary-luxury">
                    {loading ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </motion.form>
            )}

            {/* STEP 5: Success */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center py-10 w-full max-w-full px-4 mx-auto">
                <div className="w-[80px] h-[80px] bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-[40px] h-[40px] text-green-500" />
                </div>
                <h2 className="text-[28px] font-extrabold text-foreground tracking-tight">Success!</h2>
                <p className="text-[15px] text-muted-foreground leading-relaxed">
                  Your enterprise account has been verified and activated.
                </p>

                <Button type="button" onClick={() => { closeModal(); setView('LOGIN'); }} className="w-full h-[56px] rounded-[14px] bg-card hover:bg-accent text-foreground font-bold text-[15px] shadow-lg mt-6">
                  Continue to Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer Link */}
        {step < 5 && (
          <div className="mt-8 text-center border-t border-border pt-6">
            <p className="text-[14px] text-muted-foreground font-medium">
              Already have an account?{' '}
              <button type="button" onClick={() => setView('LOGIN')} className="text-foreground font-bold hover:text-foreground transition-colors">
                Login
              </button>
            </p>
          </div>
        )}
        
      </div>
    </div>
  );
}
