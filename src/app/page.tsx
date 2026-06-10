'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Play, Camera, Star, Award, Users, 
  Video, Image as ImageIcon, Trophy, CheckCircle, 
  ShieldCheck, Clock, Quote, Phone, Mail, FileEdit, Medal 
} from 'lucide-react';
import Button from '../components/ui/Button';

// -------------------------------------------------------------
// Animated Counter Component
// -------------------------------------------------------------
function AnimatedCounter({ end, suffix = "", duration = 2 }: { end: number, suffix?: string, duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('stats-section');
      if (element && !hasStarted) {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight) {
          setHasStarted(true);
          let startTimestamp: number;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(end);
            }
          };
          window.requestAnimationFrame(step);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [end, duration, hasStarted]);

  return <span className="font-outfit tabular-nums">{count}{suffix}</span>;
}

// -------------------------------------------------------------
// Main Home Page Component
// -------------------------------------------------------------
export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity1 = useTransform(scrollY, [0, 500], [1, 0]);

  // Fade up animation variants
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <main className="min-h-screen bg-brand-light selection:bg-brand-orange selection:text-white">
      
      {/* =========================================
          HERO SECTION
      ========================================= */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <motion.div 
          style={{ y: y1, opacity: opacity1 }}
          className="absolute inset-0 z-0"
        >
          <img
            className="w-full h-full object-cover scale-105"
            src="/hero_banner.png"
            alt="Hero Background"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-brand-darker/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/70 via-transparent to-[#F8FAFC]" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel-dark px-6 py-2 rounded-full flex items-center gap-2 mb-8 border border-brand-orange/30 shadow-[0_0_20px_rgba(255,140,0,0.2)]"
          >
            <Award className="w-4 h-4 text-brand-orange" />
            <span className="text-sm font-semibold text-white tracking-widest uppercase">Premium Media Agency</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl sm:text-7xl md:text-8xl font-outfit font-extrabold text-white tracking-tight leading-[1.1] mb-6 max-w-5xl"
          >
            Capturing India's <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-yellow-400">Finest Dog Shows</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-2xl text-gray-300 font-medium max-w-3xl mb-12 drop-shadow-md"
          >
            Professional Dog Photography • Dog Show Coverage • Event Videography • Creative Poster Design
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/photos">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(255,140,0,0.4)]">
                View Gallery <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/entries">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-white/30 text-white hover:bg-white/10 hover:text-white glass-panel-dark">
                Show Entries
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* =========================================
          OUR PROFESSIONAL SERVICES
      ========================================= */}
      <section className="py-24 bg-[#F8FAFC] relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-brand-orange font-bold tracking-wider uppercase text-sm mb-2 block">Our Expertise</span>
            <h2 className="text-4xl md:text-5xl font-outfit font-extrabold text-[#111827] mb-6">Professional Dog Show Media Services</h2>
            <p className="text-[#64748B] text-lg leading-relaxed">
              We capture every proud moment with world-class photography, cinematic videography, creative poster design, and complete event coverage for dog shows, kennel clubs, breeders, and pet events across India.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Service 1 */}
            <motion.div variants={fadeUpVariant} className="bg-white rounded-[24px] overflow-hidden shadow-lg border border-[#E5E7EB] hover:-translate-y-2 transition-all duration-500 group">
              <div className="h-64 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800" alt="Dog Show Photography" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center text-white">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-outfit text-white">Dog Show Photography</h3>
                </div>
              </div>
              <div className="p-8">
                <p className="text-[#64748B] mb-6 leading-relaxed">Professional high-resolution photography covering championship dog shows, kennel club competitions, breed showcases, and award ceremonies with crystal-clear quality.</p>
                <ul className="space-y-2 mb-8 text-[#111827] font-semibold">
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> HD & 4K Photography</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Individual Dog Portraits</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Ring Action Shots</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Award Ceremony Coverage</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Owner & Handler Photography</li>
                </ul>
                <Button className="w-full hover:bg-orange-600 transition-colors">View Gallery</Button>
              </div>
            </motion.div>

            {/* Service 2 */}
            <motion.div variants={fadeUpVariant} className="bg-white rounded-[24px] overflow-hidden shadow-lg border border-[#E5E7EB] hover:-translate-y-2 transition-all duration-500 group">
              <div className="h-64 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=800" alt="Dog Show Videography" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center text-white">
                    <Video className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-outfit text-white">Dog Show Videography</h3>
                </div>
              </div>
              <div className="p-8">
                <p className="text-[#64748B] mb-6 leading-relaxed">Cinematic event videography with multi-camera coverage, slow-motion highlights, interviews, and professional editing.</p>
                <ul className="space-y-2 mb-8 text-[#111827] font-semibold">
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> 4K Video Recording</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Drone Coverage</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Highlight Reels</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Full Event Coverage</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> YouTube Ready Videos</li>
                </ul>
                <Button className="w-full hover:bg-orange-600 transition-colors">Watch Videos</Button>
              </div>
            </motion.div>

            {/* Service 3 */}
            <motion.div variants={fadeUpVariant} className="bg-white rounded-[24px] overflow-hidden shadow-lg border border-[#E5E7EB] hover:-translate-y-2 transition-all duration-500 group">
              <div className="h-64 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800" alt="Creative Poster Design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center text-white">
                    <FileEdit className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-outfit text-white">Creative Poster Design</h3>
                </div>
              </div>
              <div className="p-8">
                <p className="text-[#64748B] mb-6 leading-relaxed">Luxury promotional posters, championship winner posters, kennel advertisements, social media creatives, and event branding.</p>
                <ul className="space-y-2 mb-8 text-[#111827] font-semibold">
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Premium Poster Design</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Social Media Creatives</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Winner Certificates</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Event Banners</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Print Ready Designs</li>
                </ul>
                <Button className="w-full hover:bg-orange-600 transition-colors">View Designs</Button>
              </div>
            </motion.div>

            {/* Service 4 */}
            <motion.div variants={fadeUpVariant} className="bg-white rounded-[24px] overflow-hidden shadow-lg border border-[#E5E7EB] hover:-translate-y-2 transition-all duration-500 group">
              <div className="h-64 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800" alt="Dog Show Event Coverage" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center text-white">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-outfit text-white">Dog Show Event Coverage</h3>
                </div>
              </div>
              <div className="p-8">
                <p className="text-[#64748B] mb-6 leading-relaxed">Complete photography and videography solutions for national and international dog shows with professional media management.</p>
                <ul className="space-y-2 mb-8 text-[#111827] font-semibold">
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Live Coverage</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Event Documentation</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Stage Photography</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Ring Coverage</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-orange" /> Closing Ceremony</li>
                </ul>
                <Button className="w-full hover:bg-orange-600 transition-colors">Book Service</Button>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* =========================================
          STATISTICS SECTION
      ========================================= */}
      <section id="stats-section" className="py-20 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-gray-200">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-brand-orange"><Award className="w-6 h-6" /></div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-2"><AnimatedCounter end={500} suffix="+" duration={2} /></h3>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Shows Covered</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-brand-orange"><Camera className="w-6 h-6" /></div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-2"><AnimatedCounter end={25} suffix="k+" duration={2.5} /></h3>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Photos Captured</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col items-center border-l-0 md:border-l border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-brand-orange"><Play className="w-6 h-6 fill-current" /></div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-2"><AnimatedCounter end={5} suffix="k+" duration={2} /></h3>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Videos Delivered</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-brand-orange"><Users className="w-6 h-6" /></div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-2"><AnimatedCounter end={300} suffix="+" duration={2} /></h3>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Happy Clients</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================
          WHY CHOOSE US
      ========================================= */}
      <section className="py-24 bg-[#111827] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-brand-orange font-bold tracking-wider uppercase text-sm mb-2 block">Our Advantage</span>
            <h2 className="text-4xl md:text-5xl font-outfit font-extrabold mb-6">Why Choose Us</h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: <Camera />, title: "Professional Equipment", desc: "Latest Sony, Canon & DJI equipment for unmatched quality." },
              { icon: <Users />, title: "Experienced Team", desc: "Dedicated photographers and videographers with years of dog show experience." },
              { icon: <Clock />, title: "Fast Delivery", desc: "Edited photos and videos delivered quickly and securely." },
              { icon: <ImageIcon />, title: "Creative Editing", desc: "Professional retouching and cinematic color grading." },
              { icon: <Medal />, title: "Pan India Coverage", desc: "Available for dog shows and kennel events across India." },
              { icon: <ShieldCheck />, title: "Trusted by Breeders", desc: "Preferred media partner for breeders, kennel clubs, and championship events." },
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors glass-panel-dark">
                <div className="w-12 h-12 bg-brand-orange/20 text-brand-orange rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold font-outfit mb-3">{feature.title}</h3>
                <p className="text-gray-400 font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================
          CERTIFICATIONS & TRUST SECTION
      ========================================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-outfit font-extrabold text-[#111827] mb-6">Trusted & Certified Professional Media Partner</h2>
            <p className="text-[#64748B] text-lg font-medium leading-relaxed">
              "Our commitment to professionalism, creativity, and quality has made us a trusted media partner for prestigious dog shows, kennel clubs, breeders, and pet events."
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              "Professional Event Photography Certification",
              "Professional Videography Certification",
              "Creative Design Certification",
              "Digital Media Excellence",
              "Event Management Experience",
              "Trusted Dog Show Media Partner",
              "Quality Assurance Commitment",
              "Client Satisfaction Excellence"
            ].map((cert, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="bg-[#F8FAFC] border border-[#E5E7EB] hover:border-yellow-500 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <Award className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
                <h4 className="font-bold text-[#111827] text-sm">{cert}</h4>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================
          CLIENTS & PARTNERS (Logo Slider Mockup)
      ========================================= */}
      <section className="py-16 bg-[#F8FAFC] border-y border-[#E5E7EB] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <span className="text-[#64748B] font-bold tracking-wider uppercase text-sm">Our Trusted Network</span>
        </div>
        <div className="flex space-x-12 animate-marquee whitespace-nowrap opacity-60">
          {[
            "Kennel Clubs", "Dog Show Organizers", "Professional Breeders", 
            "Pet Brands", "Event Sponsors", "Photography Partners",
            "Kennel Clubs", "Dog Show Organizers", "Professional Breeders"
          ].map((partner, i) => (
            <span key={i} className="text-2xl font-outfit font-extrabold text-gray-400 mx-8">{partner}</span>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-marquee { display: inline-block; animation: marquee 20s linear infinite; }
        `}} />
      </section>

      {/* =========================================
          OUR WORK PROCESS
      ========================================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-outfit font-extrabold text-[#111827]">Our Work Process</h2>
          </div>
          
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-[#E5E7EB] -translate-y-1/2 z-0" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              {[
                { step: 1, title: "Book Your Event", icon: <Phone /> },
                { step: 2, title: "Planning & Coordination", icon: <Users /> },
                { step: 3, title: "Professional Coverage", icon: <Camera /> },
                { step: 4, title: "Editing & Quality Check", icon: <FileEdit /> },
                { step: 5, title: "Final Delivery", icon: <CheckCircle /> },
              ].map((process, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F8FAFC] border-4 border-white shadow-lg flex items-center justify-center text-brand-orange mb-4 z-10 relative">
                    {process.icon}
                  </div>
                  <span className="text-brand-orange font-bold text-sm mb-1">Step {process.step}</span>
                  <h4 className="font-bold text-[#111827]">{process.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          GALLERY PREVIEW
      ========================================= */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-outfit font-extrabold text-[#111827] mb-4">Gallery Preview</h2>
              <p className="text-[#64748B] text-lg max-w-2xl font-medium">A glimpse into our recent event coverage, studio portraits, and ring competition captures.</p>
            </div>
            <Link href="/photos">
              <Button className="bg-[#111827] hover:bg-gray-800 text-white shadow-lg">
                View Full Gallery
              </Button>
            </Link>
          </div>

          {/* Masonry Layout */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {[
              { img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80", label: "Dog Championship Shows" },
              { img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80", label: "Professional Dog Portraits" },
              { img: "https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&q=80", label: "Ring Competition" },
              { img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80", label: "Award Ceremony" },
              { img: "https://images.unsplash.com/photo-1563889958748-18e4dd8f731c?auto=format&fit=crop&q=80", label: "Owner & Dog Moments" },
              { img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80", label: "Creative Poster Designs" },
            ].map((photo, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} className="relative break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer premium-shadow bg-white">
                <img src={photo.img} alt={photo.label} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <h3 className="text-white font-bold text-lg">{photo.label}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          TESTIMONIALS
      ========================================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-outfit font-extrabold text-[#111827]">Client Testimonials</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              "The photographs captured every emotion perfectly. Outstanding quality and professionalism.",
              "Best dog show videography team we have worked with.",
              "Our championship event was beautifully documented with cinematic excellence."
            ].map((text, i) => (
              <div key={i} className="bg-[#F8FAFC] border border-[#E5E7EB] p-8 rounded-3xl relative premium-shadow">
                <Quote className="w-10 h-10 text-brand-orange/20 absolute top-6 right-6" />
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, idx) => <Star key={idx} className="w-5 h-5 fill-brand-orange text-brand-orange" />)}
                </div>
                <p className="text-[#111827] font-medium leading-relaxed italic mb-6">"{text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <h4 className="font-bold text-sm text-[#111827]">Verified Client</h4>
                    <p className="text-[#64748B] text-xs">Dog Show Organizer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          CALL TO ACTION
      ========================================= */}
      <section className="relative py-32 bg-[#111827] overflow-hidden">
        <img src="/hero_banner.png" alt="CTA Background" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-outfit font-extrabold text-white mb-8">Ready to Capture Your Next Dog Show?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-white text-[#111827] hover:bg-gray-100">
                <Camera className="w-5 h-5 mr-2" /> Book Photography
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-[#F97316] hover:bg-orange-600 text-white border-none">
                <Video className="w-5 h-5 mr-2" /> Book Videography
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-white/30 text-white hover:bg-white/10 glass-panel-dark">
                <Mail className="w-5 h-5 mr-2" /> Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
