'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { getImageUrl } from '@/lib/api';
import Image from 'next/image';

const MotionImage = motion(Image);

interface ImageLightboxProps {
  images: any[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex, isOpen, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [lastTap, setLastTap] = useState(0);

  // Touch swipe states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [touchStartDist, setTouchStartDist] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);

  // References
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Reset index and scale when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setIsLoaded(false);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  // Reset scale and loader on image change
  useEffect(() => {
    setScale(1);
    setIsLoaded(false);
  }, [currentIndex]);

  // Keyboard navigation & Esc key close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images]);

  // Focus trap inside modal
  useEffect(() => {
    if (!isOpen) return;

    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(focusableElementsString);
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    // Focus close button initially
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }

    const handleTabTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    };

    modal.addEventListener('keydown', handleTabTrap);
    return () => modal.removeEventListener('keydown', handleTabTrap);
  }, [isOpen]);

  const getImgSrc = (img: any) => {
    if (!img) return '';
    if (typeof img === 'string') return getImageUrl(img);
    return getImageUrl(img.imageUrl || img.s3Url || img.cdnUrl || img.src || '');
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  // Double tap to zoom toggle
  const handleTap = (e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      e.preventDefault();
      setScale((prev) => (prev > 1 ? 1 : 2.5));
    }
    setLastTap(now);
  };

  // Touch Swipe handlers for mobile navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches.length === 2) {
      // Pinch start
      const dist = Math.hypot(
        e.targetTouches[0].clientX - e.targetTouches[1].clientX,
        e.targetTouches[0].clientY - e.targetTouches[1].clientY
      );
      setTouchStartDist(dist);
      setInitialScale(scale);
    } else if (e.targetTouches.length === 1) {
      // Swipe start
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.targetTouches.length === 2 && touchStartDist) {
      // Pinch Zooming
      e.preventDefault();
      const dist = Math.hypot(
        e.targetTouches[0].clientX - e.targetTouches[1].clientX,
        e.targetTouches[0].clientY - e.targetTouches[1].clientY
      );
      const factor = dist / touchStartDist;
      const newScale = Math.max(1, Math.min(4, initialScale * factor));
      setScale(newScale);
    } else if (e.targetTouches.length === 1 && scale === 1) {
      // Swiping
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartDist(null);
    if (scale === 1 && touchStart !== null && touchEnd !== null) {
      const distance = touchStart - touchEnd;
      const minSwipeDistance = 50;
      if (distance > minSwipeDistance) {
        handleNext();
      } else if (distance < -minSwipeDistance) {
        handlePrev();
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Preload previous and next images in cache
  const nextIndex = (currentIndex + 1) % images.length;
  const prevIndex = (currentIndex - 1 + images.length) % images.length;
  const nextSrc = getImgSrc(images[nextIndex]);
  const prevSrc = getImgSrc(images[prevIndex]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && images && images.length > 0 && (
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.95)',
          }}
          className="fixed inset-0 z-[999999999] backdrop-blur-md outline-none select-none overflow-hidden"
        >
          {/* Background Preloaders */}
          {nextSrc && <img src={nextSrc} className="hidden" aria-hidden="true" alt="preload" />}
          {prevSrc && <img src={prevSrc} className="hidden" aria-hidden="true" alt="preload" />}

          {/* Top-Left Corner: Image Counter */}
          <div 
            className="absolute top-6 left-6 z-50 text-white/80 font-bold text-sm tracking-wider bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {currentIndex + 1} / {images.length}
          </div>

          {/* Top-Right Corner: Close & Zoom buttons */}
          <div 
            className="absolute top-6 right-6 z-50 flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setScale((prev) => (prev > 1 ? 1 : 2.5))}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
              title={scale > 1 ? "Zoom Out" : "Zoom In"}
              aria-label={scale > 1 ? "Zoom out" : "Zoom in"}
            >
              {scale > 1 ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white text-black hover:scale-110 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg"
              title="Close Gallery"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Fixed Vertically Centered Previous Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white text-white hover:text-black hover:scale-110 shadow-2xl transition-all duration-200 cursor-pointer border border-white/10 backdrop-blur-sm"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 mr-0.5" />
          </button>

          {/* Centered Image Container */}
          <div
            className="relative flex items-center justify-center pointer-events-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Shimmer / Spinner Loading State */}
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-[85vw] h-[65vh] max-w-[1200px] max-h-[800px] bg-white/5 animate-pulse rounded-2xl flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              </div>
            )}

            <MotionImage
              key={currentIndex}
              src={getImgSrc(images[currentIndex])}
              alt={images[currentIndex]?.altText || `Lightbox Image ${currentIndex + 1}`}
              onLoad={() => setIsLoaded(true)}
              onClick={(e) => {
                e.stopPropagation();
                handleTap(e);
              }}
              width={images[currentIndex]?.width || 1920}
              height={images[currentIndex]?.height || 1080}
              unoptimized
              initial={{ opacity: 0 }}
              animate={{
                scale: scale,
                opacity: isLoaded ? 1 : 0,
              }}
              transition={{
                scale: { type: 'spring', stiffness: 300, damping: 25 },
                opacity: { duration: 0.2 }
              }}
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '95vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                cursor: scale > 1 ? 'zoom-out' : 'zoom-in',
                transformOrigin: 'center center',
              }}
              className="shadow-2xl select-none"
            />
          </div>

          {/* Fixed Vertically Centered Next Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white text-white hover:text-black hover:scale-110 shadow-2xl transition-all duration-200 cursor-pointer border border-white/10 backdrop-blur-sm"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 ml-0.5" />
          </button>

          {/* Mobile swipe helper */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none md:hidden">
            <span className="text-white/40 text-xs font-semibold uppercase tracking-widest bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
              Swipe to navigate
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

