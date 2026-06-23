'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api, { getImageUrl } from '@/lib/api';
import Spinner from '@/components/common/loader/Spinner';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function ShowPhotosAdminPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAlbum, setCurrentAlbum] = useState<any>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [showDate, setShowDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const res = await api.get('/homepage-show-albums');
      setAlbums(res.data || []);
    } catch (error) {
      toast.error('Failed to load albums');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (album: any = null) => {
    if (album) {
      setCurrentAlbum(album);
      setTitle(album.title);
      setLocation(album.location || '');
      setShowDate(album.showDate ? new Date(album.showDate).toISOString().split('T')[0] : '');
      setDescription(album.description || '');
      setCoverImage(album.coverImage);
      setStatus(album.status);
      setFeatured(album.featured);
      setImages(album.images?.map((img: any) => img.imageUrl) || []);
    } else {
      setCurrentAlbum(null);
      setTitle('');
      setLocation('');
      setShowDate('');
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
        if (res.url) {
          uploadedUrls.push(res.url);
        }
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) {
      return toast.error('Cover image is required');
    }

    const payload = {
      title,
      location,
      showDate: showDate || null,
      description,
      coverImage,
      status,
      featured,
      images: images.map((url, i) => ({ imageUrl: url, displayOrder: i }))
    };

    try {
      if (currentAlbum) {
        await api.put(`/homepage-show-albums/${currentAlbum.id}`, payload);
        toast.success('Album updated');
      } else {
        await api.post('/homepage-show-albums', payload);
        toast.success('Album created');
      }
      setIsModalOpen(false);
      fetchAlbums();
    } catch (error) {
      toast.error('Failed to save album');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this album?')) return;
    try {
      await api.delete(`/homepage-show-albums/${id}`);
      toast.success('Album deleted');
      fetchAlbums();
    } catch (error) {
      toast.error('Failed to delete album');
    }
  };

  if (isLoading) return <Spinner className="p-8" />;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Homepage Show Photos</h1>
          <p className="text-muted-foreground mt-1">Manage the premium photo gallery shown on the homepage.</p>
        </div>
        <Button onClick={() => openModal()} className="bg-foreground hover:bg-foreground">
          <Plus className="w-5 h-5 mr-2" />
          Add Album
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/50 text-muted-foreground text-sm uppercase font-semibold">
            <tr>
              <th className="p-4">Cover</th>
              <th className="p-4">Show Details</th>
              <th className="p-4">Status</th>
              <th className="p-4">Photos</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {albums.map((album) => (
              <tr key={album.id} className="hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <OptimizedImage src={getImageUrl(album.coverImage)} alt="Cover" className="w-20 h-14 object-cover rounded-md" />
                </td>
                <td className="p-4">
                  <div className="font-bold text-foreground">{album.title}</div>
                  <div className="text-sm text-muted-foreground">{album.location} • {album.showDate ? new Date(album.showDate).toLocaleDateString() : 'No date'}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${album.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {album.status}
                  </span>
                </td>
                <td className="p-4 font-medium">{album.images?.length || 0} photos</td>
                <td className="p-4 flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openModal(album)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(album.id)}><Trash2 className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
            {albums.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No albums created yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-6">{currentAlbum ? 'Edit Album' : 'Create Album'}</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Show Title *</label>
                  <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Coimbatore Canine Club" />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Location</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Coimbatore" />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Show Date</label>
                  <Input type="date" value={showDate} onChange={(e) => setShowDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Status</label>
                  <select className="w-full h-10 px-3 rounded-md border border-input bg-background" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-sm">Cover Image *</label>
                <div className="flex items-center gap-4">
                  {coverImage && <OptimizedImage src={getImageUrl(coverImage)} alt="Cover" className="h-20 rounded-md object-cover" />}
                  <Input type="file" accept="image/*" onChange={(e) => handleUpload(e, true)} disabled={isUploading} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-sm">Gallery Images (Multiple)</label>
                <Input type="file" accept="image/*" multiple onChange={(e) => handleUpload(e, false)} disabled={isUploading} />
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-md overflow-hidden bg-muted">
                      <OptimizedImage src={getImageUrl(url)} alt="Gallery" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isUploading} className="bg-foreground hover:bg-foreground">Save Album</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
