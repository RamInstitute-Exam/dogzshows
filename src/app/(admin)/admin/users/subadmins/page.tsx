'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Search, ShieldAlert, Edit, Trash2, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function SubAdmins() {
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/roles/subadmins`);
      const data = res;
      if (data.success) {
        setSubAdmins(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sub admins');
    } finally {
      setLoading(false);
    }
  };

  const filtered = subAdmins.filter(sa => 
    (sa.firstName || '').toLowerCase().includes(search.toLowerCase()) || 
    (sa.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-foreground" /> Sub Admin Directory
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Manage delegated administrators and their module access.</p>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search sub-admins..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-[#7C8798] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-all shadow-lg"
                />
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold whitespace-nowrap">
                <UserCheck className="w-4 h-4 mr-2" /> Assign Sub Admin
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Admin Profile</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Contact</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-foreground  mb-4" />
                        <p className="text-muted-foreground">Loading directory...</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <ShieldAlert className="w-12 h-12 text-[#1E293B]  mb-4" />
                        <p className="text-muted-foreground font-medium">No sub admins found matching "{search}"</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((admin, i) => (
                      <motion.tr 
                        key={admin.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-foreground font-bold border border-border">
                              {(admin.firstName || 'A').charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-foreground group-hover:text-foreground transition-colors">{admin.firstName} {admin.lastName}</p>
                              <p className="text-xs text-muted-foreground">Since {new Date(admin.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4 text-muted-foreground" /> {admin.email}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {admin.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Revoked
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
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

        </div>
      
  );
}
