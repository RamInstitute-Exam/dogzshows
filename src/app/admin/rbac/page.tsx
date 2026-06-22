'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Search, Filter, Edit, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function RBACManagement() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roles');
      if (res.success) setRoles(res.data);
    } catch (error) {
      console.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="w-full">
      <div className="w-full space-y-4">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-500" /> Role & Permissions
            </h1>
            <p className="text-muted-foreground font-medium mt-1">Manage system access roles and granular permissions.</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="border-border hover:bg-accent text-foreground">
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              <Plus className="w-4 h-4 mr-2" /> Create Role
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/50 border-b border-border">
                  <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase">Role Name</th>
                  <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase">Priority</th>
                  <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase">Permissions Count</th>
                  <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500  mb-4" />
                      <p className="text-muted-foreground">Loading roles...</p>
                    </td>
                  </tr>
                ) : roles.map((role, i) => (
                  <motion.tr key={role.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-accent/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-foreground">{role.displayName || role.name}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{role.priority}</td>
                    <td className="py-4 px-6 text-sm">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
                        {role.permissions?.length || 0} assigned
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button variant="ghost" size="sm" className="text-blue-500 hover:bg-blue-500/10">Manage</Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
