"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ListTree, Save, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

interface Menu {
  id: string;
  name: string;
  url: string;
  parentId: string | null;
  displayOrder: number;
  visibility: boolean;
  children?: Menu[];
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [parentId, setParentId] = useState<string>('');

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/menus', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setMenus(data.data);
      }
    } catch (error) {
      toast.error('Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        url,
        parentId: parentId || null,
        displayOrder: editingMenu ? editingMenu.displayOrder : 99,
        position: 'NAVBAR'
      };

      const method = editingMenu ? 'PUT' : 'POST';
      const endpoint = editingMenu ? `/api/v1/menus/${editingMenu.id}` : '/api/v1/menus';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingMenu ? 'Menu updated' : 'Menu created');
        setIsModalOpen(false);
        fetchMenus();
      } else {
        toast.error(data.message || 'Error saving menu');
      }
    } catch (error) {
      toast.error('Error saving menu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu? Submenus will also be deleted.')) return;
    try {
      const res = await fetch(`/api/v1/menus/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        toast.success('Menu deleted');
        fetchMenus();
      }
    } catch (error) {
      toast.error('Error deleting menu');
    }
  };

  const openModal = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu);
      setName(menu.name);
      setUrl(menu.url);
      setParentId(menu.parentId || '');
    } else {
      setEditingMenu(null);
      setName('');
      setUrl('');
      setParentId('');
    }
    setIsModalOpen(true);
  };

  if (loading) return <div className="w-full">Loading menus...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Navigation Menus</h1>
          <p className="text-muted-foreground text-sm">Manage dynamic frontend navigation bar.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-brand-orange hover:bg-orange-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Menu Item
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-bold flex items-center gap-2"><ListTree className="w-4 h-4 text-brand-orange"/> Menu Structure</h3>
        </div>
        
        <div className="p-4 space-y-4">
          {menus.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No menus found.</p>
          ) : (
            menus.map((parent) => (
              <div key={parent.id} className="border border-border rounded-xl bg-background overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <span className="font-bold">{parent.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{parent.url}</span>
                    {parent.url === '#mega' && <span className="text-[10px] bg-brand-orange/20 text-brand-orange px-2 py-0.5 rounded-full font-bold">MEGA MENU</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openModal(parent)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(parent.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                {parent.children && parent.children.length > 0 && (
                  <div className="border-t border-border bg-background p-3 pl-12 space-y-2">
                    {parent.children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                          <span className="font-medium text-sm">{child.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{child.url}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openModal(child)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(child.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border flex flex-col">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="font-bold text-lg">{editingMenu ? 'Edit Menu' : 'Create Menu'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-muted-foreground hover:bg-accent rounded-full"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-muted-foreground">Name</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Home"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl outline-none focus:border-brand-orange"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-muted-foreground">URL</label>
                <input 
                  type="text" required value={url} onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. /events or #mega"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl outline-none focus:border-brand-orange font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Use <code className="text-brand-orange bg-brand-orange/10 px-1 rounded">#mega</code> to define a Mega Menu container.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-muted-foreground">Parent Menu</label>
                <select 
                  value={parentId} onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl outline-none focus:border-brand-orange"
                >
                  <option value="">None (Top Level)</option>
                  {menus.map(m => (
                    <option key={m.id} value={m.id} disabled={m.id === editingMenu?.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-muted-foreground font-bold hover:bg-accent rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-brand-orange text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-brand-orange/20"><Save className="w-4 h-4"/> Save Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
