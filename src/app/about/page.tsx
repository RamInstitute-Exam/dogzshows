'use client';

import { motion } from 'framer-motion';
import { Target, Award, Camera, Users, Star, Quote } from 'lucide-react';
import Image from 'next/image';

export default function AboutUs() {
  return (
    <main className="min-h-screen bg-brand-light pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-outfit font-extrabold text-brand-dark mb-6 tracking-tight">Our Story</h1>
          <p className="text-xl text-gray-500 font-medium">
            JuztDog Media was born out of a profound passion for purebred dogs and a desire to capture their perfection. We are India's premier media agency dedicated exclusively to the dog show circuit.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-brand-darker text-white p-10 md:p-12 rounded-[2.5rem]"
          >
            <Target className="w-10 h-10 text-brand-orange mb-6" />
            <h2 className="text-3xl font-bold font-outfit mb-4">Our Mission</h2>
            <p className="text-gray-400 font-medium leading-relaxed">
              To elevate the standard of canine media in India by providing world-class photography, cinematic videography, and seamless digital event management for breeders, owners, and kennel clubs alike.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-brand-orange text-white p-10 md:p-12 rounded-[2.5rem]"
          >
            <Camera className="w-10 h-10 text-white mb-6" />
            <h2 className="text-3xl font-bold font-outfit mb-4">Our Vision</h2>
            <p className="text-orange-100 font-medium leading-relaxed">
              To be the definitive visual archive of canine excellence. We believe every champion deserves to be immortalized through the lens, capturing their form, movement, and spirit for generations.
            </p>
          </motion.div>
        </div>

        {/* Equipment & Approach */}
        <div className="mb-24 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80" alt="Camera equipment" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-brand-dark/20 mix-blend-overlay"></div>
            </div>
          </div>
          <div className="md:w-1/2">
            <span className="text-brand-orange font-bold tracking-wider uppercase text-sm mb-2 block">Our Gear</span>
            <h2 className="text-4xl font-extrabold font-outfit text-brand-dark mb-6">World-Class Equipment</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              We shoot exclusively on Sony Alpha flagship cameras paired with G Master glass to ensure every hair, every muscle definition, and every expression is captured with uncompromising clarity, even in poor indoor stadium lighting.
            </p>
            <ul className="space-y-4 font-bold text-brand-dark">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center"><CheckIcon /></div>
                Sony A1 & A9III for zero blackout 120fps shooting
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center"><CheckIcon /></div>
                Sony 70-200mm f/2.8 GM II for ring isolation
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center"><CheckIcon /></div>
                DJI Ronin 4D for cinematic cinematic ring-side tracking
              </li>
            </ul>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold font-outfit text-brand-dark">Our Journey</h2>
          </div>
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute left-1/2 -ml-0.5 w-1 h-full bg-gray-200 rounded-full hidden md:block"></div>
            
            {[
              { year: '2022', title: 'The Beginning', desc: 'Started as a passionate solo photographer covering local kennel club matches.' },
              { year: '2024', title: 'Agency Expansion', desc: 'Grew into a full media team, introducing video coverage and digital registrations.' },
              { year: '2026', title: 'National Recognition', desc: 'Awarded Official Media Partner for the All India Championship Dog Show.' }
            ].map((item, idx) => (
              <div key={item.year} className={`relative flex items-center justify-between md:justify-normal w-full mb-12 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="hidden md:block w-5 h-5 rounded-full bg-brand-orange absolute left-1/2 -ml-2.5 shadow-[0_0_0_4px_white]"></div>
                <div className="w-full md:w-[45%] bg-white p-8 rounded-3xl premium-shadow border border-gray-100">
                  <span className="text-brand-orange font-extrabold text-2xl font-outfit mb-2 block">{item.year}</span>
                  <h3 className="text-xl font-bold text-brand-dark mb-2">{item.title}</h3>
                  <p className="text-gray-500 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <div className="text-center mb-16">
            <span className="text-brand-orange font-bold tracking-wider uppercase text-sm mb-2 block">Client Love</span>
            <h2 className="text-4xl font-extrabold font-outfit text-brand-dark">What Breeders Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-brand-darker text-white p-10 rounded-3xl relative">
                <Quote className="w-12 h-12 text-white/10 absolute top-8 right-8" />
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, idx) => <Star key={idx} className="w-5 h-5 fill-brand-orange text-brand-orange" />)}
                </div>
                <p className="text-gray-300 font-medium leading-relaxed mb-8 italic">
                  "JuztDog Media captured our champion Husky perfectly. Their understanding of breed standards means they always shoot at the exact right angle and moment. The online entry system also saved us hours of paperwork."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                  <div>
                    <h4 className="font-bold font-outfit text-lg">Dr. Rakesh Sharma</h4>
                    <p className="text-brand-orange text-xs font-bold uppercase">Winterfell Kennels</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
