'use client';

import React, { useState, useEffect } from 'react';
import { FolderOpen, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import { Button } from '@/components/ui/button';
import { useAdminMediaCategories } from '@/hooks/useMedia';
import api from '@/lib/api';

interface CategoryFormData {
  id?: string;
  name: string;
  slug: string;
  status: string;
}

export default function CategoriesManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: adminCategoriesRes, isLoading, refetch } = useAdminMediaCategories({ page, limit: 10, search });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', slug: '', status: 'ACTIVE' });

  const categories = adminCategoriesRes?.success && Array.isArray(adminCategoriesRes.items) ? adminCategoriesRes.items : [];
  const totalCount = adminCategoriesRes?.totalCount || 0;
  const totalPages = adminCategoriesRes?.totalPages || 1;

  const handleSave = async () => {
    if (!formData.name) return alert('Name is required');
    try {
      if (formData.id) {
        await api.put(`/media/admin/category/${formData.id}`, formData);
      } else {
        await api.post('/media/admin/category', formData);
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to save category', error);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete category "${item.name}"? This will delete all albums and items linked to it.`)) return;
    try {
      await api.delete(`/media/admin/category/${item.id}`);
      refetch();
    } catch (error) {
      console.error('Failed to delete category', error);
    }
  };

  const openCreate = () => {
    setFormData({ name: '', slug: '', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormData(item);
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
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
          {c.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-4 relative">
      <AdminDataTable
        title="Categories Management"
        description="Configure media gallery categories for organizing photos and videos."
        icon={FolderOpen}
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
        <Button onClick={openCreate} className="absolute top-[32px] right-6 md:right-12 bg-blue-600 hover:bg-blue-700 text-white font-bold z-10 flex">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-lg rounded-2xl p-6 border border-border shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{formData.id ? 'Edit Category' : 'Create Category'}</h3>
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
                    placeholder="e.g. Show Photos"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                    placeholder="e.g. show-photos"
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
                  <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    Save Category
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
