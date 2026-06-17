'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Plus, Edit2, Trash2, Copy, RefreshCw, Search, X, Check, AlertTriangle, 
  HelpCircle, ChevronRight, ShieldAlert, Award, Database, Settings, Bell, Calendar,
  Trophy, CreditCard, Image as ImageIcon, Video, FileText, Info
} from 'lucide-react';
import { config } from '@/lib/config';
import api from '@/services/api';

// Modules list matching database seeder
const MODULES = [
  { id: 'users', label: 'Users' },
  { id: 'roles', label: 'Roles' },
  { id: 'permissions', label: 'Permissions Matrix' },
  { id: 'dogs', label: 'Dogs' },
  { id: 'owners', label: 'Owners' },
  { id: 'breeds', label: 'Breeds' },
  { id: 'fci-groups', label: 'FCI Groups' },
  { id: 'show-classes', label: 'Show Classes' },
  { id: 'clubs', label: 'Clubs' },
  { id: 'judges', label: 'Judges' },
  { id: 'events', label: 'Events' },
  { id: 'registrations', label: 'Registrations' },
  { id: 'payments', label: 'Payments' },
  { id: 'winners', label: 'Winners' },
  { id: 'banners', label: 'Banners' },
  { id: 'cms', label: 'CMS Global' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'videos', label: 'Videos' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'blogs', label: 'Blogs' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'reports', label: 'Reports' },
  { id: 'support-tickets', label: 'Support Tickets' },
  { id: 'downloads', label: 'Downloads' },
  { id: 'settings', label: 'System Settings' }
];

const ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve'];

export default function RoleManagement() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('shield');
  const [priority, setPriority] = useState(50);
  const [status, setStatus] = useState('ACTIVE');
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [rolesRes, permsRes] = await Promise.all([
        fetch(`${config.apiUrl}/roles`, { headers }),
        fetch(`${config.apiUrl}/permissions?all=true`, { headers })
      ]);

      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();

      if (rolesData.success) setRoles(rolesData.data);
      if (permsData.success) setPermissions(permsData.data);
    } catch (error) {
      console.error('Error fetching dynamic RBAC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedRoleId(null);
    setRoleName('');
    setDisplayName('');
    setDescription('');
    setColor('#3B82F6');
    setIcon('shield');
    setPriority(50);
    setStatus('ACTIVE');
    setSelectedPermissions({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: any) => {
    setModalMode('edit');
    setSelectedRoleId(role.id);
    setRoleName(role.name);
    setDisplayName(role.displayName || '');
    setDescription(role.description || '');
    setColor(role.color || '#3B82F6');
    setIcon(role.icon || 'shield');
    setPriority(role.priority || 50);
    setStatus(role.status || 'ACTIVE');

    // Load permissions
    const permMap: Record<string, boolean> = {};
    role.permissions?.forEach((rp: any) => {
      if (rp.permission?.id) {
        permMap[rp.permission.id] = true;
      }
    });
    setSelectedPermissions(permMap);
    setIsModalOpen(true);
  };

  const handleOpenDuplicate = (role: any) => {
    setModalMode('duplicate');
    setSelectedRoleId(null);
    setRoleName(`${role.name} Copy`);
    setDisplayName(`${role.displayName || role.name} Copy`);
    setDescription(role.description || '');
    setColor(role.color || '#3B82F6');
    setIcon(role.icon || 'shield');
    setPriority(role.priority || 50);
    setStatus('ACTIVE');

    // Load permissions
    const permMap: Record<string, boolean> = {};
    role.permissions?.forEach((rp: any) => {
      if (rp.permission?.id) {
        permMap[rp.permission.id] = true;
      }
    });
    setSelectedPermissions(permMap);
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permId]: !prev[permId]
    }));
  };

  const handleToggleModuleAll = (moduleId: string, checkAll: boolean) => {
    const nextPerms = { ...selectedPermissions };
    
    // Find all permissions matching this module prefix
    permissions.forEach(p => {
      const [mod] = p.name.split(':');
      if (mod === moduleId) {
        if (checkAll) {
          nextPerms[p.id] = true;
        } else {
          delete nextPerms[p.id];
        }
      }
    });

    setSelectedPermissions(nextPerms);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const activePermissionIds = Object.keys(selectedPermissions).filter(k => selectedPermissions[k]);

      const payload = {
        name: roleName,
        displayName,
        description,
        color,
        icon,
        priority: Number(priority),
        status,
        permissions: activePermissionIds
      };

      const url = modalMode === 'edit' && selectedRoleId 
        ? `${config.apiUrl}/roles/${selectedRoleId}`
        : `${config.apiUrl}/roles`;

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
        alert(data.message || 'An error occurred while saving the role.');
      }
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (name === 'Super Admin' || name === 'SUPER_ADMIN') {
      alert('The Super Admin role cannot be deleted.');
      return;
    }

    if (!confirm(`Are you sure you want to delete the role "${name}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/roles/${id}`);
      const data = res;
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Failed to delete role.');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.displayName && role.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-brand-orange" /> Role Management
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Configure dynamic enterprise roles, priority hierarchy, and fine-grained permissions.
          </p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 bg-brand-orange hover:bg-brand-orange/95 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-orange/20"
        >
          <Plus className="w-5 h-5" /> Create New Role
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search roles by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-orange outline-none transition-all text-sm"
          />
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/80 border border-border text-foreground text-sm font-semibold rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Main Grid View of Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center bg-card rounded-3xl border border-border">
            <RefreshCw className="w-10 h-10 animate-spin text-brand-orange  mb-4" />
            <p className="text-muted-foreground font-semibold">Loading enterprise roles...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-card rounded-3xl border border-border">
            <ShieldAlert className="w-14 h-14 text-muted-foreground/60  mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">No Roles Found</h3>
            <p className="text-muted-foreground max-w-md ">Create a custom role with a custom permission matrix to start assigning to staff members.</p>
          </div>
        ) : (
          filteredRoles.map(role => (
            <motion.div 
              key={role.id}
              layout
              className="bg-card border border-border rounded-3xl p-6 shadow-md relative overflow-hidden group hover:border-brand-orange/40 hover:shadow-lg transition-all"
            >
              {/* Highlight bar with role color */}
              <div 
                className="absolute top-0 left-0 w-full h-1.5 transition-all" 
                style={{ backgroundColor: role.color || '#3B82F6' }}
              />

              <div className="flex justify-between items-start mb-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                  style={{ backgroundColor: `${role.color || '#3B82F6'}15`, color: role.color || '#3B82F6' }}
                >
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-accent border border-border rounded-lg text-muted-foreground">
                    Priority {role.priority || 0}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg ${
                    role.status === 'ACTIVE' 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {role.status || 'ACTIVE'}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground flex items-center gap-2 group-hover:text-brand-orange transition-colors">
                {role.displayName || role.name}
              </h3>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">System Identifier: <span className="font-mono text-foreground/80">{role.name}</span></p>
              
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2 h-10">
                {role.description || 'No custom description provided for this role.'}
              </p>

              {/* Status details */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-border/80">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Assigned Users</p>
                  <p className="text-lg font-extrabold text-foreground mt-0.5">{role._count?.users || 0} Users</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Permissions</p>
                  <p className="text-lg font-extrabold text-foreground mt-0.5">{role.permissions?.length || 0} Active</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border/60">
                <button 
                  onClick={() => handleOpenDuplicate(role)}
                  title="Duplicate Role Template"
                  className="p-2.5 bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground rounded-xl transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleOpenEdit(role)}
                  title="Edit Role Matrix"
                  className="p-2.5 bg-accent hover:bg-accent/80 text-muted-foreground hover:text-brand-orange rounded-xl transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(role.id, role.name)}
                  disabled={role.name === 'Super Admin' || role.name === 'SUPER_ADMIN'}
                  title="Delete Role"
                  className="p-2.5 bg-accent hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Multi-Module Matrix Edit/Create Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border flex justify-between items-center bg-accent/30">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-brand-orange" />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {modalMode === 'create' && 'Create Custom Role'}
                      {modalMode === 'edit' && `Edit permissions: ${roleName}`}
                      {modalMode === 'duplicate' && `Duplicate configuration: ${roleName}`}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Assign custom priorities and check module specific access matrices below.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Role identifier (Internal Name) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      System Identifier Name <span title="Internal ID, alphanumeric only (e.g. event_manager)"><HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60" /></span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. event_manager"
                      value={roleName}
                      disabled={modalMode === 'edit'}
                      onChange={(e) => setRoleName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-orange outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Display Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Role Display Name
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Event Manager"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-orange outline-none transition-all"
                    />
                  </div>

                  {/* Color representation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Interface Accent Color
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-12 h-[42px] bg-background border border-border rounded-xl p-1 cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="#3B82F6"
                        className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:border-brand-orange outline-none transition-all text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Role Description */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Brief Description
                    </label>
                    <input 
                      type="text"
                      placeholder="Describe what resources users belonging to this role can access..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-orange outline-none transition-all"
                    />
                  </div>

                  {/* Priority Hierarchy & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        Priority <span title="Higher number represents higher hierarchy level (e.g. 100 for Super Admins, 10 for standard users)"><HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60" /></span>
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max="100"
                        value={priority}
                        onChange={(e) => setPriority(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:border-brand-orange outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Status
                      </label>
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:border-brand-orange outline-none transition-all text-sm font-medium"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Permissions matrix box */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
                    Granular Access Permission Matrix
                  </h3>

                  {permissions.length === 0 ? (
                    <div className=" text-center bg-accent/20 rounded-2xl border border-border">
                      <AlertTriangle className="w-8 h-8 text-amber-500  mb-2" />
                      <p className="text-muted-foreground font-semibold">No permissions loaded from database.</p>
                    </div>
                  ) : (
                    <div className="border border-border rounded-2xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-accent/40 border-b border-border">
                            <th className="p-4 font-bold text-muted-foreground">Module Layer</th>
                            {ACTIONS.map(action => (
                              <th key={action} className="p-4 font-bold text-muted-foreground text-center capitalize">{action}</th>
                            ))}
                            <th className="p-4 font-bold text-muted-foreground text-center">Toggle All</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {MODULES.map(module => {
                            // Find relevant permissions for this module
                            const modulePerms = permissions.filter(p => p.name.startsWith(`${module.id}:`));
                            const hasAllChecked = modulePerms.length > 0 && modulePerms.every(p => selectedPermissions[p.id]);

                            return (
                              <tr key={module.id} className="hover:bg-accent/10 transition-colors">
                                <td className="p-4 font-bold text-foreground capitalize">
                                  {module.label}
                                </td>
                                {ACTIONS.map(action => {
                                  const perm = modulePerms.find(p => p.name.endsWith(`:${action}`));
                                  return (
                                    <td key={action} className="p-4 text-center">
                                      {perm ? (
                                        <input 
                                          type="checkbox"
                                          checked={!!selectedPermissions[perm.id]}
                                          onChange={() => handleTogglePermission(perm.id)}
                                          className="w-4 h-4 rounded border-border text-brand-orange focus:ring-brand-orange cursor-pointer"
                                        />
                                      ) : (
                                        <span className="text-[10px] text-muted-foreground/45 font-bold uppercase">N/A</span>
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="p-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleModuleAll(module.id, !hasAllChecked)}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                                      hasAllChecked 
                                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                        : 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20'
                                    }`}
                                  >
                                    {hasAllChecked ? 'Clear' : 'Select'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Submit footer */}
                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-accent hover:bg-accent/80 text-foreground font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-brand-orange hover:bg-brand-orange/95 text-white font-bold rounded-xl shadow-lg transition-all"
                  >
                    {modalMode === 'edit' ? 'Save Changes' : 'Create Role'}
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
