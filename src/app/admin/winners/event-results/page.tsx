'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function EventResultList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${'event-results'}?page=${page}&limit=20&search=${search}`);
      if (res.success) {
        setData(res.data?.items || res.items || res.data || []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const res = await api.delete(`/${'event-results'}/${id}`);
      if (res.success) {
        toast.success('Deleted successfully');
        fetchData();
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground flex items-center gap-3">
            Event Results
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage event results and placements</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:border-foreground transition-all outline-none"
            />
          </div>
          <Link href={`/admin/winners/event-results/create`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-bold text-sm rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add New
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">Event ID</th>
                <th className="px-6 py-4">Winner ID</th>
                <th className="px-6 py-4">Award</th>
                <th className="px-6 py-4">Judge ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No records found
                  </td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{item.eventId}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{item.winnerId}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{item.award}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{item.judgeId}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'PUBLISHED' || item.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {item.status || 'PUBLISHED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      <Link href={`/admin/winners/event-results/edit?id=${item.id}`}>
                        <button className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}