'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { getImageUrl } from '@/lib/api';

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
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (isOpen && activeThumbnailRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentIndex, isOpen]);

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
            height: '100vh',
            minHeight: '100vh',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
          className="fixed inset-0 z-[999999999] flex flex-col justify-between bg-black/95 backdrop-blur-md outline-none select-none"
        >
          {/* Background Preloader for smooth transitions */}
          {nextSrc && <img src={nextSrc} className="hidden" aria-hidden="true" alt="preload" />}
          {prevSrc && <img src={prevSrc} className="hidden" aria-hidden="true" alt="preload" />}

          {/* Top Header / Actions Area */}
          <div className="w-full flex items-center justify-between p-4 z-50" onClick={(e) => e.stopPropagation()}>
            {/* Image Counter */}
            <div className="text-white/80 font-bold text-sm tracking-wider bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Action Buttons (Zoom Indicators + Close) */}
            <div className="flex items-center gap-3">
              {scale > 1 ? (
                <button
                  onClick={() => setScale(1)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Reset Zoom"
                  aria-label="Reset zoom"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setScale(2.5)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Zoom In"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white text-black hover:scale-110 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg"
                title="Close Gallery"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Content Area: Image + Navigation */}
          <div
            className="flex-1 relative flex items-center justify-center w-full overflow-hidden px-4 md:px-12"
            onClick={(e) => {
              // Close popup when clicking outside the main image container
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
          >
            {/* Left Arrow (Desktop Only) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-6 z-50 hidden md:flex w-14 h-14 items-center justify-center rounded-full bg-white/10 hover:bg-white text-white hover:text-black hover:scale-110 shadow-2xl transition-all duration-200 cursor-pointer border border-white/10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8 mr-0.5" />
            </button>

            {/* Large Image Container */}
            <div
              className="relative flex items-center justify-center max-w-[95vw] max-h-[75vh] md:max-w-[85vw] md:max-h-[80vh] pointer-events-auto"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Shimmer / Spinner Loading State */}
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-10 rounded-[20px] overflow-hidden">
                  <div className="absolute inset-0 bg-white/5 animate-pulse" />
                  <div className="w-10 h-10 border-4 border-white/20 border-t-foreground rounded-full animate-spin" />
                </div>
              )}

              <motion.img
                key={currentIndex}
                src={getImgSrc(images[currentIndex])}
                alt={images[currentIndex]?.altText || `Lightbox Image ${currentIndex + 1}`}
                onLoad={() => setIsLoaded(true)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTap(e);
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{
                  scale: scale,
                  opacity: isLoaded ? 1 : 0,
                }}
                transition={{
                  scale: { type: 'spring', stiffness: 300, damping: 25 },
                  opacity: { duration: 0.2 }
                }}
                style={{
                  cursor: scale > 1 ? 'zoom-out' : 'zoom-in',
                  transformOrigin: 'center center',
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                className="max-w-full max-h-[70vh] md:max-h-[80vh] object-contain rounded-[20px] shadow-2xl transition-shadow duration-300 pointer-events-auto select-none"
              />
            </div>

            {/* Right Arrow (Desktop Only) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-6 z-50 hidden md:flex w-14 h-14 items-center justify-center rounded-full bg-white/10 hover:bg-white text-white hover:text-black hover:scale-110 shadow-2xl transition-all duration-200 cursor-pointer border border-white/10"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8 ml-0.5" />
            </button>
          </div>

          {/* Footer Area: Mobile Navigation */}
          <div className="w-full bg-gradient-to-t from-black/80 to-transparent pt-6 pb-8 z-50 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>

            {/* Mobile Overlay Arrows */}
            <div className="flex md:hidden items-center justify-center gap-8 w-full px-4">
              <button
                onClick={handlePrev}
                className="w-12 h-12 rounded-full bg-white/15 active:bg-white/30 text-white flex items-center justify-center cursor-pointer border border-white/15"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 mr-0.5" />
              </button>
              <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Swipe</span>
              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-full bg-white/15 active:bg-white/30 text-white flex items-center justify-center cursor-pointer border border-white/15"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 ml-0.5" />
              </button>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
