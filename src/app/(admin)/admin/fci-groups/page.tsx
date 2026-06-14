'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Layers, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { config } from '@/lib/config';

export default function FciGroupsMaster() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('${config.apiUrl}/groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setGroups(data.data || []);
    } catch (error) {
      console.error('Failed to fetch FCI Groups');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8 bg-background">
        <div className="w-full max-w-[1200px] mx-auto space-y-6">
          
          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Layers className="w-6 h-6 text-brand-orange" /> FCI Groups Master
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Manage standard FCI breed groups.</p>
            </div>
            <Button onClick={fetchGroups} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-foreground font-bold">
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh Data
            </Button>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Add New Group</h2>
            <form className="flex gap-4" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const groupNumber = (form.elements.namedItem('groupNumber') as HTMLInputElement).value;
              const name = (form.elements.namedItem('name') as HTMLInputElement).value;
              const description = (form.elements.namedItem('description') as HTMLInputElement).value;
              try {
                const token = localStorage.getItem('token');
                await fetch('${config.apiUrl}/groups', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ groupNumber, name, description })
                });
                form.reset();
                fetchGroups();
              } catch (err) {
                console.error(err);
              }
            }}>
              <input name="groupNumber" type="number" placeholder="Group #" required className="bg-accent border border-border text-foreground p-2 rounded" />
              <input name="name" type="text" placeholder="Group Name" required className="bg-accent border border-border text-foreground p-2 rounded flex-1" />
              <input name="description" type="text" placeholder="Description" className="bg-accent border border-border text-foreground p-2 rounded flex-1" />
              <Button type="submit" className="bg-brand-orange text-foreground">Add</Button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card border-b border-border">
                  <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Group ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground">Loading FCI Groups...</td>
                  </tr>
                ) : groups.map((g, i) => (
                  <motion.tr 
                    key={g.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                  >
                    <td className="py-4 px-6 font-bold text-foreground">Group {g.groupNumber || i+1}</td>
                    <td className="py-4 px-6 text-indigo-400 font-bold">{g.name}</td>
                    <td className="py-4 px-6 text-muted-foreground text-sm">{g.description || 'No description provided.'}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"><Edit className="w-4 h-4" /></Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          onClick={async () => {
                            if(confirm('Are you sure you want to delete this group?')) {
                              try {
                                const token = localStorage.getItem('token');
                                await fetch(`${config.apiUrl}/groups/${g.id}`, {
                                  method: 'DELETE',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                fetchGroups();
                              } catch(err) {
                                console.error(err);
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
