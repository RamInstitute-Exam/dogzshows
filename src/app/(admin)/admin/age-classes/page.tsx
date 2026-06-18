'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { config } from '@/lib/config';
import api from '@/services/api';

interface AgeClass {
  id: string;
  name: string;
  description: string;
  minMonths: number | null;
  maxMonths: number | null;
  specialRequirements: string | null;
}

export default function AgeClassesPage() {
  const [classes, setClasses] = useState<AgeClass[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      const res = await api.get(`/age-classes`);
      const data = res;
      if (data.success) {
        setClasses(data.data);
      }
    } catch (error) {
      console.error('Failed to load age classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this age class?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/age-classes/${id}`);
      fetchClasses();
    } catch (err) {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const minMonths = (form.elements.namedItem('minMonths') as HTMLInputElement).value;
    const maxMonths = (form.elements.namedItem('maxMonths') as HTMLInputElement).value;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${config.apiUrl}/age-classes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          minMonths: minMonths ? parseInt(minMonths) : null,
          maxMonths: maxMonths ? parseInt(maxMonths) : null
        })
      });
      form.reset();
      fetchClasses();
    } catch (err) {}
  };

  return (
    <div className="w-full space-y-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Show Classes & Age Rules</h1>
              <p className="text-muted-foreground">Manage classes like Puppy, Junior, Open based on age limits.</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Add New Class</h2>
            <form className="flex gap-4" onSubmit={handleAdd}>
              <input name="name" type="text" placeholder="Class Name (e.g. Junior)" required className="bg-accent border border-border text-foreground p-2 rounded flex-1" />
              <input name="minMonths" type="number" placeholder="Min Months" className="bg-accent border border-border text-foreground p-2 rounded w-32" />
              <input name="maxMonths" type="number" placeholder="Max Months" className="bg-accent border border-border text-foreground p-2 rounded w-32" />
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
                    <th className="p-4 font-semibold">Class Name</th>
                    <th className="p-4 font-semibold">Age Range (Months)</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-accent transition-colors">
                      <td className="p-4 text-foreground font-bold">{cls.name}</td>
                      <td className="p-4 text-muted-foreground">
                        {cls.minMonths !== null ? `${cls.minMonths}` : '0'} to {cls.maxMonths !== null ? `${cls.maxMonths}` : '∞'} months
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cls.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                  {classes.length === 0 && (
                    <tr>
                      <td colSpan={3} className=" text-center text-muted-foreground">No classes found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
    </div>
  );
}
