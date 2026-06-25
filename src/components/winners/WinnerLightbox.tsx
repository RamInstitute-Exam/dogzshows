'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Award, MapPin, Calendar, Hash } from 'lucide-react';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { getImageUrl } from '@/lib/api';

interface WinnerLightboxProps {
  winner: any;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function WinnerLightbox({ winner, isOpen, onClose, onNext, onPrev }: WinnerLightboxProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setImageLoaded(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, winner?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !winner) return null;

  const imageUrl = winner.imageUrl || getImageUrl(winner.winnerImage);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Controls */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {onPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {onNext && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        {/* Content */}
        <div 
          className="relative w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 p-4 md:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Main Image */}
          <div className="relative w-full md:w-2/3 h-[50vh] md:h-[80vh] flex items-center justify-center">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
              </div>
            )}
            {imageUrl && (
              <img
                src={imageUrl}
                alt={winner.awardTitle || winner.awardCategory || 'Winner'}
                className={`max-w-full max-h-full object-contain rounded-lg transition-opacity duration-300 shadow-2xl ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
            )}
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-1/3 bg-zinc-900/80 rounded-2xl p-6 border border-white/10 flex flex-col gap-6 text-white max-h-[40vh] md:max-h-[80vh] overflow-y-auto">
            <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 mb-2">
                {winner.awardTitle || winner.awardCategory || winner.category?.name || 'Championship Winner'}
              </h2>
              {winner.dogName && (
                <p className="text-lg text-slate-300 font-medium">
                  {winner.dogName}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {(winner.event?.name || winner.competition) && (
                <div className="flex items-start gap-3">
                  <TrophyIcon className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Event</p>
                    <p className="text-base text-slate-200">{winner.event?.name || winner.competition}</p>
                  </div>
                </div>
              )}

              {winner.club?.name && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Club</p>
                    <p className="text-base text-slate-200">{winner.club.name}</p>
                  </div>
                </div>
              )}

              {(winner.year || winner.showYear) && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Year</p>
                    <p className="text-base text-slate-200">{winner.year || winner.showYear}</p>
                  </div>
                </div>
              )}

              {winner.placement && (
                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Placement</p>
                    <p className="text-base text-slate-200">{winner.placement}</p>
                  </div>
                </div>
              )}
              
              {winner.breedName && (
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Breed</p>
                    <p className="text-base text-slate-200">{winner.breedName}</p>
                  </div>
                </div>
              )}
            </div>

            {winner.description && (
              <div className="mt-auto pt-6 border-t border-white/10">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {winner.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function TrophyIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
