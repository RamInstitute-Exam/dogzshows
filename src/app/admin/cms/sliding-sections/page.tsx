'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api, { getImageUrl } from '@/lib/api';
import Spinner from '@/components/common/loader/Spinner';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function SlidingSectionsAdminPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<any>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [isFeatured, setIsFeatured] = useState(false);
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [images, setImages] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/homepage-sliding-sections');
      setSections(res.data || []);
    } catch (error) {
      toast.error('Failed to load sections');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (section: any = null) => {
    if (section) {
      setCurrentSection(section);
      setName(section.name);
      setTitle(section.title);
      setSubtitle(section.subtitle || '');
      setStatus(section.status);
      setIsFeatured(section.isFeatured || false);
      setShowOnHomepage(section.showOnHomepage ?? true);
      setDisplayOrder(section.displayOrder);
      setImages(section.images || []);
    } else {
      setCurrentSection(null);
      setName('');
      setTitle('');
      setSubtitle('');
      setStatus('ACTIVE');
      setIsFeatured(false);
      setShowOnHomepage(true);
      setDisplayOrder(sections.length);
      setImages([]);
    }
    setIsModalOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const newImages: any[] = [];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        const res = await api.post('/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.url) {
          newImages.push({ imageUrl: res.url, status: 'ACTIVE' });
        }
      }

      setImages((prev) => [...prev, ...newImages]);
      toast.success('Upload successful');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

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

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title) return toast.error('Section Name and Title are required');

    const payload = {
      name,
      title,
      subtitle,
      status,
      isFeatured,
      showOnHomepage,
      displayOrder: Number(displayOrder),
      images: images.map((img, i) => ({ ...img, displayOrder: i }))
    };

    try {
      if (currentSection) {
        await api.put(`/homepage-sliding-sections/${currentSection.id}`, payload);
        toast.success('Section updated');
      } else {
        await api.post('/homepage-sliding-sections', payload);
        toast.success('Section created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save section');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section entirely?')) return;
    try {
      await api.delete(`/homepage-sliding-sections/${id}`);
      toast.success('Section deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete section');
    }
  };

  if (isLoading) return <Spinner className="p-8" />;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Sliding Photo Sections</h2>
          <Button onClick={() => openModal()} className="bg-foreground hover:bg-foreground">
            <Plus className="w-5 h-5 mr-2" /> Add Section
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-muted/50 text-muted-foreground text-sm uppercase font-semibold">
              <tr>
                <th className="p-4">Display Order</th>
                <th className="p-4">Section Name & Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Images</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sections.map((sec) => (
                <tr key={sec.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-mono font-bold text-lg">{sec.displayOrder}</td>
                  <td className="p-4">
                    <div className="font-bold text-foreground">{sec.name}</div>
                    <div className="text-sm text-muted-foreground">{sec.title}</div>
                    {sec.subtitle && <div className="text-xs text-muted-foreground italic mt-0.5">{sec.subtitle}</div>}
                  </td>
                  <td className="p-4">
                    <span className={`w-max px-2 py-1 text-xs font-bold rounded-full ${sec.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {sec.status}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{sec.images?.length || 0}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openModal(sec)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(sec.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {sections.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No sections created yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-6">{currentSection ? 'Edit Section' : 'Create Section'}</h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Internal Name (e.g. Personal Photos) *</label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Public Title (e.g. Premium Personal Photos) *</label>
                  <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="font-semibold text-sm">Sub Title (Optional)</label>
                  <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. 5th & 6th All Breeds Championship Dog Show" maxLength={500} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Display Order</label>
                    <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                    Featured Album
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showOnHomepage"
                    checked={showOnHomepage}
                    onChange={(e) => setShowOnHomepage(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="showOnHomepage" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                    Show on Homepage
                  </label>
                </div>
              </div>

              <div className="p-4 border border-border rounded-xl bg-muted/20">
                <div className="flex justify-between items-center mb-4">
                  <label className="font-semibold text-sm">Gallery Images ({images.length})</label>
                  <div className="w-64"><Input type="file" accept="image/*" multiple onChange={handleUpload} disabled={isUploading} /></div>
                </div>

                <p className="text-xs text-muted-foreground mb-4">Drag and drop images to reorder them.</p>

                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                  {images.map((img, index) => (
                    <div
                      key={img.imageUrl + index}
                      draggable
                      onDragStart={(e) => onDragStart(e, index)}
                      onDragEnd={onDragEnd}
                      onDragOver={(e) => onDragOver(e, index)}
                      className="relative group aspect-square rounded-lg overflow-hidden bg-muted cursor-move border border-transparent hover:border-border transition-all"
                    >
                      <OptimizedImage src={getImageUrl(img.imageUrl)} alt={`Gallery ${index}`} className="w-full h-full object-cover pointer-events-none" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <GripVertical className="text-white w-5 h-5 cursor-move" />
                        <button type="button" onClick={() => setImages(images.filter((_, i) => i !== index))} className="bg-red-500 text-white rounded-full p-1 hover:scale-110 transition-transform">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 rounded-sm">{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isUploading} className="bg-foreground hover:bg-foreground">Save Section</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
