'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { useState } from 'react';

// Zod Schema Validation
const dogRegistrationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  breed: z.string().min(2, 'Breed is required'),
  kciNumber: z.string().regex(/^KCI-\d{4}-\d{4}$/, 'Format: KCI-YYYY-XXXX'),
  microchip: z.string().length(15, 'Microchip must be 15 digits'),
  dob: z.string().min(1, 'Date of birth is required'),
});

type DogRegistrationFormValues = z.infer<typeof dogRegistrationSchema>;

export default function DogRegistrationForm() {
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DogRegistrationFormValues>({
    resolver: zodResolver(dogRegistrationSchema)
  });

  const onSubmit = async (data: DogRegistrationFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Valid Form Data:', data);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 text-green-800 p-8 rounded-[2rem] text-center border border-green-200">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Registration Successful!</h3>
        <p>Your dog has been officially registered in the system.</p>
        <Button className="mt-6 bg-green-600 hover:bg-green-700 rounded-full" onClick={() => setIsSuccess(false)}>Register Another</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-card p-8 rounded-[2rem] shadow-sm border border-border">
      <h3 className="text-2xl font-bold text-foreground mb-6">Register Dog</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">Dog Name</label>
            <input 
              {...register('name')} 
              className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500 ring-red-500' : 'border-border focus:ring-brand-orange'} focus:outline-none focus:ring-2`} 
              placeholder="e.g. Sir Maximus"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">Breed</label>
            <input 
              {...register('breed')} 
              className={`w-full px-4 py-3 rounded-xl border ${errors.breed ? 'border-red-500 ring-red-500' : 'border-border focus:ring-brand-orange'} focus:outline-none focus:ring-2`} 
              placeholder="e.g. Golden Retriever"
            />
            {errors.breed && <p className="text-red-500 text-xs mt-1 font-bold">{errors.breed.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">KCI Number</label>
            <input 
              {...register('kciNumber')} 
              className={`w-full px-4 py-3 rounded-xl border ${errors.kciNumber ? 'border-red-500 ring-red-500' : 'border-border focus:ring-brand-orange'} focus:outline-none focus:ring-2`} 
              placeholder="KCI-YYYY-XXXX"
            />
            {errors.kciNumber && <p className="text-red-500 text-xs mt-1 font-bold">{errors.kciNumber.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">Microchip (15 digits)</label>
            <input 
              {...register('microchip')} 
              className={`w-full px-4 py-3 rounded-xl border ${errors.microchip ? 'border-red-500 ring-red-500' : 'border-border focus:ring-brand-orange'} focus:outline-none focus:ring-2`} 
              placeholder="981020000000000"
            />
            {errors.microchip && <p className="text-red-500 text-xs mt-1 font-bold">{errors.microchip.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-muted-foreground mb-2">Date of Birth</label>
          <input 
            type="date"
            {...register('dob')} 
            className={`w-full px-4 py-3 rounded-xl border ${errors.dob ? 'border-red-500 ring-red-500' : 'border-border focus:ring-brand-orange'} focus:outline-none focus:ring-2`} 
          />
          {errors.dob && <p className="text-red-500 text-xs mt-1 font-bold">{errors.dob.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-brand-orange hover:bg-orange-600 h-14 rounded-xl text-lg font-bold mt-4"
        >
          {isSubmitting ? 'Registering...' : 'Complete Registration'}
        </Button>
      </div>
    </form>
  );
}
