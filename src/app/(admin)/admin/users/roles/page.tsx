'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Edit, Trash2, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { config } from '@/lib/config';

export default function RoleManagement() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('${config.apiUrl}/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8 bg-background">
        <div className="w-full max-w-[1600px] mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Shield className="w-8 h-8 text-brand-orange" /> Role Management
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Configure RBAC roles and module permissions.</p>
            </div>
            <Button className="bg-brand-orange hover:bg-orange-600 text-foreground font-bold whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" /> Create Role
            </Button>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Role Name</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Assigned Users</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Permissions</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-orange mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading roles...</p>
                      </td>
                    </tr>
                  ) : roles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <Shield className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No roles configured.</p>
                      </td>
                    </tr>
                  ) : (
                    roles.map((role, i) => (
                      <motion.tr 
                        key={role.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <p className="font-bold text-foreground group-hover:text-brand-orange transition-colors">{role.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{role.description || 'System standard role'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent border border-border rounded-full text-sm font-bold text-muted-foreground">
                            <Users className="w-4 h-4 text-muted-foreground" /> {role._count?.users || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-2">
                            {role.permissions?.slice(0, 3).map((rp: any) => (
                              <span key={rp.permission.id} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                                {rp.permission.name.replace('_', ' ')}
                              </span>
                            ))}
                            {role.permissions?.length > 3 && (
                              <span className="text-[10px] uppercase font-bold px-2 py-1 bg-accent text-muted-foreground rounded">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                            {(!role.permissions || role.permissions.length === 0) && (
                              <span className="text-xs text-muted-foreground">No granular permissions</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10" disabled={role.name === 'SUPER_ADMIN'}>
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
      </main>
    </div>
  );
}
