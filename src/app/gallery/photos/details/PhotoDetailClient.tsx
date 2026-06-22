'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, User, MapPin, Tag, Share2, ChevronRight,
  Camera, Calendar, Heart, ZoomIn, X, ChevronLeft, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';

interface PhotoDetailClientProps {
  initialPhoto?: any;
  initialPhotos?: any[];
}

export default function PhotoDetailClient({ initialPhoto, initialPhotos }: PhotoDetailClientProps) {
  const photo = initialPhoto;
  const allPhotos = initialPhotos || [];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);


  // Use category or album for the photo strip and lightbox context
  const stripPhotos = allPhotos.filter((p: any) => 
    p.category?.id === photo?.category?.id || p.album?.id === photo?.album?.id
  );
  
  // If no related, just show the photo itself in the strip
  const presentationPhotos = stripPhotos.length > 0 ? stripPhotos : (photo ? [photo] : []);

  // Set initial lightbox index based on the current photo
  useEffect(() => {
    if (photo && presentationPhotos.length > 0) {
      const idx = presentationPhotos.findIndex(p => p.slug === photo.slug);
      if (idx !== -1) {
        setCurrentLightboxIndex(idx);
      }
    }
  }, [photo, presentationPhotos]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentLightboxIndex(prev => (prev === 0 ? presentationPhotos.length - 1 : prev - 1));
  }, [presentationPhotos.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentLightboxIndex(prev => (prev === presentationPhotos.length - 1 ? 0 : prev + 1));
  }, [presentationPhotos.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, handlePrev, handleNext]);



  if (!photo) {
    return (
      <PageContainer>
        <div className="flex-grow flex flex-col items-center justify-center gap-4 text-[#94A3B8] p-8">
          <Camera className="w-16 h-16 opacity-30" />
          <p className="text-xl font-semibold text-white">Photography not found</p>
          <Link href="/gallery/photos" className="text-primary hover:underline font-bold">← Return to Gallery</Link>
        </div>
      </PageContainer>
    );
  }

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const formattedDate = photo.createdAt 
    ? new Date(photo.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown Date';

  return (
    <PageContainer>
      
      {/* ────────────────────────────────────────────────────────
          LIGHTBOX MODAL
      ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col"
          >
            {/* Lightbox Toolbar */}
            <div className="flex items-center justify-between p-6 text-white absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex flex-col">
                <span className="font-bold text-lg">{presentationPhotos[currentLightboxIndex]?.title}</span>
                <span className="text-xs text-white/50">{currentLightboxIndex + 1} of {presentationPhotos.length}</span>
              </div>
              <div className="flex items-center gap-4">

                <button 
                  onClick={() => setLightboxOpen(false)}
                  className="p-3 bg-white/10 hover:bg-red-500 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Main View */}
            <div className="flex-1 flex items-center justify-center relative px-4 sm:px-16" onClick={() => setLightboxOpen(false)}>
              <button 
                onClick={handlePrev}
                className="absolute left-4 sm:left-8 p-4 bg-black/50 hover:bg-primary hover:text-primary-foreground rounded-full backdrop-blur-md transition-all z-10 border border-white/10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <motion.img
                key={currentLightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={presentationPhotos[currentLightboxIndex]?.cdnUrl}
                alt={presentationPhotos[currentLightboxIndex]?.title}
                className="max-h-[85vh] max-w-full object-contain drop-shadow-2xl cursor-default"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
              />

              <button 
                onClick={handleNext}
                className="absolute right-4 sm:right-8 p-4 bg-black/50 hover:bg-primary hover:text-primary-foreground rounded-full backdrop-blur-md transition-all z-10 border border-white/10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8] mb-8 tracking-wider uppercase">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/gallery/photos" className="hover:text-primary transition-colors">Media Gallery</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary truncate max-w-[200px] sm:max-w-none">{photo.title}</span>
        </nav>

        {/* 75 / 25 SPLIT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[75%_25%] gap-8 items-start">
          
          {/* ═════════ LEFT COLUMN (HERO & STRIP) ═════════ */}
          <div className="flex flex-col gap-6 w-full min-w-0">
            {/* HERO IMAGE CONTAINER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full aspect-auto md:h-[75vh] 2xl:h-[85vh] bg-[#0A0A0A] rounded-[32px] overflow-hidden group border border-white/5 cursor-zoom-in shadow-2xl"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={photo.cdnUrl}
                alt={photo.altText || photo.title}
                fill={false}
                width={800}
                height={1200}
                quality={100}
                unoptimized
                sizes="100vw"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center"
                }}
                className="gallery-image transition-transform duration-1000 group-hover:scale-105"
              />
              
              {/* Elegant dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Quick Actions Overlay */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-3">
                <div className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-primary hover:text-primary-foreground transition-colors shadow-lg">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
            </motion.div>

            {/* PHOTO STRIP (Related) */}
            {presentationPhotos.length > 1 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                    {photo.category?.name || 'Related'} Collection
                  </h3>
                  <span className="text-xs text-[#94A3B8] font-semibold">{presentationPhotos.length} Items</span>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent">
                  {presentationPhotos.map((p: any) => {
                    const isActive = p.slug === photo.slug;
                    return (
                      <Link href={`/gallery/show-photos/details?slug=${p.slug}`} key={p.id} className="snap-start shrink-0">
                        <div className={`relative w-[140px] aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 bg-black ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#020817] shadow-md' : 'opacity-50 hover:opacity-100 border border-white/10'}`}>
                          <img src={p.cdnUrl} alt={p.title} className="w-full h-full object-contain" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* ═════════ RIGHT COLUMN (STICKY GLASSMORPHISM PANEL) ═════════ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-8 flex flex-col gap-8 p-8 rounded-[28px] bg-[rgba(14,20,36,0.85)] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div>
              {photo.category?.name && (
                <span className="inline-block bg-primary/10 text-primary text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 border border-primary/20">
                  {photo.category.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug tracking-tight mb-3">
                {photo.title}
              </h1>
              {photo.description && (
                <p className="text-[#94A3B8] text-sm leading-[1.8] max-w-[65ch]">
                  {photo.description}
                </p>
              )}
            </div>

            {/* Premium Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-6 border-y border-white/5">
              
              {photo.photographer && (
                <div 
                  className="bg-[#0A0A0A] rounded-2xl border border-white/5 flex flex-col justify-center gap-1.5 w-full"
                  style={{ minHeight: '80px', height: 'auto', padding: '16px 18px' }}
                >
                  <div className="flex items-center gap-2 text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-primary" /> Photographer
                  </div>
                  <span 
                    className="text-sm font-bold text-white"
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal', lineHeight: '1.5' }}
                  >
                    {photo.photographer}
                  </span>
                </div>
              )}

              {photo.location && (
                <div 
                  className="bg-[#0A0A0A] rounded-2xl border border-white/5 flex flex-col justify-center gap-1.5 w-full"
                  style={{ minHeight: '80px', height: 'auto', padding: '16px 18px' }}
                >
                  <div className="flex items-center gap-2 text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Location
                  </div>
                  <span 
                    className="text-sm font-bold text-white"
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal', lineHeight: '1.5' }}
                  >
                    {photo.location}
                  </span>
                </div>
              )}

              {photo.breed && (
                <div 
                  className="bg-[#0A0A0A] rounded-2xl border border-white/5 flex flex-col justify-center gap-1.5 w-full"
                  style={{ minHeight: '80px', height: 'auto', padding: '16px 18px' }}
                >
                  <div className="flex items-center gap-2 text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5 text-primary" /> Breed
                  </div>
                  <span 
                    className="text-sm font-bold text-white"
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal', lineHeight: '1.5' }}
                  >
                    {photo.breed}
                  </span>
                </div>
              )}

              {photo.album?.title && (
                <div 
                  className="bg-[#0A0A0A] rounded-2xl border border-white/5 flex flex-col justify-center gap-1.5 w-full"
                  style={{ minHeight: '80px', height: 'auto', padding: '16px 18px' }}
                >
                  <div className="flex items-center gap-2 text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">
                    <Camera className="w-3.5 h-3.5 text-primary" /> Album
                  </div>
                  <span 
                    className="text-sm font-bold text-white"
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal', lineHeight: '1.5' }}
                  >
                    {photo.album.title}
                  </span>
                </div>
              )}

              <div 
                className="bg-[#0A0A0A] rounded-2xl border border-white/5 flex flex-col justify-center gap-1.5 w-full"
                style={{ minHeight: '80px', height: 'auto', padding: '16px 18px' }}
              >
                <div className="flex items-center gap-2 text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Date
                </div>
                <span 
                  className="text-sm font-bold text-white"
                  style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal', lineHeight: '1.5' }}
                >
                  {formattedDate}
                </span>
              </div>

              <div 
                className="bg-[#0A0A0A] rounded-2xl border border-white/5 flex flex-col justify-center gap-1.5 w-full"
                style={{ minHeight: '80px', height: 'auto', padding: '16px 18px' }}
              >
                <div className="flex items-center gap-2 text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5 text-primary" /> Views
                </div>
                <span 
                  className="text-sm font-bold text-white"
                  style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal', lineHeight: '1.5' }}
                >
                  {photo.views || 0}
                </span>
              </div>

            </div>

            {/* Clickable Rounded Pill Tags */}
            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(photo.tags) ? photo.tags : []).map((tag: string) => (
                  <Link 
                    key={tag} 
                    href={`/gallery/photos?q=${tag}`}
                    className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] rounded-full font-bold uppercase tracking-wider transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-2">

              
              <div className="flex gap-3">
                <button
                  onClick={share}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[16px] text-xs font-bold text-white transition-all hover:-translate-y-0.5"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[16px] text-xs font-bold text-primary transition-all hover:-translate-y-0.5"
                  onClick={() => alert("Added to favorites!")}
                >
                  <Heart className="w-4 h-4" /> Favorite
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}
