'use client';

import React, { useState, useEffect } from 'react';
import { FolderHeart, X, Plus, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import { Button } from '@/components/ui/button';
import { useAdminMediaAlbums } from '@/hooks/useMedia';
import api from '@/lib/api';
import { toast } from 'sonner';
import ImageUploader from '@/components/shared/ImageUploader';

interface AlbumFormData {
  id?: string;
  title: string;
  slug: string;
  coverImage: string;
  description: string;
  status: string;
  order: number;
}

export default function PhotoAlbumsManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: adminAlbumsRes, isLoading, refetch } = useAdminMediaAlbums({ page, limit: 10, search });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<AlbumFormData>({
    title: '',
    slug: '',
    coverImage: '',
    description: '',
    status: 'ACTIVE',
    order: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const albums = adminAlbumsRes?.success && Array.isArray(adminAlbumsRes.data) ? adminAlbumsRes.data : [];
  const totalCount = adminAlbumsRes?.total || 0;
  const totalPages = adminAlbumsRes?.totalPages || 1;

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        order: Number(formData.order) || 0
      };

      if (formData.id) {
        const res = await api.put(`/photo-albums/${formData.id}`, payload);
        if (res.success) {
          toast.success('Album updated successfully');
        } else {
          toast.error(res.message || 'Failed to update album');
        }
      } else {
        const res = await api.post('/photo-albums', payload);
        if (res.success) {
          toast.success('Album created successfully');
        } else {
          toast.error(res.message || 'Failed to create album');
        }
      }
      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      console.error('Failed to save album', error);
      toast.error(error.message || 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Are you sure you want to delete album "${item.title}"?`)) return;
    try {
      const res = await api.delete(`/photo-albums/${item.id}`);
      if (res.success) {
        toast.success('Album deleted successfully');
        refetch();
      } else {
        toast.error(res.message || 'Failed to delete album');
      }
    } catch (error: any) {
      console.error('Failed to delete album', error);
      toast.error(error.message || 'Failed to delete album');
    }
  };

  const openCreate = () => {
    setFormData({
      title: '',
      slug: '',
      coverImage: '',
      description: '',
      status: 'ACTIVE',
      order: 0
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormData({
      id: item.id,
      title: item.title,
      slug: item.slug,
      coverImage: item.coverImage || '',
      description: item.description || '',
      status: item.status,
      order: item.order || 0
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    refetch();
  }, [page, search]);

  const columns: ColumnDefinition<any>[] = [
    {
      header: 'Cover',
      accessor: (a) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-accent flex items-center justify-center">
          {a.coverImage ? (
            <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover" />
          ) : (
            <Image className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      )
    },
    { header: 'Title', accessor: 'title', className: 'font-bold text-foreground' },
    { header: 'Slug', accessor: 'slug' },
    { header: 'Order', accessor: 'order' },
    {
      header: 'Status',
      accessor: (a) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${a.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {a.status}
        </span>
      )
    }
  ];

  return (
    <div className=" space-y-4 relative">
      <AdminDataTable
        title="Photo Albums"
        description="Manage media gallery photo albums to group photos under a specific context."
        icon={FolderHeart}
        data={albums}
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
        createLabel="Add Album"
        keyExtractor={(item) => item.id}
      />

      {/* Button overlay hack since AdminDataTable createLink opens page */}
      {!isLoading && (
        <Button onClick={openCreate} className="absolute top-[48px] right-10 md:right-14 bg-blue-600 hover:bg-blue-700 text-white font-bold z-10 flex h-10 px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4 mr-2" /> Add Album
        </Button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-lg rounded-2xl p-6 border border-border shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">{formData.id ? 'Edit Album' : 'Create Album'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Album Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })}
                    className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                    placeholder="e.g. Best in Show 2026"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                    placeholder="e.g. best-in-show-2026"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Cover Image URL</label>
                  <div className="mt-1.5">
                    <ImageUploader
                      currentImage={formData.coverImage}
                      onUploadSuccess={(url) => setFormData({ ...formData, coverImage: url })}
                      onRemove={() => setFormData({ ...formData, coverImage: '' })}
                      folder="media-albums"
                      label=""
                      aspectRatio={16/9}
                      helpText="Landscape image. Max 10 MB."
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                    placeholder="Provide details about the photos under this album..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Display Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                      className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                      placeholder="0"
                    />
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
                <div className="pt-4">
                  <Button onClick={handleSave} disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11">
                    {isSubmitting ? 'Saving...' : 'Save Album'}
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
