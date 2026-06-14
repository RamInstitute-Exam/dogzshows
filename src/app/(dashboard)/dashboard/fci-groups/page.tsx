'use client';

import React, { useEffect, useState } from 'react';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { config } from '@/lib/config';

interface FciGroup {
  id: string;
  groupNumber: number;
  name: string;
  description: string;
  _count: { breeds: number };
}

export default function FciGroupsPage() {
  const [groups, setGroups] = useState<FciGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('${config.apiUrl}/fci', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load FCI groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="p-4 md:p-8 text-muted-foreground">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">FCI Groups & Breeds</h1>
            <p className="text-muted-foreground">Manage FCI classification groups and their respective breeds.</p>
          </div>
          <Button className="bg-brand-orange hover:bg-orange-600 text-foreground">
            <Plus className="w-4 h-4 mr-2"/> Add Group
          </Button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-card rounded-xl border border-border"></div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card border-b border-border text-muted-foreground uppercase text-xs tracking-wider">
                  <th className="p-4 font-semibold">Group #</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Breeds Count</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {groups.map((group) => (
                  <tr key={group.id} className="hover:bg-accent transition-colors">
                    <td className="p-4 text-foreground font-bold">{group.groupNumber}</td>
                    <td className="p-4 text-foreground">{group.name}</td>
                    <td className="p-4 text-muted-foreground">{group._count?.breeds || 0} Breeds</td>
                    <td className="p-4 flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-input">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-red-900/50 text-red-500 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {groups.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">No FCI groups found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RoleProtectedRoute>
  );
}
