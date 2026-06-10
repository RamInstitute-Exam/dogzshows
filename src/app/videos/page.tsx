'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Eye, Calendar, X } from 'lucide-react';
import Button from '../../components/ui/Button';

// Mock Data
const ALL_VIDEOS = [
  { id: 1, title: 'National Dog Show Finals 2026', category: 'Dog Show Videos', duration: '12:45', views: '14.2K', date: '2 days ago', thumbnail: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-a-field-of-yellow-flowers-42354-large.mp4' },
  { id: 2, title: 'Behind the Scenes: Golden Retriever Studio Session', category: 'Dog Videography', duration: '05:20', views: '8.5K', date: '1 week ago', thumbnail: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-playing-with-her-dog-in-the-park-42291-large.mp4' },
  { id: 3, title: 'Agility Course Championship Highlight Reel', category: 'Dog Show Videos', duration: '08:15', views: '22.1K', date: '3 weeks ago', thumbnail: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-a-field-of-yellow-flowers-42354-large.mp4' },
  { id: 4, title: 'Husky Pack in the Snow - Cinematic Short', category: 'Dog Videography', duration: '03:40', views: '45.3K', date: '1 month ago', thumbnail: 'https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&q=80', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-playing-with-her-dog-in-the-park-42291-large.mp4' },
  { id: 5, title: 'Best of Breed Interviews 2026', category: 'Dog Show Videos', duration: '15:30', views: '5.1K', date: '2 months ago', thumbnail: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-a-field-of-yellow-flowers-42354-large.mp4' },
  { id: 6, title: 'Rottweiler Obedience Training - Documentary', category: 'Dog Videography', duration: '22:10', views: '12.8K', date: '3 months ago', thumbnail: 'https://images.unsplash.com/photo-1563889958748-18e4dd8f731c?auto=format&fit=crop&q=80', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-playing-with-her-dog-in-the-park-42291-large.mp4' },
];

const CATEGORIES = ['All Videos', 'Dog Show Videos', 'Dog Videography'];

export default function VideoGallery() {
  const [activeCategory, setActiveCategory] = useState('All Videos');
  const [activeVideo, setActiveVideo] = useState<typeof ALL_VIDEOS[0] | null>(null);

  const filteredVideos = activeCategory === 'All Videos' 
    ? ALL_VIDEOS 
    : ALL_VIDEOS.filter(v => v.category === activeCategory);

  const relatedVideos = ALL_VIDEOS.filter(v => v.id !== activeVideo?.id).slice(0, 3);

  return (
    <main className="min-h-screen bg-brand-light pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-outfit font-extrabold text-brand-dark mb-4">Video Gallery</h1>
          <p className="text-gray-500 font-medium max-w-xl">Watch our cinematic dog show recaps, behind-the-scenes event coverage, and premium dog videography.</p>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-10 pb-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full whitespace-nowrap font-semibold transition-all duration-300 ${
                activeCategory === category 
                  ? 'bg-brand-dark text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredVideos.map((video) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                key={video.id}
                className="bg-white rounded-[2rem] overflow-hidden premium-shadow group cursor-pointer"
                onClick={() => setActiveVideo(video)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-brand-darker/20 group-hover:bg-brand-darker/40 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-brand-orange/90 backdrop-blur text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-brand-darker/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {video.duration}
                  </div>
                </div>
                
                <div className="p-6">
                  <span className="text-brand-orange text-xs font-bold uppercase tracking-wider mb-2 block">{video.category}</span>
                  <h3 className="text-xl font-bold font-outfit text-brand-dark mb-4 line-clamp-2 group-hover:text-brand-orange transition-colors">{video.title}</h3>
                  <div className="flex items-center text-gray-500 text-sm font-medium gap-4">
                    <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {video.views}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {video.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Fullscreen Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-darker/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur z-10 transition-colors"
              onClick={() => setActiveVideo(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 mt-10 h-full max-h-[85vh]">
              {/* Main Player */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex-grow flex flex-col"
              >
                <div className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl flex-grow aspect-video lg:aspect-auto">
                  <video 
                    src={activeVideo.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-6 text-white">
                  <h2 className="text-2xl md:text-3xl font-bold font-outfit mb-2">{activeVideo.title}</h2>
                  <div className="flex items-center text-gray-400 text-sm font-medium gap-6">
                    <span>{activeVideo.views} views</span>
                    <span>{activeVideo.date}</span>
                    <span className="bg-brand-orange/20 text-brand-orange px-2 py-0.5 rounded-md">{activeVideo.category}</span>
                  </div>
                </div>
              </motion.div>

              {/* Related Videos Sidebar */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto hide-scrollbar pb-10"
              >
                <h3 className="text-white font-bold font-outfit text-xl mb-2">Up Next</h3>
                {relatedVideos.map(video => (
                  <div 
                    key={video.id} 
                    className="flex gap-3 cursor-pointer group"
                    onClick={() => setActiveVideo(video)}
                  >
                    <div className="relative w-32 aspect-video rounded-xl overflow-hidden flex-shrink-0">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-bold">
                        {video.duration}
                      </div>
                    </div>
                    <div className="flex flex-col py-1">
                      <h4 className="text-white text-sm font-bold line-clamp-2 group-hover:text-brand-orange transition-colors leading-snug">{video.title}</h4>
                      <p className="text-gray-400 text-xs mt-1">{video.views} • {video.date}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
