'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, ZoomIn, ZoomOut, Maximize2, Minimize2, Search,
  Download, Printer, Share2, ChevronLeft, ChevronRight, X, Volume2, VolumeX, RefreshCw, AlertCircle, Eye, Settings
} from 'lucide-react';
import { Howl } from 'howler';
import Image from 'next/image';
import HTMLFlipBook from 'react-pageflip';
import api, { getOriginalUrl } from '@/lib/api';
import { motion, AnimatePresence, useAnimate } from 'framer-motion';

const magazineCache: Record<string, Magazine> = {};

interface PageData {
  pageNumber: number;
  imageUrl: string;
  thumbnailUrl: string;
  text: string;
}

interface Magazine {
  id: string;
  title: string;
  slug: string;
  edition: string | null;
  month: string | null;
  year: number | null;
  totalPages: number;
  pdfUrl: string;
  pages: PageData[] | null;
  enableDownload: boolean;
  enablePrint: boolean;
  enableShare: boolean;
  enableZoom: boolean;
  enableFullscreen: boolean;
  enableSearch: boolean;
  enablePageSound: boolean;
  enableAutoFlip: boolean;
  enableRtl: boolean;
  status: string;
}

// ForwardRef Wrapper for StPageFlip Compatibility
const FlipPage = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-[#fdfdfc] shadow-xl relative select-none w-full h-full overflow-hidden ${className || ''}`}
      >
        {children}
      </div>
    );
  }
);
FlipPage.displayName = 'FlipPage';

export default function MagazineViewerClientPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Intro Animation State
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [introScope, animate] = useAnimate();

  // Viewer Configs
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Toolbar auto-hide state
  const [showToolbar, setShowToolbar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 500, height: 707, wrapperWidth: 1000, wrapperHeight: 707 });
  const [bookScale, setBookScale] = useState(1);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    function handleResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        const PAGE_WIDTH = 500;
        const PAGE_HEIGHT = 707;

        let mobileMode = false;
        let bookWidth = PAGE_WIDTH * 2;
        let scale = 1;

        let mobileLandscape = w < 768;

        if (mobileLandscape) {
          // Dedicated Mobile Landscape Mode
          // Rotate 90deg: width becomes h, height becomes w
          const availableRotatedW = h - 60; // 30px margin top/bottom
          const availableRotatedH = w - 60; // 30px margin left/right
          scale = Math.min(
            availableRotatedW / bookWidth,
            availableRotatedH / PAGE_HEIGHT
          );
        } else {
          const availableW = w * 0.95; // 95% of screen width to allow slight padding
          const availableH = h - 160;  // Subtract Header (72px) + Footer (80px)

          scale = Math.min(
            availableW / bookWidth,
            availableH / PAGE_HEIGHT
          );
        }

        setIsMobileLandscape(mobileLandscape);
        setIsMobile(false); // Force 2-page spread
        setIsDesktop(w >= 1024);
        setBookScale(scale);
        setDimensions({
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          wrapperWidth: bookWidth,
          wrapperHeight: PAGE_HEIGHT
        });
        setIsReady(true);
      }, 100);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []);

  // References
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Touch tracking refs for mobile landscape gestures
  const touchStateRef = useRef<{
    startY: number;
    startX: number;
    lastY: number;
    lastX: number;
    startTime: number;
    lastTapTime: number;
    pinchStartDist: number | null;
  }>({
    startY: 0,
    startX: 0,
    lastY: 0,
    lastX: 0,
    startTime: 0,
    lastTapTime: 0,
    pinchStartDist: null,
  });

  // Derived Values
  const pages = useMemo(() => magazine?.pages || [], [magazine]);
  const totalPages = magazine?.totalPages || 0;
  const isCover = currentPage === 1;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return pages.filter((page) =>
      page.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, pages]);

  // Turn Sound Howler Instance
  const turnSound = useMemo(() => {
    return new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav'],
      html5: true,
      volume: soundVolume,
    });
  }, [soundVolume]);

  // Load magazine details
  useEffect(() => {
    if (!slug || slug === 'placeholder' || slug === '_') {
      setLoading(false);
      return;
    }

    const fetchMagazine = async () => {
      try {
        if (magazineCache[slug]) {
          setMagazine(magazineCache[slug]);
          setIsMuted(!magazineCache[slug].enablePageSound);

          if (magazineCache[slug].pages && magazineCache[slug].pages.length > 0) {
            setIsPlayingIntro(true);
          }

          setLoading(false);
          return;
        }

        const res = await api.get(`/public/magazines/${slug}`);
        if (res.success && res.data) {
          magazineCache[slug] = res.data;
          setMagazine(res.data);
          setIsMuted(!res.data.enablePageSound);

          if (res.data.pages && res.data.pages.length > 0) {
            setIsPlayingIntro(true);
          }

          // Resume reading progress
          const savedPage = localStorage.getItem(`mag_progress_${res.data.id}`);
          if (savedPage) {
            const parsedPage = parseInt(savedPage);
            if (parsedPage >= 1 && parsedPage <= res.data.totalPages) {
              setCurrentPage(parsedPage);
            }
          }
        } else {
          setError('Magazine not found.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load magazine.');
      } finally {
        setLoading(false);
      }
    };
    fetchMagazine();
  }, [slug]);

  // Sync progress to localStorage
  useEffect(() => {
    if (magazine) {
      localStorage.setItem(`mag_progress_${magazine.id}`, currentPage.toString());
    }
  }, [currentPage, magazine]);

  // Toolbar Auto-Hide Management
  const resetHideTimer = () => {
    setShowToolbar(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowToolbar(false);
    }, 4000); // Hide toolbar after 4 seconds of inactivity
  };

  useEffect(() => {
    const handleActivity = () => resetHideTimer();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    resetHideTimer();
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Intro Animation Sequence Driver
  useEffect(() => {
    if (!isPlayingIntro || !introScope.current) return;

    let isCancelled = false;

    const playIntroSequence = async () => {
      try {
        // Step 1: Wait for background fade to black
        await new Promise(r => setTimeout(r, 300));
        if (isCancelled) return;

        // Step 2 & 3: Tumbling Fall (from -140vh, 1080deg rotation)
        await animate(".intro-book-wrapper",
          { y: ['-140vh', '0vh'], scale: [0.5, 1.05], rotateZ: [-25, 1080], rotateX: [35, 0], rotateY: [10, 0], opacity: [0, 1] },
          { duration: 2.0, ease: "easeInOut" }
        );
        if (isCancelled) return;

        // Step 4: Soft Bounce (Spring)
        await animate(".intro-book-wrapper", { scale: 1.0 }, { type: "spring", stiffness: 300, damping: 15, duration: 0.4 });
        if (isCancelled) return;

        // Step 5: Camera Zoom In
        await animate(".intro-book-wrapper", { scale: 1.35 }, { duration: 0.7, ease: "easeInOut" });
        if (isCancelled) return;

        // Reveal inner page underneath before opening cover
        animate(".intro-inner-page", { opacity: 1 }, { duration: 0.1 });

        // Step 6 & 7: Cover opens with 3D tilt
        await animate(".intro-cover", { rotateY: -170 }, { duration: 0.8, ease: "easeInOut" });
        if (isCancelled) return;

        // Step 8: Zoom inside massive
        await animate(".intro-book-wrapper", { scale: 5, opacity: 0 }, { duration: 0.6, ease: "easeIn" });
        if (isCancelled) return;

        // Step 9: Finish
        setIsPlayingIntro(false);
      } catch (e) {
        // Animation interrupted
      }
    };

    playIntroSequence();

    return () => { isCancelled = true; };
  }, [isPlayingIntro, animate, slug, introScope]);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setShowSearch(false);
      }
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [magazine, currentPage, orientation]);

  if (!slug || slug === 'placeholder' || slug === '_') {
    return (
      <div className="flex-1 w-full h-[calc(100vh-var(--nav-height))] bg-zinc-950 flex flex-col items-center justify-center space-y-6 text-white">
        <RefreshCw className="w-12 h-12 animate-spin text-red-500" />
      </div>
    );
  }

  if (loading || !isReady) {
    return (
      <div className="flex-1 w-full h-[calc(100vh-var(--nav-height))] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black flex flex-col justify-between overflow-hidden relative">
        <header className="h-18 px-4 sm:px-6 bg-zinc-900 border-b border-white/5 flex items-center justify-between z-40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
              <div className="h-2 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="w-10 h-10 bg-white/5 rounded-xl animate-pulse hidden sm:block" />)}
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center relative overflow-hidden px-2.5 sm:px-5 md:px-10 py-18">
          <div className="flex items-center justify-center gap-4 md:gap-8 lg:gap-12 w-full h-full relative">
            <div className="w-14 h-14 rounded-full bg-white/5 animate-pulse hidden md:block shrink-0" />

            <div
              className="relative shadow-2xl rounded-2xl bg-zinc-900 border border-white/5 animate-pulse flex items-center justify-center overflow-hidden"
              style={{
                width: dimensions.wrapperWidth || (isMobile ? dimensions.width : dimensions.width * 2) || 550,
                height: dimensions.wrapperHeight || dimensions.height || 780,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
            </div>

            <div className="w-14 h-14 rounded-full bg-white/5 animate-pulse hidden md:block shrink-0" />
          </div>
        </main>

        <footer className="h-20 bg-zinc-900 border-t border-white/5 flex items-center justify-center px-6 z-40">
          <div className="flex items-center gap-6">
            <div className="w-24 h-8 bg-white/5 rounded-xl animate-pulse" />
            <div className="w-32 h-4 bg-white/5 rounded animate-pulse" />
            <div className="w-24 h-8 bg-white/5 rounded-xl animate-pulse" />
          </div>
        </footer>
      </div>
    );
  }

  if (error || !magazine) {
    return (
      <div className="flex-1 w-full h-[calc(100vh-var(--nav-height))] bg-zinc-950 flex flex-col items-center justify-center space-y-4 text-white p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold font-outfit">Failed to open book</h2>
        <p className="text-zinc-400 max-w-md text-sm">{error || 'Magazine metadata is unavailable.'}</p>
        <button
          onClick={() => router.push('/e-magazines')}
          className="mt-4 px-6 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-sm transition-all"
        >
          Return to gallery
        </button>
      </div>
    );
  }

  const handleNext = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const handlePrev = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const handleZoomIn = () => {
    if (!magazine.enableZoom) return;
    setZoom((z) => Math.min(2.5, z + 0.25));
  };

  const handleZoomOut = () => {
    if (!magazine.enableZoom) return;
    setZoom((z) => {
      const newZoom = Math.max(1, z - 0.25);
      if (newZoom <= 1) setPan({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const handleFullscreenToggle = () => {
    if (!magazine.enableFullscreen) return;
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen().catch(() => { });
    } else {
      document.exitFullscreen();
    }
  };

  const handlePrint = () => {
    if (!magazine.enablePrint) return;
    window.print();
  };

  const handleShare = () => {
    if (!magazine.enableShare) return;
    navigator.clipboard.writeText(window.location.href);
    alert('Share link copied to clipboard!');
  };

  const jumpToPage = (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    if (bookRef.current) {
      // react-pageflip page indexes are 0-indexed, so page 1 is index 0
      bookRef.current.pageFlip().turnToPage(pageNum - 1);
    }
  };

  const onFlip = (e: { data: number }) => {
    const newPage = e.data + 1;
    setCurrentPage(newPage);
  };

  const onChangeState = (e: { data: string }) => {
    // Play page turn sound the moment they start dragging or flipping
    if ((e.data === 'user_fold' || e.data === 'flipping') && magazine?.enablePageSound && !isMuted) {
      if (!turnSound.playing()) {
        turnSound.play();
      }
    }
  };

  const onChangeOrientation = (e: { data: 'portrait' | 'landscape' }) => {
    setOrientation(e.data);
  };

  return (
    <div
      ref={viewerRef}
      className="flex-1 w-full h-[calc(100vh-var(--nav-height))] max-w-[100vw] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-900 to-black text-white flex flex-col justify-between overflow-hidden select-none font-sans relative"
      onWheel={(e) => {
        if (zoom > 1 || e.ctrlKey) {
          if (e.deltaY < 0) handleZoomIn();
          else handleZoomOut();
        }
      }}
    >
      {/* ── CENTRAL INTERACTIVE CANVAS ── */}
      <main className="flex-1 flex items-start justify-center relative overflow-hidden px-2.5 sm:px-5 md:px-10 py-4">

        {/* Search Panel overlay */}
        {showSearch && (
          <div className="absolute top-0 left-0 h-full w-80 bg-zinc-900 border-r border-white/5 z-35 shadow-2xl flex flex-col p-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="font-extrabold text-sm font-outfit flex items-center gap-1.5">
                <Search className="w-4.5 h-4.5 text-zinc-400" /> Search Pages
              </span>
              <button onClick={() => setShowSearch(false)} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mt-4 px-4 py-2.5 bg-background border border-white/10 text-white rounded-xl outline-none focus:border-primary text-xs font-semibold"
            />

            <div className="flex-1 overflow-y-auto mt-4 space-y-2">
              {searchQuery.trim() && searchResults.map((p) => (
                <button
                  key={p.pageNumber}
                  onClick={() => {
                    jumpToPage(p.pageNumber);
                    setShowSearch(false);
                  }}
                  className="w-full text-left p-3 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all flex flex-col gap-1 cursor-pointer"
                >
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                    Page {p.pageNumber}
                  </span>
                  <p className="text-zinc-300 text-xs font-medium line-clamp-2 italic">
                    &ldquo;{p.text}&rdquo;
                  </p>
                </button>
              ))}

              {searchQuery.trim() && searchResults.length === 0 && (
                <div className="text-center text-zinc-500 py-12 text-xs font-semibold">
                  No matching content found
                </div>
              )}

              {!searchQuery.trim() && (
                <div className="text-center text-zinc-500 py-12 text-xs font-semibold">
                  Type query to search pages
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ROW LAYOUT: ARROW ◀ | BOOK | ARROW ▶ ── */}
        <div className="flex items-center justify-center gap-0 md:gap-8 lg:gap-12 w-full h-full max-w-[100vw] relative overflow-hidden">

          {/* Glass Left Navigation Arrow */}
          <button
            onClick={handlePrev}
            disabled={currentPage <= 1}
            className={`w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all select-none hidden md:flex shrink-0 ${currentPage <= 1 ? 'opacity-25 cursor-not-allowed' : 'hover:scale-105 hover:bg-white/15 cursor-pointer'
              }`}
            title="Previous Page"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {/* Zoom Wrapper */}
          <motion.div
            initial={isMobileLandscape ? { opacity: 0, y: -300, x: 0, rotate: 0, scale: 0.75 * zoom * bookScale } : { opacity: 0, scale: 0.95 }}
            animate={isMobileLandscape ? { opacity: 1, y: pan.y, x: pan.x, rotate: 90, scale: zoom * bookScale } : { opacity: 1, scale: zoom * bookScale, rotate: 0 }}
            transition={isMobileLandscape ? { duration: 0.9, type: 'spring', bounce: 0.4 } : { duration: 0.4 }}
            className="flex items-center justify-center overflow-visible relative"
            style={{
              transformOrigin: 'center center',
            }}
          >
            {/* Book Frame with Soft Outer Shadow */}
            <div
              className={`relative bg-zinc-900 transition-all duration-300 ${isDesktop ? 'shadow-[0_30px_70px_rgba(0,0,0,0.85)]' : ''}`}
              style={{
                width: dimensions.wrapperWidth || dimensions.width,
                height: dimensions.wrapperHeight || dimensions.height,
              }}
              {...(isMobileLandscape ? {
                onTouchStart: (e) => {
                  const touch = e.touches[0];
                  if (e.touches.length === 2) {
                    // Pinch zoom start
                    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                    touchStateRef.current.pinchStartDist = dist;
                  } else {
                    touchStateRef.current.startY = touch.clientY;
                    touchStateRef.current.startX = touch.clientX;
                    touchStateRef.current.lastY = touch.clientY;
                    touchStateRef.current.lastX = touch.clientX;
                    touchStateRef.current.startTime = Date.now();
                  }
                },
                onTouchMove: (e) => {
                  if (e.touches.length === 2 && touchStateRef.current.pinchStartDist !== null) {
                    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                    if (dist > touchStateRef.current.pinchStartDist + 40) { 
                      handleZoomIn(); 
                      touchStateRef.current.pinchStartDist = dist; 
                    }
                    if (dist < touchStateRef.current.pinchStartDist - 40) { 
                      handleZoomOut(); 
                      touchStateRef.current.pinchStartDist = dist; 
                    }
                  } else if (e.touches.length === 1 && zoom > 1) {
                    // Handle Panning when zoomed in
                    const touch = e.touches[0];
                    const dx = touch.clientX - touchStateRef.current.lastX;
                    const dy = touch.clientY - touchStateRef.current.lastY;
                    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
                    touchStateRef.current.lastX = touch.clientX;
                    touchStateRef.current.lastY = touch.clientY;
                  }
                },
                onTouchEnd: (e) => {
                  if (touchStateRef.current.pinchStartDist !== null) {
                    touchStateRef.current.pinchStartDist = null;
                    return;
                  }
                  const touchY = e.changedTouches[0].clientY;
                  const touchX = e.changedTouches[0].clientX;
                  const dy = touchY - touchStateRef.current.startY;
                  const dx = touchX - touchStateRef.current.startX;
                  const dt = Date.now() - touchStateRef.current.startTime;
                  
                  // Double tap
                  if (touchStateRef.current.lastTapTime && Date.now() - touchStateRef.current.lastTapTime < 300) {
                    setZoom(z => {
                      if (z === 1) return 1.5;
                      setPan({ x: 0, y: 0 }); // reset pan on double tap zoom out
                      return 1;
                    });
                    touchStateRef.current.lastTapTime = 0;
                    return;
                  }
                  touchStateRef.current.lastTapTime = Date.now();

                  // Check for swipe
                  if (dt < 400 && zoom === 1) {
                    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                      // Horizontal swipe on phone screen
                      if (dx < 0) handleNext(); // Swipe Left (pull content left) -> Next
                      else handlePrev(); // Swipe Right -> Prev
                    } else if (Math.abs(dy) > 50) {
                      // Vertical swipe on phone screen
                      if (dy < 0) handleNext(); // Swipe Up -> Next
                      else handlePrev(); // Swipe Down -> Prev
                    }
                  }
                  
                  if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 200 && zoom === 1) {
                    // Tap handling
                    // Since book is rotated, Top half of phone = Left page, Bottom half = Right page
                    if (touchY < window.innerHeight / 2) {
                      handlePrev(); 
                    } else {
                      handleNext(); 
                    }
                  }
                }
              } : {})}
            >

              {/* Premium Subtle Center Crease */}
              {isDesktop && !isMobile && !isCover && orientation === 'landscape' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30px] h-full bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.15)_30%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.15)_70%,rgba(0,0,0,0)_100%)] z-30 pointer-events-none mix-blend-multiply" />
              )}

              {/* StPageFlip (HTMLFlipBook) Container */}
              {isReady && pages.length > 0 && (
                <HTMLFlipBook
                  key={isMobile ? 'mobile' : 'desktop'}
                  ref={bookRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  size="fixed"
                  minWidth={dimensions.width}
                  maxWidth={dimensions.width}
                  minHeight={dimensions.height}
                  maxHeight={dimensions.height}
                  maxShadowOpacity={0.65}
                  showCover={true}
                  startPage={currentPage - 1}
                  mobileScrollSupport={true}
                  useMouseEvents={!isMobileLandscape}
                  usePortrait={isMobile}
                  drawShadow={isDesktop}
                  flippingTime={850}
                  swipeDistance={25}
                  showPageCorners={true}
                  onFlip={onFlip}
                  onChangeState={onChangeState}
                  onChangeOrientation={onChangeOrientation}
                  className="rounded-[4px] overflow-hidden animate-none bg-[#fdfdfc]"
                  style={{
                    width: '100%',
                    height: '100%',
                    boxShadow: isDesktop ? 'inset 0 0 10px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {pages.map((page, index) => {
                    // Lazy Loading: Render image only if page is near current viewport context (+- 4 pages)
                    const isNear = Math.abs(index + 1 - currentPage) <= 4;

                    return (
                      <FlipPage key={page.pageNumber}>
                        {isNear ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={getOriginalUrl(page.imageUrl)}
                              alt={`Page ${page.pageNumber}`}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
                              className="object-contain pointer-events-none select-none bg-[#fdfdfc]"
                              priority={page.pageNumber <= 4}
                              loading={page.pageNumber <= 4 ? undefined : "lazy"}
                              quality={95}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-zinc-900 border-x border-white/5 flex flex-col items-center justify-center">
                            <div className="text-[10px] text-zinc-700 font-bold uppercase tracking-wider animate-pulse">Page {page.pageNumber}</div>
                          </div>
                        )}

                        {/* Subtle Outer Page Edge / Thickness */}
                        {isDesktop && (
                          <div className={`absolute top-0 w-[1px] h-full bg-black/5 z-20 pointer-events-none ${index % 2 === 0 ? 'right-0' : 'left-0'
                            }`} />
                        )}
                      </FlipPage>
                    );
                  })}
                </HTMLFlipBook>
              )}
            </div>
          </motion.div>

          {/* Glass Right Navigation Arrow */}
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className={`w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all select-none hidden md:flex shrink-0 ${currentPage >= totalPages ? 'opacity-25 cursor-not-allowed' : 'hover:scale-105 hover:bg-white/15 cursor-pointer'
              }`}
            title="Next Page"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      </main>

      {/* ── LUXURY 3D OPENING ANIMATION OVERLAY ── */}
      <AnimatePresence>
        {isPlayingIntro && (
          <motion.div
            ref={introScope}
            initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
            animate={{ backgroundColor: 'rgba(5,5,5,1)' }}
            exit={{ backgroundColor: 'rgba(0,0,0,0)' }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-[100] flex items-center justify-center overflow-hidden"
            style={{
              perspective: '2500px',
              pointerEvents: 'auto'
            }}
            onClick={() => {
              // Allow user to click anywhere to skip
              setIsPlayingIntro(false);
            }}
          >
            {/* Subtle animated spotlight and particles (pure CSS) */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(circle at 50% -20%, rgba(255,255,255,0.05) 0%, transparent 60%)'
            }} />

            <motion.div
              className="intro-book-wrapper relative"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                transformStyle: 'preserve-3d',
                opacity: 0 // initial state for sequence
              }}
            >
              {/* Dynamic Ground Shadow */}
              <motion.div
                className="absolute -bottom-12 left-[5%] w-[90%] h-12 rounded-[100%] bg-black blur-2xl opacity-60 pointer-events-none"
              />

              {/* 3D Cover */}
              <motion.div
                className="intro-cover absolute inset-0 w-full h-full cursor-pointer"
                style={{
                  transformOrigin: 'left center',
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 30px 60px -12px rgba(0,0,0,0.8), 0 18px 36px -18px rgba(0,0,0,1)'
                }}
              >
                {/* Front Cover (Image) */}
                <div
                  className="absolute inset-0 w-full h-full bg-zinc-900 overflow-hidden rounded-r-md"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(1px)' // slight offset to prevent Z-fighting
                  }}
                >
                  {pages[0] && (
                    <Image
                      src={getOriginalUrl(pages[0].imageUrl)}
                      alt="Magazine Cover"
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                  {/* Soft inner shadow on the spine side */}
                  <div className="absolute inset-y-0 left-0 w-12 bg-[linear-gradient(90deg,rgba(0,0,0,0.4)_0%,transparent_100%)] pointer-events-none" />

                  {/* Glossy reflection */}
                  <div
                    className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.15)_0%,transparent_40%)] pointer-events-none"
                  />
                </div>

                {/* Back of Cover (Inside Paper Texture) */}
                <div
                  className="absolute inset-0 w-full h-full bg-[#fdfdfc] border border-black/10 rounded-l-md"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg) translateZ(1px)', // Faces the other way
                    boxShadow: 'inset 20px 0 50px rgba(0,0,0,0.05)' // Spine shadow on inside
                  }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.15)_0%,transparent_15%)]" />
                </div>
              </motion.div>

              {/* First Inside Page (Static behind the cover) */}
              <motion.div
                className="intro-inner-page absolute inset-0 w-full h-full bg-[#fdfdfc] border border-black/5 rounded-r-md"
                style={{
                  transform: 'translateZ(-1px)',
                  opacity: 0 // initially hidden until cover opens
                }}
              >
                {pages[1] && (
                  <Image
                    src={getOriginalUrl(pages[1].imageUrl)}
                    alt="First Page"
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
