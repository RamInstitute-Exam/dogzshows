'use client';

import React, { useState, useEffect } from 'react';
import { FolderOpen, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import { Button } from '@/components/ui/button';
import { useJudgeCategories } from '@/hooks/useJudges';
import api from '@/services/api';

export default function JudgeCategoriesManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const {
    categories,
    total,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  } = useJudgeCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({ name: '', slug: '', description: '', status: 'ACTIVE' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories({ page, limit: 10, search });
  }, [page, search, fetchCategories]);

  const handleSave = async () => {
    setIsSubmitting(true);
    let success = false;
    
    if (formData.id) {
      success = await updateCategory(formData.id, formData);
    } else {
      success = await createCategory(formData);
    }
    
    setIsSubmitting(false);
    
    if (success) {
      setIsModalOpen(false);
      fetchCategories({ page, limit: 10, search });
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Are you sure you want to delete category "${item.name}"?`)) return;
    const success = await deleteCategory(item.id);
    if (success) {
      fetchCategories({ page, limit: 10, search });
    }
  };

  const openCreate = () => {
    setFormData({ name: '', slug: '', description: '', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormData({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      status: item.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const columns: ColumnDefinition<any>[] = [
    { header: 'Name', accessor: 'name', className: 'font-bold text-foreground' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Status',
      accessor: (c) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {c.status || 'ACTIVE'}
        </span>
      )
    }
  ];

  return (
    <div className=" space-y-4 relative">
      <AdminDataTable
        title="Judge Categories"
        description="Manage judge categories."
        icon={FolderOpen}
        data={categories}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={Math.ceil(total / 10) || 1}
        totalCount={total}
        search={search}
        onSearchChange={setSearch}
        onRefresh={() => fetchCategories({ page, limit: 10, search })}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={handleDelete}
        onCreate={openCreate}
        createLabel="Add Category"
        keyExtractor={(item) => item.id}
      />

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
                    placeholder="e.g. Conformation Judge"
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
                    placeholder="e.g. conformation-judge"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm font-semibold"
                    placeholder="Brief description"
                    rows={3}
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
