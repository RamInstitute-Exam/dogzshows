'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Image as ImageIcon, Trash2, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';

export default function MediaGallery() {
  const [loading, setLoading] = useState(false);
  const [images] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b', title: 'Dog Show Hero 1', date: '2023-10-01' },
    { id: 2, url: 'https://images.unsplash.com/photo-1534361960057-19889db9621e', title: 'Championship Event', date: '2023-09-15' },
    { id: 3, url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee', title: 'Winner Ceremony', date: '2023-08-20' },
    { id: 4, url: 'https://images.unsplash.com/photo-1602526430780-781d850d9e2a', title: 'Poodle Jump', date: '2023-07-11' }
  ]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8 bg-background">
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <ImageIcon className="w-8 h-8 text-fuchsia-500" /> Media Gallery
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Manage global platform imagery, event photos, and assets.</p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search media..." 
                  className="pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder-[#7C8798] focus:outline-none focus:border-fuchsia-500 transition-all w-64"
                />
              </div>
              <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-foreground font-bold">
                <Upload className="w-4 h-4 mr-2" /> Upload Media
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {images.map((img, i) => (
              <motion.div 
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden group"
              >
                <div className="h-48 relative bg-card">
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-3">
                    <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-foreground rounded-full h-10 w-10">
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-foreground font-bold truncate">{img.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Uploaded: {img.date}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
