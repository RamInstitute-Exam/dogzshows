'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, GripVertical, X, Save, Eye, Search, Filter, ImageIcon, Image as ImageIconLucide, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api, { getImageUrl } from '@/lib/api';
import Spinner from '@/components/common/loader/Spinner';

function MediaGalleryMgmtContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const activeTab = searchParams.get('tab') || 'list';
  const paramAlbumId = searchParams.get('albumId');

  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Dropdown States
  const [categories, setCategories] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('ALL');
  const [filterClubId, setFilterClubId] = useState('ALL');
  const [filterEventId, setFilterEventId] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, DRAFT, PUBLISHED
  const [filterFeatured, setFilterFeatured] = useState('ALL'); // ALL, FEATURED, REGULAR

  // Album Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [clubId, setClubId] = useState('');
  const [eventId, setEventId] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [albumDate, setAlbumDate] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState('DRAFT');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Bulk selection state
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<string[]>([]);

  // Manage Images Tab Specific State
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedAlbumIndex, setDraggedAlbumIndex] = useState<number | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

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
        handleSelectAlbumForImages(albums[0].id);
      }
    }
  }, [paramAlbumId, activeTab, albums]);

  const fetchDropdownData = async () => {
    try {
      const [catRes, clubRes, eventRes] = await Promise.all([
        api.get('/public/gallery/categories'),
        api.get('/public/clubs?limit=1000'),
        api.get('/public/shows?limit=1000')
      ]);
      if (catRes.success) setCategories(catRes.data || []);
      if (clubRes.success) setClubs(clubRes.data || []);
      if (eventRes.success) setEvents(eventRes.data || []);
    } catch (error) {
      console.error('Failed to load dropdown directories:', error);
    }
  };

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
          setCategoryId(album.categoryId || '');
          setClubId(album.clubId || '');
          setEventId(album.eventId || '');
          setCity(album.city || '');
          setState(album.state || '');
          setDescription(album.description || '');
          setCoverImage(album.coverImage);
          setStatus(album.status);
          setFeatured(album.featured);
          setAlbumDate(album.albumDate ? new Date(album.albumDate).toISOString().split('T')[0] : '');
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
    setCategoryId(categories[0]?.id || '');
    setClubId('');
    setEventId('');
    setCity('');
    setState('');
    setDescription('');
    setCoverImage('');
    setStatus('DRAFT');
    setFeatured(false);
    setAlbumDate('');
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
      setUploadProgress(0);
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
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      if (isCover && uploadedUrls.length > 0) {
        setCoverImage(uploadedUrls[0]);
        toast.success('Cover image uploaded successfully');
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
      setUploadProgress(0);
    }
  };

  // Drag & Drop handlers for images (within album)
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
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

  const onDragEnd = () => {
    setDraggedIndex(null);
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

  // Drag & Drop handlers for Albums List (Display Order)
  const onAlbumDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedAlbumIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onAlbumDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
  };

  const onAlbumDrop = async (index: number) => {
    if (draggedAlbumIndex === null || draggedAlbumIndex === index) return;

    const newAlbums = [...albums];
    const draggedItem = newAlbums[draggedAlbumIndex];
    newAlbums.splice(draggedAlbumIndex, 1);
    newAlbums.splice(index, 0, draggedItem);

    setAlbums(newAlbums);
    setDraggedAlbumIndex(null);

    // Save Display Orders to Database dynamically
    try {
      toast.loading('Saving album order...');
      await Promise.all(
        newAlbums.map((alb, idx) => 
          api.put(`/media-gallery-mgmt/admin/albums/${alb.id}`, { displayOrder: idx + 1 })
        )
      );
      toast.dismiss();
      toast.success('Albums order saved successfully!');
      fetchAlbums();
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to update album ordering');
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
    if (!categoryId) return toast.error('Category is required');
    if (!coverImage) return toast.error('Cover image is required');

    const payload = {
      title, description, categoryId,
      clubId: clubId || null,
      eventId: eventId || null,
      city: city || null,
      state: state || null,
      coverImage,
      albumDate: albumDate || null,
      status, featured,
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
    window.open(`/gallery/album/${album.slug}`, '_blank');
  };

  // Bulk Actions
  const handleBulkAction = async (action: string) => {
    if (selectedAlbumIds.length === 0) return;
    if (action === 'DELETE' && !confirm(`Are you sure you want to delete these ${selectedAlbumIds.length} albums?`)) return;

    try {
      const res = await api.post('/media-gallery-mgmt/admin/albums/bulk', {
        action,
        ids: selectedAlbumIds
      });
      if (res.success) {
        toast.success(`Bulk action "${action}" completed successfully`);
        setSelectedAlbumIds([]);
        fetchAlbums();
      } else {
        toast.error('Failed to execute bulk action');
      }
    } catch (e) {
      toast.error('Bulk action failed');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlbumIds(filteredAlbums.map(a => a.id));
    } else {
      setSelectedAlbumIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedAlbumIds(prev => [...prev, id]);
    } else {
      setSelectedAlbumIds(prev => prev.filter(item => item !== id));
    }
  };

  // Filtering Logic
  const filteredAlbums = albums.filter((album) => {
    const matchesSearch = 
      album.title.toLowerCase().includes(search.toLowerCase()) ||
      (album.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (album.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (album.state || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory = 
      filterCategoryId === 'ALL' || album.categoryId === filterCategoryId;

    const matchesClub = 
      filterClubId === 'ALL' || album.clubId === filterClubId;

    const matchesEvent = 
      filterEventId === 'ALL' || album.eventId === filterEventId;

    const matchesStatus = 
      filterStatus === 'ALL' || album.status === filterStatus;

    const matchesFeatured = 
      filterFeatured === 'ALL' || 
      (filterFeatured === 'FEATURED' && album.featured) || 
      (filterFeatured === 'REGULAR' && !album.featured);

    return matchesSearch && matchesCategory && matchesClub && matchesEvent && matchesStatus && matchesFeatured;
  });

  return (
    <div className="p-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Media Gallery Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage photo collections, event cover layouts, dynamic categories, and image ordering.</p>
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
              className="bg-foreground hover:bg-foreground/90 text-white font-bold cursor-pointer"
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
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${activeTab === 'list' ? 'border-border text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Albums
        </button>
        <button 
          onClick={() => router.push('/admin/media-gallery-mgmt?tab=add')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${activeTab === 'add' ? 'border-border text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          {paramAlbumId ? 'Edit Album' : 'Add Album'}
        </button>
        <button 
          onClick={() => router.push(`/admin/media-gallery-mgmt?tab=images${paramAlbumId ? `&albumId=${paramAlbumId}` : ''}`)}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${activeTab === 'images' ? 'border-border text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Gallery Images
        </button>
      </div>

      {/* Loader */}
      {isLoading && (
        <Spinner className="py-20" />
      )}

      {/* TAB 1: ALBUM LIST */}
      {!isLoading && activeTab === 'list' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 bg-muted/20 p-4 rounded-xl border border-border/60">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search name, location, state..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {/* Club Filter */}
            <select
              value={filterClubId}
              onChange={(e) => setFilterClubId(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm cursor-pointer"
            >
              <option value="ALL">All Clubs</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="DRAFT">DRAFT</option>
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

          {/* Bulk Actions Bar */}
          {selectedAlbumIds.length > 0 && (
            <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 p-4 rounded-xl justify-between">
              <span className="text-sm font-bold text-foreground">
                Selected {selectedAlbumIds.length} albums:
              </span>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('PUBLISH')}>Publish</Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('UNPUBLISH')}>Unpublish</Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('FEATURE')}>Feature</Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('UNFEATURE')}>Unfeature</Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction('DELETE')}>Delete Selected</Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-b border-border select-none">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox"
                      checked={selectedAlbumIds.length === filteredAlbums.length && filteredAlbums.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="p-4 w-16 text-center">Order</th>
                  <th className="p-4 w-28">Cover</th>
                  <th className="p-4">Album Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Photos</th>
                  <th className="p-4 text-center">Featured</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredAlbums.map((album, idx) => (
                  <tr 
                    key={album.id} 
                    draggable
                    onDragStart={(e) => onAlbumDragStart(e, idx)}
                    onDragOver={onAlbumDragOver}
                    onDrop={() => onAlbumDrop(idx)}
                    className="hover:bg-muted/10 transition-colors cursor-move"
                  >
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={selectedAlbumIds.includes(album.id)}
                        onChange={(e) => handleSelectOne(album.id, e.target.checked)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      <GripVertical className="w-4 h-4 mx-auto opacity-40 group-hover:opacity-100 cursor-move inline" />
                      <span className="ml-1 text-xs">{album.displayOrder}</span>
                    </td>
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
                        {album.event?.name && <div>🎬 {album.event.name}</div>}
                        {album.club?.name && <div>🛡️ {album.club.name}</div>}
                        {(album.city || album.state) && <div>📍 {[album.city, album.state].filter(Boolean).join(', ')}</div>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-accent text-accent-foreground border border-border">
                        {album.category?.name || 'Unassigned'}
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
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${album.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {album.status}
                      </span>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
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
                    <td colSpan={9} className="p-12 text-center text-muted-foreground">
                      <div className="max-w-sm mx-auto space-y-2">
                        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30" />
                        <h4 className="font-bold text-foreground">No Albums Found</h4>
                        <p className="text-xs">Create a new photo album or adjust your filters to see results.</p>
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
        <form onSubmit={handleSaveAlbum} className="bg-card rounded-2xl border border-border p-6 space-y-8 w-full shadow-sm">
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

            {/* Category Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Category *</label>
              <select 
                required
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm cursor-pointer"
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="" disabled>-- Select Category --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Event Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Event / Dog Show</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm cursor-pointer"
                value={eventId} 
                onChange={(e) => setEventId(e.target.value)}
              >
                <option value="">None / Independent Collection</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>

            {/* Club Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Host Club</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm cursor-pointer"
                value={clubId} 
                onChange={(e) => setClubId(e.target.value)}
              >
                <option value="">None</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">City</label>
              <Input 
                placeholder="e.g. Coimbatore" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">State</label>
              <Input 
                placeholder="e.g. Tamil Nadu" 
                value={state} 
                onChange={(e) => setState(e.target.value)} 
              />
            </div>

            {/* Album Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Album Event Date</label>
              <Input 
                type="date" 
                value={albumDate} 
                onChange={(e) => setAlbumDate(e.target.value)} 
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
            <div className="space-y-2 flex flex-col justify-end lg:col-span-2">
              <label className="text-sm font-semibold mb-2">Visibility & Status</label>
              <div className="flex gap-4">
                <select 
                  className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm cursor-pointer"
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </select>

                <label className="flex items-center gap-2 cursor-pointer border px-4 rounded-md border-input bg-background text-foreground select-none">
                  <input 
                    type="checkbox" 
                    checked={featured} 
                    onChange={(e) => setFeatured(e.target.checked)} 
                    className="rounded text-foreground focus:ring-foreground cursor-pointer w-4 h-4" 
                  />
                  <span className="text-sm font-semibold">Featured Album</span>
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
              className="w-full p-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground focus:border-border"
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
                className="bg-foreground hover:bg-foreground/90 text-white font-bold cursor-pointer"
              >
                <Save className="w-4 h-4 mr-2" /> {paramAlbumId ? 'Update Album' : 'Save Album'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: GALLERY IMAGES MANAGEMENT */}
      {!isLoading && activeTab === 'images' && (
        <div className="w-full space-y-6">
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
                    {album.title} ({album.category?.name || 'Photos'})
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
                      Album: <span className="text-foreground">{selectedAlbum.title}</span>
                    </h3>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1 font-medium">
                      {selectedAlbum.event?.name && <span>Show: {selectedAlbum.event.name}</span>}
                      {(selectedAlbum.city || selectedAlbum.state) && <span>Location: {[selectedAlbum.city, selectedAlbum.state].filter(Boolean).join(', ')}</span>}
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
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Uploading files...</span>
                        <span className="font-bold text-foreground">{uploadProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-foreground transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
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
                        className="bg-foreground hover:bg-foreground text-white font-bold cursor-pointer text-xs"
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
                          onDragOver={(e) => onDragOver(e, index)}
                          onDragEnd={onDragEnd}
                          className={`relative group aspect-[4/3] rounded-xl overflow-hidden bg-muted cursor-move border transition-all ${isCover ? 'border-green-500 ring-2 ring-green-500/20' : 'border-border/60 hover:border-border'}`}
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
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white hover:text-foreground p-2 rounded-full cursor-pointer z-10 transition-all shadow border border-white/10"
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
    <Suspense fallback={<Spinner className="p-8" />}>
      <MediaGalleryMgmtContent />
    </Suspense>
  );
}
