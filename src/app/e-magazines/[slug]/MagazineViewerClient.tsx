'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, RefreshCw, AlertCircle,
  ZoomIn, ZoomOut, Maximize2, Minimize2, Bookmark, BookOpen,
  Volume2, VolumeX, Grid, HelpCircle
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

// Preload image helper utilizing native decode() for zero-flash GPU rendering
const preloadImages = async (urls: string[]) => {
  const promises = urls.map((url) => {
    return new Promise<void>((resolve) => {
      const img = new window.Image();
      img.src = url;
      img.onload = () => {
        if ('decode' in img) {
          img.decode()
            .then(() => resolve())
            .catch(() => resolve());
        } else {
          resolve();
        }
      };
      img.onerror = () => resolve();
    });
  });
  await Promise.all(promises);
};

// ── Realistic Hardcover Book Page Model ───────────────────────────────────────────
const FlipPage = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; index: number; isFrontCover?: boolean; isBackCover?: boolean; className?: string }
>(({ children, index, isFrontCover, isBackCover, className }, ref) => {
  // Normally even indexes are left pages, odd are right.
  // BUT the front cover is displayed on the right, and the back cover on the left.
  const isLeft = isBackCover ? true : isFrontCover ? false : index % 2 === 0;
  const isRight = isFrontCover ? true : isBackCover ? false : index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`relative select-none w-full h-full overflow-hidden bg-[#faf9f6] flex flex-col justify-between ${className || ''}`}
      style={{
        borderTopLeftRadius: isLeft ? '12px' : '0px',
        borderBottomLeftRadius: isLeft ? '12px' : '0px',
        borderTopRightRadius: isRight ? '12px' : '0px',
        borderBottomRightRadius: isRight ? '12px' : '0px',
        boxShadow: isLeft
          ? '-4px 0 12px rgba(0,0,0,0.15), -1px 0 3px rgba(0,0,0,0.05), inset -1px 0 0 rgba(255,255,255,0.4)'
          : '4px 0 12px rgba(0,0,0,0.15), 1px 0 3px rgba(0,0,0,0.05), inset 1px 0 0 rgba(255,255,255,0.4)',
      }}
    >
      {/* Premium Luxury Paper Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-30 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0%200%20200%20200'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter%20id='noiseFilter'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='3'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />





      {children}
    </div>
  );
});
FlipPage.displayName = 'FlipPage';

export default function MagazineViewerClientPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Intro Animation States
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [isIntroOpened, setIsIntroOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Viewer Controls & States
  const [currentPage, setCurrentPage] = useState(2);
  const [isMuted, setIsMuted] = useState(false);
  const [soundVolume] = useState(0.5);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showBookmarksPanel, setShowBookmarksPanel] = useState(false);

  // Zoom States
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Mobile layouts
  const [isMobile, setIsMobile] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 500, height: 707, wrapperWidth: 1000, wrapperHeight: 707 });
  const [bookScale, setBookScale] = useState(1);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // References
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pinchStartDist = useRef<number | null>(null);

  // Touch panning/swiping states
  const touchStateRef = useRef<{
    startY: number;
    startX: number;
    startTime: number;
  }>({
    startY: 0,
    startX: 0,
    startTime: 0,
  });

  const pages = useMemo(() => magazine?.pages || [], [magazine]);
  const totalPages = magazine?.totalPages || 0;

  // Paper turn sound (Mixkit audio)
  const turnSound = useMemo(() => {
    return new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav'],
      html5: true,
      volume: soundVolume,
    });
  }, [soundVolume]);

  // Load bookmarks
  useEffect(() => {
    if (magazine) {
      const saved = localStorage.getItem(`mag_bookmarks_${magazine.id}`);
      if (saved) {
        try {
          setBookmarks(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [magazine]);

  // Save bookmarks
  const toggleBookmark = (pageNumber: number) => {
    if (!magazine) return;
    let nextBookmarks;
    if (bookmarks.includes(pageNumber)) {
      nextBookmarks = bookmarks.filter((p) => p !== pageNumber);
    } else {
      nextBookmarks = [...bookmarks, pageNumber].sort((a, b) => a - b);
    }
    setBookmarks(nextBookmarks);
    localStorage.setItem(`mag_bookmarks_${magazine.id}`, JSON.stringify(nextBookmarks));
  };

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await viewerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Responsive dimensions detection
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    function handleResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        const PAGE_WIDTH = 500;
        const PAGE_HEIGHT = 707;
        const SPREAD_WIDTH = PAGE_WIDTH * 2;

        const isMobilePortrait = w < 768 && w < h;
        const isMobileLand = h < 768 && w > h;

        let scale = 1;

        if (isMobilePortrait) {
          // Rotates the layout to landscape spread on portrait devices
          const rotatedAvailW = h * 0.92;
          const rotatedAvailH = w * 0.88;
          scale = Math.min(rotatedAvailW / SPREAD_WIDTH, rotatedAvailH / PAGE_HEIGHT);
          setIsMobile(true);
          setIsDesktop(false);
        } else if (isMobileLand) {
          const availableW = w * 0.92;
          const availableH = h - 140;
          scale = Math.min(availableW / SPREAD_WIDTH, availableH / PAGE_HEIGHT);
          setIsMobile(false);
          setIsDesktop(false);
        } else {
          const availableW = w * 0.92;
          const availableH = h - 220; // Room for thumbnail strip and top/bottom bars
          scale = Math.min(availableW / SPREAD_WIDTH, availableH / PAGE_HEIGHT);
          setIsMobile(false);
          setIsDesktop(w >= 1024);
        }

        setBookScale(scale);
        setDimensions({
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          wrapperWidth: SPREAD_WIDTH,
          wrapperHeight: PAGE_HEIGHT,
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

  // Load magazine
  useEffect(() => {
    if (!slug || slug === 'placeholder' || slug === '_') {
      setLoading(false);
      return;
    }

    const fetchMagazine = async () => {
      try {
        if (magazineCache[slug]) {
          const cached = magazineCache[slug];
          setMagazine(cached);
          setIsMuted(!cached.enablePageSound);

          if (cached.pages && cached.pages.length > 0) {
            const preloadUrls = cached.pages.slice(0, 4).map((p) => getOriginalUrl(p.imageUrl));
            await preloadImages(preloadUrls);

            const introPlayed = sessionStorage.getItem(`mag_intro_played_${slug}`);
            if (introPlayed) {
              setIsPlayingIntro(false);
              setIsIntroOpened(true);
            } else {
              setIsPlayingIntro(true);
              setIsIntroOpened(false);
            }

            const remainingUrls = cached.pages.slice(4).map((p) => getOriginalUrl(p.imageUrl));
            preloadImages(remainingUrls);
          }

          const savedPage = localStorage.getItem(`mag_progress_${cached.id}`);
          if (savedPage) {
            const parsedPage = parseInt(savedPage);
            if (parsedPage >= 1 && parsedPage <= cached.totalPages) {
              setCurrentPage(parsedPage);
            } else {
              setCurrentPage(2);
            }
          } else {
            setCurrentPage(2);
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
            const preloadUrls = res.data.pages.slice(0, 4).map((p: any) => getOriginalUrl(p.imageUrl));
            await preloadImages(preloadUrls);

            const introPlayed = sessionStorage.getItem(`mag_intro_played_${slug}`);
            if (introPlayed) {
              setIsPlayingIntro(false);
              setIsIntroOpened(true);
            } else {
              setIsPlayingIntro(true);
              setIsIntroOpened(false);
            }

            const remainingUrls = res.data.pages.slice(4).map((p: any) => getOriginalUrl(p.imageUrl));
            preloadImages(remainingUrls);
          }

          const savedPage = localStorage.getItem(`mag_progress_${res.data.id}`);
          if (savedPage) {
            const parsedPage = parseInt(savedPage);
            if (parsedPage >= 1 && parsedPage <= res.data.totalPages) {
              setCurrentPage(parsedPage);
            } else {
              setCurrentPage(2);
            }
          } else {
            setCurrentPage(2);
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

  // Sync progress page to localStorage
  useEffect(() => {
    if (magazine) {
      localStorage.setItem(`mag_progress_${magazine.id}`, currentPage.toString());
    }
  }, [currentPage, magazine]);

  // Toolbar Auto-Hide timer
  const resetHideTimer = () => {
    setShowToolbar(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (zoomScale === 1 && !showThumbnails && !showBookmarksPanel) {
        setShowToolbar(false);
      }
    }, 5000);
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
  }, [zoomScale, showThumbnails, showBookmarksPanel]);

  // Tilt animations on closed book cover mouse movements
  const handleMouseMoveTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isIntroOpened || isOpening) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Normalize coordinates
    const tiltX = (y / (rect.height / 2)) * -10; // Max tilt 10deg
    const tiltY = (x / (rect.width / 2)) * 10;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeaveTilt = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Cinematic 3D Hardcover closing animation sequence triggered on previous click on Page 2-3
  const handleCloseBook = async () => {
    if (isOpening || !isIntroOpened) return;
    setIsOpening(true);
    setIsPlayingIntro(true);
    setIsExiting(false);

    try {
      if (magazine?.enablePageSound && !isMuted) {
        turnSound.play();
      }

      // Play close transition declaratively
      setIsOpening(false);
      await new Promise(r => setTimeout(r, 1600));

      setIsIntroOpened(false);
      setIsOpening(false);
      setCurrentPage(3);
    } catch (e) {
      setIsIntroOpened(false);
      setIsOpening(false);
    }
  };

  // Cinematic 3D Hardcover opening animation sequence triggered on user click
  const handleOpenBook = async () => {
    if (isOpening || isIntroOpened) return;
    setIsOpening(true);

    try {
      if (magazine?.enablePageSound && !isMuted) {
        turnSound.play();
      }

      // Wait for the 3D swing cover & center pan animation to finish
      await new Promise(r => setTimeout(r, 1600));

      // Zoom out & fade out overlay
      setIsExiting(true);
      await new Promise(r => setTimeout(r, 550));

      sessionStorage.setItem(`mag_intro_played_${slug}`, 'true');
      setIsIntroOpened(true);
      setIsPlayingIntro(false);

      // Instantly position pageFlip ref to page spread
      if (bookRef.current) {
        bookRef.current.pageFlip().turnToPage(currentPage === 1 ? 0 : currentPage - 1);
      }
    } catch (e) {
      setIsPlayingIntro(false);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape' && zoomScale > 1) handleResetZoom();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [magazine, currentPage, zoomScale]);

  if (!slug || slug === 'placeholder' || slug === '_') {
    return (
      <div className="flex-1 w-full h-[calc(100vh-var(--nav-height))] bg-zinc-950 flex flex-col items-center justify-center space-y-6 text-white">
        <RefreshCw className="w-12 h-12 animate-spin text-[var(--brand-orange,#f97316)]" />
      </div>
    );
  }

  // Preloading screen
  if (loading || !isReady) {
    return (
      <div className="flex-1 w-full h-[calc(100vh-var(--nav-height))] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black flex flex-col justify-between overflow-hidden relative">
        <header className="h-18 px-6 border-b border-white/5 flex items-center justify-between z-40 bg-black/45 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
              <div className="h-2 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center relative overflow-hidden px-5 py-18">
          <div className="flex items-center justify-center gap-12 w-full h-full relative">
            <div
              className="relative shadow-2xl rounded-2xl bg-zinc-900/60 border border-white/5 animate-pulse flex items-center justify-center overflow-hidden"
              style={{
                width: dimensions.wrapperWidth,
                height: dimensions.wrapperHeight,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !magazine) {
    return (
      <div className="flex-1 w-full h-[calc(100vh-var(--nav-height))] bg-zinc-950 flex flex-col items-center justify-center space-y-4 text-white p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold font-heading">Failed to open book</h2>
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
    if (currentPage <= 1) {
      handleCloseBook();
    } else if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const onFlip = (e: { data: number }) => {
    // pageFlip provides left-side page index of the current spread
    // Index 0 represents Page 1 (Cover)
    const nextLeftPage = e.data === 0 ? 1 : e.data + 1;
    setCurrentPage(nextLeftPage);
    handleResetZoom();
  };

  const onChangeState = (e: { data: string }) => {
    if ((e.data === 'user_fold' || e.data === 'flipping') && magazine?.enablePageSound && !isMuted) {
      if (!turnSound.playing()) {
        turnSound.play();
      }
    }
  };

  const onChangeOrientation = (e: { data: 'portrait' | 'landscape' }) => {
    setOrientation(e.data);
  };

  // Zoom Operations
  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.35, 2.5));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = prev - 0.35;
      if (next <= 1) {
        setPanOffset({ x: 0, y: 0 });
        return 1;
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Panning functionality when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale === 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale === 1) return;
    const nextX = e.clientX - dragStart.current.x;
    const nextY = e.clientY - dragStart.current.y;

    // Bounds check to avoid infinite panning
    const maxPanX = (dimensions.wrapperWidth * (zoomScale - 1)) / 2;
    const maxPanY = (dimensions.wrapperHeight * (zoomScale - 1)) / 2;

    setPanOffset({
      x: Math.max(-maxPanX, Math.min(maxPanX, nextX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, nextY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers (panning + pinch to zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDist.current = dist;
    } else if (zoomScale > 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      dragStart.current = { x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y };
    } else {
      const touch = e.touches[0];
      touchStateRef.current.startY = touch.clientY;
      touchStateRef.current.startX = touch.clientX;
      touchStateRef.current.startTime = Date.now();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist / pinchStartDist.current;
      const nextScale = Math.max(1, Math.min(zoomScale * delta, 2.5));
      setZoomScale(nextScale);
      if (nextScale === 1) setPanOffset({ x: 0, y: 0 });
      pinchStartDist.current = dist;
    } else if (isDragging && zoomScale > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      const nextX = touch.clientX - dragStart.current.x;
      const nextY = touch.clientY - dragStart.current.y;

      const maxPanX = (dimensions.wrapperWidth * (zoomScale - 1)) / 2;
      const maxPanY = (dimensions.wrapperHeight * (zoomScale - 1)) / 2;

      setPanOffset({
        x: Math.max(-maxPanX, Math.min(maxPanX, nextX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, nextY)),
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    pinchStartDist.current = null;

    if (zoomScale === 1 && e.changedTouches.length === 1) {
      const touchY = e.changedTouches[0].clientY;
      const touchX = e.changedTouches[0].clientX;
      const dy = touchY - touchStateRef.current.startY;
      const dx = touchX - touchStateRef.current.startX;
      const dt = Date.now() - touchStateRef.current.startTime;

      if (dt < 400) {
        // Landscape swiping
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) handleNext();
          else handlePrev();
        }
        // Portrait swiping (rotated)
        else if (isMobile && Math.abs(dy) > 40) {
          if (dy < 0) handlePrev();
          else handleNext();
        }
      }
    }
  };

  // Jump to specific page spread
  const jumpToPage = (pageNumber: number) => {
    if (pageNumber < 1) return;
    if (isPlayingIntro) {
      setIsPlayingIntro(false);
      setIsIntroOpened(true);
    }
    if (bookRef.current) {
      const targetIndex = pageNumber === 1 ? 0 : (pageNumber % 2 === 1 ? pageNumber - 2 : pageNumber - 1);
      bookRef.current.pageFlip().turnToPage(targetIndex);
    }
  };

  // Ambient glow backgrounds matching active pages
  const leftBgImg = pages[currentPage - 1] ? getOriginalUrl(pages[currentPage - 1].imageUrl) : '';
  const rightBgImg = pages[currentPage] ? getOriginalUrl(pages[currentPage].imageUrl) : '';

  // Cinematic floating particles
  const particles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: `${(i * 7) % 100}%`,
    top: `${(i * 13) % 100}%`,
    size: ((i * 3) % 4) + 2,
    delay: (i * 0.4) % 10,
    duration: ((i * 7) % 15) + 15,
  }));

  // Render Page stacked edges thickness detail
  const renderPageThickness = (side: 'left' | 'right') => {
    const pagesLeft = side === 'left' ? currentPage : totalPages - currentPage;
    const maxThickness = Math.min(Math.ceil(pagesLeft / 2), 6);
    if (maxThickness <= 0) return null;

    return (
      <div
        className={`absolute top-0 bottom-0 w-[8px] bg-zinc-950/80 pointer-events-none z-15 flex flex-col justify-between`}
        style={{
          [side]: '-8px',
          boxShadow: side === 'left'
            ? 'inset 1px 0 0 rgba(255,255,255,0.05), -2px 0 5px rgba(0,0,0,0.5)'
            : 'inset -1px 0 0 rgba(255,255,255,0.05), 2px 0 5px rgba(0,0,0,0.5)',
        }}
      >
        {Array.from({ length: maxThickness }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 bg-[#faf9f6] border-zinc-300/30"
            style={{
              [side]: `${i * 1.2}px`,
              width: '1.2px',
              borderLeftWidth: side === 'left' ? '1px' : '0',
              borderRightWidth: side === 'right' ? '1px' : '0',
              opacity: 0.95 - (i * 0.12),
            }}
          />
        ))}
      </div>
    );
  };

  // Calculate dynamic shifts to center the single cover pages
  let autoShiftX = 0;
  let autoShiftY = 0;
  if (!isOpening) {
    if (currentPage === 1) {
      const shift = (dimensions.width / 4) * zoomScale;
      if (isMobile) {
        autoShiftY = -shift;
      } else {
        autoShiftX = -shift;
      }
    } else if (currentPage >= totalPages) {
      const shift = (dimensions.width / 4) * zoomScale;
      if (isMobile) {
        autoShiftY = shift;
      } else {
        autoShiftX = shift;
      }
    }
  }

  // Intro animation helpers
  const startScale = isMobile ? bookScale * 1.08 : 0.85;
  const endScale = isMobile ? bookScale : 1;
  const initialScale = isMobile ? bookScale * 0.75 : 0.6;
  const startX = isMobile ? 0 : -(dimensions.wrapperWidth / 4) * 0.85;
  const endX = 0;
  const startY = isMobile ? -(dimensions.wrapperWidth / 4) * startScale : 0;
  const endY = 0;

  return (
    <div
      ref={viewerRef}
      className="flex-1 w-full h-[calc(100vh-var(--nav-height))] max-w-[100vw] bg-black text-white flex flex-col justify-between overflow-hidden select-none font-sans relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <style>{`
        @keyframes float-dust {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          15% { opacity: 0.45; }
          85% { opacity: 0.45; }
          100% {
            transform: translateY(-95px) translateX(50px) scale(1.2);
            opacity: 0;
          }
        }
        .animate-float-dust {
          animation-name: float-dust;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        .glass-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .glass-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        .glass-btn:active:not(:disabled) {
          transform: translateY(1px);
          background: rgba(255, 255, 255, 0.06);
        }
        /* Custom scrollbar for horizontal thumbnails strip */
        .custom-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 99px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 99px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>

      {/* ── AMBIENT CINEMATIC BACKDROP ── */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        {/* Left Side Blurred Ambient Light */}
        {leftBgImg && (
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.35] filter blur-[120px] rounded-full bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `url(${leftBgImg})` }}
          />
        )}
        {/* Right Side Blurred Ambient Light */}
        {rightBgImg && (
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.35] filter blur-[120px] rounded-full bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `url(${rightBgImg})` }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-black to-zinc-950/80 z-10" />

        {/* Cinematic Spotlight */}
        <div className="absolute inset-x-0 top-0 h-[50%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06)_0%,transparent_75%)] z-15" />

        {/* Cinematic Dust Particles */}
        <div className="absolute inset-0 z-15 opacity-55">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-white/20 filter blur-[0.8px] animate-float-dust"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── TOP CONTROLS BAR ── */}
      <AnimatePresence>
        {!isPlayingIntro && showToolbar && (
          <motion.header
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            className="h-16 px-6 border-b border-white/5 flex items-center justify-between z-40 bg-zinc-950/45 backdrop-blur-xl absolute top-0 left-0 right-0"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/e-magazines')}
                className="w-10 h-10 rounded-xl glass-btn flex items-center justify-center text-white cursor-pointer"
                title="Back to Magazines"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-sm font-extrabold tracking-wider uppercase text-white line-clamp-1">{magazine.title}</h1>
                <p className="text-[10px] text-white/55 font-bold uppercase tracking-widest">{magazine.edition || 'Special Edition'}</p>
              </div>
            </div>

            {/* Top Toolbar Actions (Removed as requested) */}
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── MAIN DIGITAL READING INTERACTIVE WORKSPACE ── */}
      <main
        className="flex-1 flex items-center justify-center relative overflow-hidden px-4 py-8 z-20 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-6 md:gap-10 lg:gap-14 w-full max-w-[100vw]">

          {/* Floating Left Control */}
          <button
            onClick={handlePrev}
            className={`absolute z-30 w-12 h-12 rounded-full flex items-center justify-center text-white active:scale-90 transition-all select-none shrink-0 cursor-pointer ${
              isMobile
                ? 'top-20 left-1/2 -translate-x-1/2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
                : 'left-6 hidden md:flex md:border border-white/10 md:bg-black/60 md:backdrop-blur-xl md:shadow-2xl md:hover:scale-105 hover:bg-white/10'
            }`}
            title="Previous Page"
          >
            {isMobile ? <ChevronUp className="w-7 h-7" /> : <ChevronLeft className="w-7 h-7" />}
          </button>

          {/* Book Perspective Zoom Scale Frame */}
          <motion.div
            animate={{
              scale: bookScale * zoomScale,
              rotate: isMobile ? 90 : 0,
              x: panOffset.x + autoShiftX,
              y: panOffset.y + autoShiftY,
            }}
            transition={isDragging ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' }}
            className="flex items-center justify-center overflow-visible relative"
            style={{ transformOrigin: 'center center' }}
          >
            {/* Real Book Hardcover wrapper container */}
            <div
              className={`relative bg-zinc-950 transition-shadow duration-500 rounded-[12px] ${isDesktop ? 'shadow-[0_45px_110px_rgba(0,0,0,0.85)] border border-white/5' : ''
                }`}
              style={{
                width: dimensions.wrapperWidth,
                height: dimensions.wrapperHeight,
              }}
            >
              {/* Dynamic Pages Edge Stack detail */}
              {!isMobile && renderPageThickness('left')}
              {!isMobile && renderPageThickness('right')}

              {/* Spine Crease shading detail */}
              {!isMobile && (
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[16px] h-full bg-[linear-gradient(90deg,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.65)_50%,rgba(0,0,0,0.25)_100%)] z-30 pointer-events-none mix-blend-multiply" />
              )}
              {!isMobile && (
                <div className="absolute top-0 bottom-0 left-[calc(50%-0.5px)] w-[1px] h-full bg-white/10 z-30 pointer-events-none" />
              )}

              {/* Bookmark Ribbon on Pages */}
              {bookmarks.includes(currentPage) && (
                <div
                  onClick={() => toggleBookmark(currentPage)}
                  className="absolute top-0 left-8 w-[24px] h-[48px] bg-red-600 cursor-pointer z-35 flex items-center justify-center shadow-md animate-in slide-in-from-top-4 duration-300"
                  style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)' }}
                  title="Remove Bookmark"
                >
                  <Bookmark className="w-3.5 h-3.5 text-white/90 fill-white/80" />
                </div>
              )}
              {bookmarks.includes(currentPage + 1) && !isMobile && currentPage + 1 <= totalPages && (
                <div
                  onClick={() => toggleBookmark(currentPage + 1)}
                  className="absolute top-0 right-8 w-[24px] h-[48px] bg-red-600 cursor-pointer z-35 flex items-center justify-center shadow-md animate-in slide-in-from-top-4 duration-300"
                  style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)' }}
                  title="Remove Bookmark"
                >
                  <Bookmark className="w-3.5 h-3.5 text-white/90 fill-white/80" />
                </div>
              )}

              {/* HTMLFlipBook core Component */}
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
                  startPage={currentPage === 1 ? 0 : currentPage - 1}
                  mobileScrollSupport={false}
                  useMouseEvents={!isMobile && zoomScale === 1}
                  usePortrait={false}
                  drawShadow={true}
                  flippingTime={900}
                  swipeDistance={25}
                  showPageCorners={true}
                  onFlip={onFlip}
                  onChangeState={onChangeState}
                  onChangeOrientation={onChangeOrientation}
                  className="rounded-[12px] overflow-hidden bg-transparent"
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {pages.map((page, index) => {
                    const isNear = Math.abs(index + 1 - currentPage) <= 4;

                    return (
                      <FlipPage 
                        key={`${page.pageNumber}-${index}`} 
                        index={index}
                        isFrontCover={index === 0}
                        isBackCover={index === pages.length - 1}
                      >
                        {isNear ? (
                          <div className="relative w-full h-full bg-[#faf9f6] flex items-center justify-center">
                            <Image
                              src={getOriginalUrl(page.imageUrl)}
                              alt={`Page ${page.pageNumber}`}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
                              className="object-contain pointer-events-none select-none bg-[#faf9f6]"
                              priority={index < 2}
                              quality={90}
                            />

                          </div>
                        ) : (
                          <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center">
                            <div className="text-[10px] text-zinc-700 font-bold uppercase tracking-wider animate-pulse">Page {page.pageNumber}</div>
                          </div>
                        )}
                      </FlipPage>
                    );
                  })}
                </HTMLFlipBook>
              )}
            </div>
          </motion.div>

          {/* Floating Right Control */}
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            className={`absolute z-30 w-12 h-12 rounded-full flex items-center justify-center text-white active:scale-90 transition-all select-none shrink-0 ${
              isMobile
                ? 'bottom-6 left-1/2 -translate-x-1/2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
                : 'right-6 hidden md:flex md:border border-white/10 md:bg-black/60 md:backdrop-blur-xl md:shadow-2xl'
            } ${
              currentPage >= totalPages - 1 ? 'opacity-0 pointer-events-none' : 'md:hover:scale-105 cursor-pointer'
            }`}
            title="Next Page"
          >
            {isMobile ? <ChevronDown className="w-7 h-7" /> : <ChevronRight className="w-7 h-7" />}
          </button>
        </div>
      </main>

      {/* ── FLOATING BOOKMARK PANEL (SIDE DRAWER) ── */}
      <AnimatePresence>
        {showBookmarksPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookmarksPanel(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs z-45"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute top-16 bottom-0 right-0 w-80 bg-zinc-950 border-l border-white/5 z-50 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-base font-extrabold uppercase tracking-wider flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-red-500 fill-red-500" /> Bookmarks
                  </h3>
                  <span className="text-[10px] bg-white/10 font-bold px-2 py-0.5 rounded-full text-zinc-300">{bookmarks.length} saved</span>
                </div>

                {bookmarks.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 space-y-2">
                    <Bookmark className="w-8 h-8 mx-auto opacity-20" />
                    <p className="text-xs font-semibold uppercase tracking-wider">No Bookmarks Saved</p>
                    <p className="text-[10px] text-zinc-600 px-4">Click the bookmark icon in the header to save pages for quick reference.</p>
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {bookmarks.map((pNum) => (
                      <li key={pNum}>
                        <button
                          onClick={() => {
                            jumpToPage(pNum);
                            setShowBookmarksPanel(false);
                          }}
                          className="w-full text-left p-3.5 bg-white/3 hover:bg-white/7 border border-white/5 rounded-xl flex items-center justify-between transition-colors cursor-pointer group"
                        >
                          <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">
                            Page {pNum}
                          </span>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── BOTTOM TOOLBAR & CONTROLS ── */}
      <AnimatePresence>
        {!isPlayingIntro && showToolbar && (
          <motion.footer
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 25 }}
            className="hidden md:flex flex-col gap-4 border-t border-white/5 z-40 bg-zinc-950/45 backdrop-blur-xl absolute bottom-0 left-0 right-0 p-4"
          >
            {/* Slider & Thumbnails strip toggle bar */}
            <div className="flex items-center justify-between gap-4 max-w-[1440px] mx-auto w-full">

              {/* Pagination controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  className="w-9 h-9 rounded-lg glass-btn flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-300 tabular-nums">
                  {currentPage === 1 ? 'Page 1' : `Page ${currentPage} - ${Math.min(currentPage + 1, totalPages)}`}
                </div>
                <button
                  onClick={handleNext}
                  disabled={currentPage >= totalPages - 1}
                  className="w-9 h-9 rounded-lg glass-btn flex items-center justify-center disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom middle: Zoom actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="w-9 h-9 rounded-lg glass-btn flex items-center justify-center text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-3 h-9 rounded-lg glass-btn flex items-center justify-center text-xs font-bold text-white cursor-pointer"
                  title="Reset Zoom"
                >
                  {Math.round(zoomScale * 100)}%
                </button>
                <button
                  onClick={handleZoomIn}
                  className="w-9 h-9 rounded-lg glass-btn flex items-center justify-center text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Bottom right: Toggle Thumbnail Strip */}
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={`px-4 h-9 rounded-lg glass-btn flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${showThumbnails ? 'bg-white/10 text-white border-white/20' : 'text-zinc-400'
                  }`}
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Pages Strip</span>
              </button>
            </div>

            {/* Horizontal Pages Thumbnail Strip panel */}
            <AnimatePresence>
              {showThumbnails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 104, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/5 pt-3 max-w-[1440px] mx-auto w-full"
                >
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scroll scroll-smooth w-full">
                    {pages.map((p, idx) => {
                      const isSelected = isPlayingIntro
                        ? idx === 0
                        : (currentPage === 1 ? idx === 0 : (idx + 1 === currentPage || idx + 1 === currentPage + 1));
                      return (
                        <button
                          key={p.pageNumber}
                          onClick={() => jumpToPage(p.pageNumber)}
                          className={`relative aspect-[3/4] h-20 rounded-md border overflow-hidden shrink-0 transition-all cursor-pointer ${isSelected
                              ? 'border-red-500 scale-[1.04] ring-2 ring-red-500/20 shadow-md'
                              : 'border-white/10 opacity-60 hover:opacity-100 hover:scale-[1.02]'
                            }`}
                        >
                          <Image
                            src={p.thumbnailUrl || p.imageUrl ? getOriginalUrl(p.thumbnailUrl || p.imageUrl) : ''}
                            alt={`Thumb ${p.pageNumber}`}
                            fill
                            sizes="75px"
                            className="object-cover pointer-events-none select-none"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/85 px-1.5 py-0.5 rounded text-[8px] font-extrabold text-white">
                            {p.pageNumber}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* ── CINEMATIC 3D COVER OPENING ANIMATION OVERLAY ── */}
      <AnimatePresence>
        {isPlayingIntro && (
          <motion.div
            initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
            animate={{ backgroundColor: 'rgba(5,5,5,1)' }}
            exit={{ backgroundColor: 'rgba(0,0,0,0)' }}
            transition={{ duration: 0.55 }}
            onClick={handleOpenBook}
            className="absolute inset-0 z-[100] flex items-center justify-center overflow-hidden"
            style={{
              perspective: '2500px',
              pointerEvents: 'auto'
            }}
          >
            {/* Elegant Top Right Skip Button (Removed as requested) */}
            {/* Ambient glow spotlight behind the 3D book cover */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_60%)] z-5" />

            {/* Cinematic intro particles */}
            <div className="absolute inset-0 pointer-events-none opacity-45 z-10">
              {particles.slice(0, 15).map((p) => (
                <div
                  key={p.id}
                  className="absolute rounded-full bg-white/20 filter blur-[0.8px] animate-float-dust"
                  style={{
                    left: p.left,
                    top: p.top,
                    width: p.size,
                    height: p.size,
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.duration}s`,
                  }}
                />
              ))}
            </div>

            {/* 3D Book Layout container */}
            <motion.div
              className="intro-book-wrapper relative cursor-pointer shrink-0"
              onMouseMove={handleMouseMoveTilt}
              onMouseLeave={handleMouseLeaveTilt}
              onClick={handleOpenBook}
              initial={{
                y: '-100vh',
                x: startX,
                rotateZ: isMobile ? 90 : -15,
                scale: initialScale,
                opacity: 0,
              }}
              animate={isExiting ? {
                scale: isMobile ? bookScale * 1.15 : 1.15,
                opacity: 0,
              } : {
                y: isOpening ? endY : startY,
                x: isOpening ? endX : startX,
                rotateZ: isMobile ? 90 : 0,
                scale: isOpening ? endScale : startScale,
                opacity: 1,
              }}
              transition={{
                duration: isOpening ? 1.6 : 1.2,
                ease: isOpening ? [0.25, 1, 0.5, 1] : [0.34, 1.56, 0.64, 1]
              }}
              style={{
                width: dimensions.wrapperWidth,
                height: dimensions.height,
                transformStyle: 'preserve-3d',
                transformOrigin: '50% 50%',
                transform: (!isMobile && !isOpening) ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined,
              }}
            >
              {/* Pulsing overlay instructions centered on closed cover page */}
              {!isOpening && (
                <div className="click-to-open-badge absolute top-0 bottom-0 right-0 w-1/2 flex items-center justify-center pointer-events-none z-40">
                  <div className="px-6 py-3 rounded-full bg-black/60 border border-white/10 backdrop-blur-md shadow-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/90 animate-pulse">
                    <BookOpen className="w-4 h-4 text-red-500 fill-red-500 animate-bounce" />
                    Click to Read
                  </div>
                </div>
              )}
              {/* Ground Shadow */}
              <div
                className="absolute -bottom-16 left-[5%] w-[90%] h-16 rounded-[100%] bg-black/85 blur-3xl pointer-events-none z-10"
              />

              {/* Inside Left Page (Page 3) */}
              <motion.div
                className="intro-left-page absolute top-0 bottom-0 left-0 w-1/2 bg-[#faf9f6] border border-black/5 rounded-l-md overflow-hidden"
                animate={{ opacity: isOpening ? 1 : 0 }}
                transition={{ duration: 1.6, ease: [0.25, 1, 0.5, 1] }}
                style={{
                  transform: 'translateZ(-2px)',
                }}
              >
                {pages[2] && (
                  <Image
                    src={getOriginalUrl(pages[2].imageUrl)}
                    alt="Left Page"
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="object-contain pointer-events-none select-none bg-[#faf9f6]"
                    priority
                  />
                )}
                {/* Spine crease shading */}
                <div className="absolute inset-y-0 right-0 w-[45px] bg-gradient-to-l from-black/25 to-transparent pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.035] pointer-events-none z-10"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0%200%20200%20200'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter%20id='noiseFilter'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='3'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                {/* Visual stacked pages details */}
                <div className="absolute top-[3px] bottom-[3px] left-[3px] w-[3px] bg-zinc-300/30 border-r border-black/10 opacity-70" />
                <div className="absolute top-[6px] bottom-[6px] left-[6px] w-[3px] bg-zinc-300/20 border-r border-black/10 opacity-40" />
              </motion.div>

              {/* Inside Right Page (Page 4) */}
              <motion.div
                className="intro-right-page absolute top-0 bottom-0 right-0 w-1/2 bg-[#faf9f6] border border-black/5 rounded-r-md overflow-hidden"
                animate={{ opacity: isOpening ? 1 : 0 }}
                transition={{ duration: 1.6, ease: [0.25, 1, 0.5, 1] }}
                style={{
                  transform: 'translateZ(-3px)',
                }}
              >
                {pages[3] && (
                  <Image
                    src={getOriginalUrl(pages[3].imageUrl)}
                    alt="Right Page"
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="object-contain pointer-events-none select-none bg-[#faf9f6]"
                    priority
                  />
                )}
                {/* Center fold crease shadow */}
                <div className="absolute inset-y-0 left-0 w-[45px] bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.035] pointer-events-none z-10"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0%200%20200%20200'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter%20id='noiseFilter'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='3'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                {/* Visual stacked pages details */}
                <div className="absolute top-[3px] bottom-[3px] right-[3px] w-[3px] bg-zinc-300/30 border-l border-black/10 opacity-70" />
                <div className="absolute top-[6px] bottom-[6px] right-[6px] w-[3px] bg-zinc-300/20 border-l border-black/10 opacity-40" />
              </motion.div>

              {/* 3D Swing Cover (Page 1 cover on right, pivots on left hinge/spine center) */}
              <motion.div
                className="intro-cover absolute top-0 bottom-0 right-0 w-1/2"
                animate={{ rotateY: isOpening ? -180 : 0 }}
                transition={{ duration: 1.6, ease: [0.25, 1, 0.5, 1] }}
                style={{
                  transformOrigin: 'left center',
                  transformStyle: 'preserve-3d',
                  z: 1,
                }}
              >
                {/* Front Cover Face (Page 1) */}
                <div
                  className="absolute inset-0 w-full h-full bg-[#faf9f6] overflow-hidden rounded-r-md"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(2px)',
                    boxShadow: '4px 0 15px rgba(0,0,0,0.45)'
                  }}
                >
                  {pages[0] && (
                    <Image
                      src={getOriginalUrl(pages[0].imageUrl)}
                      alt="Magazine Cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 45vw"
                      className="object-contain pointer-events-none select-none bg-[#faf9f6]"
                      priority
                    />
                  )}
                  {/* Spine binding line details */}
                  <div className="absolute inset-y-0 left-0 w-[4px] bg-black/25 z-20" />
                  <div className="absolute inset-y-0 left-[4px] w-[1px] bg-white/20 z-20" />
                  <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/45 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                </div>

                {/* Inside Back Face (Page 3 cover image content) */}
                <div
                  className="absolute inset-0 w-full h-full bg-[#faf9f6] overflow-hidden rounded-l-md"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg) translateZ(2.5px)',
                    boxShadow: 'inset 25px 0 50px rgba(0,0,0,0.1)'
                  }}
                >
                  {pages[2] && (
                    <Image
                      src={getOriginalUrl(pages[2].imageUrl)}
                      alt="Inside Cover Page"
                      fill
                      sizes="(max-width: 768px) 100vw, 45vw"
                      className="object-contain pointer-events-none select-none bg-[#faf9f6]"
                      priority
                    />
                  )}
                  {/* Spine crease shading */}
                  <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/35 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 opacity-[0.035] pointer-events-none z-10"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0%200%20200%20200'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter%20id='noiseFilter'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='3'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Tap-to-skip hint (Removed as requested) */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
