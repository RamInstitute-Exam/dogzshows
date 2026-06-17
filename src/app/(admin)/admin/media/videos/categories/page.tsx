'use client';

import React, { useState, useEffect } from 'react';
import { Film, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import { Button } from '@/components/ui/button';
import { useAdminVideoCategories } from '@/hooks/useMedia';
import api from '@/lib/api';
import { toast } from 'sonner';

interface CategoryFormData {
  id?: string;
  name: string;
  slug: string;
  status: string;
}

export default function VideoCategoriesManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: adminCategoriesRes, isLoading, refetch } = useAdminVideoCategories({ page, limit: 10, search });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', slug: '', status: 'ACTIVE' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = adminCategoriesRes?.success && Array.isArray(adminCategoriesRes.data) ? adminCategoriesRes.data : [];
  const totalCount = adminCategoriesRes?.total || 0;
  const totalPages = adminCategoriesRes?.totalPages || 1;

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      if (formData.id) {
        const res = await api.put(`/video-categories/${formData.id}`, formData);
        if (res.success) {
          toast.success('Category updated successfully');
        } else {
          toast.error(res.message || 'Failed to update category');
        }
      } else {
        const res = await api.post('/video-categories', formData);
        if (res.success) {
          toast.success('Category created successfully');
        } else {
          toast.error(res.message || 'Failed to create category');
        }
      }
      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      console.error('Failed to save category', error);
      toast.error(error.message || 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Are you sure you want to delete category "${item.name}"?`)) return;
    try {
      const res = await api.delete(`/video-categories/${item.id}`);
      if (res.success) {
        toast.success('Category deleted successfully');
        refetch();
      } else {
        toast.error(res.message || 'Failed to delete category');
      }
    } catch (error: any) {
      console.error('Failed to delete category', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const openCreate = () => {
    setFormData({ name: '', slug: '', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormData({
      id: item.id,
      name: item.name,
      slug: item.slug,
      status: item.status
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    refetch();
  }, [page, search]);

  const columns: ColumnDefinition<any>[] = [
    { header: 'Name', accessor: 'name', className: 'font-bold text-foreground' },
    { header: 'Slug', accessor: 'slug' },
    {
      header: 'Status',
      accessor: (c) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {c.status}
        </span>
      )
    }
  ];

  return (
    <div className=" space-y-4 relative">
      <AdminDataTable
        title="Video Categories"
        description="Configure media gallery categories for organizing videos."
        icon={Film}
        data={categories}
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
        createLabel="Add Category"
        keyExtractor={(item) => item.id}
      />

      {/* Button overlay hack since AdminDataTable createLink opens page */}
      {!isLoading && (
        <Button onClick={openCreate} className="absolute top-[48px] right-10 md:right-14 bg-blue-600 hover:bg-blue-700 text-white font-bold z-10 flex h-10 px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-lg rounded-2xl p-6 border border-border shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">{formData.id ? 'Edit Category' : 'Create Category'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Category Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })}
                    className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                    placeholder="e.g. Championship Videos"
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
                    placeholder="e.g. championship-videos"
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
                <div className="pt-4">
                  <Button onClick={handleSave} disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11">
                    {isSubmitting ? 'Saving...' : 'Save Category'}
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
