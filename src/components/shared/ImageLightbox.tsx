'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react';
import api, { getImageUrl, getOriginalUrl } from '@/lib/api';
import Image from 'next/image';

interface ImageLightboxProps {
  images: any[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  allowDownload?: boolean;
  onDownload?: (photoId: string, index: number) => Promise<void>;
  downloadingId?: string | null;
  downloadCounts?: Record<string, number>;
  onStatsUpdate?: (photoId: string, stats: { viewCount?: number; downloadCount?: number }) => void;
}

export default function ImageLightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
  allowDownload,
  onDownload,
  downloadingId,
  downloadCounts,
  onStatsUpdate,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
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
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, []);

  // Reset index and scale when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      document.body.classList.add('lightbox-active');
      // Lock both body and html scroll completely to prevent any mobile scroll leakage or bouncing
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100vh';
    } else {
      document.body.classList.remove('lightbox-active');
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    }
    return () => {
      document.body.classList.remove('lightbox-active');
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, [isOpen, initialIndex]);

  // Reset scale on image change
  useEffect(() => {
    setScale(1);
  }, [currentIndex]);

  // Views counter tracking
  useEffect(() => {
    if (isOpen && images && images[currentIndex]) {
      const activePhoto = images[currentIndex];
      // Increment views count on the backend
      api.post(`/gallery/photo/${activePhoto.id}/view`)
        .then((res) => {
          const newViewCount = (res.success && res.viewCount !== undefined) ? res.viewCount : (activePhoto.viewCount || 0) + 1;
          activePhoto.viewCount = newViewCount;
          if (onStatsUpdate) {
            onStatsUpdate(activePhoto.id, { viewCount: newViewCount });
          }
        })
        .catch((err) => {
          console.error('Failed to increment view count:', err);
          // Fallback increment locally if api fails
          const newViewCount = (activePhoto.viewCount || 0) + 1;
          activePhoto.viewCount = newViewCount;
          if (onStatsUpdate) {
            onStatsUpdate(activePhoto.id, { viewCount: newViewCount });
          }
        });
    }
  }, [isOpen, currentIndex, images, onStatsUpdate]);

  // Keyboard navigation & Esc key close (disabled on mobile)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (typeof window !== 'undefined' && window.innerWidth <= 768) return;

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
    if (typeof img === 'string') return getOriginalUrl(img);
    return getOriginalUrl(img.mediumUrl || img.imageUrl || img.s3Url || img.cdnUrl || img.src || '');
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

  if (!mounted) return null;

  const activeImage = images[currentIndex];
  const imageSrc = activeImage ? getImgSrc(activeImage) : '';

  return createPortal(
    <AnimatePresence>
      {isOpen && images && images.length > 0 && (
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            body.lightbox-active > *:not(.lightbox-portal) {
              visibility: hidden !important;
            }
            .lightbox-portal {
              width: 100vw !important;
              max-width: 100vw !important;
              height: 100vh !important;
              max-height: 100vh !important;
              overflow: hidden !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          `}} />
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
              position: 'fixed',
              inset: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 99999,
              background: '#000000',
            }}
            className="fixed inset-0 z-[99999] outline-none select-none overflow-hidden touch-none w-screen h-screen bg-black lightbox-portal"
          >
            {/* Main Full-Screen Layout Container */}
            <div className="relative w-full h-full flex flex-col justify-between p-4 md:p-6">
            
            {/* Header: height 60px, flex, space-between, items-center */}
            <div 
              style={{
                height: '60px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                zIndex: 9999,
              }}
              className="px-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button: Left, width auto, padding 0 16px */}
              <button
                onClick={onClose}
                style={{
                  width: 'auto',
                  padding: '0 16px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
                className="cursor-pointer transition-all hover:bg-white/20 active:scale-95 flex-shrink-0 whitespace-nowrap"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-white" />
                <span>Close</span>
              </button>

              {/* Counter: Right, fixed right */}
              <div 
                style={{
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px',
                  borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  color: '#ffffff',
                  fontWeight: 'extrabold',
                  fontSize: '14px',
                  letterSpacing: '0.05em',
                }}
                className="flex-shrink-0 whitespace-nowrap select-none"
              >
                {currentIndex + 1} / {images.length}
              </div>
            </div>

            {/* Middle Image Area (flex-grow/flex-1, display flex, items-center, justify-center, centering the image) */}
            <div 
              className="w-full flex-1 flex items-center justify-center min-h-0 relative my-auto px-12 sm:px-16 touch-none select-none"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {imageSrc && (
                <Image
                  src={imageSrc}
                  alt={activeImage?.altText || `Lightbox Image ${currentIndex + 1}`}
                  width={activeImage?.width || 1920}
                  height={activeImage?.height || 1080}
                  priority
                  unoptimized
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTap(e);
                  }}
                  className={`max-w-[92vw] max-h-[70vh] object-contain select-none pointer-events-auto w-auto h-auto ${scale > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.2s ease',
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  draggable={false}
                />
              )}
            </div>

            {/* Left Navigation Arrow: 44px x 44px, background rgba(0,0,0,.55), backdrop blur, over image */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              style={{
                position: 'fixed',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 9999,
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,.55)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              className="cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Right Navigation Arrow: 44px x 44px, background rgba(0,0,0,.55), backdrop blur, over image */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              style={{
                position: 'fixed',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 9999,
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,.55)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              className="cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Bottom Controls Area (Stats, Download Button, Swipe helper) */}
            <div 
              className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[320px] flex flex-col items-center gap-3.5 select-none z-[9999] bg-black/90 px-4 py-3 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Statistics Row - Hidden on mobile */}
              <div className="hidden md:flex items-center justify-center gap-4 text-sm font-semibold text-white/90">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                  {(activeImage?.viewCount ?? 0).toLocaleString()} <span className="text-white/70">Visitors</span>
                </span>

                {allowDownload && activeImage?.allowDownload !== false && (
                  <>
                    <span className="text-white/30">|</span>
                    <span className="flex items-center gap-1.5">
                      <Download className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                      {((downloadCounts && downloadCounts[activeImage?.id]) ?? activeImage?.downloadCount ?? 0).toLocaleString()} <span className="text-white/70">Downloads</span>
                    </span>
                  </>
                )}
              </div>

              {/* Download Button */}
              {allowDownload && activeImage?.allowDownload !== false && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (activeImage && onDownload) {
                      await onDownload(activeImage.id, currentIndex);
                      if (onStatsUpdate) {
                        const currentCount = (downloadCounts && downloadCounts[activeImage.id]) ?? activeImage.downloadCount ?? 0;
                        onStatsUpdate(activeImage.id, { downloadCount: currentCount + 1 });
                      }
                    }
                  }}
                  disabled={downloadingId === activeImage?.id}
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-65 text-white flex items-center justify-center gap-2 transition-all cursor-pointer font-bold text-sm shadow-md border border-emerald-500/20 active:scale-95"
                  title="Download Photo"
                >
                  {downloadingId === activeImage?.id ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download Photo
                    </>
                  )}
                </button>
              )}

              {/* Swipe Helper Text */}
              <div className="pointer-events-none mt-1 text-center">
                <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">
                  Swipe Left / Right To Navigate
                </span>
              </div>
            </div>

          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

