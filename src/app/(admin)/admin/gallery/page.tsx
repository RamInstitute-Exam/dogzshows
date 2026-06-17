'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X } from 'lucide-react';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface GalleryData {
  id?: string;
  title: string;
  url: string;
  type: string;
  album: string;
}

export default function GalleryManagement() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<GalleryData>({ title: '', url: '', type: 'PHOTO', album: '' });

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/gallery?page=${page}&search=${search}&limit=10`);
      if (res.success) {
        setData(res.data.items || res.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || res.data.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (formData.id) {
        await api.put(`/gallery/${formData.id}`, formData);
      } else {
        await api.post('/gallery', formData);
      }
      setIsModalOpen(false);
      fetchGallery();
    } catch (error) {
      console.error('Failed to save media');
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Delete this media item?')) return;
    try {
      await api.delete(`/gallery/${item.id}`);
      fetchGallery();
    } catch (error) {
      console.error('Failed to delete');
    }
  };

  const openCreate = () => {
    setFormData({ title: '', url: '', type: 'PHOTO', album: '' });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormData(item);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchGallery();
  }, [page, search]);

  const columns: ColumnDefinition<any>[] = [
    { header: 'Preview', accessor: (g) => <img src={g.url} alt="Preview" className="w-16 h-16 object-cover rounded-md" /> },
    { header: 'Title', accessor: 'title', className: 'font-bold text-foreground' },
    { header: 'Type', accessor: 'type' },
    { header: 'Album', accessor: (g) => g.album || 'Uncategorized' },
    { header: 'Date', accessor: (g) => new Date(g.createdAt).toLocaleDateString() }
  ];

  return (
    <div className="w-full">
      <AdminDataTable
        title="Gallery Management"
        description="Upload and organize event photos, videos, and dog albums."
        icon={Camera}
        data={data}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        onSearchChange={setSearch}
        onRefresh={fetchGallery}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={handleDelete}
        createLink="#" // Override generic link since we use modal
        createLabel="Upload Media"
        keyExtractor={(item) => item.id}
      />

      {/* Button overlay hack since AdminDataTable createLink opens page */}
      {!loading && (
        <Button onClick={openCreate} className="absolute top-[108px] right-12 bg-blue-600 hover:bg-blue-700 text-white font-bold z-10 hidden md:flex">
          <Camera className="w-4 h-4 mr-2" /> Upload Media
        </Button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-lg rounded-2xl p-6 border border-border shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{formData.id ? 'Edit Media' : 'Upload Media'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title / Description</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full mt-1 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none" placeholder="e.g. Winner at Delhi Dog Show" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Media URL</label>
                  <input type="text" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full mt-1 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none" placeholder="/images/gallery1.png" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full mt-1 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none">
                      <option value="PHOTO">Photo</option>
                      <option value="VIDEO">Video</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Album Tag</label>
                    <input type="text" value={formData.album} onChange={e => setFormData({...formData, album: e.target.value})} className="w-full mt-1 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none" placeholder="e.g. 2026 Shows" />
                  </div>
                </div>
                <div className="pt-4">
                  <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 font-bold">Save Media</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
