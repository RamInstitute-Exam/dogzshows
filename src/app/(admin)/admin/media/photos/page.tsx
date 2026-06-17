'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import api from '@/lib/api';

export default function PhotoManagement() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/media/photos?page=${page}&search=${search}&limit=10`);
      // Since our new endpoint returns an array directly, we adapt to that,
      // or if it returns pagination we use it. For now, assuming array return.
      if (Array.isArray(res)) {
        setData(res);
        setTotalPages(1);
        setTotalCount(res.length);
      } else if (res.success || Array.isArray(res.data)) {
        const photos = res.data?.photos || res.data || res;
        setData(photos);
        setTotalPages(res.data?.totalPages || 1);
        setTotalCount(res.data?.totalCount || photos.length || 0);
      } else {
        setData(res);
        setTotalCount(res.length);
      }
    } catch (error) {
      console.error('Failed to fetch photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [page, search]);

  const deletePhoto = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo? This will also remove it from AWS S3.')) return;
    try {
      await api.delete(`/media/photos/${id}`);
      fetchPhotos();
    } catch (error) {
      console.error('Failed to delete photo');
      alert('Failed to delete photo');
    }
  };

  const columns: ColumnDefinition<any>[] = [
    { 
      header: 'Thumbnail', 
      accessor: (photo) => (
        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
          <img src={photo.cdnUrl || photo.s3Key} alt={photo.title} className="w-full h-full object-cover" />
        </div>
      ) 
    },
    { header: 'Title', accessor: 'title', className: 'font-bold text-foreground' },
    { header: 'Album', accessor: (photo) => photo.album?.title || '-' },
    { 
      header: 'Featured', 
      accessor: (photo) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${photo.featured ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
          {photo.featured ? 'Yes' : 'No'}
        </span>
      ) 
    },
    {
      header: 'Actions',
      accessor: (photo) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => deletePhoto(photo.id)}
            className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full">
      <AdminDataTable
        title="Photo Management"
        description="Manage all photography assets, upload new photos directly to S3."
        icon={ImageIcon}
        data={data}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        onSearchChange={setSearch}
        onRefresh={fetchPhotos}
        onPageChange={setPage}
        createLink="/admin/media/photos/create"
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
