'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, GripVertical, X, Save, Eye, Search, Filter, ImageIcon, Image as ImageIconLucide, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api, { getImageUrl } from '@/lib/api';

function MediaGalleryMgmtContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const activeTab = searchParams.get('tab') || 'list';
  const paramAlbumId = searchParams.get('albumId');

  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, ALL_PHOTOS, OUTDOOR_PHOTOS
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ACTIVE, INACTIVE
  const [filterFeatured, setFilterFeatured] = useState('ALL'); // ALL, FEATURED, REGULAR

  // Album Form State
  const [title, setTitle] = useState('');
  const [albumType, setAlbumType] = useState('ALL_PHOTOS');
  const [location, setLocation] = useState('');
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState('0');
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Manage Images Tab Specific State
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Fetch albums on mount / tab change
  useEffect(() => {
    fetchAlbums();
  }, [activeTab]);

  // Load specific album if albumId param exists (for Edit / Manage Images)
  useEffect(() => {
    if (paramAlbumId) {
      loadAlbumDetails(paramAlbumId);
    } else {
      resetForm();
    }
  }, [paramAlbumId, activeTab]);

  // Sync selectedAlbumId with param
  useEffect(() => {
    if (activeTab === 'images') {
      if (paramAlbumId) {
        setSelectedAlbumId(paramAlbumId);
      } else if (albums.length > 0 && !selectedAlbumId) {
        // Default to first album if none selected
        handleSelectAlbumForImages(albums[0].id);
      }
    }
  }, [paramAlbumId, activeTab, albums]);

  const fetchAlbums = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/media-gallery-mgmt/admin/albums?limit=1000');
      if (res.success && res.items) {
        setAlbums(res.items);
      } else if (res.data) {
        setAlbums(res.data);
      }
    } catch (error) {
      toast.error('Failed to load albums');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAlbumDetails = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/media-gallery-mgmt/admin/albums/${id}`);
      if (res.success && res.data) {
        const album = res.data;
        if (activeTab === 'add') {
          setTitle(album.title);
          setAlbumType(album.albumType || 'ALL_PHOTOS');
          setLocation(album.location || '');
          setEventName(album.eventName || '');
          setDescription(album.description || '');
          setCoverImage(album.coverImage);
          setStatus(album.status);
          setFeatured(album.featured);
          setDisplayOrder(album.displayOrder?.toString() || '0');
          setImages(album.images?.map((img: any) => img.imageUrl) || []);
        } else if (activeTab === 'images') {
          setSelectedAlbum(album);
          setImages(album.images?.map((img: any) => img.imageUrl) || []);
        }
      }
    } catch (error) {
      toast.error('Failed to load album details');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setAlbumType('ALL_PHOTOS');
    setLocation('');
    setEventName('');
    setDescription('');
    setCoverImage('');
    setStatus('ACTIVE');
    setFeatured(false);
    setDisplayOrder('0');
    setImages([]);
    setSelectedAlbum(null);
  };

  const handleSelectAlbumForImages = (id: string) => {
    setSelectedAlbumId(id);
    router.push(`/admin/media-gallery-mgmt?tab=images&albumId=${id}`);
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
        toast.success('Cover image updated locally');
      } else {
        const updatedImages = [...images, ...uploadedUrls];
        setImages(updatedImages);
        toast.success(`${uploadedUrls.length} images uploaded`);

        // If managing images, immediately sync with backend
        if (activeTab === 'images' && paramAlbumId) {
          await api.put(`/media-gallery-mgmt/admin/albums/${paramAlbumId}`, {
            images: updatedImages
          });
          loadAlbumDetails(paramAlbumId);
        }
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // HTML5 Native Drag & Drop Handlers for images
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

  const persistReorder = async () => {
    if (activeTab === 'images' && paramAlbumId) {
      try {
        await api.put(`/media-gallery-mgmt/admin/albums/${paramAlbumId}`, {
          images: images
        });
        toast.success('Gallery order updated');
        loadAlbumDetails(paramAlbumId);
      } catch (error) {
        toast.error('Failed to save updated order');
      }
    }
  };

  const handleSetCoverFromGallery = async (imageUrl: string) => {
    if (activeTab === 'images' && paramAlbumId) {
      try {
        await api.put(`/media-gallery-mgmt/admin/albums/${paramAlbumId}`, {
          coverImage: imageUrl
        });
        toast.success('Cover image updated successfully');
        loadAlbumDetails(paramAlbumId);
      } catch (error) {
        toast.error('Failed to update cover image');
      }
    }
  };

  const handleDeleteImageFromGallery = async (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    if (activeTab === 'images' && paramAlbumId) {
      try {
        await api.put(`/media-gallery-mgmt/admin/albums/${paramAlbumId}`, {
          images: newImages
        });
        toast.success('Image deleted from gallery');
        loadAlbumDetails(paramAlbumId);
      } catch (error) {
        toast.error('Failed to delete image');
      }
    }
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error('Album Title is required');
    if (!coverImage) return toast.error('Cover image is required');

    const payload = {
      title, albumType, location, eventName,
      description, coverImage, status, featured,
      displayOrder: parseInt(displayOrder) || 0,
      images: images
    };

    try {
      setIsSaving(true);
      if (paramAlbumId) {
        await api.put(`/media-gallery-mgmt/admin/albums/${paramAlbumId}`, payload);
        toast.success('Album updated successfully');
      } else {
        await api.post('/media-gallery-mgmt/admin/albums', payload);
        toast.success('Album created successfully');
      }
      router.push('/admin/media-gallery-mgmt?tab=list');
    } catch (error) {
      toast.error('Failed to save album');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Are you sure you want to delete this album? This will permanently delete all photos inside it.')) return;
    try {
      await api.delete(`/media-gallery-mgmt/admin/albums/${id}`);
      toast.success('Album deleted successfully');
      fetchAlbums();
    } catch (error) {
      toast.error('Failed to delete album');
    }
  };

  const handlePreview = (album: any) => {
    if (!album?.slug) return;
    window.open(`/gallery/outdoor-photos/${album.slug}`, '_blank');
  };

  // Filtering Logic
  const filteredAlbums = albums.filter((album) => {
    const matchesSearch = 
      album.title.toLowerCase().includes(search.toLowerCase()) ||
      (album.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (album.eventName || '').toLowerCase().includes(search.toLowerCase());

    const matchesType = 
      filterType === 'ALL' || album.albumType === filterType;

    const matchesStatus = 
      filterStatus === 'ALL' || album.status === filterStatus;

    const matchesFeatured = 
      filterFeatured === 'ALL' || 
      (filterFeatured === 'FEATURED' && album.featured) || 
      (filterFeatured === 'REGULAR' && !album.featured);

    return matchesSearch && matchesType && matchesStatus && matchesFeatured;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Media Gallery Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage photo collections, event cover layouts, and image ordering.</p>
        </div>
        <div className="flex gap-3">
          {activeTab !== 'list' && (
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/media-gallery-mgmt?tab=list')}
              className="cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
            </Button>
          )}
          {activeTab !== 'add' && (
            <Button 
              onClick={() => router.push('/admin/media-gallery-mgmt?tab=add')} 
              className="bg-brand-orange hover:bg-orange-600 text-white font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Album
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border/80">
        <button 
          onClick={() => router.push('/admin/media-gallery-mgmt?tab=list')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${activeTab === 'list' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Albums
        </button>
        <button 
          onClick={() => router.push('/admin/media-gallery-mgmt?tab=add')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${activeTab === 'add' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          {paramAlbumId ? 'Edit Album' : 'Add Album'}
        </button>
        <button 
          onClick={() => router.push(`/admin/media-gallery-mgmt?tab=images${paramAlbumId ? `&albumId=${paramAlbumId}` : ''}`)}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${activeTab === 'images' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Gallery Images
        </button>
      </div>

      {/* Loader */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm mt-4">Loading media gallery content...</p>
        </div>
      )}

      {/* TAB 1: ALBUM LIST */}
      {!isLoading && activeTab === 'list' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-muted/20 p-4 rounded-xl border border-border/60">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search by name, location, event..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="pl-9"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="ALL_PHOTOS">All Photos</option>
              <option value="OUTDOOR_PHOTOS">Outdoor Photos</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {/* Featured Filter */}
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm cursor-pointer"
            >
              <option value="ALL">All Visibility</option>
              <option value="FEATURED">Featured Only</option>
              <option value="REGULAR">Regular Only</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-b border-border">
                <tr>
                  <th className="p-4 w-28">Cover</th>
                  <th className="p-4">Album Details</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-center">Images</th>
                  <th className="p-4 text-center">Featured</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredAlbums.map((album) => (
                  <tr key={album.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4">
                      <img 
                        src={getImageUrl(album.coverImage)} 
                        alt={album.title} 
                        className="w-20 h-14 object-cover rounded-md border border-border shadow-sm"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-foreground">{album.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                        {album.eventName && <div>🎬 {album.eventName}</div>}
                        {album.location && <div>📍 {album.location}</div>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-accent text-accent-foreground border border-border">
                        {album.albumType === 'ALL_PHOTOS' ? 'All Photos' : 'Outdoor Photos'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-foreground/80">
                      {album.images?.length || album._count?.images || 0}
                    </td>
                    <td className="p-4 text-center">
                      {album.featured ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400">
                          ★
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${album.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {album.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePreview(album)} 
                          title="Preview"
                          className="cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSelectAlbumForImages(album.id)} 
                          title="Manage Images"
                          className="cursor-pointer flex items-center gap-1"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span className="hidden lg:inline text-xs">Images</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => router.push(`/admin/media-gallery-mgmt?tab=add&albumId=${album.id}`)} 
                          title="Edit"
                          className="cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteAlbum(album.id)} 
                          title="Delete"
                          className="cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAlbums.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground">
                      <div className="max-w-sm mx-auto space-y-2">
                        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30" />
                        <h4 className="font-bold text-foreground">No Albums Found</h4>
                        <p className="text-xs">Create a new photo album or adjust your filter queries to see results.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ADD / EDIT ALBUM */}
      {!isLoading && activeTab === 'add' && (
        <form onSubmit={handleSaveAlbum} className="bg-card rounded-2xl border border-border p-6 space-y-8 max-w-4xl mx-auto shadow-sm">
          <h2 className="text-xl font-bold border-b border-border pb-3">
            {paramAlbumId ? 'Update Album Specifications' : 'New Album Specifications'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Album Title *</label>
              <Input 
                required 
                placeholder="Enter album name" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Album Type *</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm cursor-pointer"
                value={albumType} 
                onChange={(e) => setAlbumType(e.target.value)}
              >
                <option value="ALL_PHOTOS">All Photos</option>
                <option value="OUTDOOR_PHOTOS">Outdoor Photos</option>
              </select>
            </div>

            {/* Event Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Event Name (Club / Show Details)</label>
              <Input 
                placeholder="e.g. Coimbatore Championship Dog Show" 
                value={eventName} 
                onChange={(e) => setEventName(e.target.value)} 
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Location</label>
              <Input 
                placeholder="e.g. Chennai, Tamil Nadu" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
              />
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Display Order</label>
              <Input 
                type="number" 
                placeholder="0" 
                value={displayOrder} 
                onChange={(e) => setDisplayOrder(e.target.value)} 
              />
            </div>

            {/* Featured & Status */}
            <div className="space-y-2 flex flex-col justify-end">
              <label className="text-sm font-semibold mb-2">Visibility & Status</label>
              <div className="flex gap-4">
                <select 
                  className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm cursor-pointer"
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>

                <label className="flex items-center gap-2 cursor-pointer border px-4 rounded-md border-input bg-background text-foreground select-none">
                  <input 
                    type="checkbox" 
                    checked={featured} 
                    onChange={(e) => setFeatured(e.target.checked)} 
                    className="rounded text-brand-orange focus:ring-brand-orange cursor-pointer w-4 h-4" 
                  />
                  <span className="text-sm font-semibold">Featured</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea 
              placeholder="Enter brief description of the album event"
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
              rows={3}
            />
          </div>

          {/* Cover Image Upload */}
          <div className="p-5 border border-border/80 rounded-xl bg-muted/20 space-y-4">
            <label className="text-sm font-bold block">Cover Image *</label>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {coverImage ? (
                <div className="relative group shrink-0">
                  <img 
                    src={getImageUrl(coverImage)} 
                    alt="Cover Preview" 
                    className="h-28 w-40 object-cover rounded-lg shadow border border-border" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setCoverImage('')} 
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-28 w-40 bg-muted border-2 border-dashed border-border rounded-lg flex items-center justify-center shrink-0">
                  <ImageIconLucide className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}
              <div className="flex-1 w-full space-y-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleUpload(e, true)} 
                  disabled={isUploading} 
                  className="cursor-pointer" 
                />
                <p className="text-xs text-muted-foreground">Select a single cover image. This photo represents the album on display grids.</p>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex justify-between items-center pt-6 border-t border-border mt-8">
            <div>
              {paramAlbumId && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => handleDeleteAlbum(paramAlbumId)}
                  className="cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Album
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              {paramAlbumId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handlePreview({ slug: title.toLowerCase().replace(/\s+/g, '-') })}
                  className="cursor-pointer"
                >
                  <Eye className="w-4 h-4 mr-2" /> Preview
                </Button>
              )}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/admin/media-gallery-mgmt?tab=list')}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving || isUploading} 
                className="bg-brand-orange hover:bg-orange-600 text-white font-bold cursor-pointer"
              >
                <Save className="w-4 h-4 mr-2" /> {paramAlbumId ? 'Update Album' : 'Save Album'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: GALLERY IMAGES MANAGEMENT */}
      {!isLoading && activeTab === 'images' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold border-b border-border pb-3 flex items-center justify-between">
              <span>Manage Album Gallery Images</span>
              <span className="text-xs text-muted-foreground font-normal">Manage uploads, select covers, and reorder grid layout</span>
            </h2>

            {/* Album Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Select Album to Edit:</label>
              <select
                value={selectedAlbumId}
                onChange={(e) => handleSelectAlbumForImages(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm cursor-pointer"
              >
                <option value="" disabled>-- Pick an album --</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title} ({album.albumType === 'ALL_PHOTOS' ? 'All Photos' : 'Outdoor Photos'})
                  </option>
                ))}
              </select>
            </div>

            {selectedAlbum ? (
              <div className="space-y-6 border-t border-border pt-6">
                {/* Album Details Banner */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 p-4 rounded-xl border border-border/40">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Album: <span className="text-brand-orange">{selectedAlbum.title}</span>
                    </h3>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1 font-medium">
                      {selectedAlbum.eventName && <span>Event: {selectedAlbum.eventName}</span>}
                      {selectedAlbum.location && <span>Location: {selectedAlbum.location}</span>}
                      <span>Total Photos: {images.length}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePreview(selectedAlbum)}
                      className="cursor-pointer text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Live Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push(`/admin/media-gallery-mgmt?tab=add&albumId=${selectedAlbum.id}`)}
                      className="cursor-pointer text-xs"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Meta
                    </Button>
                  </div>
                </div>

                {/* Upload Section */}
                <div className="p-5 border border-border rounded-xl bg-muted/10 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Upload Images</h4>
                      <p className="text-xs text-muted-foreground mt-1">Select one or multiple photos to upload directly to this album.</p>
                    </div>
                    <div className="w-full sm:w-80">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={(e) => handleUpload(e, false)} 
                        disabled={isUploading} 
                        className="cursor-pointer" 
                      />
                    </div>
                  </div>
                  {isUploading && (
                    <div className="flex items-center gap-2 text-xs text-brand-orange font-bold animate-pulse">
                      <div className="w-4.5 h-4.5 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                      Uploading photos directly to album gallery...
                    </div>
                  )}
                </div>

                {/* Gallery Images Ordering & Edit options */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm">Photos Grid ({images.length})</h4>
                    {images.length > 1 && (
                      <Button 
                        size="sm" 
                        onClick={persistReorder}
                        className="bg-brand-orange hover:bg-orange-600 text-white font-bold cursor-pointer text-xs"
                      >
                        Save Grid Order
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Drag and drop images to reorder layout. Click the green check icon to set as the cover image.</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                    {images.map((url, index) => {
                      const isCover = selectedAlbum.coverImage === url;
                      return (
                        <div 
                          key={url + index} 
                          draggable 
                          onDragStart={(e) => onDragStart(e, index)}
                          onDragEnd={onDragEnd}
                          onDragOver={(e) => onDragOver(e, index)}
                          className={`relative group aspect-[4/3] rounded-xl overflow-hidden bg-muted cursor-move border transition-all ${isCover ? 'border-green-500 ring-2 ring-green-500/20' : 'border-border/60 hover:border-brand-orange'}`}
                        >
                          <img 
                            src={getImageUrl(url)} 
                            alt={`Gallery item ${index + 1}`} 
                            className="w-full h-full object-cover pointer-events-none" 
                          />
                          
                          {/* Image Number Badge */}
                          <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/10">
                            {index + 1}
                          </div>

                          {/* Cover Badge */}
                          {isCover && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                              <Check className="w-2.5 h-2.5" /> Cover
                            </div>
                          )}

                          {/* Hover Actions overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <GripVertical className="text-white w-5 h-5 cursor-move" />
                            
                            {!isCover && (
                              <button 
                                type="button" 
                                onClick={() => handleSetCoverFromGallery(url)} 
                                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-1.5 hover:scale-110 transition-transform cursor-pointer shadow"
                                title="Set as Cover Image"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            <button 
                              type="button" 
                              onClick={() => setPreviewImage(url)} 
                              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 hover:scale-110 transition-transform cursor-pointer shadow"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button 
                              type="button" 
                              onClick={() => handleDeleteImageFromGallery(index)} 
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 hover:scale-110 transition-transform cursor-pointer shadow"
                              title="Delete image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {images.length === 0 && (
                      <div className="col-span-full py-16 text-center text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
                        No photos uploaded to this album yet. Drag files or browse above to upload.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-muted-foreground border border-dashed border-border rounded-xl mt-6">
                Please select or create a photo album to manage its gallery images.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox / Preview modal for admin */}
      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            <button 
              onClick={() => setPreviewImage(null)} 
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white hover:text-brand-orange p-2 rounded-full cursor-pointer z-10 transition-all shadow border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={getImageUrl(previewImage)} 
              alt="Preview" 
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function MediaGalleryMgmtAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Media Gallery...</div>}>
      <MediaGalleryMgmtContent />
    </Suspense>
  );
}
