'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { config } from '@/lib/config';
import api from '@/lib/api';

export default function ClubGalleryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get('/club-galleries');
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete('/club-galleries/' + id);
      fetchData();
    } catch (err) {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    try {
      await api.post('/club-galleries', {
        clubId: (form.elements.namedItem('clubId') as HTMLInputElement).value,
          title: (form.elements.namedItem('title') as HTMLInputElement).value,
          image: (form.elements.namedItem('image') as HTMLInputElement).value
      });
      form.reset();
      fetchData();
    } catch (err) {}
  };

  return (
    <div className="flex bg-card">
      <AdminSidebar />
      <main className="flex-1 md:ml-64  bg-background text-muted-foreground p-8">
        <div className="w-full space-y-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Club Gallery</h1>
              <p className="text-muted-foreground">Manage club gallery</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl mb-6 overflow-x-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">Add New</h2>
            <form className="flex gap-4 flex-wrap" onSubmit={handleAdd}>
              <input name="clubId" type="text" placeholder="clubId" required className="bg-accent border border-border text-foreground p-2 rounded flex-1" />
              <input name="title" type="text" placeholder="title" required className="bg-accent border border-border text-foreground p-2 rounded flex-1" />
              <input name="image" type="text" placeholder="image" required className="bg-accent border border-border text-foreground p-2 rounded flex-1" />
              <Button type="submit" className="bg-brand-orange text-foreground">Add</Button>
            </form>
          </div>

          {loading ? (
            <div className="animate-pulse h-32 bg-card rounded-xl border border-border"></div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card border-b border-border text-muted-foreground uppercase text-xs tracking-wider">
                    <th className="p-4 font-semibold capitalize">clubId</th>
                    <th className="p-4 font-semibold capitalize">title</th>
                    <th className="p-4 font-semibold capitalize">image</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-accent transition-colors">
                      <td className="p-4 text-foreground font-bold">{item.clubId}</td>
                      <td className="p-4 text-foreground font-bold">{item.title}</td>
                      <td className="p-4 text-foreground font-bold">{item.image}</td>
                      <td className="p-4 flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
