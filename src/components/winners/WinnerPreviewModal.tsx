'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { getImageUrl } from '@/lib/api';

interface WinnerPreviewModalProps {
  winner: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function WinnerPreviewModal({ winner, isOpen, onClose }: WinnerPreviewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !winner) return null;

  const dogName = winner.dogName || 'Champion Dog';
  const imageUrl = winner.winnerImage || winner.imageUrl;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer transition-opacity duration-300"
      />

      {/* Modal Image Container */}
      <div className="relative w-full max-w-5xl flex justify-center items-center z-10 animate-in fade-in zoom-in-95 duration-300 pointer-events-none">
        
        {imageUrl && (
          <div className="relative pointer-events-auto">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute -top-12 right-0 z-50 p-2 bg-black/50 hover:bg-black/80 text-white hover:text-amber-400 rounded-full border border-white/10 backdrop-blur transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <img 
              src={getImageUrl(imageUrl)} 
              alt={dogName} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
            />
          </div>
        )}
      </div>
    </div>
  );
}
