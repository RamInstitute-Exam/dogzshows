'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, RefreshCw, AlertCircle, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api, { getThumbnailUrl } from '@/lib/api';
import Image from 'next/image';

interface Magazine {
  id: string;
  title: string;
  slug: string;
  edition: string | null;
  month: string | null;
  year: number | null;
  totalPages: number;
  status: string; // DRAFT, PUBLISHED, PROCESSING, FAILED
  featured: boolean;
  displayOrder: number;
  coverUrl: string | null;
  createdAt: string;
}

export default function AdminMagazinesPage() {
  const router = useRouter();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  const fetchMagazines = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/magazines`, {
        page,
        limit: 10,
        search: search || undefined,
      });
      if (res.success) {
        setMagazines(res.items || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to load magazines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMagazines();
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this magazine? This will perform a soft delete.')) return;
    try {
      const res = await api.delete(`/magazines/${id}`);
      if (res.success) {
        fetchMagazines();
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete magazine.');
    }
  };

  const toggleFeatured = async (magazine: Magazine) => {
    try {
      const res = await api.put(`/magazines/${magazine.id}`, {
        featured: !magazine.featured,
      });
      if (res.success) {
        setMagazines((prev) =>
          prev.map((m) => (m.id === magazine.id ? { ...m, featured: !m.featured } : m))
        );
      }
    } catch (error) {
      console.error('Toggle featured failed:', error);
    }
  };

  const togglePublish = async (magazine: Magazine) => {
    const nextStatus = magazine.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await api.put(`/magazines/${magazine.id}`, {
        status: nextStatus,
      });
      if (res.success) {
        setMagazines((prev) =>
          prev.map((m) => (m.id === magazine.id ? { ...m, status: nextStatus } : m))
        );
      }
    } catch (error) {
      console.error('Toggle status failed:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'DRAFT':
        return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
      case 'PROCESSING':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse';
      case 'FAILED':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">E-Magazines</h1>
          <p className="text-muted-foreground mt-1">
            Manage your digital flipbook publications and review processing statuses.
          </p>
        </div>
        <Link href="/admin/e-magazines/create">
          <Button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-red-500/15 hover:scale-[1.01] active:scale-95 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Magazine
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-xl">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by title or edition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-background border border-border focus:border-red-500 text-foreground rounded-xl outline-none transition-all text-sm font-medium"
          />
        </div>
        <Button
          onClick={fetchMagazines}
          variant="outline"
          className="border-border hover:bg-accent text-foreground w-full sm:w-auto h-[42px] px-5 rounded-xl"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reload
        </Button>
      </div>

      {/* Main Listing Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-2xl border border-border shadow-xl space-y-4">
          <RefreshCw className="w-10 h-10 animate-spin text-red-500" />
          <p className="text-muted-foreground font-semibold">Fetching publications...</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-xs tracking-wider font-bold">
                  <th className="p-5 font-semibold">Cover</th>
                  <th className="p-5 font-semibold">Magazine Details</th>
                  <th className="p-5 font-semibold">Edition / Date</th>
                  <th className="p-5 font-semibold text-center">Pages</th>
                  <th className="p-5 font-semibold">Featured</th>
                  <th className="p-5 font-semibold">Status</th>
                  <th className="p-5 font-semibold">Order</th>
                  <th className="p-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {magazines.map((mag) => (
                  <tr key={mag.id} className="hover:bg-accent/40 transition-colors">
                    {/* Cover */}
                    <td className="p-5 whitespace-nowrap">
                      <div className="relative w-14 h-20 rounded-lg overflow-hidden border border-border bg-background shadow-md">
                        {mag.coverUrl ? (
                          <Image
                            src={getThumbnailUrl(mag.coverUrl)}
                            alt={mag.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-accent text-muted-foreground">
                            <FileText className="w-8 h-8 opacity-45" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="p-5 max-w-[280px]">
                      <div className="flex flex-col">
                        <span className="text-foreground font-extrabold text-base leading-snug line-clamp-1">
                          {mag.title}
                        </span>
                        <span className="text-muted-foreground text-xs font-semibold mt-1">
                          Slug: {mag.slug}
                        </span>
                      </div>
                    </td>

                    {/* Edition */}
                    <td className="p-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-foreground font-bold text-sm">
                          {mag.edition || 'Regular'}
                        </span>
                        <span className="text-muted-foreground text-xs mt-0.5">
                          {mag.month && `${mag.month} `}
                          {mag.year}
                        </span>
                      </div>
                    </td>

                    {/* Pages */}
                    <td className="p-5 text-center whitespace-nowrap font-bold text-sm text-foreground">
                      {mag.status === 'PROCESSING' ? (
                        <span className="text-amber-500 flex items-center justify-center gap-1.5 text-xs font-semibold animate-pulse">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Parsing
                        </span>
                      ) : mag.status === 'FAILED' ? (
                        <span className="text-red-500 font-bold text-xs">-</span>
                      ) : (
                        mag.totalPages
                      )}
                    </td>

                    {/* Featured */}
                    <td className="p-5 whitespace-nowrap">
                      <button
                        onClick={() => toggleFeatured(mag)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                          mag.featured
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm'
                            : 'bg-zinc-500/5 text-muted-foreground border-zinc-500/10 hover:border-zinc-500/20'
                        }`}
                      >
                        {mag.featured ? '★ Featured' : '☆ Standard'}
                      </button>
                    </td>

                    {/* Status */}
                    <td className="p-5 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${getStatusBadgeClass(mag.status)}`}>
                        {mag.status}
                      </span>
                    </td>

                    {/* Order */}
                    <td className="p-5 whitespace-nowrap text-sm font-semibold text-muted-foreground">
                      {mag.displayOrder}
                    </td>

                    {/* Actions */}
                    <td className="p-5 text-right whitespace-nowrap">
                      <div className="flex justify-end items-center gap-2">
                        {mag.status === 'PUBLISHED' && (
                          <Link
                            href={`/media-gallery/e-magazines/${mag.slug}`}
                            target="_blank"
                            title="Read Viewer"
                          >
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500">
                              <Eye className="w-4.5 h-4.5" />
                            </Button>
                          </Link>
                        )}
                        {mag.status !== 'PROCESSING' && (
                          <>
                            <button
                              onClick={() => togglePublish(mag)}
                              className="text-xs font-bold h-9 px-3 rounded-xl border hover:bg-accent border-border text-foreground transition-all active:scale-95"
                              title={mag.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                            >
                              {mag.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                            </button>
                            <Link href={`/admin/e-magazines/edit?id=${mag.id}`} title="Edit Publication">
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent">
                                <Edit className="w-4.5 h-4.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(mag.id)}
                              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                              title="Delete Publication"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {magazines.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-muted-foreground font-semibold">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-muted-foreground/60" />
                        <span>No publications found. Create your first magazine above!</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border p-5 text-sm font-semibold bg-muted/5">
              <span className="text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-9 border-border text-foreground hover:bg-accent"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-9 border-border text-foreground hover:bg-accent"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
