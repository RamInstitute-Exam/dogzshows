'use client';

import React, { useState, useEffect } from 'react';
import { Images, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import { Button } from '@/components/ui/button';
import { useAdminMediaAlbums, useMediaCategories } from '@/hooks/useMedia';
import api from '@/lib/api';
import OptimizedImage from '@/components/shared/OptimizedImage';

interface AlbumFormData {
  id?: string;
  title: string;
  slug: string;
  coverImage: string;
  categoryId: string;
}

export default function AlbumsManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: adminAlbumsRes, isLoading, refetch } = useAdminMediaAlbums({ page, limit: 10, search });
  const { data: categoriesRes } = useMediaCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<AlbumFormData>({ title: '', slug: '', coverImage: '', categoryId: '' });

  const albums = adminAlbumsRes?.success && Array.isArray(adminAlbumsRes.items) ? adminAlbumsRes.items : [];
  const categories = categoriesRes?.success && Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
  const totalCount = adminAlbumsRes?.totalCount || 0;
  const totalPages = adminAlbumsRes?.totalPages || 1;

  const handleSave = async () => {
    if (!formData.title || !formData.categoryId) return alert('Title and Category are required');
    try {
      if (formData.id) {
        await api.put(`/media/admin/album/${formData.id}`, formData);
      } else {
        await api.post('/media/admin/album', formData);
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to save album', error);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete album "${item.title}"? This will unlink photos/videos in this album.`)) return;
    try {
      await api.delete(`/media/admin/album/${item.id}`);
      refetch();
    } catch (error) {
      console.error('Failed to delete album', error);
    }
  };

  const openCreate = () => {
    setFormData({ title: '', slug: '', coverImage: '/images/placeholder.webp', categoryId: categories[0]?.id || '' });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormData({
      id: item.id,
      title: item.title,
      slug: item.slug,
      coverImage: item.coverImage || '/images/placeholder.webp',
      categoryId: item.categoryId
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    refetch();
  }, [page, search]);

  const columns: ColumnDefinition<any>[] = [
    { header: 'Cover', accessor: (a) => <OptimizedImage src={a.coverImage || '/images/placeholder.webp'} alt="Cover" className="w-16 h-12 object-cover rounded-lg border border-border" /> },
    { header: 'Title', accessor: 'title', className: 'font-bold text-foreground' },
    { header: 'Slug', accessor: 'slug' },
    { header: 'Category', accessor: (a) => a.category?.name || 'Uncategorized' }
  ];

  return (
    <div className="space-y-4 relative">
      <AdminDataTable
        title="Albums Management"
        description="Organize your photographs and video galleries into grouped albums."
        icon={Images}
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

      {!isLoading && (
        <Button onClick={openCreate} className="absolute top-[32px] right-6 md:right-12 bg-blue-600 hover:bg-blue-700 text-white font-bold z-10 flex">
          <Plus className="w-4 h-4 mr-2" /> Add Album
        </Button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-lg rounded-2xl p-6 border border-border shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{formData.id ? 'Edit Album' : 'Create Album'}</h3>
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
                    placeholder="e.g. Dog Shows"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                    placeholder="e.g. dog-shows"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Cover Image URL</label>
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                    placeholder="/images/placeholder.webp"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold cursor-pointer"
                  >
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-4">
                  <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    Save Album
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
