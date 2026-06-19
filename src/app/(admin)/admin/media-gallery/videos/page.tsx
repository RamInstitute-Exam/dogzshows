'use client';

import React, { useState, useEffect } from 'react';
import { Video, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import { Button } from '@/components/ui/button';
import { useAdminMediaVideos, useMediaCategories, useMediaAlbums } from '@/hooks/useMedia';
import { getImageUrl } from '@/lib/api';
import api from '@/lib/api';

interface VideoFormData {
  id?: string;
  title: string;
  slug: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  featured: boolean;
  categoryId: string;
  albumId: string;
  status: string;
}

export default function VideosManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: adminVideosRes, isLoading, refetch } = useAdminMediaVideos({ page, limit: 10, search });
  const { data: categoriesRes } = useMediaCategories();
  const { data: albumsRes } = useMediaAlbums();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    slug: '',
    thumbnail: '',
    videoUrl: '',
    duration: '',
    featured: false,
    categoryId: '',
    albumId: '',
    status: 'ACTIVE'
  });

  const videos = adminVideosRes?.success && Array.isArray(adminVideosRes.items) ? adminVideosRes.items : [];
  const categories = categoriesRes?.success && Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
  const albums = albumsRes?.success && Array.isArray(albumsRes.data) ? albumsRes.data : [];
  const totalCount = adminVideosRes?.totalCount || 0;
  const totalPages = adminVideosRes?.totalPages || 1;

  const handleSave = async () => {
    if (!formData.title || !formData.videoUrl || !formData.categoryId) {
      return alert('Title, Video URL, and Category are required');
    }
    try {
      const dataToSend = {
        ...formData,
        albumId: formData.albumId === 'none' || formData.albumId === '' ? null : formData.albumId
      };
      if (formData.id) {
        await api.put(`/media/admin/${formData.id}`, dataToSend);
      } else {
        await api.post('/media/admin/video', dataToSend);
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to save video', error);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete video "${item.title}"?`)) return;
    try {
      await api.delete(`/media/admin/${item.id}`);
      refetch();
    } catch (error) {
      console.error('Failed to delete video', error);
    }
  };

  const openCreate = () => {
    setFormData({
      title: '',
      slug: '',
      thumbnail: '/images/placeholder.webp',
      videoUrl: '',
      duration: '02:00',
      featured: false,
      categoryId: categories[0]?.id || '',
      albumId: 'none',
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormData({
      id: item.id,
      title: item.title,
      slug: item.slug,
      thumbnail: item.thumbnail || '/images/placeholder.webp',
      videoUrl: item.videoUrl,
      duration: item.duration || '02:00',
      featured: item.featured,
      categoryId: item.categoryId,
      albumId: item.albumId || 'none',
      status: item.status
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    refetch();
  }, [page, search]);

  const columns: ColumnDefinition<any>[] = [
    { header: 'Thumbnail', accessor: (v) => <img src={getImageUrl(v.thumbnail)} alt="Thumbnail" className="w-16 h-12 object-cover rounded-lg border border-border" /> },
    { header: 'Title', accessor: 'title', className: 'font-bold text-foreground' },
    { header: 'Category', accessor: (v) => v.category?.name || 'Uncategorized' },
    { header: 'Duration', accessor: 'duration' },
    {
      header: 'Featured',
      accessor: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${v.featured ? 'bg-primary/20 text-primary' : 'bg-accent text-muted-foreground'}`}>
          {v.featured ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${v.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
          {v.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-4 relative">
      <AdminDataTable
        title="Video Gallery Management"
        description="Add, edit, delete and classify cinematic show videos."
        icon={Video}
        data={videos}
        columns={columns}
        loading={isLoading}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        onSearchChange={setSearch}
        onRefresh={refetch}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={handleDelete}
        createLink="#"
        createLabel="Add Video"
        keyExtractor={(item) => item.id}
      />

      {!isLoading && (
        <Button onClick={openCreate} className="absolute top-[32px] right-6 md:right-12 bg-blue-600 hover:bg-blue-700 text-white font-bold z-10 flex">
          <Plus className="w-4 h-4 mr-2" /> Add Video
        </Button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-2xl rounded-2xl p-6 border border-border shadow-2xl overflow-y-auto max-h-[95vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{formData.id ? 'Edit Video' : 'Add Video'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now() })}
                      className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                      placeholder="e.g. Golden Retriever Agility Show"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                      placeholder="e.g. golden-retriever-agility-show"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-muted-foreground">Video URL (YouTube, Vimeo, MP4)</label>
                    <input
                      type="text"
                      value={formData.videoUrl}
                      onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                      placeholder="e.g. https://assets.mixkit.co/..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                      placeholder="e.g. 05:30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Thumbnail Image URL</label>
                  <input
                    type="text"
                    value={formData.thumbnail}
                    onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                    placeholder="e.g. /images/media-gallery/golden_retriever.png"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Category</label>
                    <select
                      value={formData.categoryId}
                      onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Album</label>
                    <select
                      value={formData.albumId}
                      onChange={e => setFormData({ ...formData, albumId: e.target.value })}
                      className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold cursor-pointer"
                    >
                      <option value="none">None (No Album)</option>
                      {albums.map((a: any) => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold cursor-pointer"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-border rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-sm font-semibold text-muted-foreground cursor-pointer">
                    Featured Item (Show on homepage gallery)
                  </label>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    Save Video
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
