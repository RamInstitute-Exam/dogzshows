'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Layers, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function FciGroupsMaster() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchGroups();
  }, [page, search]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/groups?page=${page}&limit=10&search=${search}`);
      const data = res;
      if (data.success) {
        setGroups(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch FCI Groups');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Layers className="w-6 h-6 text-brand-orange" /> FCI Groups Master
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Manage standard FCI breed groups. Total: {totalCount}</p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search group..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-brand-orange transition-all"
                />
              </div>
              <Button onClick={fetchGroups} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-foreground font-bold">
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Refresh
              </Button>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Add New Group</h2>
            <form className="flex flex-wrap md:flex-nowrap gap-4" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const groupNumber = (form.elements.namedItem('groupNumber') as HTMLInputElement).value;
              const name = (form.elements.namedItem('name') as HTMLInputElement).value;
              const description = (form.elements.namedItem('description') as HTMLInputElement).value;
              try {
                const token = localStorage.getItem('token');
                await api.post(`/groups`, JSON.stringify({ groupNumber: parseInt(groupNumber), name, description }));
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
            <div className="overflow-x-auto">
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
                  ) : groups.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-muted-foreground">No groups found.</td>
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
                        <div className="flex items-center justify-end gap-1  transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"><Edit className="w-4 h-4" /></Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                            onClick={async () => {
                              if(confirm('Are you sure you want to delete this group?')) {
                                try {
                                  const token = localStorage.getItem('token');
                                  await api.delete(`/groups/${g.id}`);
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

            {/* Pagination */}
            {!loading && totalPages > 0 && (
              <div className="p-4 border-t border-border flex items-center justify-between bg-card">
                <p className="text-sm text-muted-foreground">Showing Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 border-border text-foreground hover:bg-accent">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 border-border text-foreground hover:bg-accent">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

    </div>
  );
}
