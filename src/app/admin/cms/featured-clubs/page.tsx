'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function FeaturedClubsAdmin() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [allClubs, setAllClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    logoUrl: '',
    bannerUrl: '',
    city: '',
    state: '',
    description: '',
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchFeaturedClubs();
  }, []);

  const fetchFeaturedClubs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clubs?limit=100&isFeatured=true');
      if (res.success) {
        setClubs(res.data || res.items || []);
      }
    } catch (error) {
      toast.error('Failed to load featured clubs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClubs = async () => {
    try {
      const res = await api.get('/clubs?limit=500');
      if (res.success) {
        // Filter out already featured
        const featuredIds = clubs.map(c => c.id);
        const nonFeatured = (res.data || res.items || []).filter((c: any) => !featuredIds.includes(c.id));
        setAllClubs(nonFeatured);
      }
    } catch (error) {
      toast.error('Failed to load clubs list');
    }
  };

  const handleOpenAddModal = () => {
    fetchAllClubs();
    setIsAddModalOpen(true);
  };

  const handleAddFeatured = async (clubId: string) => {
    try {
      const res = await api.put(`/clubs/${clubId}`, { isFeatured: true, displayOrder: clubs.length + 1 });
      if (res.success) {
        toast.success('Club added to featured list');
        setIsAddModalOpen(false);
        fetchFeaturedClubs();
      }
    } catch (error) {
      toast.error('Failed to add club');
    }
  };

  const handleOpenEditModal = (club: any) => {
    setSelectedClub(club);
    setEditForm({
      name: club.name || '',
      logoUrl: club.logoUrl || '',
      bannerUrl: club.bannerUrl || '',
      city: club.city || '',
      state: club.state || '',
      description: club.description || '',
      displayOrder: club.displayOrder || 0,
      isActive: club.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const res = await api.put(`/clubs/${selectedClub.id}`, {
        ...editForm,
        displayOrder: parseInt(String(editForm.displayOrder))
      });
      if (res.success) {
        toast.success('Club updated successfully');
        setIsEditModalOpen(false);
        fetchFeaturedClubs();
      }
    } catch (error) {
      toast.error('Failed to update club');
    }
  };

  const handleRemoveFeatured = async (clubId: string) => {
    if (!confirm('Remove this club from the featured list?')) return;
    try {
      const res = await api.put(`/clubs/${clubId}`, { isFeatured: false });
      if (res.success) {
        toast.success('Removed from featured list');
        fetchFeaturedClubs();
      }
    } catch (error) {
      toast.error('Failed to remove club');
    }
  };

  const toggleStatus = async (club: any) => {
    try {
      const res = await api.put(`/clubs/${club.id}`, { isActive: !club.isActive });
      if (res.success) {
        toast.success(`Club ${!club.isActive ? 'activated' : 'deactivated'}`);
        fetchFeaturedClubs();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredSearch = allClubs.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Featured Clubs</h1>
          <p className="text-gray-500 mt-1">Manage the featured clubs displayed on the Home Page.</p>
        </div>
        <Button onClick={handleOpenAddModal} className="bg-foreground hover:bg-foreground text-white rounded-xl h-12 px-6">
          <Plus className="w-5 h-5 mr-2" />
          Add Featured Club
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium">Loading clubs...</div>
        ) : clubs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">No featured clubs found. Add one to display on the Home Page.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                  <th className="p-4 w-16">Order</th>
                  <th className="p-4">Club</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {clubs.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-foreground">{club.displayOrder || 0}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          {club.logoUrl ? (
                            <OptimizedImage src={club.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                              {club.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{club.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{club.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {[club.city, club.state].filter(Boolean).join(', ') || '-'}
                    </td>
                    <td className="p-4">
                      <button onClick={() => toggleStatus(club)} className="focus:outline-none">
                        {club.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(club)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveFeatured(club.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-1.5" /> Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Club to Feature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search clubs by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl bg-gray-50 border-gray-200"
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
              {filteredSearch.map(club => (
                <div key={club.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-border/30 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900">{club.name}</p>
                    <p className="text-sm text-gray-500">{[club.city, club.state].filter(Boolean).join(', ')}</p>
                  </div>
                  <Button size="sm" onClick={() => handleAddFeatured(club.id)} className="bg-foreground hover:bg-foreground text-white rounded-lg">
                    Add
                  </Button>
                </div>
              ))}
              {filteredSearch.length === 0 && (
                <div className="text-center p-8 text-gray-500">No clubs found matching your search.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Featured Club Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <Label>Club Name</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-12 bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={editForm.logoUrl} onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })} className="h-12 bg-gray-50" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Banner URL</Label>
                <Input value={editForm.bannerUrl} onChange={(e) => setEditForm({ ...editForm, bannerUrl: e.target.value })} className="h-12 bg-gray-50" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="h-12 bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} className="h-12 bg-gray-50" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Short Description</Label>
                <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="bg-gray-50 min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label>Display Order (Lower is first)</Label>
                <Input type="number" value={editForm.displayOrder} onChange={(e) => setEditForm({ ...editForm, displayOrder: parseInt(e.target.value) || 0 })} className="h-12 bg-gray-50" />
              </div>
              <div className="space-y-2 flex flex-col justify-center">
                <Label className="mb-3">Status</Label>
                <div className="flex items-center gap-3">
                  <Switch checked={editForm.isActive} onCheckedChange={(v) => setEditForm({ ...editForm, isActive: v })} />
                  <span className="text-sm font-medium">{editForm.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="h-12 rounded-xl">Cancel</Button>
              <Button onClick={handleUpdate} className="bg-foreground hover:bg-foreground text-white h-12 px-8 rounded-xl">Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
