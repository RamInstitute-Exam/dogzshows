'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Menu as MenuIcon, Plus, Loader2, Edit, Trash2, X, ChevronDown,
  ChevronRight, Eye, EyeOff, ExternalLink, GripVertical, Save, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAdminMenus, useInvalidateMenus, NavMenuItem } from '@/hooks/useNavMenus';

// ── Constants ─────────────────────────────────────────────────────────────

const POSITIONS = [
  { value: 'NAVBAR',        label: 'Public Navbar' },
  { value: 'FOOTER_MAIN',   label: 'Footer — Main' },
  { value: 'FOOTER_QUICK',  label: 'Footer — Quick Links' },
  { value: 'ADMIN_SIDEBAR', label: 'Admin Sidebar' },
  { value: 'SIDEBAR',       label: 'Dashboard Sidebar' },
];

const ROLE_OPTIONS = [
  { label: 'Guest',       value: 'Guest' },
  { label: 'User',        value: 'User' },
  { label: 'Judge',       value: 'Judge' },
  { label: 'Organizer',   value: 'Organizer' },
  { label: 'Admin',       value: 'Admin' },
  { label: 'Super Admin', value: 'Super Admin' },
];

const EMPTY_FORM = {
  id:             '',
  name:           '',
  url:            '',
  icon:           '',
  position:       'NAVBAR',
  parentId:       '',
  displayOrder:   0,
  visibility:     true,
  openNewTab:     false,
  badge:          '',
  color:          '',
  onlyLoggedUser: false,
  onlyGuest:      false,
  onlyAdmin:      false,
  roleIds:        [] as string[],
};

type FormData = typeof EMPTY_FORM;

// ── Sub-components ────────────────────────────────────────────────────────

function Badge({ label, color = 'blue' }: { label: string; color?: string }) {
  const map: Record<string, string> = {
    blue:   'bg-blue-500/10 text-blue-400',
    green:  'bg-green-500/10 text-green-400',
    red:    'bg-red-500/10 text-red-400',
    amber:  'bg-amber-500/10 text-amber-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[color] ?? map.blue}`}>
      {label}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-border'}`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </label>
  );
}

function MenuRow({
  menu,
  allMenus,
  depth,
  onEdit,
  onDelete,
  onToggleVisible,
}: {
  menu: NavMenuItem;
  allMenus: NavMenuItem[];
  depth: number;
  onEdit: (m: NavMenuItem) => void;
  onDelete: (id: string) => void;
  onToggleVisible: (id: string, current: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = menu.children && menu.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200
          ${menu.visibility ? 'border-border bg-card/60' : 'border-border/40 bg-card/20 opacity-60'}`}
        style={{ marginLeft: depth * 28 }}
      >
        {/* Indent indicator */}
        {depth > 0 && (
          <div className="w-4 h-px bg-border/60 flex-shrink-0" />
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className={`flex-shrink-0 text-muted-foreground transition-transform duration-200 ${!hasChildren ? 'invisible' : ''}`}
        >
          <ChevronRight
            className="w-4 h-4"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .2s' }}
          />
        </button>

        {/* Drag handle */}
        <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 cursor-grab" />

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-sm">{menu.name}</span>
            {menu.badge && <Badge label={menu.badge} color="amber" />}
            {menu.onlyAdmin && <Badge label="Admin Only" color="red" />}
            {menu.onlyLoggedUser && <Badge label="Logged In" color="blue" />}
            {menu.onlyGuest && <Badge label="Guest Only" color="green" />}
            {menu.openNewTab && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted-foreground font-mono">{menu.url}</span>
            <span className="text-xs text-muted-foreground/60">{POSITIONS.find(p => p.value === menu.position)?.label}</span>
          </div>
        </div>

        {/* Order badge */}
        <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full font-mono flex-shrink-0">
          #{menu.displayOrder}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onToggleVisible(menu.id, menu.visibility)}
            className={`p-1.5 rounded-lg transition-colors ${menu.visibility ? 'text-green-400 hover:bg-green-500/10' : 'text-muted-foreground hover:bg-accent'}`}
            title={menu.visibility ? 'Visible — click to hide' : 'Hidden — click to show'}
          >
            {menu.visibility ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(menu)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(menu.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Children */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-1 flex flex-col gap-1"
          >
            {menu.children.map(child => (
              <MenuRow
                key={child.id}
                menu={child}
                allMenus={allMenus}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleVisible={onToggleVisible}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function MenuManagement() {
  const [position, setPosition] = useState<string | undefined>(undefined);
  const { data: menus = [], isLoading, refetch } = useAdminMenus(position);
  const invalidate = useInvalidateMenus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving]           = useState(false);
  const [formData, setFormData]       = useState<FormData>(EMPTY_FORM);

  // Flatten tree for parent selector
  const flat = useCallback((items: NavMenuItem[], depth = 0): Array<{ menu: NavMenuItem; depth: number }> => {
    return items.flatMap(m => [{ menu: m, depth }, ...flat(m.children ?? [], depth + 1)]);
  }, []);
  const flatMenus = flat(menus);

  // ── Helpers ──────────────────────────────────────────────────────────

  function field<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData(f => ({ ...f, [key]: value }));
  }

  function openCreate() {
    setFormData({ ...EMPTY_FORM, displayOrder: flatMenus.length + 1 });
    setIsModalOpen(true);
  }

  function openEdit(menu: NavMenuItem) {
    setFormData({
      id:             menu.id,
      name:           menu.name,
      url:            menu.url,
      icon:           menu.icon ?? '',
      position:       menu.position,
      parentId:       menu.parentId ?? '',
      displayOrder:   menu.displayOrder,
      visibility:     menu.visibility,
      openNewTab:     menu.openNewTab,
      badge:          menu.badge ?? '',
      color:          menu.color ?? '',
      onlyLoggedUser: menu.onlyLoggedUser,
      onlyGuest:      menu.onlyGuest,
      onlyAdmin:      menu.onlyAdmin,
      roleIds:        (menu as any).permissions?.map((p: any) => p.roleId) ?? [],
    });
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.url.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...formData,
        parentId: formData.parentId || null,
        displayOrder: Number(formData.displayOrder),
      };
      if (formData.id) {
        await api.put(`/menus/${formData.id}`, payload);
      } else {
        await api.post('/menus', payload);
      }
      setIsModalOpen(false);
      await refetch();
      invalidate();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this menu and all its children?')) return;
    try {
      await api.delete(`/menus/${id}`);
      await refetch();
      invalidate();
    } catch (err) {
      console.error('Delete failed', err);
    }
  }

  async function handleToggleVisible(id: string, current: boolean) {
    try {
      await api.put(`/menus/${id}`, { visibility: !current });
      await refetch();
      invalidate();
    } catch (err) {
      console.error('Toggle failed', err);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:">
      <div className="w-full space-y-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <MenuIcon className="w-8 h-8 text-blue-400" />
              Menu Management
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              All menus are database-driven. Changes reflect instantly on the website with no deployment required.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
              <Plus className="w-4 h-4" />
              Add Menu Item
            </Button>
          </div>
        </div>

        {/* Position filter tabs */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setPosition(undefined)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${!position ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
          >
            All
          </button>
          {POSITIONS.map(p => (
            <button
              key={p.value}
              onClick={() => setPosition(p.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${position === p.value ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Menu tree */}
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-border p-5 flex items-center justify-between">
            <h3 className="font-bold text-lg">
              {position ? POSITIONS.find(p => p.value === position)?.label : 'All Menus'}
              {!isLoading && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({flatMenus.length} items)
                </span>
              )}
            </h3>
          </div>

          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400  mb-3" />
              <p className="text-muted-foreground text-sm">Loading menus…</p>
            </div>
          ) : menus.length === 0 ? (
            <div className="py-16 text-center">
              <MenuIcon className="w-10 h-10 text-muted-foreground/30  mb-3" />
              <p className="text-muted-foreground font-medium">No menus found</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Click "Add Menu Item" to create your first menu</p>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-2">
              {menus.map(menu => (
                <MenuRow
                  key={menu.id}
                  menu={menu}
                  allMenus={menus}
                  depth={0}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onToggleVisible={handleToggleVisible}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 text-sm text-muted-foreground space-y-1">
          <p className="font-semibold text-blue-400 mb-2">How it works</p>
          <p>• Changes are reflected immediately on the website — no code deployment needed.</p>
          <p>• Use <strong>Visibility toggle</strong> to show/hide menu items without deleting them.</p>
          <p>• <strong>Display Order</strong> controls the left-to-right (desktop) or top-to-bottom (mobile) sequence.</p>
          <p>• <strong>Parent Menu</strong> — select a parent to make this a dropdown child item.</p>
          <p>• <strong>RBAC</strong> — "Only Logged User", "Only Guest", "Only Admin" are quick flags. For fine-grained control, use Role Permissions.</p>
          <p>• <strong>Refetch on Window Focus</strong> — the navbar automatically re-fetches menus when users return to the tab.</p>
        </div>

      </div>

      {/* ── MODAL ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-bold">
                  {formData.id ? 'Edit Menu Item' : 'Create Menu Item'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                      Menu Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => field('name', e.target.value)}
                      placeholder="e.g. Show Calendar"
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm"
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                      URL / Route <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.url}
                      onChange={e => field('url', e.target.value)}
                      placeholder="/events or https://..."
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm"
                    />
                  </div>

                  {/* Icon */}
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                      Icon Name (Lucide)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={e => field('icon', e.target.value)}
                      placeholder="e.g. Calendar, Dog, Trophy"
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm"
                    />
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                      Position
                    </label>
                    <select
                      value={formData.position}
                      onChange={e => field('position', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm"
                    >
                      {POSITIONS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Parent */}
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                      Parent Menu
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={e => field('parentId', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm"
                    >
                      <option value="">— No Parent (Top Level) —</option>
                      {flatMenus
                        .filter(({ menu }) => menu.id !== formData.id)
                        .map(({ menu, depth }) => (
                          <option key={menu.id} value={menu.id}>
                            {'  '.repeat(depth)}{depth > 0 ? '└ ' : ''}{menu.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={e => field('displayOrder', Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm"
                    />
                  </div>

                  {/* Badge */}
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={e => field('badge', e.target.value)}
                      placeholder="e.g. New, Hot, Beta"
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground">Visibility & Behaviour</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Toggle checked={formData.visibility}     onChange={v => field('visibility', v)}     label="Visible" />
                    <Toggle checked={formData.openNewTab}     onChange={v => field('openNewTab', v)}     label="Open in New Tab" />
                    <Toggle checked={formData.onlyLoggedUser} onChange={v => field('onlyLoggedUser', v)} label="Only Logged-in Users" />
                    <Toggle checked={formData.onlyGuest}      onChange={v => field('onlyGuest', v)}      label="Only Guests" />
                    <Toggle checked={formData.onlyAdmin}      onChange={v => field('onlyAdmin', v)}      label="Only Admins" />
                  </div>
                </div>

                {/* Role Permissions */}
                <div className="border border-border rounded-xl p-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-3">
                    Role Visibility (leave empty = visible to all matching the flags above)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_OPTIONS.map(role => {
                      const selected = formData.roleIds.includes(role.value);
                      return (
                        <button
                          key={role.value}
                          onClick={() =>
                            field(
                              'roleIds',
                              selected
                                ? formData.roleIds.filter(r => r !== role.value)
                                : [...formData.roleIds, role.value]
                            )
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                            selected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-transparent border-border text-muted-foreground hover:border-blue-500 hover:text-blue-400'
                          }`}
                        >
                          {role.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !formData.name.trim() || !formData.url.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 min-w-[120px]"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <><Save className="w-4 h-4" />{formData.id ? 'Update' : 'Create'}</>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
