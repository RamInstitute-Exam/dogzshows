'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, Plus, Edit2, Trash2, Search, X, RefreshCw, AlertTriangle, 
  HelpCircle, Check, ShieldAlert, Download, Filter, Eye
} from 'lucide-react';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function PermissionsManagement() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Search, filter, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  
  // Form State
  const [selectedPermissionId, setSelectedPermissionId] = useState<string | null>(null);
  const [permName, setPermName] = useState('');
  const [description, setDescription] = useState('');
  
  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [permsRes, rolesRes] = await Promise.all([
        fetch(`${config.apiUrl}/permissions?all=true`, { headers }),
        fetch(`${config.apiUrl}/roles`, { headers })
      ]);

      const permsData = await permsRes.json();
      const rolesData = await rolesRes.json();

      if (permsData.success) setPermissions(permsData.data);
      if (rolesData.success) setRoles(rolesData.data);
    } catch (error) {
      console.error('Error fetching RBAC permissions data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedPermissionId(null);
    setPermName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (perm: any) => {
    setModalMode('edit');
    setSelectedPermissionId(perm.id);
    setPermName(perm.name);
    setDescription(perm.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: permName,
        description
      };

      const url = modalMode === 'edit' && selectedPermissionId 
        ? `${config.apiUrl}/permissions/${selectedPermissionId}`
        : `${config.apiUrl}/permissions`;

      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert(data.message || 'An error occurred while saving the permission.');
      }
    } catch (error) {
      console.error('Error saving permission:', error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the permission "${name}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/permissions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = res;
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Failed to delete permission.');
      }
    } catch (error) {
      console.error('Error deleting permission:', error);
    }
  };

  // Bulk Actions
  const handleSelectAll = (checked: boolean) => {
    const nextSelected: Record<string, boolean> = {};
    if (checked) {
      currentItems.forEach(item => {
        nextSelected[item.id] = true;
      });
    }
    setSelectedIds(nextSelected);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => ({
      ...prev,
      details: checked
    }));
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Object.keys(selectedIds).filter(id => selectedIds[id]);
    if (idsToDelete.length === 0) return;

    if (!confirm(`Are you sure you want to delete the ${idsToDelete.length} selected permissions?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/permissions/bulk-delete`);
      const data = res;
      if (data.success) {
        setSelectedIds({});
        fetchData();
      } else {
        alert(data.message || 'Bulk delete failed.');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Permission Name,Module Prefix,Description,Created At"].join(",") + "\n"
      + permissions.map(p => {
          const [module] = p.name.split(':');
          return `"${p.id}","${p.name}","${module}","${p.description || ''}","${p.createdAt}"`;
        }).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `JuzDog_RBAC_Permissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unique Modules derived from permissions list
  const uniqueModules = Array.from(new Set(permissions.map(p => p.name.split(':')[0]))).sort();

  // Filter & Search Logic
  const filteredPermissions = permissions.filter(perm => {
    const matchesSearch = perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (perm.description && perm.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const [module] = perm.name.split(':');
    const matchesModule = selectedModule === 'all' || module === selectedModule;

    return matchesSearch && matchesModule;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPermissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Key className="w-8 h-8 text-brand-orange" /> Permissions Master
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Browse and manage all granular security permission identifiers mapped to your modules.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/80 border border-border text-foreground text-sm font-semibold rounded-xl transition-all"
          >
            <Download className="w-4.5 h-4.5" /> Export CSV
          </button>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-brand-orange/95 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-orange/20"
          >
            <Plus className="w-5 h-5" /> Add Permission
          </button>
        </div>
      </div>

      {/* Advanced Filtering / Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search permissions by name or description..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-orange outline-none transition-all text-sm"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-xl text-sm w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Module:</span>
            <select
              value={selectedModule}
              onChange={(e) => { setSelectedModule(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-foreground outline-none text-xs font-bold cursor-pointer capitalize"
            >
              <option value="all">All Modules</option>
              {uniqueModules.map(mod => (
                <option key={mod} value={mod}>{mod.replace('-', ' ')}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={fetchData}
            className="p-2.5 bg-accent hover:bg-accent/80 border border-border text-foreground rounded-xl transition-all"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bulk Action Controls */}
      {Object.keys(selectedIds).filter(k => selectedIds[k]).length > 0 && (
        <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="w-5 h-5" />
            <span>{Object.keys(selectedIds).filter(k => selectedIds[k]).length} items selected for bulk actions.</span>
          </div>
          <button 
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Bulk Delete Selected
          </button>
        </div>
      )}

      {/* Grid Listing View */}
      <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-accent/30 border-b border-border">
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={currentItems.length > 0 && currentItems.every(item => selectedIds[item.id])}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-brand-orange focus:ring-brand-orange cursor-pointer"
                  />
                </th>
                <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">Permission Name</th>
                <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">Module Layer</th>
                <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">Description</th>
                <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">Created Date</th>
                <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-brand-orange  mb-3" />
                    <p className="text-muted-foreground font-semibold">Fetching security key descriptors...</p>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <ShieldAlert className="w-12 h-12 text-muted-foreground/60  mb-3" />
                    <h3 className="text-md font-bold text-foreground">No Permissions Match Your Query</h3>
                  </td>
                </tr>
              ) : (
                currentItems.map((perm, idx) => {
                  const [module, action] = perm.name.split(':');
                  const isChecked = !!selectedIds[perm.id];

                  return (
                    <motion.tr 
                      key={perm.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`hover:bg-accent/10 transition-colors ${isChecked ? 'bg-brand-orange/5' : ''}`}
                    >
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(perm.id, e.target.checked)}
                          className="w-4 h-4 rounded border-border text-brand-orange focus:ring-brand-orange cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-foreground bg-accent px-2.5 py-1.5 border border-border rounded-xl">
                          {perm.name}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold rounded-full capitalize">
                          {module.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground font-medium max-w-xs truncate" title={perm.description}>
                        {perm.description || 'Access level permissions override.'}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs font-semibold">
                        {new Date(perm.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => handleOpenEdit(perm)}
                            className="p-2 bg-accent/60 hover:bg-accent text-muted-foreground hover:text-brand-orange rounded-lg transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(perm.id, perm.name)}
                            className="p-2 bg-accent/60 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Navigation */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-accent/20">
            <span className="text-xs font-semibold text-muted-foreground">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPermissions.length)} of {filteredPermissions.length} permissions
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => paginate(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-bold bg-card border border-border rounded-lg text-foreground hover:bg-accent disabled:opacity-45"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => paginate(idx + 1)}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg border ${
                    currentPage === idx + 1 
                      ? 'bg-brand-orange border-brand-orange text-white' 
                      : 'bg-card border-border text-foreground hover:bg-accent'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button 
                onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-bold bg-card border border-border rounded-lg text-foreground hover:bg-accent disabled:opacity-45"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Permission Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-accent/30">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-brand-orange" />
                  <h2 className="text-lg font-bold text-foreground">
                    {modalMode === 'create' ? 'Create Custom Permission' : 'Edit Description'}
                  </h2>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    Permission String Identifier <span title="Formatted in lowercase module:action syntax (e.g. settings:view)"><HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60" /></span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. blogs:publish"
                    value={permName}
                    disabled={modalMode === 'edit'}
                    onChange={(e) => setPermName(e.target.value.toLowerCase().replace(/[^a-z0-9:-]/g, ''))}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-orange outline-none transition-all disabled:opacity-50 font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Detailed Description
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Write a sentence details what access this permission token overrides..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-orange outline-none transition-all text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-accent hover:bg-accent/80 text-foreground font-semibold rounded-lg transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange/95 text-white font-bold rounded-lg shadow-md transition-all text-sm"
                  >
                    {modalMode === 'edit' ? 'Save Changes' : 'Create Permission'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
