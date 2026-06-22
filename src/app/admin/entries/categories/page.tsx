'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Layers, RefreshCw, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/services/api';

export default function EntryCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sortOrder: 0,
    status: 'ACTIVE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/entries/categories');
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (error) {
      console.error('Failed to load categories', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      sortOrder: categories.length + 1,
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      sortOrder: cat.sortOrder || 0,
      status: cat.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.delete(`/entries/categories/${id}`);
      if (res.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
      }
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (selectedCategory) {
        res = await api.put(`/entries/categories/${selectedCategory.id}`, JSON.stringify(formData));
      } else {
        res = await api.post('/entries/categories', JSON.stringify(formData));
      }

      if (res.success) {
        toast.success(selectedCategory ? 'Category updated' : 'Category created');
        setIsModalOpen(false);
        fetchCategories();
      } else {
        toast.error(res.message || 'Action failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-500" /> Entry Categories
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Manage standard entry classes and categories like Puppy, Junior, Champion, etc.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto items-center">
          <Button variant="outline" onClick={fetchCategories} className="border-border text-foreground hover:bg-accent">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </div>
      </div>

      {/* Table Box */}
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-card border-b border-border">
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider w-20">Sort</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Category Name</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading categories...</p>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Layers className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No categories created yet.</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => (
                  <motion.tr 
                    key={cat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                  >
                    <td className="py-4 px-6 font-bold text-foreground">
                      {cat.sortOrder}
                    </td>
                    <td className="py-4 px-6 text-blue-400 font-bold">
                      {cat.name}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground text-sm max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        cat.status === 'ACTIVE' 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                          : 'bg-accent/40 text-muted-foreground border border-border'
                      }`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(cat)} className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card max-w-md w-full rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col text-foreground">
              <div className="flex justify-between items-center p-6 border-b border-border shrink-0 bg-accent/10">
                <h3 className="text-xl font-extrabold text-foreground">{selectedCategory ? 'Edit Category' : 'Add Category'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Category Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" placeholder="e.g. Imported Breed, Veteran" />
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Sort Order</label>
                  <input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-blue-500 outline-none" placeholder="Category definition or age rules description..." />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6">
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
