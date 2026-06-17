const fs = require('fs');
const path = require('path');

const models = [
  { name: 'Club Categories', slug: 'club-categories', endpoint: 'club-categories', fields: ['name'] },
  { name: 'Club Events', slug: 'club-events', endpoint: 'club-events', fields: ['clubId', 'title', 'venue', 'startDate', 'endDate'] },
  { name: 'Committee Members', slug: 'club-committees', endpoint: 'club-committees', fields: ['clubId', 'name', 'designation', 'email', 'phone'] },
  { name: 'Club Gallery', slug: 'club-galleries', endpoint: 'club-galleries', fields: ['clubId', 'title', 'image'] },
];

const basePath = path.join(__dirname, '..', 'src', 'app', '(admin)', 'admin');

models.forEach((m) => {
  const dirPath = path.join(basePath, m.slug);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const inputs = m.fields.map(f => `<input name="${f}" type="text" placeholder="${f}" required className="bg-accent border border-border text-foreground p-2 rounded flex-1" />`).join('\n              ');
  const ths = m.fields.map(f => `<th className="p-4 font-semibold capitalize">${f}</th>`).join('\n                    ');
  const tds = m.fields.map(f => `<td className="p-4 text-foreground font-bold">{item.${f}}</td>`).join('\n                      ');
  const bodyFields = m.fields.map(f => `${f}: (form.elements.namedItem('${f}') as HTMLInputElement).value`).join(',\n          ');

  const content = `'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { config } from '@/lib/config';
import api from '@/lib/api';

export default function ${m.name.replace(/\s+/g, '')}Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get('/${m.endpoint}');
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
      await api.delete('/${m.endpoint}/' + id);
      fetchData();
    } catch (err) {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    try {
      await api.post('/${m.endpoint}', {
        ${bodyFields}
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
              <h1 className="text-3xl font-bold text-foreground mb-2">${m.name}</h1>
              <p className="text-muted-foreground">Manage ${m.name.toLowerCase()}</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl mb-6 overflow-x-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">Add New</h2>
            <form className="flex gap-4 flex-wrap" onSubmit={handleAdd}>
              ${inputs}
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
                    ${ths}
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-accent transition-colors">
                      ${tds}
                      <td className="p-4 flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={${m.fields.length + 1}} className="p-4 text-center text-muted-foreground">No records found.</td>
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
`;
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
});

console.log('Frontend admin pages generated');
