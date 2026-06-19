'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api, { getImageUrl } from '@/lib/api';

export default function OutdoorPhotosAdminPage() {
  const [settings, setSettings] = useState<any>({ smallHeading: '', title: '', subtitle: '', status: 'ACTIVE' });
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAlbum, setCurrentAlbum] = useState<any>(null);
  const [albumName, setAlbumName] = useState('');
  const [clubName, setClubName] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, albumsRes] = await Promise.all([
        api.get('/homepage-outdoor-photos/settings'),
        api.get('/homepage-outdoor-photos')
      ]);
      if (settingsRes.data) setSettings(settingsRes.data);
      setAlbums(albumsRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSavingSettings(true);
      await api.put('/homepage-outdoor-photos/settings', settings);
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const openModal = (album: any = null) => {
    if (album) {
      setCurrentAlbum(album);
      setAlbumName(album.albumName);
      setClubName(album.clubName);
      setLocation(album.location || '');
      setEventDate(album.eventDate ? new Date(album.eventDate).toISOString().split('T')[0] : '');
      setDescription(album.description || '');
      setCoverImage(album.coverImage);
      setStatus(album.status);
      setFeatured(album.featured);
      setImages(album.images?.map((img: any) => img.imageUrl) || []);
    } else {
      setCurrentAlbum(null);
      setAlbumName('');
      setClubName('');
      setLocation('');
      setEventDate('');
      setDescription('');
      setCoverImage('');
      setStatus('ACTIVE');
      setFeatured(false);
      setImages([]);
    }
    setIsModalOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        const res = await api.post('/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.url) uploadedUrls.push(res.url);
      }

      if (isCover && uploadedUrls.length > 0) {
        setCoverImage(uploadedUrls[0]);
      } else {
        setImages((prev) => [...prev, ...uploadedUrls]);
      }
      toast.success('Upload successful');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // HTML5 Native Drag & Drop Handlers
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedIndex(null);
    e.currentTarget.style.opacity = '1';
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Reorder array instantly for visual feedback
    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    
    setImages(newImages);
    setDraggedIndex(index); // update index to continuous drag
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) return toast.error('Cover image is required');
    if (!albumName || !clubName) return toast.error('Album Name and Club Name are required');

    const payload = {
      albumName, clubName, location, eventDate: eventDate || null,
      description, coverImage, status, featured,
      images: images.map((url, i) => ({ imageUrl: url, displayOrder: i }))
    };

    try {
      if (currentAlbum) {
        await api.put(`/homepage-outdoor-photos/${currentAlbum.id}`, payload);
        toast.success('Album updated');
      } else {
        await api.post('/homepage-outdoor-photos', payload);
        toast.success('Album created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save album');
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Are you sure you want to delete this album?')) return;
    try {
      await api.delete(`/homepage-outdoor-photos/${id}`);
      toast.success('Album deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete album');
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Section Settings */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Section Settings</h2>
          <Button onClick={saveSettings} disabled={isSavingSettings} className="bg-brand-orange hover:bg-orange-600">
            <Save className="w-4 h-4 mr-2" /> Save Settings
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Small Heading</label>
            <Input value={settings.smallHeading} onChange={(e) => setSettings({...settings, smallHeading: e.target.value})} placeholder="PREMIUM PERSONAL PHOTOS" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Main Title</label>
            <Input value={settings.title} onChange={(e) => setSettings({...settings, title: e.target.value})} placeholder="Outdoor Photos" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Subtitle</label>
            <Input value={settings.subtitle} onChange={(e) => setSettings({...settings, subtitle: e.target.value})} />
          </div>
        </div>
      </div>

      {/* Albums Management */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Outdoor Photo Albums</h2>
          <Button onClick={() => openModal()} className="bg-brand-orange hover:bg-orange-600">
            <Plus className="w-5 h-5 mr-2" /> Add Album
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-muted/50 text-muted-foreground text-sm uppercase font-semibold">
              <tr>
                <th className="p-4">Cover</th>
                <th className="p-4">Album Details</th>
                <th className="p-4">Status</th>
                <th className="p-4">Photos</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {albums.map((album) => (
                <tr key={album.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <img src={getImageUrl(album.coverImage)} alt="Cover" className="w-24 h-16 object-cover rounded-md shadow-sm" />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-foreground">{album.albumName}</div>
                    <div className="text-sm text-muted-foreground">{album.clubName} • {album.eventDate ? new Date(album.eventDate).toLocaleDateString() : 'No date'}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className={`w-max px-2 py-1 text-xs font-bold rounded-full ${album.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {album.status}
                      </span>
                      {album.featured && <span className="w-max px-2 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700">FEATURED</span>}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{album.images?.length || 0}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openModal(album)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAlbum(album.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {albums.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No albums created yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Album Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-6">{currentAlbum ? 'Edit Album' : 'Create Album'}</h2>
            
            <form onSubmit={handleSaveAlbum} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Album Name *</label>
                  <Input required value={albumName} onChange={(e) => setAlbumName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Club Name *</label>
                  <Input required value={clubName} onChange={(e) => setClubName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Location</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Event Date</label>
                  <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <label className="font-semibold text-sm mb-2">Status & Visibility</label>
                  <div className="flex gap-4">
                    <select className="flex-1 h-10 px-3 rounded-md border border-input bg-background" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer border px-3 rounded-md border-input bg-background">
                      <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded text-brand-orange focus:ring-brand-orange" />
                      <span className="text-sm font-medium">Featured</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-xl bg-muted/20">
                <label className="font-semibold text-sm block mb-4">Cover Image *</label>
                <div className="flex items-center gap-6">
                  {coverImage ? (
                    <div className="relative group">
                      <img src={getImageUrl(coverImage)} alt="Cover" className="h-32 w-48 object-cover rounded-lg shadow-md" />
                      <button type="button" onClick={() => setCoverImage('')} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 w-48 bg-muted border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">No cover image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input type="file" accept="image/*" onChange={(e) => handleUpload(e, true)} disabled={isUploading} />
                    <p className="text-xs text-muted-foreground mt-2">Used as the thumbnail for the album card on the homepage.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-xl bg-muted/20">
                <div className="flex justify-between items-center mb-4">
                  <label className="font-semibold text-sm">Gallery Images ({images.length})</label>
                  <div className="w-64"><Input type="file" accept="image/*" multiple onChange={(e) => handleUpload(e, false)} disabled={isUploading} /></div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-4">Drag and drop images to reorder them. The first 4 images may be previewed.</p>

                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                  {images.map((url, index) => (
                    <div 
                      key={url + index} 
                      draggable 
                      onDragStart={(e) => onDragStart(e, index)}
                      onDragEnd={onDragEnd}
                      onDragOver={(e) => onDragOver(e, index)}
                      className="relative group aspect-square rounded-lg overflow-hidden bg-muted cursor-move border border-transparent hover:border-brand-orange transition-all"
                    >
                      <img src={getImageUrl(url)} alt={`Gallery ${index}`} className="w-full h-full object-cover pointer-events-none" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <GripVertical className="text-white w-5 h-5 cursor-move" />
                        <button type="button" onClick={() => setImages(images.filter((_, i) => i !== index))} className="bg-red-500 text-white rounded-full p-1 hover:scale-110 transition-transform">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 rounded-sm">{index + 1}</div>
                    </div>
                  ))}
                  {images.length > 20 && (
                    <div className="aspect-square rounded-lg bg-muted flex items-center justify-center border border-dashed border-border">
                      <span className="text-xs font-bold text-muted-foreground">+{images.length - 20}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isUploading} className="bg-brand-orange hover:bg-orange-600">Save Album</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
