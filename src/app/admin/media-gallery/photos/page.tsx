'use client';

import React, { useState, useEffect } from 'react';
import { Camera, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import { Button } from '@/components/ui/button';
import { useAdminMediaImages, useMediaCategories, useMediaAlbums } from '@/hooks/useMedia';
import { getImageUrl } from '@/lib/api';
import api from '@/lib/api';
import ImageUploader from '@/components/shared/ImageUploader';

interface PhotoFormData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  altText: string;
  featured: boolean;
  categoryId: string;
  albumId: string;
  status: string;
}

export default function PhotosManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: adminImagesRes, isLoading, refetch } = useAdminMediaImages({ page, limit: 10, search });
  const { data: categoriesRes } = useMediaCategories();
  const { data: albumsRes } = useMediaAlbums();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<PhotoFormData>({
    title: '',
    slug: '',
    description: '',
    imageUrl: '',
    altText: '',
    featured: false,
    categoryId: '',
    albumId: '',
    status: 'ACTIVE'
  });

  const photos = adminImagesRes?.success && Array.isArray(adminImagesRes.items) ? adminImagesRes.items : [];
  const categories = categoriesRes?.success && Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
  const albums = albumsRes?.success && Array.isArray(albumsRes.data) ? albumsRes.data : [];
  const totalCount = adminImagesRes?.totalCount || 0;
  const totalPages = adminImagesRes?.totalPages || 1;

  const handleSave = async () => {
    if (!formData.title || !formData.imageUrl || !formData.categoryId) {
      return alert('Title, Image URL, and Category are required');
    }
    try {
      const dataToSend = {
        ...formData,
        albumId: formData.albumId === 'none' || formData.albumId === '' ? null : formData.albumId
      };
      if (formData.id) {
        await api.put(`/media/admin/${formData.id}`, dataToSend);
      } else {
        await api.post('/media/admin/image', dataToSend);
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to save photo', error);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete photo "${item.title}"?`)) return;
    try {
      await api.delete(`/media/admin/${item.id}`);
      refetch();
    } catch (error) {
      console.error('Failed to delete photo', error);
    }
  };

  const openCreate = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      imageUrl: '/images/placeholder.webp',
      altText: '',
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
      description: item.description || '',
      imageUrl: item.imageUrl,
      altText: item.altText || '',
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
    { header: 'Preview', accessor: (p) => <img src={getImageUrl(p.imageUrl)} alt="Preview" className="w-16 h-12 object-cover rounded-lg border border-border" /> },
    { header: 'Title', accessor: 'title', className: 'font-bold text-foreground' },
    { header: 'Category', accessor: (p) => p.category?.name || 'Uncategorized' },
    { header: 'Album', accessor: (p) => p.album?.title || 'None' },
    {
      header: 'Featured',
      accessor: (p) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.featured ? 'bg-primary/20 text-primary' : 'bg-accent text-muted-foreground'}`}>
          {p.featured ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (p) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
          {p.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-4 relative">
      <AdminDataTable
        title="Photo Gallery Management"
        description="Add, edit, delete and classify photography show records."
        icon={Camera}
        data={photos}
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
        createLabel="Add Photo"
        keyExtractor={(item) => item.id}
      />

      {!isLoading && (
        <Button onClick={openCreate} className="absolute top-[32px] right-6 md:right-12 bg-blue-600 hover:bg-blue-700 text-white font-bold z-10 flex">
          <Plus className="w-4 h-4 mr-2" /> Add Photo
        </Button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-2xl rounded-2xl p-6 border border-border shadow-2xl overflow-y-auto max-h-[95vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{formData.id ? 'Edit Photo' : 'Add Photo'}</h3>
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
                      placeholder="e.g. Golden Retriever Champion"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                      placeholder="e.g. golden-retriever-champion"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold h-20"
                    placeholder="Provide detailed description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Image URL</label>
                    <div className="mt-1.5">
                      <ImageUploader
                        currentImage={formData.imageUrl}
                        onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
                        onRemove={() => setFormData({ ...formData, imageUrl: '' })}
                        folder="media-gallery"
                        label=""
                        helpText="Max 10 MB."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Alt Text</label>
                    <input
                      type="text"
                      value={formData.altText}
                      onChange={e => setFormData({ ...formData, altText: e.target.value })}
                      className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                      placeholder="e.g. Golden Retriever show stand pose"
                    />
                  </div>
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
                    Save Photo
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
