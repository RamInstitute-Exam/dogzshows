'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Download, Plus, RefreshCw, Edit, Trash2, Shield, MoreVertical, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { config } from '@/lib/config';
import api from '@/services/api';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function UserManagementListing() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/users?page=${page}&limit=10&search=${search}`);
      const data = res;
      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(users.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete selected users?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.post(`/users/bulk-delete`, JSON.stringify({ ids: selectedIds }));
      setSelectedIds([]);
      fetchUsers();
    } catch (error) {
      console.error('Failed to bulk delete');
    }
  };

  return (
    <div className="w-full">
      <div className="w-full space-y-4">
          
          {/* Top Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" /> User Directory
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Total {totalCount} members registered on the platform.</p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search name, email, phone..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder-[#7C8798] focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                <Filter className="w-4 h-4 mr-2" /> Filters
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button variant="outline" onClick={fetchUsers} className="border-border text-foreground hover:bg-accent">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Link href="/admin/users/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  <Plus className="w-4 h-4 mr-2" /> Create New
                </Button>
              </Link>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
              <p className="text-blue-400 font-bold">{selectedIds.length} users selected</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20">Export Selected</Button>
                <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20">Change Status</Button>
                <Button size="sm" onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 text-foreground border-0">Delete Selected</Button>
              </div>
            </motion.div>
          )}

          {/* Data Table */}
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th className="py-4 px-6 w-12">
                      <input type="checkbox" onChange={handleSelectAll} checked={users.length > 0 && selectedIds.length === users.length} className="rounded bg-accent border-border text-blue-500 focus:ring-blue-500" />
                    </th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right min-w-[180px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500  mb-4" />
                        <p className="text-muted-foreground">Loading users...</p>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Users className="w-12 h-12 text-[#1E293B]  mb-4" />
                        <p className="text-muted-foreground font-medium">No users found.</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user, i) => (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(user.id)}
                            onChange={() => handleSelectOne(user.id)}
                            className="rounded bg-accent border-border text-blue-500 focus:ring-blue-500" 
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-foreground overflow-hidden">
                              {user.avatarUrl ? <OptimizedImage src={user.avatarUrl} className="w-full h-full object-cover" /> : (user.firstName?.charAt(0) || 'U')}
                            </div>
                            <div>
                              <p className="font-bold text-foreground group-hover:text-blue-400 transition-colors">
                                {user.title ? `${user.title} ` : ''}{user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">ID: {user.id.substring(0,8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{user.phone || 'No phone'}</p>
                        </td>
                        <td className="py-4 px-6">
                          {user.roles?.length > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
                              <Shield className="w-3 h-3" /> {user.roles[0].role.name.replace('_', ' ')}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">User</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3 transition-opacity">
                            <Link href={`/admin/users/edit?id=${user.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
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
    </div>
  );
}
