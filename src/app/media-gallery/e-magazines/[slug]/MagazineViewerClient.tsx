'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, ZoomIn, ZoomOut, Maximize2, Minimize2, Search, 
  Download, Printer, Share2, ChevronLeft, ChevronRight, X, Volume2, VolumeX, RefreshCw, AlertCircle, Eye, Settings
} from 'lucide-react';
import { Howl } from 'howler';
import HTMLFlipBook from 'react-pageflip';
import api, { getOriginalUrl } from '@/lib/api';

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
        className={`bg-zinc-900 shadow-2xl relative select-none w-full h-full overflow-hidden ${className || ''}`}
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
  
  // Toolbar auto-hide state
  const [showToolbar, setShowToolbar] = useState(true);

  // References
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        const res = await api.get(`/public/magazines/${slug}`);
        if (res.success && res.data) {
          setMagazine(res.data);
          setIsMuted(!res.data.enablePageSound);
          
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
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-6 text-white">
        <RefreshCw className="w-12 h-12 animate-spin text-red-500" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-6 text-white">
        <RefreshCw className="w-12 h-12 animate-spin text-red-500" />
        <div className="text-center">
          <h2 className="text-xl font-bold font-outfit">Loading publication...</h2>
          <p className="text-zinc-500 text-xs mt-1">Preparing high-resolution previews</p>
        </div>
      </div>
    );
  }

  if (error || !magazine) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4 text-white p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold font-outfit">Failed to open book</h2>
        <p className="text-zinc-400 max-w-md text-sm">{error || 'Magazine metadata is unavailable.'}</p>
        <button
          onClick={() => router.push('/media-gallery/e-magazines')}
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
    setZoom((z) => Math.max(1, z - 0.25));
  };

  const handleFullscreenToggle = () => {
    if (!magazine.enableFullscreen) return;
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen().catch(() => {});
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
    
    // Play page turn sound
    if (magazine.enablePageSound && !isMuted) {
      turnSound.play();
    }
  };

  const onChangeOrientation = (e: { data: 'portrait' | 'landscape' }) => {
    setOrientation(e.data);
  };

  return (
    <div
      ref={viewerRef}
      className="h-screen w-screen bg-zinc-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans relative"
      onWheel={(e) => {
        if (zoom > 1 || e.ctrlKey) {
          if (e.deltaY < 0) handleZoomIn();
          else handleZoomOut();
        }
      }}
      onDoubleClick={() => {
        if (magazine.enableZoom) {
          setZoom((z) => (z > 1 ? 1 : 1.75));
        }
      }}
    >
      {/* ── AUTO-HIDING TOP TOOLBAR ── */}
      <header 
        className={`h-18 px-4 sm:px-6 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between z-40 select-none transition-transform duration-500 fixed top-0 left-0 w-full ${
          showToolbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/media-gallery/e-magazines')}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base leading-tight font-outfit">{magazine.title}</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
              {magazine.edition || 'Regular Edition'} {magazine.month && `• ${magazine.month}`} {magazine.year}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom controls */}
          {magazine.enableZoom && (
            <div className="hidden sm:flex items-center bg-white/5 p-1 rounded-xl border border-white/5 mr-1.5">
              <button onClick={handleZoomOut} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoom(1)} 
                className="text-[10px] font-extrabold px-2.5 hover:underline"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button onClick={handleZoomIn} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sound Control Toggle */}
          {magazine.enablePageSound && (
            <div className="relative">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title={isMuted ? 'Unmute turns' : 'Mute turns'}
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
              </button>
            </div>
          )}

          {/* Settings Control Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${showSettings ? 'bg-white/10 text-white' : 'hover:bg-white/10'}`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Search Toggle */}
          {magazine.enableSearch && (
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (!showSearch) setZoom(1);
              }}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${showSearch ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/10'}`}
              title="Search Book"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Fullscreen */}
          {magazine.enableFullscreen && (
            <button
              onClick={handleFullscreenToggle}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Fullscreen Mode"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          )}

          {/* Print Layout */}
          {magazine.enablePrint && (
            <button
              onClick={handlePrint}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Print Pages"
            >
              <Printer className="w-5 h-5" />
            </button>
          )}

          {/* Share */}
          {magazine.enableShare && (
            <button
              onClick={handleShare}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Copy link"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}

          {/* Download S3 PDF */}
          {magazine.enableDownload && (
            <a href={magazine.pdfUrl} download target="_blank" rel="noreferrer">
              <button
                className="p-2.5 hover:bg-white/10 rounded-xl text-primary transition-colors cursor-pointer"
                title="Download PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            </a>
          )}
        </div>
      </header>

      {/* ── SETTINGS AND VOLUME DROPDOWN PANEL ── */}
      {showSettings && (
        <div className="absolute top-20 right-6 bg-zinc-900 border border-white/5 rounded-2xl p-5 w-64 z-50 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="font-bold text-xs uppercase tracking-wider text-zinc-400">Settings</span>
            <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-white/5 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Volume control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">Page Turn Sound</span>
              <span className="text-zinc-500 font-bold">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
              className="w-full accent-primary bg-zinc-700 h-1 rounded-lg outline-none cursor-pointer"
            />
          </div>

          {/* Sizing Details */}
          <div className="pt-2 text-[10px] text-zinc-500 space-y-1">
            <div className="flex justify-between">
              <span>Resolution:</span>
              <span className="font-bold text-zinc-400">1200px (WebP)</span>
            </div>
            <div className="flex justify-between">
              <span>Reading Mode:</span>
              <span className="font-bold text-zinc-400 capitalize">{orientation}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── CENTRAL INTERACTIVE CANVAS ── */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden bg-zinc-950 px-2.5 sm:px-5 md:px-10 py-18">
        
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
        <div className="flex items-center justify-center gap-4 md:gap-8 lg:gap-12 w-full h-full max-w-full relative">
          
          {/* Glass Left Navigation Arrow */}
          <button
            onClick={handlePrev}
            disabled={currentPage <= 1}
            className={`w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all select-none hidden md:flex shrink-0 ${
              currentPage <= 1 ? 'opacity-25 cursor-not-allowed' : 'hover:scale-105 hover:bg-white/15 cursor-pointer'
            }`}
            title="Previous Page"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {/* Zoom Wrapper */}
          <div
            className="flex items-center justify-center overflow-visible relative transition-transform duration-200"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Book Frame with Soft Outer Shadow */}
            <div className="relative shadow-[0_30px_70px_rgba(0,0,0,0.85)] rounded-2xl overflow-visible bg-zinc-900 border border-white/5">
              
              {/* Dynamic Center Fold Gutter shadow overlay */}
              {!isCover && orientation === 'landscape' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-full bg-gradient-to-r from-black/35 via-black/10 to-black/35 z-30 pointer-events-none" />
              )}

              {/* StPageFlip (HTMLFlipBook) Container */}
              {pages.length > 0 && (
                <HTMLFlipBook
                  ref={bookRef}
                  width={550}
                  height={780}
                  size="stretch"
                  minWidth={300}
                  maxWidth={800}
                  minHeight={420}
                  maxHeight={1150}
                  maxShadowOpacity={0.6}
                  showCover={true}
                  mobileScrollSupport={true}
                  useMouseEvents={true}
                  onFlip={onFlip}
                  onChangeOrientation={onChangeOrientation}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    height: 'calc(100vh - 180px)',
                    maxHeight: 'calc(100vh - 180px)',
                    width: orientation === 'portrait' ? 'auto' : 'calc((100vh - 180px) * 1.414)',
                    aspectRatio: orientation === 'portrait' ? '1/1.414' : '1.414',
                  }}
                >
                  {pages.map((page, index) => {
                    // Lazy Loading: Render image only if page is near current viewport context (+- 4 pages)
                    const isNear = Math.abs(index + 1 - currentPage) <= 4;
                    
                    return (
                      <FlipPage key={page.pageNumber}>
                        {isNear ? (
                          <img
                            src={getOriginalUrl(page.imageUrl)}
                            alt={`Page ${page.pageNumber}`}
                            className="w-full h-full object-fill pointer-events-none select-none"
                            loading="eager"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center space-y-3">
                            <RefreshCw className="w-7 h-7 animate-spin text-zinc-600" />
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Loading</span>
                          </div>
                        )}

                        {/* Page edges and thickness layer */}
                        <div className={`absolute top-0 w-1.5 h-full bg-black/10 z-20 pointer-events-none ${
                          index % 2 === 0 ? 'right-0' : 'left-0'
                        }`} />
                      </FlipPage>
                    );
                  })}
                </HTMLFlipBook>
              )}
            </div>
          </div>

          {/* Glass Right Navigation Arrow */}
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className={`w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all select-none hidden md:flex shrink-0 ${
              currentPage >= totalPages ? 'opacity-25 cursor-not-allowed' : 'hover:scale-105 hover:bg-white/15 cursor-pointer'
            }`}
            title="Next Page"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      </main>

      {/* ── BOTTOM PROGRESS BAR & NAVIGATION ── */}
      <footer className="h-20 bg-zinc-900/60 backdrop-blur-xl border-t border-white/5 flex flex-col justify-center items-center px-6 z-40 select-none">
        <div className="flex items-center gap-6">
          <button
            onClick={handlePrev}
            disabled={currentPage <= 1}
            className="flex items-center gap-1.5 px-4 py-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl transition-all cursor-pointer font-bold text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-zinc-400 font-extrabold text-sm select-none">
            {orientation === 'portrait' ? (
              <span>Page {currentPage} / {totalPages}</span>
            ) : currentPage === 1 ? (
              <span>Cover (Page 1) / {totalPages}</span>
            ) : currentPage + 1 >= totalPages ? (
              <span>Spread {currentPage}-{totalPages} / {totalPages}</span>
            ) : (
              <span>Spread {currentPage}-{currentPage + 1} / {totalPages}</span>
            )}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1.5 px-4 py-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl transition-all cursor-pointer font-bold text-sm"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full max-w-xl h-1 bg-white/10 rounded-full mt-2 relative overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          />
        </div>
      </footer>
    </div>
  );
}
