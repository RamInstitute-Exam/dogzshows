'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Search,
  Star,
  X,
  FolderInput,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertTriangle,
  FolderOpen,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import api, { getImageUrl } from '@/lib/api';
import axiosInstance from '@/lib/axios';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function PhotoManagement() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Filters and Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [selectedFeatured, setSelectedFeatured] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // Counts and Meta
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Lists for Dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);

  // Bulk actions State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [targetAlbumId, setTargetAlbumId] = useState('');
  const [processingBulk, setProcessingBulk] = useState(false);

  // Fetch reference lists (categories and albums) on mount
  const fetchReferenceData = async () => {
    try {
      const [catRes, albRes] = await Promise.all([
        api.get('/public/photo-categories'),
        api.get('/public/photo-albums')
      ]);
      setCategories(catRes?.data || catRes || []);
      setAlbums(albRes?.data || albRes || []);
    } catch (error) {
      console.error('Failed to load categories/albums:', error);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/admin/photos/stats');
      if (res && res.success) {
        setStats(res.data || null);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch photos with current filters
  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const queryParams: any = {
        page,
        limit,
        search: search || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        album: selectedAlbum !== 'all' ? selectedAlbum : undefined,
        featured: selectedFeatured !== 'all' ? selectedFeatured : undefined,
        date: selectedDate || undefined,
        sortBy: sortBy !== 'latest' ? sortBy : undefined
      };

      const res = await api.get('/admin/photos', queryParams);
      if (res.success || Array.isArray(res.data)) {
        setPhotos(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      } else {
        setPhotos([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferenceData();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [page, selectedCategory, selectedAlbum, selectedFeatured, selectedDate, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPhotos();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedAlbum('all');
    setSelectedFeatured('all');
    setSelectedDate('');
    setSortBy('latest');
    setPage(1);
  };

  // Checkbox interactions
  const isAllSelectedOnPage = photos.length > 0 && photos.every(p => selectedIds.has(p.id));

  const handleSelectAllToggle = () => {
    const newSelected = new Set(selectedIds);
    if (isAllSelectedOnPage) {
      // Remove all current page photos from selection
      photos.forEach(p => newSelected.delete(p.id));
    } else {
      // Add all current page photos to selection
      photos.forEach(p => newSelected.add(p.id));
    }
    setSelectedIds(newSelected);
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Single Delete
  const handleDeleteSingle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo? This will also remove it from AWS S3.')) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/admin/photos/bulk`, { data: { ids: [id] } });
      toast.success('Photo deleted successfully');
      // Remove from selected list if it was selected
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
      fetchPhotos();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete photo:', error);
      toast.error('Failed to delete photo');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllowDownload = async (photoId: string, currentVal: boolean) => {
    try {
      const nextVal = !currentVal;
      await api.post(`/admin/photos/${photoId}/toggle-download`, { allowDownload: nextVal });
      toast.success(`Downloads ${nextVal ? 'enabled' : 'disabled'} successfully`);
      fetchPhotos();
    } catch {
      toast.error('Failed to update download permission');
    }
  };

  const handleResetDownloads = async (photoId: string) => {
    if (!confirm('Are you sure you want to reset the download count for this photo?')) return;
    try {
      await api.post(`/admin/photos/${photoId}/reset-downloads`);
      toast.success('Download count reset');
      fetchPhotos();
      fetchStats();
    } catch {
      toast.error('Failed to reset download count');
    }
  };

  const handleBulkFeaturedToggle = async (featured: boolean) => {
    setProcessingBulk(true);
    try {
      const ids = Array.from(selectedIds);
      await api.patch('/admin/photos/featured', { ids, featured });
      toast.success(`Successfully ${featured ? 'marked' : 'removed'} featured status for ${ids.length} photos`);
      setSelectedIds(new Set());
      fetchPhotos();
      fetchStats();
    } catch (error: any) {
      console.error('Bulk featured error:', error);
      toast.error('Failed to update featured status');
    } finally {
      setProcessingBulk(false);
    }
  };

  const handleBulkMoveAlbum = async () => {
    setProcessingBulk(true);
    try {
      const ids = Array.from(selectedIds);
      await api.patch('/admin/photos/album', { ids, albumId: targetAlbumId || null });
      toast.success(`Successfully moved ${ids.length} photos to album`);
      setSelectedIds(new Set());
      setShowAlbumModal(false);
      setTargetAlbumId('');
      fetchPhotos();
    } catch (error: any) {
      console.error('Bulk move album error:', error);
      toast.error('Failed to move photos to album');
    } finally {
      setProcessingBulk(false);
    }
  };

  const executeBulkDeleteFinal = async () => {
    setProcessingBulk(true);
    try {
      const ids = Array.from(selectedIds);
      await axiosInstance.delete('/admin/photos/bulk', { data: { ids } });
      toast.success(`✓ ${ids.length} photos deleted successfully`);
      setSelectedIds(new Set());
      setShowDeleteModal(false);
      setPage(1);
      fetchPhotos();
      fetchStats();
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete photos');
    } finally {
      setProcessingBulk(false);
    }
  };

  // Pagination bounds
  const startRecord = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalCount);

  // Helper for generating page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    if (page <= 3) {
      end = Math.min(totalPages, maxVisible);
    }
    if (page >= totalPages - 2) {
      start = Math.max(1, totalPages - (maxVisible - 1));
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="w-full flex flex-col min-h-screen pb-24">
      {/* Top Header Card */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-blue-500" /> Photo Management
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Manage all photography assets, upload new photos directly to S3.
          </p>
        </div>
        <a href="/admin/media/photos/create" className="w-full md:w-auto">
          <button className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
            + Create New
          </button>
        </a>
      </div>

      {/* Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {/* Total Unique Visitors Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-md flex items-center gap-4">
          <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-500 shrink-0">
            <Eye className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
              {loadingStats ? (
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              ) : (
                (stats?.totalUniqueVisitors ?? 0).toLocaleString()
              )}
            </h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Total Unique Visitors</p>
          </div>
        </div>

        {/* Total Downloads Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-md flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-500 shrink-0">
            <Download className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
              {loadingStats ? (
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              ) : (
                (stats?.totalDownloads ?? 0).toLocaleString()
              )}
            </h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Total Downloads</p>
          </div>
        </div>

        {/* Most Viewed Photos Card */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-md xl:col-span-1 flex flex-col justify-between">
          <div className="mb-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Most Viewed Photos</h4>
            <div className="space-y-2">
              {loadingStats ? (
                [1, 2, 3].map(i => <div key={i} className="h-9 bg-muted animate-pulse rounded" />)
              ) : (stats?.mostViewedPhotos || []).slice(0, 3).map((p: any) => (
                <div key={p.id} className="flex items-center gap-2 text-xs">
                  <OptimizedImage src={getImageUrl(p.imageUrl)} className="w-7 h-7 rounded object-cover border border-border" />
                  <span className="font-semibold text-foreground truncate max-w-[120px]">{p.title}</span>
                  <span className="ml-auto font-bold text-blue-500">{p.views} visitors</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most Downloaded Photos Card */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-md xl:col-span-1 flex flex-col justify-between">
          <div className="mb-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Most Downloaded Photos</h4>
            <div className="space-y-2">
              {loadingStats ? (
                [1, 2, 3].map(i => <div key={i} className="h-9 bg-muted animate-pulse rounded" />)
              ) : (stats?.mostDownloadedPhotos || []).slice(0, 3).map((p: any) => (
                <div key={p.id} className="flex items-center gap-2 text-xs">
                  <OptimizedImage src={getImageUrl(p.imageUrl)} className="w-7 h-7 rounded object-cover border border-border" />
                  <span className="font-semibold text-foreground truncate max-w-[120px]">{p.title}</span>
                  <span className="ml-auto font-bold text-emerald-500">{p.downloadCount} dl</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-md mb-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search bar */}
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, album, category, photographer, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-background border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
            />
          </div>

          <button
            type="submit"
            className="px-6 h-11 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-border"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </form>

        {/* Inline Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Category Filter */}
          <div className="flex flex-col min-w-[150px]">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Category</span>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="h-10 px-3 bg-background border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Album Filter */}
          <div className="flex flex-col min-w-[150px]">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Album</span>
            <select
              value={selectedAlbum}
              onChange={(e) => { setSelectedAlbum(e.target.value); setPage(1); }}
              className="h-10 px-3 bg-background border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All Albums</option>
              {albums.map((a: any) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>

          {/* Featured Filter */}
          <div className="flex flex-col min-w-[150px]">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Featured</span>
            <select
              value={selectedFeatured}
              onChange={(e) => { setSelectedFeatured(e.target.value); setPage(1); }}
              className="h-10 px-3 bg-background border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="true">Featured Only</option>
              <option value="false">Non-Featured Only</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col min-w-[150px]">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Date Uploaded</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
              className="h-10 px-3 bg-background border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            />
          </div>

          {/* Sort By Filter */}
          <div className="flex flex-col min-w-[150px]">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="h-10 px-3 bg-background border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="latest">Latest Uploads</option>
              <option value="most-viewed">Most Viewed</option>
              <option value="most-downloaded">Most Downloaded</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex flex-col justify-end h-10 mt-auto">
            <button
              onClick={handleClearFilters}
              className="h-10 px-4 bg-accent/20 hover:bg-accent/40 text-foreground font-bold text-xs rounded-xl transition-all border border-border/50 flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          </div>

          <div className="flex flex-col justify-end h-10 mt-auto ml-auto">
            <button
              onClick={fetchPhotos}
              className="h-10 w-10 bg-background hover:bg-accent border border-border rounded-xl flex items-center justify-center p-0 text-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Photos Table */}
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden w-full relative">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-card border-b border-border sticky top-0 z-10">
                <th className="py-4 px-6 text-xs font-extrabold text-muted-foreground uppercase tracking-wider w-16 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelectedOnPage}
                    onChange={handleSelectAllToggle}
                    className="w-4.5 h-4.5 rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-6 text-xs font-extrabold text-muted-foreground uppercase tracking-wider w-28">Thumbnail</th>
                <th className="py-4 px-6 text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Photo Name</th>
                <th className="py-4 px-6 text-xs font-extrabold text-muted-foreground uppercase tracking-wider text-center">Unique Visitors</th>
                <th className="py-4 px-6 text-xs font-extrabold text-muted-foreground uppercase tracking-wider text-center">Downloads</th>
                <th className="py-4 px-6 text-xs font-extrabold text-muted-foreground uppercase tracking-wider text-center">Allow Download</th>
                <th className="py-4 px-6 text-xs font-extrabold text-muted-foreground uppercase tracking-wider text-center">Status</th>
                <th className="py-4 px-6 text-xs font-extrabold text-muted-foreground uppercase tracking-wider text-center">Featured</th>
                <th className="py-4 px-6 text-xs font-extrabold text-muted-foreground uppercase tracking-wider text-right w-56">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {loading ? (
                // Skeletons
                [1, 2, 3, 4, 5].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-6 px-6 text-center">
                      <div className="w-4.5 h-4.5 bg-muted rounded mx-auto" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-[72px] h-[72px] bg-muted rounded-lg" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-5 bg-muted rounded w-2/3 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-muted rounded w-12 mx-auto" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-muted rounded w-12 mx-auto" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-12 h-6 bg-muted rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-16 h-6 bg-muted rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-12 h-6 bg-muted rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="w-32 h-8 bg-muted rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : photos.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={9} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" strokeWidth={1} />
                      <h3 className="text-xl font-bold text-foreground mb-2">No photos found</h3>
                      <p className="text-sm text-muted-foreground mb-6 text-center">
                        We couldn't find any photos matching your query.
                      </p>
                      <button onClick={handleClearFilters} className="px-5 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold rounded-xl transition-all border border-border text-sm">
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                // Rows
                photos.map((photo) => {
                  const isChecked = selectedIds.has(photo.id);
                  return (
                    <tr
                      key={photo.id}
                      className={`hover:bg-accent/40 transition-colors group cursor-pointer ${isChecked ? 'bg-blue-600/5 hover:bg-blue-600/10' : ''}`}
                      onClick={() => handleSelectRow(photo.id)}
                    >
                      <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(photo.id)}
                          className="w-4.5 h-4.5 rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center">
                          <img
                            src={getImageUrl(photo.cdnUrl || photo.s3Key)}
                            alt={photo.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-foreground text-sm line-clamp-1">{photo.title}</div>
                        {photo.photographer && (
                          <div className="text-[10px] text-muted-foreground font-semibold mt-1">Uploaded by: {photo.photographer}</div>
                        )}
                        <div className="text-[10px] text-muted-foreground/80 font-medium mt-0.5">
                          Album: {photo.album?.title || '-'} | Cat: {photo.category?.title || '-'}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center text-sm font-bold text-foreground">
                        {photo.views ?? 0}
                      </td>
                      <td className="py-4 px-6 text-center text-sm font-bold text-foreground">
                        {photo.downloadCount ?? 0}
                      </td>
                      <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleAllowDownload(photo.id, photo.allowDownload !== false)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${photo.allowDownload !== false
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                              : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                          {photo.allowDownload !== false ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${photo.status === 'ACTIVE'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-muted text-muted-foreground'
                          }`}>
                          {photo.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-all ${photo.featured ? 'bg-amber-500/10 text-amber-500' : 'text-muted-foreground/30'
                          }`}>
                          <Star className={`w-4 h-4 ${photo.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleResetDownloads(photo.id)}
                          title="Reset downloads"
                          className="p-1.5 bg-accent hover:bg-accent/80 text-foreground rounded-lg transition-colors inline-flex items-center justify-center"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(photo.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-xs font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {!loading && photos.length > 0 && (
          <div className="p-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-card">
            <div className="text-sm text-muted-foreground font-semibold">
              Displaying {startRecord}–{endRecord} of {totalCount} Photos
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-foreground bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all border ${p === page ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-transparent border-border text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-foreground bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4 sm:gap-6 animate-in slide-in-from-bottom duration-300">
          <div className="text-sm font-extrabold text-foreground whitespace-nowrap px-3 py-1.5 bg-blue-600/10 text-blue-500 rounded-lg">
            {selectedIds.size} Selected
          </div>

          <div className="h-6 w-[1px] bg-border hidden sm:block" />

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkFeaturedToggle(true)}
              disabled={processingBulk}
              className="px-4 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 fill-current" /> Mark Featured
            </button>
            <button
              onClick={() => handleBulkFeaturedToggle(false)}
              disabled={processingBulk}
              className="px-4 py-2 bg-accent hover:bg-accent-foreground/10 text-foreground hover:text-accent-foreground rounded-xl text-xs font-extrabold transition-all"
            >
              Remove Featured
            </button>
            <button
              onClick={() => { setTargetAlbumId(''); setShowAlbumModal(true); }}
              disabled={processingBulk}
              className="px-4 py-2 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5"
            >
              <FolderInput className="w-3.5 h-3.5" /> Move to Album
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={processingBulk}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-red-600/10"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              disabled={processingBulk}
              className="px-4 py-2 text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Bulk Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Delete {selectedIds.size} selected photos?
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  This action cannot be undone. This will permanently delete the selected photos from:
                </p>
                <ul className="list-disc pl-5 text-xs text-muted-foreground mt-2 space-y-1">
                  <li>Database records</li>
                  <li>AWS S3 Storage objects</li>
                  <li>Featured Photo status</li>
                  <li>Album associations</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={processingBulk}
                className="px-5 py-2.5 bg-accent hover:bg-accent/80 text-foreground font-bold rounded-xl text-xs transition-all border border-border"
              >
                Cancel
              </button>
              <button
                onClick={executeBulkDeleteFinal}
                disabled={processingBulk}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-red-600/10"
              >
                {processingBulk ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Album Modal for Bulk Move */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-foreground">
                  Move {selectedIds.size} photos to Album
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Select a destination album. Choosing "No Album" will remove them from their current albums.
                </p>

                <div className="mt-4">
                  <select
                    value={targetAlbumId}
                    onChange={(e) => setTargetAlbumId(e.target.value)}
                    className="w-full px-4 h-11 bg-background border border-border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                  >
                    <option value="">-- No Album --</option>
                    {albums.map((a: any) => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAlbumModal(false)}
                disabled={processingBulk}
                className="px-5 py-2.5 bg-accent hover:bg-accent/80 text-foreground font-bold rounded-xl text-xs transition-all border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkMoveAlbum}
                disabled={processingBulk}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/10"
              >
                {processingBulk ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Moving...
                  </>
                ) : (
                  'Move Photos'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
