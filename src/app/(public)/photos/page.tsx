'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Share2, ZoomIn, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock Data
const PHOTOS = [
  { id: 1, title: 'Golden Retriever Champion', category: 'Dog Shows', width: 800, height: 600, url: '/images/hero_banner.png', location: 'National Championship' },
  { id: 2, title: 'Husky Action Shot', category: 'Portraits', width: 600, height: 800, url: '/images/winners_banner.png', location: 'Winter Classic' },
  { id: 3, title: 'Rottweiler Stance', category: 'Dog Shows', width: 800, height: 800, url: '/images/competitions_banner.png', location: 'Working Dog Specialty' },
  { id: 4, title: 'Pug Portrait', category: 'Portraits', width: 800, height: 533, url: '/images/dogshows_banner.png', location: 'Studio Session' },
  { id: 5, title: 'German Shepherd Agility', category: 'Action', width: 600, height: 900, url: '/images/about_banner.png', location: 'Summer Agility Trials' },
  { id: 6, title: 'Dalmatian Running', category: 'Action', width: 1200, height: 800, url: '/images/gallery_banner.png', location: 'Open Field Event' },
  { id: 7, title: 'Bulldog Resting', category: 'Portraits', width: 800, height: 800, url: '/images/events_banner.png', location: 'City Dog Show' },
];

const CATEGORIES = ['All', 'Dog Shows', 'Portraits', 'Action'];

export default function PhotoGallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<typeof PHOTOS[0] | null>(null);

  const filteredPhotos = useMemo(() => {
    return PHOTOS.filter(photo => {
      const matchesCategory = activeCategory === 'All' || photo.category === activeCategory;
      const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            photo.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-brand-light pt-24 pb-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div>
            <h1 className="text-muted-foregroundxl md:text-muted-foregroundxl font-outfit font-extrabold text-brand-dark mb-4">Photo Gallery</h1>
            <p className="text-muted-foreground font-medium max-w-xl">Explore our premium collection of dog show photography, studio portraits, and action captures.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-12 pr-4 py-3 rounded-full border border-border bg-card focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange shadow-sm font-medium transition-all"
              />
            </div>
            
            {/* Download All Button */}
            <Button variant="outline" className="border-border text-brand-dark hover:bg-card h-[50px] rounded-full hidden sm:flex">
              <Download className="w-4 h-4 mr-2" /> Download Kit
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-10 pb-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full whitespace-nowrap font-semibold transition-all duration-300 ${
                activeCategory === category 
                  ? 'bg-brand-orange text-foreground shadow-md shadow-brand-orange/20' 
                  : 'bg-card text-muted-foreground hover:bg-input border border-transparent'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          <AnimatePresence>
            {filteredPhotos.map((photo) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={photo.id}
                className="break-inside-avoid relative rounded-[20px] overflow-hidden group cursor-zoom-in bg-input shadow-sm"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo.url} 
                  alt={photo.title}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-darker/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-brand-orange text-xs font-bold uppercase tracking-wider mb-2 block">{photo.category}</span>
                    <h3 className="text-foreground font-bold font-outfit text-lg mb-1 leading-snug">{photo.title}</h3>
                    <p className="text-muted-foreground text-sm font-medium">{photo.location}</p>
                    
                    <div className="flex gap-2 mt-4">
                      <button className="w-10 h-10 rounded-full bg-card/20 hover:bg-brand-orange backdrop-blur text-foreground flex items-center justify-center transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-card/20 hover:bg-brand-orange backdrop-blur text-foreground flex items-center justify-center transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPhotos.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-muted-foreground">No photos found matching your criteria</h3>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-darker/98 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedPhoto(null)}
          >
            <button 
              className="absolute top-6 right-6 text-foreground/70 hover:text-foreground bg-card/10 p-2 rounded-full backdrop-blur z-10 transition-colors"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-6xl max-h-[85vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.title}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-foreground rounded-b-lg flex justify-between items-end">
                <div>
                  <span className="bg-brand-orange px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">{selectedPhoto.category}</span>
                  <h2 className="text-2xl font-bold font-outfit">{selectedPhoto.title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{selectedPhoto.location}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-border text-foreground hover:bg-card/10 backdrop-blur">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                  <Button className="bg-brand-orange hover:bg-orange-600 text-foreground">
                    <Download className="w-4 h-4 mr-2" /> Download High-Res
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
