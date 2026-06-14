'use client';

import { Image as ImageIcon, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EventGallery() {
  const media = [
    { type: 'image', src: '/images/hero_banner.png', span: 'col-span-2 row-span-2' },
    { type: 'video', src: '/images/events_banner.png', span: 'col-span-1 row-span-1' },
    { type: 'image', src: '/images/gallery_banner.png', span: 'col-span-1 row-span-1' },
    { type: 'image', src: '/images/winners_banner.png', span: 'col-span-1 row-span-1' },
    { type: 'image', src: '/images/judges_banner.png', span: 'col-span-1 row-span-1' },
  ];

  return (
    <div className="bg-card rounded-[20px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-50 mb-[80px]">
      <h2 className="text-muted-foregroundxl font-extrabold text-[#0F172A] mb-8">Event Gallery</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[150px]">
        {media.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-2xl overflow-hidden group cursor-pointer ${item.span}`}
          >
            <img src={item.src} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              {item.type === 'video' ? (
                <PlayCircle className="w-12 h-12 text-foreground/90 drop-shadow-lg group-hover:scale-110 transition-transform" />
              ) : (
                <ImageIcon className="w-8 h-8 text-foreground/0 group-hover:text-foreground/90 drop-shadow-lg transition-all" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
